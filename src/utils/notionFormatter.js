import confetti from 'canvas-confetti';

/**
 * Converts a Project into rich Notion-ready Markdown
 */
export function formatProjectForNotion(project, areaName = '') {
  const wbs = Array.isArray(project.wbs) ? project.wbs : [];
  const wbsChecked = wbs.filter(w => w.done).length;
  const totalWbs = wbs.length;
  const progressPercent = totalWbs > 0 ? Math.round((wbsChecked / totalWbs) * 100) : 0;
  const deadlineLabel = project.deadline ? project.deadline : '미정';
  const tags = Array.isArray(project.tags) ? project.tags : [];

  const calloutBlock = project.notionCallout ? `> ${project.notionCallout}\n` : '';

  return `# 🎯 [Project] ${project.title}

> 📌 **상태**: ${project.status} | **마감일**: ${deadlineLabel} | **소속 영역**: ${areaName || '미지정'} | **진척도**: ${progressPercent}% (${wbsChecked}/${totalWbs})
> 🏷️ **태그**: ${tags.map(t => `#${t}`).join(' ') || '없음'}

${calloutBlock}---

### 🎯 핵심 목표 및 기대 결과 (Goal & Expected Outcome)
${project.goal || '—'}

---

### ✅ 세부 실행 계획 및 체크리스트 (WBS & Action Items)
${wbs.map(item => `- [${item.done ? 'x' : ' '}] ${item.task}`).join('\n') || '- [ ] 세부 과업을 추가하세요'}

---

### 📝 사역 메모 및 리소스 연결 (Notes & Resources)
${project.notes || '추가 메모 없음'}
`;
}

/**
 * Converts an Area into rich Notion-ready Markdown
 */
export function formatAreaForNotion(area, linkedProjects = []) {
  const routines = Array.isArray(area.routines) ? area.routines : [];
  return `# 🏛️ [Area] ${area.name}

> 👤 **책임자/팀**: ${area.leader} | **코드**: ${area.code}
> 📊 **활성 프로젝트**: ${linkedProjects.length}개 진행 중

---

### 🎯 책임 영역 헌장 및 기준 (Ministry Standard)
${area.standard}

---

### 🔄 주간 및 정기 핵심 루틴 (Standard Operating Procedures)
${routines.map(routine => `- 🔹 ${routine}`).join('\n')}

---

### 🚀 연결된 사역 프로젝트 (Active Projects)
${linkedProjects.length > 0
  ? linkedProjects.map(p => `- **${p.title}** (${p.status}, 마감: ${p.deadline || '미정'})`).join('\n')
  : '- 현재 진행 중인 직결 프로젝트가 없습니다.'}
`;
}

/**
 * Converts a Resource into rich Notion-ready Markdown
 */
export function formatResourceForNotion(resource) {
  const tags = Array.isArray(resource.tags) ? resource.tags : [];
  return `# 📚 [Resource] ${resource.title}

> 📂 **분류**: ${resource.category || '미분류'}
> 🏷️ **태그**: ${tags.map(t => `#${t}`).join(' ') || '없음'}

---

### 💡 한 줄 요약 (Core Summary)
> ${resource.summary}

---

### 📖 내용 및 사역 적용 자료 (Content)
${resource.content}
`;
}

/**
 * Converts an Archive item into rich Notion-ready Markdown
 */
export function formatArchiveForNotion(archive, areaName = '') {
  return `# 📦 [Archive] ${archive.title}

> 📅 **완료일**: ${archive.completedDate} | **소속 영역**: ${areaName || '미지정'}

---

### 📋 사역 요약 및 성과 (Summary)
${archive.summary}

---

### 🔍 사역 회고 및 사후 평가 (AAR - After Action Review)
${archive.retrospective}
`;
}

/**
 * Copies formatted text to clipboard and triggers an celebratory confetti & toast feedback
 */
export async function copyToNotionClipboard(text, customMessage = '노션 형식으로 클립보드에 복사되었습니다! 노션에 붙여넣기(Ctrl+V) 하세요.') {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }

    // Trigger visual confetti
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
      });
    } catch {
      // Confetti optional
    }

    return { success: true, message: customMessage };
  } catch (err) {
    console.error('Copy failed: ', err);
    return { success: false, message: '복사에 실패했습니다. 권한을 확인해주세요.' };
  }
}
