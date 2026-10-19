import React, { useState } from 'react';
import { X, Copy, Plus, Check, CheckCircle2, Package, Layers } from 'lucide-react';
import { PRESET_PACKS } from '../data/presetLibrary';
import { formatProjectForNotion, formatResourceForNotion, formatArchiveForNotion, copyToNotionClipboard } from '../utils/notionFormatter';

export default function PresetLibraryModal({
  isOpen,
  onClose,
  onAddPresetToData
}) {
  const [selectedPack, setSelectedPack] = useState(PRESET_PACKS[0]);
  const [copiedId, setCopiedId] = useState(null);
  const [addedId, setAddedId] = useState(null);

  if (!isOpen) return null;

  const handleCopyPreset = async (pack) => {
    let markdown = '';
    if (pack.type === 'Project') {
      markdown = formatProjectForNotion(pack.data, '사역 기획');
    } else if (pack.type === 'Resource') {
      markdown = formatResourceForNotion(pack.data);
    } else if (pack.type === 'Archive') {
      markdown = formatArchiveForNotion(pack.data, '사역 회고');
    }

    const res = await copyToNotionClipboard(markdown, `'${pack.title}' 노션 서식 복사 완료`);
    if (res.success) {
      setCopiedId(pack.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleAddToData = (pack) => {
    onAddPresetToData(pack);
    setAddedId(pack.id);
    setTimeout(() => setAddedId(null), 2200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container preset-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <span className="preset-icon-badge">
              <Package size={16} />
            </span>
            <div>
              <h3 className="modal-title">사역 템플릿 컬렉션</h3>
              <p className="modal-sub">목회 현장에서 검증된 설교 시리즈, 수련회 일정, 심방 가이드</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="닫기">
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="preset-modal-body">
          {/* Left Column: Preset Pack List */}
          <div className="preset-list-column">
            <div className="preset-list-header">
              <span>템플릿 목록 ({PRESET_PACKS.length})</span>
            </div>
            <div className="preset-pack-cards">
              {PRESET_PACKS.map((pack) => {
                const isSelected = selectedPack.id === pack.id;
                return (
                  <div
                    key={pack.id}
                    className={`preset-card-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedPack(pack)}
                  >
                    <div className="preset-card-top">
                      <span className="preset-category-tag">{pack.category}</span>
                      <span className="preset-type-badge">{pack.type}</span>
                    </div>
                    <h4 className="preset-card-title">{pack.title}</h4>
                    <p className="preset-card-desc">{pack.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detail & Actions */}
          <div className="preset-detail-column">
            {selectedPack && (
              <div className="preset-detail-content">
                <div className="preset-detail-header">
                  <div className="badge-row">
                    <span className="preset-badge-highlight">{selectedPack.category}</span>
                    <span className="preset-type-pill">{selectedPack.type}</span>
                  </div>
                  <h3 className="preset-detail-title">{selectedPack.title}</h3>
                  <p className="preset-detail-desc">{selectedPack.description}</p>
                </div>

                <div className="preset-preview-box">
                  <h4 className="preview-heading">내용 미리보기</h4>
                  
                  {selectedPack.type === 'Project' && (
                    <div className="preview-project">
                      <div className="preview-field">
                        <strong>핵심 목표:</strong> {selectedPack.data.goal}
                      </div>
                      <div className="preview-field">
                        <strong>기한 및 상태:</strong> {selectedPack.data.deadline} · {selectedPack.data.status}
                      </div>
                      <div className="preview-callout">
                        {selectedPack.data.notionCallout}
                      </div>
                      <div className="preview-wbs-list">
                        <strong>세부 과제 (WBS Checklist):</strong>
                        <ul>
                          {selectedPack.data.wbs.map(w => (
                            <li key={w.id}>
                              <span>{w.done ? '☑' : '◻'}</span> {w.task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {selectedPack.type === 'Resource' && (
                    <div className="preview-resource">
                      <div className="preview-field">
                        <strong>분류:</strong> {selectedPack.data.category}
                      </div>
                      <div className="preview-callout">
                        {selectedPack.data.summary}
                      </div>
                      <div className="preview-markdown-box">
                        <pre>{selectedPack.data.content}</pre>
                      </div>
                    </div>
                  )}

                  {selectedPack.type === 'Archive' && (
                    <div className="preview-archive">
                      <div className="preview-field">
                        <strong>완료일:</strong> {selectedPack.data.completedDate}
                      </div>
                      <div className="preview-callout">
                        {selectedPack.data.summary}
                      </div>
                      <div className="preview-markdown-box">
                        <pre>{selectedPack.data.retrospective}</pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="preset-actions-bar">
                  <button
                    onClick={() => handleCopyPreset(selectedPack)}
                    className="btn-preset-action copy"
                    title="노션에 바로 붙여넣을 수 있는 마크다운 서식으로 복사"
                  >
                    {copiedId === selectedPack.id ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedId === selectedPack.id ? '노션 복사 완료' : '노션 서식 복사'}</span>
                  </button>

                  <button
                    onClick={() => handleAddToData(selectedPack)}
                    className="btn-preset-action add"
                    title="웹 작업 공간에 추가하여 수정 및 관리"
                  >
                    {addedId === selectedPack.id ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                    <span>{addedId === selectedPack.id ? '보관함에 추가됨' : '내 보관함에 추가'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
