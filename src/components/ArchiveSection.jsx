import React, { useState } from 'react';
import { Plus, Copy, Check, Archive, Calendar, Trash2, RotateCcw } from 'lucide-react';
import { formatArchiveForNotion, copyToNotionClipboard } from '../utils/notionFormatter';

export default function ArchiveSection({
  archives,
  areas,
  onAddArchive,
  onDeleteArchive,
  onOpenDetail
}) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (arch, e) => {
    e.stopPropagation();
    const area = areas.find(a => a.id === arch.originalArea);
    const markdown = formatArchiveForNotion(arch, area ? area.name : '');
    const res = await copyToNotionClipboard(markdown, `'${arch.title}' 노션 보관 서식 복사 완료!`);
    if (res.success) {
      setCopiedId(arch.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="section-container">
      {/* Section Header */}
      <div className="section-toolbar">
        <div>
          <div className="section-title-wrap">
            <span className="para-badge archive-badge">A</span>
            <h2 className="section-title">Archives (사역 보관함)</h2>
          </div>
          <p className="section-desc">
            완료되거나 비활성화된 사역 프로젝트 및 사후 평가(AAR) 회고록. 다음 세대 사역의 귀중한 나침반이 됩니다.
          </p>
        </div>

        <button
          onClick={onAddArchive}
          className="create-btn archive-btn"
        >
          <Plus size={16} />
          <span>새 보관 항목 등록</span>
        </button>
      </div>

      {/* Archives Grid */}
      <div className="cards-grid">
        {archives.length === 0 ? (
          <div className="empty-state">
            <p>보관함에 저장된 지난 사역 기록이 없습니다.</p>
            <button onClick={onAddArchive} className="empty-action-btn">
              <Plus size={16} />
              <span>완료된 사역 기록하기</span>
            </button>
          </div>
        ) : (
          archives.map(arch => {
            const area = areas.find(a => a.id === arch.originalArea);

            return (
              <div
                key={arch.id}
                className="archive-card"
                onClick={() => onOpenDetail(arch, 'Archive')}
              >
                <div className="card-top-meta">
                  <div className="meta-left">
                    <span className="archive-pill">
                      <Archive size={12} /> 완료 보관됨
                    </span>
                    {area && (
                      <span className="area-pill">
                        {area.icon} {area.name}
                      </span>
                    )}
                  </div>

                  <span className="archive-date">
                    <Calendar size={13} /> {arch.completedDate}
                  </span>
                </div>

                <h3 className="card-title">{arch.title}</h3>

                <p className="archive-summary">{arch.summary}</p>

                {/* Retrospective Preview */}
                <div className="retrospective-preview">
                  <span className="retro-label">🎯 사역 회고 (AAR 발췌):</span>
                  <pre className="retro-pre">
                    {arch.retrospective.replace(/[#>*-]/g, '').trim().substring(0, 150)}...
                  </pre>
                </div>

                {/* Card Footer Actions */}
                <div className="card-footer" onClick={(e) => e.stopPropagation()}>
                  <span className="read-more-text">클릭하여 전체 회고 보기</span>

                  <div className="card-actions">
                    <button
                      onClick={(e) => handleCopy(arch, e)}
                      className={`card-copy-btn ${copiedId === arch.id ? 'copied' : ''}`}
                      title="노션에 붙여넣을 수 있는 마크다운 복사"
                    >
                      {copiedId === arch.id ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedId === arch.id ? '복사됨' : '노션 복사'}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`'${arch.title}' 보관 항목을 삭제하시겠습니까?`)) {
                          onDeleteArchive(arch.id);
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
