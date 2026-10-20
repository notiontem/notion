import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Link2,
  Check,
  Clipboard,
  ShieldCheck,
  Trash2,
  ArrowRight
} from 'lucide-react';

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
    if (window.confirm('등록된 노션 연결 링크를 해제하시겠습니까?')) {
      onSaveUrl('');
      setUrlInput('');
      onClose();
    }
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
          setUrlInput(text.trim());
          if (errorMessage) setErrorMessage('');
        }
      }
    } catch {
      // Ignore clipboard read permission denied
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container url-modal-card fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header */}
        <div className="url-modal-header">
          <div className="url-modal-brand">
            <div className="url-notion-symbol">
              <span>N</span>
            </div>
            <div>
              <div className="url-badge-tag">
                <Link2 size={11} />
                <span>Notion Workspace Sync</span>
              </div>
              <h3 className="url-modal-heading">내 노션 워크스페이스 연결</h3>
              <p className="url-modal-desc">
                무료로 공유해 드리는 공식 템플릿을 내 노션에 복제한 후, 해당 페이지 주소를 연결합니다.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="url-modal-close-btn" title="닫기">
            <X size={17} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="url-modal-body">
          {/* Current Connection Status Box */}
          {currentUrl ? (
            <div className="url-status-box connected">
              <div className="status-box-left">
                <div className="status-indicator-dot online" />
                <div className="status-info-text">
                  <span className="status-title">현재 내 노션과 연동되어 있습니다</span>
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="status-url-link"
                    title="새 창에서 내 노션 열기"
                  >
                    <span>{currentUrl}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="url-status-box empty">
              <div className="status-box-left">
                <div className="status-indicator-dot pending" />
                <div className="status-info-text">
                  <span className="status-title">아직 내 노션 주소가 등록되지 않았습니다</span>
                  <span className="status-sub">아래 2단계 안내에 따라 복제본 링크를 등록해 주세요.</span>
                </div>
              </div>
            </div>
          )}

          {/* 2-Step Friendly Visual Guide */}
          <div className="url-steps-container">
            {/* Step 1 */}
            <div className="url-step-row">
              <div className="url-step-badge">1</div>
              <div className="url-step-content">
                <div className="url-step-text-wrap">
                  <strong>공식 템플릿을 내 노션에 복제하셨나요?</strong>
                  <p>아직 복제하지 않으셨다면 원본 페이지 우측 상단의 <strong>[복제(Duplicate)]</strong>를 먼저 실행하세요. (100% 무료 나눔)</p>
                </div>
                <a
                  href={DEFAULT_ORIGINAL_TEMPLATE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-open-template"
                >
                  <span>공식 템플릿 열기 (무료 복제)</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="url-step-row">
              <div className="url-step-badge">2</div>
              <div className="url-step-content">
                <div className="url-step-text-wrap">
                  <strong>복제된 내 페이지 주소 복사하기</strong>
                  <p>내 노션 페이지 우측 상단 <strong>[공유(Share)] ➔ [링크 복사]</strong>를 클릭한 뒤 아래에 붙여넣으세요.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <form onSubmit={handleSubmit} className="url-submit-form">
            <div className="url-field-group">
              <div className="url-field-label-row">
                <label className="url-field-label" htmlFor="notion-url-input">
                  내 노션 페이지 링크 (URL)
                </label>
                {typeof navigator !== 'undefined' && navigator.clipboard && (
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="btn-quick-paste"
                    title="클립보드에 복사된 링크 붙여넣기"
                  >
                    <Clipboard size={12} />
                    <span>붙여넣기</span>
                  </button>
                )}
              </div>

              <div className={`url-input-box ${errorMessage ? 'has-error' : ''}`}>
                <Link2 size={16} className="url-icon-left" />
                <input
                  id="notion-url-input"
                  type="url"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="https://www.notion.so/my-workspace/Ministry-Second-Brain-..."
                  className="url-text-input"
                  autoFocus
                />
              </div>

              {errorMessage && (
                <div className="url-error-alert fade-in">
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Security / Privacy Trust Strip */}
            <div className="url-privacy-trust">
              <ShieldCheck size={14} className="shield-icon" />
              <span>등록된 주소는 외부 서버로 전송되지 않으며, 사역자 본인의 기기(로컬 브라우저)에만 안전하게 보관됩니다.</span>
            </div>

            {/* Modal Bottom Footer Actions */}
            <div className="url-modal-bottom-actions">
              <div className="actions-left">
                {currentUrl ? (
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="btn-url-disconnect"
                    title="노션 연결 해제하기"
                  >
                    <Trash2 size={13} />
                    <span>연결 해제</span>
                  </button>
                ) : null}
              </div>

              <div className="actions-right">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-url-cancel"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-url-save"
                >
                  <Check size={14} />
                  <span>내 노션 연결 저장</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
