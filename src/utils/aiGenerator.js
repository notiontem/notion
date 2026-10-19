/**
 * Ministry AI Assistant & Smart Generator
 * Analyzes ministerial ideas, classifies them into PARA,
 * and generates structured Notion-ready content.
 *
 * 설계 원칙 (2026-10 개정)
 *  1. 입력에서 뽑아낼 수 있는 값(주차 수, 본문, 날짜, 대상)은 반드시 문장에 반영한다.
 *  2. 근거 없이 성경 구절을 인용하지 않는다. 본문이 확인되지 않으면 인용 대신 확인 과제를 남긴다.
 *  3. 모든 주제에 붙는 상투 문장("하나님 나라를 확장하고…")을 쓰지 않는다.
 *  4. 제목은 임의로 자르지 않는다. (노션 행 제목이 그대로 깨지던 문제)
 */

const BOOK_NAMES = [
  '창세기', '출애굽기', '레위기', '민수기', '신명기', '여호수아', '사사기', '룻기',
  '사무엘상', '사무엘하', '열왕기상', '열왕기하', '역대상', '역대하', '에스라', '느헤미야',
  '에스더', '욥기', '시편', '잠언', '전도서', '아가', '이사야', '예레미야', '예레미야애가',
  '에스겔', '다니엘', '호세아', '요엘', '아모스', '오바댜', '요나', '미가', '나훔',
  '하박국', '스바냐', '학개', '스가랴', '말라기', '마태복음', '마가복음', '누가복음',
  '요한복음', '사도행전', '로마서', '고린도전서', '고린도후서', '갈라디아서', '에베소서',
  '빌립보서', '골로새서', '데살로니가전서', '데살로니가후서', '디모데전서', '디모데후서',
  '디도서', '빌레몬서', '히브리서', '야고보서', '베드로전서', '베드로후서', '요한계시록'
];

// 약어 → 정식 명칭
const BOOK_ABBR = {
  '창': '창세기', '출': '출애굽기', '레': '레위기', '민': '민수기', '신': '신명기',
  '수': '여호수아', '삿': '사사기', '삼상': '사무엘상', '삼하': '사무엘하',
  '왕상': '열왕기상', '왕하': '열왕기하', '시': '시편', '잠': '잠언', '전': '전도서',
  '사': '이사야', '렘': '예레미야', '겔': '에스겔', '단': '다니엘',
  '마': '마태복음', '막': '마가복음', '눅': '누가복음', '요': '요한복음',
  '행': '사도행전', '롬': '로마서', '고전': '고린도전서', '고후': '고린도후서',
  '갈': '갈라디아서', '엡': '에베소서', '빌': '빌립보서', '골': '골로새서',
  '살전': '데살로니가전서', '살후': '데살로니가후서', '딤전': '디모데전서',
  '딤후': '디모데후서', '딛': '디도서', '몬': '빌레몬서', '히': '히브리서',
  '약': '야고보서', '벧전': '베드로전서', '벧후': '베드로후서', '계': '요한계시록'
};

const AUDIENCE_WORDS = [
  '청년부', '대학부', '장년부', '교회학교', '유치부', '유년부', '초등부', '중등부',
  '고등부', '새가족', '환우', '어르신', '독거노인', '전교인', '전 세대', '가정'
];

/** 입력 문자열 다듬기 (제목 절단 금지, 공백만 정리) */
function cleanPrompt(prompt) {
  return String(prompt || '').replace(/\s+/g, ' ').trim();
}

/** 80자까지만 끝에서 자른다. 중간 생략(...) 금지. */
function safeTitle(text, max = 80) {
  const t = cleanPrompt(text);
  if (t.length <= max) return t;
  return t.slice(0, max).trimEnd() + '…';
}

/**
 * 입력에서 실제 값(주차·본문·날짜·대상)을 파싱한다.
 * 파싱 실패는 오류가 아니라 "모름"으로 처리하고 문장에서 뺀다.
 */
export function parsePrompt(prompt) {
  const text = cleanPrompt(prompt);

  // 주차 수: "4주", "8주간", "4~6주" 중 첫 숫자
  const weekMatch = text.match(/(\d{1,2})\s*(?:~|-|부터)?\s*\d{0,2}\s*주/);
  const weeks = weekMatch ? Number(weekMatch[1]) : null;

  // 본문: "사 40장", "로마서 8장", "롬 8:1-11"
  let passage = null;
  const chapterMatch = text.match(/([가-힣]{1,6})\s*(\d{1,3})\s*장/);
  if (chapterMatch) {
    const rawBook = chapterMatch[1];
    const book = BOOK_ABBR[rawBook] || BOOK_NAMES.find(b => b === rawBook || rawBook.endsWith(b));
    if (book) passage = `${book} ${chapterMatch[2]}장`;
  }
  if (!passage) {
    const verseMatch = text.match(/([가-힣]{1,3})\s*(\d{1,3})\s*:\s*(\d{1,3})/);
    if (verseMatch && BOOK_ABBR[verseMatch[1]]) {
      passage = `${BOOK_ABBR[verseMatch[1]]} ${verseMatch[2]}:${verseMatch[3]}`;
    }
  }

  // 날짜: "12월 25일", "8월 14-16일"
  let deadline = '';
  const dateMatch = text.match(/(\d{1,2})\s*월\s*(\d{1,2})(?:\s*[-~]\s*\d{1,2})?\s*일/);
  if (dateMatch) {
    const month = Number(dateMatch[1]);
    const day = Number(dateMatch[2]);
    const today = new Date();
    let year = today.getFullYear();
    const candidate = new Date(year, month - 1, day);
    // 이미 지난 날짜면 다음 해 일정으로 본다.
    if (candidate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) year += 1;
    deadline = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const audience = AUDIENCE_WORDS.find(a => text.includes(a)) || '';

  return { text, weeks, passage, deadline, audience };
}

/**
 * 주제를 사역 영역(Area)으로 판별한다.
 * areaCode는 Areas DB의 code와 1:1로 맞춰 담당자·영역 자동 지정에 사용한다.
 */
export function detectAreaCode(text) {
  const t = String(text || '');
  const has = (...words) => words.some(w => t.includes(w));

  // 1) 설교 (본문이 확인되면 설교 시리즈로 본다)
  if (/설교|강해|주해/.test(t) && !has('행사', '수련회', '축제', '캠프', '기획', '컨퍼런스', '세미나', '집회', '성탄', '부활절', 'MT', '리트릿')) {
    return 'SERMON';
  }

  // 2) 돌봄 (사람의 아픔과 고난을 직접 다룬다)
  if (has('심방', '위로', '상실', '환우', '장례', '조문', '상담', '돌봄', '입원', '중보', '위기')) {
    return 'PASTORAL_CARE';
  }

  // 3) 개인 경건 (사역자 자신의 영성과 내면)
  if (has('묵상', '영성', '큐티', 'QT', '독서', '피정', '리트릿', '안식', '금식', '기도회') && !has('본문')) {
    return 'SPIRITUALITY';
  }

  // 4) 가정과 건강 (사역자의 가정·쉼·건강)
  if (has('가정', '건강', '자녀', '결혼', '부부', '번아웃', '과로', '수면', '운동', '안식년', '휴가')) {
    return 'FAMILY';
  }

  // 5) 부서 행정 및 동역 (예배팀·소그룹·교육·행정·행사 운영은 모두 부서 사역)
  return 'ADMIN';
}

const AREA_LABELS = {
  SERMON: '📖 말씀 연구 및 설교',
  PASTORAL_CARE: '🕊️ 심방 및 영혼 돌봄',
  SPIRITUALITY: '🙏 개인 경건 및 기도',
  FAMILY: '🏡 사역자 가정 및 건강',
  ADMIN: '📊 부서 행정 및 동역'
};

const GUIDE_WORDS = [
  '가이드', '매뉴얼', '자료', '예화', '콘티', '질문지', '공과', '원고', '노트',
  '메모', '정리', '템플릿', '체크리스트', '문구', '스크립트'
];

const EVENT_WORDS = [
  '수련회', '행사', '축제', '캠프', '바자회', '부흥회', '성탄', '부활절', '절기',
  '기획', '준비', '일정', '컨퍼런스', '세미나', '집회', 'MT', '리트릿'
];

export function classifyPARA(input) {
  const text = cleanPrompt(input);

  // 1) 지난 사역 기록
  if (['회고', '결산', 'AAR', 'aar', '지난', '완료된', '평가회'].some(w => text.includes(w))) {
    return {
      category: 'Archive',
      badge: '🟣 보관함 (Archive)',
      reason: '종료된 사역의 평가·기록이므로 회고(AAR) 항목으로 정리합니다.'
    };
  }

  // 2) 축적형 자료 (가이드/매뉴얼/예화/콘티는 마감일이 아니라 자산으로 쌓인다)
  if (GUIDE_WORDS.some(w => text.includes(w))) {
    return {
      category: 'Resource',
      badge: '🟢 사역 자산 (Resource)',
      reason: '설교·심방·교육 현장에서 다시 꺼내 쓸 수 있는 축적형 자료입니다.'
    };
  }

  // 3) 지속 유지해야 하는 기준/루틴
  if (['루틴', '기준', '원칙', '영역', '역할', '정기', '매주', '상시'].some(w => text.includes(w))) {
    return {
      category: 'Area',
      badge: '🔵 책임 영역 (Area)',
      reason: '마감일 없이 일정 수준을 유지해야 하는 지속 책임 영역입니다.'
    };
  }

  // 4) 마감이 있는 사역
  return {
    category: 'Project',
    badge: '🔴 사역 프로젝트 (Project)',
    reason: '완료 시점과 산출물이 정해진 구체적 사역입니다.'
  };
}

/**
 * Generate Smart Ministry Content based on user prompt and category
 */
export function generateMinistryContent(prompt, selectedCategory = 'auto') {
  const parsed = parsePrompt(prompt);
  const { text, weeks, passage, deadline, audience } = parsed;

  const classification = selectedCategory === 'auto'
    ? classifyPARA(text)
    : {
      category: selectedCategory,
      badge: selectedCategory === 'Project' ? '🔴 사역 프로젝트'
        : selectedCategory === 'Area' ? '🔵 책임 영역'
          : selectedCategory === 'Resource' ? '🟢 사역 자산' : '🟣 보관함',
      reason: '사용자 직접 지정'
    };

  const areaCode = detectAreaCode(text);
  const areaLabel = AREA_LABELS[areaCode];
  const today = new Date().toISOString().split('T')[0];
  const weekLabel = weeks ? `${weeks}주` : '';

  if (classification.category === 'Project') {
    const isSermon = (passage || /설교|강해|주해|본문/.test(text)) && !EVENT_WORDS.some(w => text.includes(w));

    if (isSermon) {
      const seriesTitle = /설교|강해/.test(text) ? text : `${text} 강해 설교 시리즈`;


      const goal = [
        weekLabel ? `${weekLabel} 동안` : '',
        passage ? `${passage} 본문을` : '정한 본문을',
        '주차별로 주해하고, 각 주의 중심 대지와 적용점을 성도들의 일상 언어로 전한다.'
      ].filter(Boolean).join(' ');

      return {
        type: 'Project',
        areaCode,
        areaLabel,
        title: safeTitle(seriesTitle),
        status: '시작 전',
        deadline,
        goal,
        tags: ['설교시리즈', '말씀연구', '주일예배'].concat(passage ? [passage.split(' ')[0]] : []),
        notionCallout: passage
          ? `📖 본문: ${passage} — 주해 방향과 적용점을 먼저 확정하고, 매주 예화를 새로 채웁니다.`
          : '📖 본문을 먼저 확정하면 주차별 대지까지 한 번에 정리됩니다. (본문 미입력)',
        wbs: [
          { id: 'gen-1', task: `${passage ? passage + ' ' : ''}본문 주해 및 중심 메시지 1차 정리`, done: false },
          { id: 'gen-2', task: `${weekLabel ? weekLabel + ' ' : ''}커리큘럼 확정 (주차별 본문·제목·대지)`, done: false },
          { id: 'gen-3', task: `주차별 예화·적용점 발굴 (${weeks ? `${weeks}주 분량` : '매주'} 1건 이상)`, done: false },
          { id: 'gen-4', task: '원고 집필 및 예배 찬양 콘티 연계', done: false },
          { id: 'gen-5', task: '주보 요약 및 소그룹 나눔 질문지 배포', done: false }
        ],
        notes: `주요 주석(NICNT, Reformation, BST) 비교 대조.${passage ? ` ${passage}의 문맥과 성도 삶의 접점을 먼저 메모.` : ' 본문을 정한 뒤 문맥과 삶의 접점을 메모할 것.'}`
      };
    }

    // 행사 / 사역 기획
    const eventTitle = /기획|사역|행사|수련회|축제|캠프/.test(text) ? text : `${text} 사역 기획`;

    return {
      type: 'Project',
      areaCode,
      areaLabel,
      title: safeTitle(eventTitle),
      status: '시작 전',
      deadline,
      goal: `'${text}'의 목적·대상·예산을 먼저 확정하고,${deadline ? ` ${deadline} 안에 실행을 마친 뒤` : ' 실행을 마친 뒤'} AAR(Keep·Problem·Try)까지 남긴다.`,
      tags: ['사역기획', '행사'].concat(audience ? [audience] : []),
      notionCallout: `💡 목표: '${text}'의 결과를 참석 인원·후속 연결·결산 같은 측정 가능한 지표로 남깁니다.`,
      wbs: [
        { id: 'gen-1', task: '기획안 확정 (목적·대상·일정·예산)', done: false },
        { id: 'gen-2', task: '실행팀 구성 및 역할 분담', done: false },
        { id: 'gen-3', task: '홍보물 제작 및 성도 공지', done: false },
        { id: 'gen-4', task: '세부 타임테이블(큐시트) 확정 및 사전 점검', done: false },
        { id: 'gen-5', task: '당일 진행 및 안전 점검', done: false },
        { id: 'gen-6', task: '사후 평가회(AAR) 및 결산 보고', done: false }
      ],
      notes: `참석 인원·후속 연결·결산 3가지를 처음부터 기록해 두면 AAR 작성이 한결 수월합니다.${audience ? ` 주요 대상: ${audience}.` : ''}`
    };
  }

  if (classification.category === 'Area') {
    return {
      type: 'Area',
      areaCode,
      areaLabel,
      name: safeTitle(text),
      code: areaCode,
      icon: '🏛️',
      leader: '담당 사역자 및 섬김이 팀',
      standard: `'${text}' 영역에서 지켜야 할 최소 기준을 문장으로 남기고, 매 분기 그 기준을 실제로 지켰는지 점검한다.`,
      routines: [
        `주간: '${safeTitle(text, 20)}' 실행 여부 점검 및 다음 주 우선순위 결정`,
        '월간: 담당자 회의 및 기도제목 공유',
        '분기: 기준 대비 미달 항목 1개를 골라 개선안 수립'
      ]
    };
  }

  if (classification.category === 'Resource') {
    const isCare = areaCode === 'PASTORAL_CARE';
    // 예배 찬양 콘티는 부서 사역(ADMIN) 안에서 찬양 부서가 맡는다.
    const isWorship = areaCode === 'ADMIN' && /찬양|콘티|예배|찬송/.test(text);
    const isManual = !isCare && /매뉴얼|가이드|정착|시스템|프로세스/.test(text);

    if (isCare) {
      return {
        type: 'Resource',
        areaCode,
        areaLabel,
        title: safeTitle(/가이드|매뉴얼/.test(text) ? text : `${text} 심방 상담 가이드`),
        category: '심방/상담 가이드',
        tags: ['심방', '상담', '영혼돌봄', '기도제목'],
        quantity: 1,
        summary: `'${text.replace(/\s*(가이드|매뉴얼)$/, '')}' — 만남 전 준비, 대화, 기도, 후속 조치까지 한 장으로 정리한 현장용 가이드.`,
        content: `> 🕊️ **먼저 할 일**: 설명보다 경청. 결론을 서두르지 않고, 성도가 자기 상황을 말할 시간을 충분히 준다.

### 🚫 피해야 할 말
- "하나님의 뜻이 있겠지요", "기도가 부족해서" 같은 인과응보적 해석
- 상대의 고통을 자기 경험과 비교하는 말

### 📖 위로의 성경 구절
1. **시편 34:18** — "여호와는 마음이 상한 자에게 가까이 하시고…"
2. **이사야 41:10** — "두려워하지 말라 내가 너와 함께 함이라"
3. **로마서 8:38-39** — 그리스도 예수 안에 있는 사랑에서 끊을 수 없음

### 💬 나눔 질문
- "요즘 마음이 가장 무거운 부분은 무엇인가요?"
- "이번 주에 하나님께 가장 먼저 아뢰고 싶은 기도 제목은 무엇인가요?"

### 🙏 마무리 기도
"사랑의 하나님, 이 가정의 한숨과 눈물을 아시니, 사람의 위로를 넘어 주의 평강으로 덮어 주옵소서. 예수 그리스도의 이름으로 기도합니다. 아멘."

### 📌 후속 조치
- 3일 내 안부 문자 1회, 2주 내 재방문 1회
- 기도제목은 교역자회 공유 목록에 기록 (개인정보 최소화)`
      };
    }

    if (isManual) {
      return {
        type: 'Resource',
        areaCode,
        areaLabel,
        title: safeTitle(/매뉴얼|가이드/.test(text) ? text : `${text} 운영 매뉴얼`),
        category: '사역 매뉴얼',
        tags: ['매뉴얼', '실행가이드'].concat(areaCode === 'DISCIPLESHIP' ? ['양육'] : []),
        quantity: 1,
        summary: `'${text.replace(/\s*(매뉴얼|가이드)$/, '')}' — 처음 맡은 사람도 그대로 따라 할 수 있게 목적·대상·순서·점검 항목으로 나눈 운영 매뉴얼.`,
        content: `### 🎯 이 매뉴얼을 쓰는 순간
새 담당자가 배정되었을 때, 진행이 사람마다 달라질 때, 인수인계가 필요할 때.

### 👤 대상과 역할
- 대상: 누구를, 몇 명을, 어느 조건까지
- 담당: 누가 최종 결정권을 갖는지 한 명으로 명시
- 협력: 함께 움직여야 할 부서·팀

### 🔁 진행 순서
1. 사전 준비 (자료·장소·인원 확정)
2. 실행 단계별 순서와 소요 시간
3. 종료 후 정리 (기록·결산·피드백)

### ✅ 점검 체크리스트
- [ ] 담당자·연락처가 문서에 적혀 있는가
- [ ] 다음 단계로 넘어가는 조건이 문장으로 명시됐는가
- [ ] 예외 상황(불참·취소·지연) 대응이 적혀 있는가

### 📌 인수인계 메모
- 최근 변경 사항과 그 이유
- 아직 정하지 못한 것'`
      };
    }

    if (isWorship) {
      return {
        type: 'Resource',
        areaCode,
        areaLabel,
        title: safeTitle(/콘티/.test(text) ? text : `${text} 예배 찬양 콘티`),
        category: '찬양 콘티',
        tags: ['예배', '찬양', '콘티', '송리스트'],
        quantity: 1,
        summary: `'${text}' 예배를 위한 5곡 흐름(경배 → 회개 → 은혜 → 결단 → 파송)과 인도 멘트.`,
        content: `### 🎵 콘티 흐름
1. **경배로 열기** (G) — 밝고 단순한 곡으로 회중의 시선 모으기
2. **회개와 고백** (A) — 가사가 신학적으로 분명한 곡
3. **은혜 선포** (C) — 십자가·부활 중심
4. **결단** (C) — 설교 주제와 직접 연결되는 곡
5. **파송** (D) — 짧고 반복 가능한 후렴

### 💡 인도 팁
- 3곡과 4곡 사이에 설교자 멘트 30초를 두면 흐름이 끊기지 않습니다.
- 조성 이동은 반 키 정도만. 회중이 따라오지 못하면 흐름이 끊깁니다.`
      };
    }

    return {
      type: 'Resource',
      areaCode,
      areaLabel,
      title: safeTitle(/예화|자료/.test(text) ? text : `${text} 설교 예화 메모`),
      category: '설교 예화',
      tags: ['설교예화', '묵상', '적용'],
      quantity: 1,
      summary: `'${text}' 주제로 설교할 때 꺼내 쓸 예화 후보와 적용 질문.`,
      content: `> 💡 **원칙**: 예화는 결론을 대신하지 않습니다. 본문 주해가 먼저고, 예화는 적용을 돕는 도구입니다.

### 🎬 예화 후보 (직접 검증 후 사용)
1. 영화·소설 장면 1개 — 주제와 정확히 맞는 장면만
2. 교회 밖 일상 사건 1개 — 성도가 겪었을 법한 상황
3. 역사·인물 사례 1개 — 출처를 각주로 남길 수 있는 것

### 🎯 적용 질문
- "이 본문을 오늘 내 삶에 적용하면 이번 주에 무엇이 달라져야 합니까?"
- "내가 붙잡고 있는 것 중 무엇을 내려놓아야 합니까?"

### 📌 주의
- 예화의 인물·수치를 사실과 다르게 말하지 않기
- 다른 설교자의 예화를 그대로 옮길 때는 출처 표기`
    };
  }

  // Archive
  return {
    type: 'Archive',
    areaCode,
    areaLabel,
    title: safeTitle(`${text} 회고 및 결산`),
    completedDate: deadline || today,
    summary: `'${text}' 사역의 결과와 배운 점을 다음 사역에서 다시 쓰기 위한 기록.`,
    retrospective: `### 🎯 사역 회고 (AAR)
- **Keep**: 다시 해도 좋은 결정 1~2가지 (근거와 함께)
- **Problem**: 진행 중 드러난 병목 (사람·시간·자원 중 어디였는지)
- **Try**: 다음 사역에서 바꿀 구체적 행동 1가지

### 📊 숫자로 남기기
- 참석/수료 인원, 재정 집행률, 후속 연결 인원`
  };
}
