import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Link, Check, Sparkles, HelpCircle } from 'lucide-react';

const DEFAULT_ORIGINAL_TEMPLATE = "https://lava-child-76b.notion.site/Ministry-Second-Brain-PARA-faa57f770752494db4bf529eaf689998";

export default function SetNotionUrlModal({
  isOpen,
  onClose,
  currentUrl,
  onSaveUrl
}) {
  const [urlInput, setUrlInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setUrlInput(currentUrl || '');
    setErrorMessage('');
  }, [currentUrl, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = urlInput.trim();

    if (!trimmed) {
      setErrorMessage('노션 페이지 링크를 입력해 주세요.');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setErrorMessage("올바른 URL 형식이어야 합니다. (예: https://www.notion.so/...)");
      return;
    }

    onSaveUrl(trimmed);
    onClose();
  };

  const handleResetToDefault = () => {
    onSaveUrl('');
    setUrlInput('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container url-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <span className="notion-icon">N</span>
            <div>
              <h3 className="modal-title">내 노션 템플릿 링크 설정</h3>
              <p className="modal-sub">본인의 노션 워크스페이스에 복제된 전용 페이지 URL을 연결합니다</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="url-guide-card">
            <div className="url-guide-step">
              <span className="step-num">1</span>
              <div>
                <strong>아직 템플릿을 내 노션에 복제하지 않으셨나요?</strong>
                <p>아래 버튼을 눌러 원본 템플릿을 열고, 우측 상단 <strong>[복제(Duplicate)]</strong>를 눌러 본인의 노션에 추가하세요.</p>
                <a
                  href={DEFAULT_ORIGINAL_TEMPLATE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-text-link"
                >
                  <span>원본 템플릿 열기 & 복제하러 가기</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            <div className="url-guide-step">
              <span className="step-num">2</span>
              <div>
                <strong>내 노션 페이지 링크 복사하기</strong>
                <p>복제된 본인 노션 페이지 우측 상단 <strong>[공유(Share)] ➡️ [링크 복사(Copy link)]</strong>를 누른 뒤 아래에 붙여넣으세요.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label className="form-label">내 노션 페이지 URL 주소</label>
              <div className="url-input-wrap">
                <Link size={16} className="url-input-icon" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="https://www.notion.so/my-workspace/Ministry-Second-Brain-..."
                  className="form-input url-input"
                  autoFocus
                />
              </div>
              {errorMessage && <p className="form-error-msg">{errorMessage}</p>}
            </div>

            <div className="url-modal-tips">
              <HelpCircle size={14} className="text-muted" />
              <span>등록된 주소는 사용자의 브라우저(로컬 스토리지)에 안전하게 저장되어 유지됩니다.</span>
            </div>

            <div className="modal-footer url-modal-footer">
              {currentUrl && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="btn-danger-outline"
                >
                  연결 해제 (초기화)
                </button>
              )}
              <div className="footer-right-buttons">
                <button type="button" onClick={onClose} className="btn-secondary">
                  취소
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} />
                  <span>내 노션 링크 저장</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
