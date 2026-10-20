import React, { useState } from 'react';
import {
  BookOpen, CheckCircle2, ArrowRight, Layers, ExternalLink,
  Copy, HelpCircle, ChevronRight, Bookmark, Calendar, HeartHandshake,
  Music, ShieldCheck, Database, Smartphone, Download, FileSpreadsheet, Package
} from 'lucide-react';

export default function UserGuidePage({
  onNavigateTab,
  onOpenSetUrlModal,
  onOpenPresetModal,
  userNotionUrl
}) {
  const [activeRecipe, setActiveRecipe] = useState('sermon');
  const notionUrl = "https://lava-child-76b.notion.site/Ministry-Second-Brain-PARA-faa57f770752494db4bf529eaf689998";

  return (
    <div className="guide-page-container fade-in" id="user-guide">
      {/* Hero Banner */}
      <div className="guide-hero">
        <div className="guide-hero-badge">
          <BookOpen size={14} />
          <span>사역자 공식 활용 가이드북 (100% 무료 나눔)</span>
        </div>
        <h1 className="guide-hero-title">
          Ministry Second Brain PARA 무료 나눔 가이드
        </h1>
        <p className="guide-hero-desc">
          무료로 공유해 드리는 <strong>Ministry Second Brain PARA</strong> 노션 템플릿을 본인의 워크스페이스에 복제하고, 
          이 웹 스튜디오를 통해 <strong>빈 데이터베이스를 가장 빠르고 체계적으로 채우는 실전 매뉴얼</strong>입니다.
        </p>

        <div className="guide-quick-nav">
          <a href="#quickstart" className="quick-nav-pill">01. 템플릿 복제 & 셋업</a>
          <a href="#para-concept" className="quick-nav-pill">02. 템플릿 4대 DB 구조</a>
          <a href="#fill-notion" className="quick-nav-pill">03. 노션에 채우는 2가지 방법</a>
          <a href="#recipes" className="quick-nav-pill">04. 실전 사역 시나리오</a>
          <a href="#faq" className="quick-nav-pill">05. 자주 묻는 질문 (FAQ)</a>
        </div>
      </div>

      {/* SECTION 1: 템플릿 복제 & 셋업 */}
      <section id="quickstart" className="guide-section-block">
        <div className="guide-sec-header">
          <span className="sec-step-badge">Part 1</span>
          <h2>템플릿 복제 및 기본 셋업 (3분 완성)</h2>
        </div>
        <p className="sec-intro-text">
          무료로 배포해 드리는 템플릿을 본인 계정으로 복제해야 나만의 사역 데이터베이스를 자유롭게 수정하고 채워 넣을 수 있습니다.
        </p>

        <div className="quickstart-steps-grid">
          {/* Step 1 */}
          <div className="quickstep-card">
            <div className="quickstep-num-wrap">
              <span className="quickstep-num">1</span>
              <span className="quickstep-tag">템플릿 복제</span>
            </div>
            <h3>내 노션에 템플릿 복제하기 (Duplicate)</h3>
            <p>
              아래 버튼을 눌러 원본 템플릿 페이지로 이동한 뒤, 우측 상단의 <strong>[복제(Duplicate)]</strong>를 누릅니다.
            </p>
            <div className="quickstep-action-box" style={{ marginTop: 'auto' }}>
              <a
                href={notionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-editorial-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>원본 노션 템플릿 열기</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="quickstep-card">
            <div className="quickstep-num-wrap">
              <span className="quickstep-num">2</span>
              <span className="quickstep-tag">링크 등록</span>
            </div>
            <h3>내 노션 페이지 주소 등록하기</h3>
            <p>
              복제된 본인 노션 페이지 우측 상단 <strong>[공유(Share)] ➡️ [링크 복사]</strong>를 누른 후 웹사이트 상단에 등록하세요.
            </p>
            <div className="quickstep-action-box" style={{ marginTop: 'auto' }}>
              <button
                onClick={onOpenSetUrlModal}
                className="action-btn"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>{userNotionUrl ? '내 노션 링크 수정' : '내 노션 링크 등록하기'}</span>
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="quickstep-card">
            <div className="quickstep-num-wrap">
              <span className="quickstep-num">3</span>
              <span className="quickstep-tag">작업 시작</span>
            </div>
            <h3>사역 데이터 채우기 시작</h3>
            <p>
              웹사이트에서 제공하는 <strong>실전 사역 템플릿 컬렉션</strong>을 열거나, 초안 작성기를 통해 원하는 내용을 정리하세요.
            </p>
            <div className="quickstep-action-box" style={{ marginTop: 'auto' }}>
              <button
                onClick={onOpenPresetModal}
                className="btn-editorial-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Package size={13} />
                <span>템플릿 컬렉션 열기</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: 템플릿 4대 DB 구조 해설 */}
      <section id="para-concept" className="guide-section-block">
        <div className="guide-sec-header">
          <span className="sec-step-badge">Part 2</span>
          <h2>Ministry Second Brain 템플릿 4대 데이터베이스 구조</h2>
        </div>
        <p className="sec-intro-text">
          티아고 포르테의 세계적인 지식 관리론(PARA)을 목회 사역 현장에 1:1로 맞추어 설계한 템플릿 구조입니다.
        </p>

        <div className="tips-grid">
          <div className="tip-card">
            <h4>🔴 Projects (사역 프로젝트 DB)</h4>
            <p>
              <strong>정의:</strong> 명확한 마감일과 구체적인 완료 목표가 있는 활동.<br />
              <strong>예시:</strong> 로마서 8주 강해 설교 시리즈, 여름 수련회 기획, 새가족 4주 정착 프로세스, 성탄절 칸타타 준비.<br />
              <strong>노션 속성:</strong> 상태(기획/진행/완료), 마감일, 담당 부서·사역자, 핵심 산출물. 본문에는 WBS 체크리스트를 붙여넣습니다.<br />
              <em>참고: 원본 템플릿의 Projects DB에는 영역 관계형 속성이 없습니다. 영역은 이 사이트에서 담당자로 매핑되며, 노션에서 관계형으로 묶고 싶다면 병합 후 수동으로 연결해 주세요.</em>
            </p>
          </div>

          <div className="tip-card">
            <h4>🔵 Areas (책임 영역 DB)</h4>
            <p>
              <strong>정의:</strong> 마감일 없이 지속적으로 높은 영적 질과 충실도를 유지해야 하는 목회 본연의 책임.<br />
              <strong>5대 핵심 영역 (노션 템플릿과 1:1):</strong> 말씀 연구 및 설교, 심방 및 영혼 돌봄, 개인 경건 및 기도, 사역자 가정 및 건강, 부서 행정 및 동역.<br />
              <em>예배팀·소그룹·교육·행사 운영은 모두 부서 사역이므로 5번 영역에서 함께 관리합니다.</em><br />
              <strong>노션 속성:</strong> 담당 사역자, 사역 기준 헌장(Standard), 주간 정기 루틴(SOP).
            </p>
          </div>

          <div className="tip-card">
            <h4>🟢 Resources (사역 지식 창고 DB)</h4>
            <p>
              <strong>정의:</strong> 언제든 설교, 심방, 공과, 회의에 꺼내어 활용할 수 있는 축적형 지식 자산.<br />
              <strong>5대 카테고리:</strong> 설교 예화, 심방/상담 가이드, 찬양 콘티, 소그룹 공과 질문지, 사역 매뉴얼.<br />
              <strong>노션 속성:</strong> 분류, 태그, 핵심 요약, 상세 본문 및 적용점.
            </p>
          </div>

          <div className="tip-card">
            <h4>🟣 Archives (아카이브 보관함 DB)</h4>
            <p>
              <strong>정의:</strong> 종료된 과거 사역의 기록과 사역 평가 회고록.<br />
              <strong>AAR (After Action Review):</strong> 단순 불평 대신 Keep(지속할 점), Problem(문제점), Try(다음 개선점)을 정리하여 다음 사역의 거름으로 축적.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: 노션에 채우는 2가지 방법 */}
      <section id="fill-notion" className="guide-section-block">
        <div className="guide-sec-header">
          <span className="sec-step-badge">Part 3</span>
          <h2>내 노션 템플릿에 내용을 채우는 2가지 방법</h2>
        </div>
        <p className="sec-intro-text">
          단순한 타이핑 수고를 덜어드리기 위해, 두 가지 강력한 채우기 방식을 제공합니다.
        </p>

        <div className="tips-grid">
          <div className="tip-card highlight-tip">
            <div className="tip-icon-box">
              <FileSpreadsheet size={20} />
            </div>
            <h4>방법 A. 노션 DB에 CSV로 일괄 가져오기 (Merge with CSV)</h4>
            <p>
              수십 개의 설교 시리즈나 사역 자료를 한 번에 노션 데이터베이스 표에 채우고 싶을 때 사용합니다. <strong>직접 검증된 순서</strong> 그대로 따라 하세요.<br />
              1. 웹 상단의 <strong>[CSV 내보내기]</strong> 클릭 (예: Projects DB용)<br />
              2. 템플릿의 해당 데이터베이스를 <strong>[전체 페이지로 열기]</strong> 한 뒤, 우측 상단 <strong>[•••(작업)] ➡️ [CSV와 병합]</strong> 클릭<br />
              3. 파일을 선택하면 5개 열이 1:1로 매칭되는지 미리보기로 확인한 뒤 <strong>[CSV 가져오기]</strong><br />
              4. 노션 서버에서 처리되며, 1개 행도 <strong>1~2분</strong> 걸립니다. 끝나면 행이 추가됩니다.<br />
              <em>중복 방지 팁: CSV 메뉴 상단의 <strong>[신규·수정 항목만]</strong> 스위치를 켜두면, 아직 보내지 않았거나 고친 항목만 내보냅니다 (예: 신규 1 / 전체 6). 내보낸 항목은 자동으로 '전송됨' 처리되어 다음부터 제외됩니다.</em><br />              <em>DB별 주의: 병합은 항상 새 행을 추가합니다.</em><br />
              • <strong>Projects</strong>: 템플릿이 비어 있으므로 그대로 병합하면 채워집니다.<br />
              • <strong>Resources·Archives</strong>: 샘플 행이 이미 있으니, <em>새로 만든 항목만 담은 파일</em>로 병합하세요. 전체 파일을 병합하면 기존 행이 중복됩니다.<br />
              • <strong>Areas</strong>: 이미 5개 행이 있으므로 병합하지 마세요. 중복 행이 생깁니다. 중요도·만족도는 노션에서 직접 수정하세요.<br />
              • <strong>소속 영역(관계형)</strong>: CSV로는 들어가지 않습니다. 병합 후 새 행의 해당 셀을 눌러 영역을 직접 연결하세요.<br />
              • <strong>본문 서식</strong>: CSV 셀 안의 마크다운은 텍스트로 들어갑니다. 상세 본문은 방법 B(붙여넣기)로 채우는 편이 깔끔합니다.<br />
            </p>
          </div>

          <div className="tip-card">
            <div className="tip-icon-box">
              <Copy size={20} />
            </div>
            <h4>방법 B. 원클릭 노션 서식 복사 (Ctrl + V)</h4>
            <p>
              개별 프로젝트나 자료의 상세 본문을 풍성하게 채울 때 사용합니다.<br />
              1. 카드나 모달의 <strong>[노션 서식 복사]</strong> 버튼 클릭<br />
              2. 내 노션 페이지 빈 본문 줄에서 <code>Ctrl + V</code> (Mac은 <code>Cmd + V</code>)<br />
              3. 노션 고유의 <strong>인용 블록(💡), 체크박스(☑️), 헤딩(H3)</strong> 서식이 즉시 자동 생성됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: 실전 사역 레시피 */}
      <section id="recipes" className="guide-section-block">
        <div className="guide-sec-header">
          <span className="sec-step-badge">Part 4</span>
          <h2>목회 현장 실전 활용 시나리오</h2>
        </div>

        <div className="recipe-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            className={`cat-pill ${activeRecipe === 'sermon' ? 'active' : ''}`}
            onClick={() => setActiveRecipe('sermon')}
          >
            📖 8주 설교 시리즈 기획
          </button>
          <button
            type="button"
            className={`cat-pill ${activeRecipe === 'retreat' ? 'active' : ''}`}
            onClick={() => setActiveRecipe('retreat')}
          >
            ⛺ 수련회 WBS 일정 관리
          </button>
          <button
            type="button"
            className={`cat-pill ${activeRecipe === 'care' ? 'active' : ''}`}
            onClick={() => setActiveRecipe('care')}
          >
            🕊️ 환우 및 위기 가정 심방
          </button>
        </div>

        {activeRecipe === 'sermon' && (
          <div className="tip-card fade-in">
            <h4>로마서 8주 강해 설교 시리즈 채우기</h4>
            <p>
              1. 웹사이트의 <strong>[사역 템플릿 컬렉션]</strong>에서 <em>'로마서 8주 핵심 강해'</em> 팩을 선택합니다.<br />
              2. 1주차부터 8주차까지의 본문 구절과 중심 메시지, WBS 체크리스트를 확인합니다.<br />
              3. <strong>[노션 서식 복사]</strong>를 누른 후, 내 노션의 <em>Projects ➡️ '새 프로젝트'</em> 본문에 붙여넣기 하면 설교 기획서가 완성됩니다.<br />
              4. 주중에 떠오르는 묵상과 예화는 <em>Resources DB</em>에 축적하며 연결하세요.
            </p>
          </div>
        )}

        {activeRecipe === 'retreat' && (
          <div className="tip-card fade-in">
            <h4>청년부/중고등부 여름 수련회 올인원 WBS 채우기</h4>
            <p>
              1. 템플릿 컬렉션에서 <em>'청년부/중고등부 여름 수련회 A to Z 올인원 WBS'</em>를 선택합니다.<br />
              2. 주제 성구 선정, 강사 섭외, 숙소 예약, 조별 공과 집필, D-30 릴레이 기도 등 검증된 7단계 체크리스트를 확인합니다.<br />
              3. 내 노션의 Projects에 복사해 두고, 스마트폰 노션 앱으로 부서 교역자 및 부장 집사님과 진척도(%)를 실시간 공유하세요.
            </p>
          </div>
        )}

        {activeRecipe === 'care' && (
          <div className="tip-card fade-in">
            <h4>고난과 상실을 겪는 가정을 위한 심방 가이드</h4>
            <p>
              1. <em>'고난·상실·환우 가정을 위한 심방 위로 지침 &amp; 기도문 팩'</em>을 확인합니다.<br />
              2. 섣부른 인과응보적 해석을 배제하는 목회적 지침, 상황별 추천 성구(시 34:18, 롬 8:26), 그리고 마무리 중보 기도문을 복사합니다.<br />
              3. 내 노션의 <em>Resources ➡️ 심방/상담 가이드</em>에 넣어두고 심방 출발 전 차 안에서 스마트폰으로 열어보며 마음을 준비하세요.
            </p>
          </div>
        )}
      </section>

      {/* SECTION 5: FAQ 자주 묻는 질문 */}
      <section id="faq" className="guide-section-block">
        <div className="guide-sec-header">
          <span className="sec-step-badge">Part 5</span>
          <h2>자주 묻는 질문 (FAQ)</h2>
        </div>

        <div className="faq-list">
          <div className="faq-item">
            <h4>Q1. 내가 입력한 설교 원고나 개인 심방 메모가 외부로 유출되지 않나요?</h4>
            <p>
              안심하세요. 본 웹사이트는 <strong>사용자 브라우저(LocalStorage) 100% 로컬 저장 방식</strong>으로 작동합니다.
              작성하신 모든 프로젝트, 메모, 성도 심방 기록은 외부 서버로 전송되지 않으며 사용자 기기 안에만 안전하게 유지됩니다.
            </p>
          </div>

          <div className="faq-item">
            <h4>Q2. 교회 집무실 PC와 자택 노트북에서 데이터를 함께 쓰려면 어떻게 하나요?</h4>
            <p>
              상단 헤더 우측의 <strong>[백업]</strong> 버튼을 누르면 데이터와 설정(노션 링크·테마)이 <code>.json</code> 파일로 다운로드됩니다.
              다른 PC에서 <strong>[복원]</strong> 버튼을 누르고 해당 파일을 불러오면 그대로 이어서 쓰실 수 있습니다.
              <em>기기 간 자동 동기화는 지원하지 않으며, 복원은 현재 데이터를 덮어쓰는 방식입니다.</em>
            </p>
          </div>

          <div className="faq-item">
            <h4>Q3. 스마트폰이나 태블릿 노션 앱에서도 잘 보이나요?</h4>
            <p>
              이 웹사이트에서 복사하거나 CSV로 가져간 데이터는 노션 클라우드를 통해 스마트폰·아이패드·갤럭시 탭 노션 앱에 그대로 보입니다.
              <em>단, 이 웹사이트 자체의 데이터(로컬 저장)는 기기 간 자동 동기화되지 않으므로, 이동 시 백업 파일을 사용해 주세요.</em>
            </p>
          </div>

          <div className="faq-item">
            <h4>Q4. 노션 데이터베이스에 CSV를 가져왔는데 열 이름이 어긋나지 않나요?</h4>
            <p>
              본 사이트의 CSV 내보내기는 <strong>Ministry Second Brain PARA 원본 템플릿의 데이터베이스 속성명(이름 / 진행 상태 / 담당 부서·사역자 / 목표 마감일 / 핵심 산출물 및 링크)과 1:1로 일치</strong>하도록 설계되었습니다. 노션 데이터베이스를 전체 페이지로 연 뒤 표 우측 상단 <code>••</code> ➡️ <code>CSV와 병합 (Merge with CSV)</code>을 선택하시면 속성 이름이 1:1로 매칭되어 기존 DB에 그대로 채워집니다.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <div className="guide-cta-card">
        <div className="guide-cta-content">
          <h3>사역 세컨드 브레인을 지금 시작해 보세요</h3>
          <p>노션의 빈 페이지 앞에서 더 이상 고민하지 마시고, 정돈된 사역 템플릿으로 워크스페이스를 채워보세요.</p>
        </div>
        <div className="guide-cta-actions">
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="cta-primary-btn"
          >
            <span>대시보드로 돌아가기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
