import React, { useState } from 'react';
import { Plus, Copy, Check, Calendar, CheckSquare, Clock, Filter, Trash2, Edit3, ArrowUpRight, FileSpreadsheet } from 'lucide-react';
import { formatProjectForNotion, copyToNotionClipboard } from '../utils/notionFormatter';
import { exportProjectsToCsv, isUnsyncedItem } from '../utils/notionCsvExporter';

export default function ProjectSection({
  projects,
  areas,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onToggleWbs,
  onOpenDetail,
  csvOnlyNew,
  onCsvExported
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  const filteredProjects = projects.filter(p => {
    if (statusFilter === 'ALL') return true;
    return p.status === statusFilter;
  });

  const handleCopy = async (project, e) => {
    e.stopPropagation();
    const area = areas.find(a => a.id === project.areaId);
    const markdown = formatProjectForNotion(project, area ? area.name : '');
    const res = await copyToNotionClipboard(markdown, `'${project.title}' 노션 서식으로 복사 완료!`);
    if (res.success) {
      setCopiedId(project.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getDDay = (deadlineStr) => {
    if (!deadlineStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(deadlineStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  return (
    <div className="section-container">
      {/* Section Header */}
      <div className="section-toolbar">
        <div>
          <div className="section-title-wrap">
            <span className="para-badge project-badge">P</span>
            <h2 className="section-title">Projects (사역 프로젝트)</h2>
          </div>
          <p className="section-desc">
            마감일과 명확한 완료 목표가 있는 구체적인 사역 (설교 시리즈, 수련회, 절기 행사, 특별 프로젝트)
          </p>
        </div>

        <div className="toolbar-actions">
          {/* Status Filter */}
          <div className="filter-group">
            <Filter size={15} className="filter-icon" />
            <button
              className={`filter-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              전체 ({projects.length})
            </button>
            <button
              className={`filter-btn ${statusFilter === '진행 중' ? 'active' : ''}`}
              onClick={() => setStatusFilter('진행 중')}
            >
              진행 중 ({projects.filter(p => p.status === '진행 중').length})
            </button>
            <button
              className={`filter-btn ${statusFilter === '시작 전' ? 'active' : ''}`}
              onClick={() => setStatusFilter('시작 전')}
            >
              시작 전 ({projects.filter(p => p.status === '시작 전').length})
            </button>
            <button
              className={`filter-btn ${statusFilter === '완료' ? 'active' : ''}`}
              onClick={() => setStatusFilter('완료')}
            >
              완료 ({projects.filter(p => p.status === '완료').length})
            </button>
          </div>

          <button
            onClick={() => {
              const list = csvOnlyNew ? projects.filter(isUnsyncedItem) : projects;
              if (!list.length) return;
              exportProjectsToCsv(list, areas, csvOnlyNew ? '신규' : '');
              if (onCsvExported) onCsvExported('Project', list.map(i => i.id));
            }}
            disabled={csvOnlyNew && !projects.some(isUnsyncedItem)}
            className="action-btn csv-btn"
            title="노션 Projects 데이터베이스로 가져올 수 있는 CSV 다운로드"
          >
            <FileSpreadsheet size={15} />
            <span>노션 CSV 내보내기</span>
          </button>

          <button
            onClick={onAddProject}
            className="create-btn project-btn"
          >
            <Plus size={16} />
            <span>새 프로젝트 등록</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="cards-grid">
        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <p>해당 상태의 사역 프로젝트가 없습니다.</p>
            <button onClick={onAddProject} className="empty-action-btn">
              <Plus size={16} />
              <span>새 프로젝트 시작하기</span>
            </button>
          </div>
        ) : (
          filteredProjects.map(project => {
            const area = areas.find(a => a.id === project.areaId);
            const totalTasks = project.wbs ? project.wbs.length : 0;
            const completedTasks = project.wbs ? project.wbs.filter(t => t.done).length : 0;
            const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const dDay = getDDay(project.deadline);

            return (
              <div
                key={project.id}
                className="project-card"
                onClick={() => onOpenDetail(project, 'Project')}
              >
                {/* Card Top Meta */}
                <div className="card-top-meta">
                  <div className="meta-left">
                    <span className={`status-pill ${project.status === '진행 중' ? 'status-active' : project.status === '완료' ? 'status-done' : 'status-plan'}`}>
                      {project.status}
                    </span>
                    {area && (
                      <span className="area-pill">
                        {area.icon} {area.name}
                      </span>
                    )}
                  </div>

                  <div className="meta-right">
                    {dDay && (
                      <span className={`dday-badge ${dDay === 'D-Day' || dDay.startsWith('D-') ? 'dday-urgent' : 'dday-passed'}`}>
                        {dDay}
                      </span>
                    )}
                  </div>
                </div>

                {/* Project Title */}
                <h3 className="card-title">{project.title}</h3>

                {/* Notion Callout Box */}
                {project.notionCallout && (
                  <div className="card-callout">
                    <span className="callout-emoji">💡</span>
                    <p>{project.notionCallout.replace(/^>\s*/, '')}</p>
                  </div>
                )}

                {/* Goal summary */}
                <p className="card-goal">
                  <strong>목표:</strong> {project.goal}
                </p>

                {/* Progress Bar */}
                <div className="progress-section">
                  <div className="progress-label">
                    <span>실행 진척도</span>
                    <strong>{percent}% ({completedTasks}/{totalTasks})</strong>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Interactive Action Items (WBS Top 3) */}
                {project.wbs && project.wbs.length > 0 && (
                  <div className="card-wbs-list">
                    {project.wbs.slice(0, 4).map(item => (
                      <div
                        key={item.id}
                        className={`wbs-check-item ${item.done ? 'wbs-done' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWbs(project.id, item.id);
                        }}
                      >
                        <span className="wbs-checkbox">
                          {item.done ? '☑' : '☐'}
                        </span>
                        <span className="wbs-text">{item.task}</span>
                      </div>
                    ))}
                    {project.wbs.length > 4 && (
                      <span className="wbs-more-count">
                        +{project.wbs.length - 4}개 세부 과업 더보기
                      </span>
                    )}
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="card-footer">
                  <div className="card-deadline">
                    <Calendar size={14} />
                    <span>{project.deadline ? `마감: ${project.deadline}` : '마감 미정'}</span>
                  </div>

                  <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleCopy(project, e)}
                      className={`card-copy-btn ${copiedId === project.id ? 'copied' : ''}`}
                      title="노션에 바로 붙여넣을 수 있는 마크다운 복사"
                    >
                      {copiedId === project.id ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedId === project.id ? '복사됨' : '노션 복사'}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`'${project.title}' 프로젝트를 삭제하시겠습니까?`)) {
                          onDeleteProject(project.id);
                        }
                      }}
                      className="card-delete-btn"
                      title="삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
