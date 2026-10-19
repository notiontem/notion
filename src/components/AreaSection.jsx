import React, { useState } from 'react';
import { Plus, Copy, Check, Users, ShieldCheck, ListChecks, ArrowRight, Trash2 } from 'lucide-react';
import { formatAreaForNotion, copyToNotionClipboard } from '../utils/notionFormatter';

export default function AreaSection({
  areas,
  projects,
  onAddArea,
  onDeleteArea,
  onOpenDetail
}) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (area, e) => {
    e.stopPropagation();
    const linkedProjects = projects.filter(p => p.areaId === area.id);
    const markdown = formatAreaForNotion(area, linkedProjects);
    const res = await copyToNotionClipboard(markdown, `'${area.name}' 책임 영역 노션 서식 복사 완료!`);
    if (res.success) {
      setCopiedId(area.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="section-container">
      {/* Section Header */}
      <div className="section-toolbar">
        <div>
          <div className="section-title-wrap">
            <span className="para-badge area-badge">A</span>
            <h2 className="section-title">Areas (사역 책임 영역)</h2>
          </div>
          <p className="section-desc">
            마감일 없이 지속적으로 높은 기준(Standard)과 영적 충실도를 유지해야 하는 목회 본연의 핵심 책임 영역
          </p>
        </div>

        <button
          onClick={onAddArea}
          className="create-btn area-btn"
        >
          <Plus size={16} />
          <span>새 책임 영역 등록</span>
        </button>
      </div>

      {/* Areas Grid */}
      <div className="cards-grid">
        {areas.map(area => {
          const linkedProjects = projects.filter(p => p.areaId === area.id);

          return (
            <div
              key={area.id}
              className="area-card"
              onClick={() => onOpenDetail(area, 'Area')}
            >
              <div className="area-card-header">
                <div className="area-icon-box">
                  <span className="area-emoji">{area.icon || '🏛️'}</span>
                </div>
                <div className="area-title-wrap">
                  <h3 className="card-title">{area.name}</h3>
                  <span className="area-leader">
                    <Users size={13} /> {area.leader}
                  </span>
                </div>
              </div>

              {/* Standard */}
              <div className="area-standard-box">
                <div className="standard-header">
                  <ShieldCheck size={14} />
                  <span>사역 기준 헌장 (Standard)</span>
                </div>
                <p className="standard-text">{area.standard}</p>
              </div>

              {/* Routines SOP */}
              <div className="area-routines-section">
                <div className="routines-header">
                  <ListChecks size={14} />
                  <span>정기 핵심 루틴 (SOP)</span>
                </div>
                <ul className="routines-list">
                  {area.routines.slice(0, 3).map((routine, idx) => (
                    <li key={idx} className="routine-item">
                      <span className="bullet-point">▸</span>
                      <span>{routine}</span>
                    </li>
                  ))}
                  {area.routines.length > 3 && (
                    <li className="routine-more">+{area.routines.length - 3}개 루틴 더보기</li>
                  )}
                </ul>
              </div>

              {/* Active Projects Link */}
              <div className="area-linked-projects">
                <span className="linked-label">연결된 프로젝트:</span>
                {linkedProjects.length > 0 ? (
                  <span className="linked-count-badge">
                    {linkedProjects.length}개 진행 중
                  </span>
                ) : (
                  <span className="linked-empty">진행 중 프로젝트 없음</span>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="card-footer" onClick={(e) => e.stopPropagation()}>
                <span className="area-code">{area.code}</span>

                <div className="card-actions">
                  <button
                    onClick={(e) => handleCopy(area, e)}
                    className={`card-copy-btn ${copiedId === area.id ? 'copied' : ''}`}
                    title="노션에 붙여넣을 수 있는 마크다운 복사"
                  >
                    {copiedId === area.id ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedId === area.id ? '복사됨' : '노션 복사'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`'${area.name}' 책임 영역을 삭제하시겠습니까?`)) {
                        onDeleteArea(area.id);
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
        })}
      </div>
    </div>
  );
}
