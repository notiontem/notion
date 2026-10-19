/**
 * Utility to export Ministry Second Brain data into Notion-compatible CSV format.
 * Includes UTF-8 BOM to prevent Korean character distortion in Excel and Notion.
 *
 * [중요] 각 CSV의 헤더는 노션 템플릿의 데이터베이스 속성명과 100% 동일하게 맞춰져 있습니다.
 * 따라서 노션 표 우측 상단 [···] → [CSV 가져오기 (Merge with CSV)] 로
 * 기존 템플릿 데이터베이스 속성에 이름 그대로 병합됩니다.
 *
 * 매핑 기준 (노션 템플릿 실제 속성)
 *  - PROJECTS  : 이름 / 진행 상태 / 담당 부서·사역자 / 목표 마감일 / 핵심 산출물 및 링크
 *  - RESOURCES : 이름 / 카테고리 / 소분류 항목 / 보관 수량 / 비고 및 검색 팁
 *  - AREAS     : 이름 / 사역적 중요도 / 현재 만족도 / 주간 점검 루틴 / 지속적 실천 원칙
 *  - ARCHIVES  : 이름 / 완료된 사역 수 / 설교 시리즈 / 수련회 및 행사 결과 / 예결산 및 통계
 */

/**
 * 병합(Merge with CSV) 시 셀 안에 마크다운 기호(###, **, -)가 그대로 노출되지 않도록 평문으로 바꾼다.
 * 서식이 그대로 살아야 하는 본문은 '노션 서식 복사' 경로를 쓴다.
 */
function toPlainText(markdown) {
  return String(markdown || '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * 노션과 아직 동기화되지 않은 항목인지 판별한다.
 * 한 번도 내보내지 않았거나, 내보낸 뒤에 수정된 항목이 '신규·수정' 대상이다.
 * 중복 병합 사고를 막는 '신규만 내보내기' 모드의 기준이다.
 */
export function isUnsyncedItem(item) {
  if (!item) return false;
  if (!item.exportedAt) return true;
  return !!(item.updatedAt && item.updatedAt > item.exportedAt);
}

// Escape CSV field properly
function escapeCsv(field) {
  if (field === null || field === undefined || field === '') return '';
  const str = String(field);
  // If field contains comma, quote, or newline, escape it
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

// Download helper with UTF-8 BOM
function downloadCsvFile(csvContent, filename) {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 노션 템플릿의 '진행 상태' 옵션(시작 전 / 진행 중 / 완료)에 맞게 정규화
function normalizeStatus(status) {
  const map = {
    '진행중': '진행 중',
    '진행 중': '진행 중',
    '기획중': '시작 전',
    '대기': '시작 전',
    '시작 전': '시작 전',
    '완료': '완료'
  };
  return map[status] || status || '';
}

/**
 * Export Projects → 노션 템플릿 '사역 프로젝트 마스터 DB' 속성과 동일한 열
 */
export function exportProjectsToCsv(projects, areas = [], tag = '') {
  const areaMap = {};
  areas.forEach(a => {
    areaMap[a.id] = { name: a.name || '', leader: a.leader || '' };
  });

  const headers = [
    "이름",
    "진행 상태",
    "담당 부서/사역자",
    "목표 마감일",
    "핵심 산출물 및 링크"
  ];

  const rows = projects.map(p => {
    const wbsDone = p.wbs ? p.wbs.filter(w => w.done).length : 0;
    const wbsTotal = p.wbs ? p.wbs.length : 0;
    const progress = wbsTotal > 0 ? `${Math.round((wbsDone / wbsTotal) * 100)}%` : '';
    const area = areaMap[p.areaId] || {};
    const owner = area.leader || area.name || '';
    const tags = Array.isArray(p.tags) ? p.tags.map(t => `#${t}`).join(' ') : (p.tags || '');
    const deliverable = [
      p.goal || '',
      progress ? `(진척도 ${progress})` : '',
      tags ? `| ${tags}` : ''
    ].filter(Boolean).join(' ');

    return [
      escapeCsv(p.title),
      escapeCsv(normalizeStatus(p.status)),
      escapeCsv(owner),
      escapeCsv(p.deadline),
      escapeCsv(deliverable)
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const today = new Date().toISOString().split('T')[0];
  downloadCsvFile(csv, `노션_사역_프로젝트_DB_${today}${tag ? '_' + tag : ''}.csv`);
}

/**
 * 노션 '목회 지식창고 & 설교 예화 DB'의 카테고리 옵션과 1:1로 맞추기 위한 변환.
 * 앱에서는 목회 현장 용어(설교 예화, 심방/상담 가이드 등)를 쓰고,
 * CSV로 내보낼 때만 템플릿 옵션(설교 지원, 말씀 연구, 목회 행정, 지성 & 영성, 예배 미디어)으로 바꾼다.
 */
const RESOURCE_CATEGORY_MAP = {
  '설교 예화': '설교 지원',
  '심방/상담 가이드': '목회 행정',
  '찬양 콘티': '예배 미디어',
  '소그룹 공과': '말씀 연구',
  '사역 매뉴얼': '목회 행정'
};

/**
 * Export Resources → 노션 템플릿 '목회 지식창고 & 설교 예화 DB' 속성과 동일한 열
 */
export function exportResourcesToCsv(resources, tag = '') {
  const headers = [
    "이름",
    "카테고리",
    "소분류 항목",
    "보관 수량",
    "비고 및 검색 팁"
  ];

  const rows = resources.map(r => {
    const tags = Array.isArray(r.tags) ? r.tags.join(', ') : (r.tags || '');
    return [
      escapeCsv(r.title),
      escapeCsv(RESOURCE_CATEGORY_MAP[r.category] || r.category || ''),
      escapeCsv(tags),
      escapeCsv(r.quantity != null ? r.quantity : ''),
      escapeCsv(r.summary)
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const today = new Date().toISOString().split('T')[0];
  downloadCsvFile(csv, `노션_목회_지식창고_DB_${today}${tag ? '_' + tag : ''}.csv`);
}

/**
 * 노션 '영역별 균형 트래커 DB'와 1:1로 맞추기 위한 변환.
 * 템플릿 속성은 '사역적 중요도'(선택: ★★★★★ / ★★★★☆)와 '현재 만족도'(숫자)이다.
 * 이름은 병합 시 기존 행과 일치하도록 notionTitle(정식 행 제목)을 쓴다.
 */
function toStarOption(value) {
  if (value === '★★★★★' || value === '★★★★☆') return value;
  if (typeof value === 'number') return value >= 5 ? '★★★★★' : value >= 4 ? '★★★★☆' : String(value);
  return value != null ? String(value) : '';
}

/**
 * Export Areas → 노션 템플릿 '영역별 균형 트래커 DB' 속성과 동일한 열
 */
export function exportAreasToCsv(areas, tag = '') {
  const headers = [
    "이름",
    "사역적 중요도",
    "현재 만족도",
    "주간 점검 루틴",
    "지속적 실천 원칙"
  ];

  const rows = areas.map(a => {
    const routines = Array.isArray(a.routines) ? a.routines.join(' | ') : (a.routines || '');
    return [
      escapeCsv(a.notionTitle || a.name),
      escapeCsv(toStarOption(a.importance)),
      escapeCsv(a.satisfaction != null ? a.satisfaction : ''),
      escapeCsv(routines),
      escapeCsv(a.standard)
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const today = new Date().toISOString().split('T')[0];
  downloadCsvFile(csv, `노션_영역별_균형_트래커_DB_${today}${tag ? '_' + tag : ''}.csv`);
}

/**
 * Export Archives → 노션 템플릿 '연도별 사역 아카이브 DB' 속성과 동일한 열
 */
export function exportArchivesToCsv(archives, areas = [], tag = '') {
  const areaMap = {};
  areas.forEach(a => {
    areaMap[a.id] = a.name || '';
  });

  const headers = [
    "이름",
    "완료된 사역 수",
    "설교 시리즈",
    "수련회 및 행사 결과",
    "예결산 및 통계"
  ];

  const rows = archives.map(arch => {
    const areaName = areaMap[arch.originalArea] || arch.originalArea || '';
    const resultSummary = [
      arch.summary || '',
      arch.completedDate ? `(완료: ${arch.completedDate})` : '',
      areaName ? `| 관련 영역: ${areaName}` : ''
    ].filter(Boolean).join(' ');

    return [
      escapeCsv(arch.title),
      escapeCsv(arch.completedCount != null ? arch.completedCount : ''),
      escapeCsv(arch.sermonSeries || ''),
      escapeCsv(resultSummary),
      escapeCsv(toPlainText(arch.retrospective))
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const today = new Date().toISOString().split('T')[0];
  downloadCsvFile(csv, `노션_연도별_사역_아카이브_DB_${today}${tag ? '_' + tag : ''}.csv`);
}
