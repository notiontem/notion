import React, { useState } from 'react';
import { ExternalLink, CheckCircle2, X, ArrowRight, Link, BookOpen } from 'lucide-react';

const DEFAULT_ORIGINAL_TEMPLATE = "https://lava-child-76b.notion.site/Ministry-Second-Brain-PARA-faa57f770752494db4bf529eaf689998";

export default function OnboardingModal({
  isOpen,
  onClose,
  currentNotionUrl,
  onSaveNotionUrl,
  onStartWithCleanData,
  onStartWithSampleData
}) {
  const [step, setStep] = useState(1);
  const [urlInput, setUrlInput] = useState(currentNotionUrl || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveUrl = (e) => {
    e?.preventDefault();
    if (urlInput.trim()) {
      onSaveNotionUrl(urlInput.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const handleFinish = (useClean) => {
    if (urlInput.trim()) {
      onSaveNotionUrl(urlInput.trim());
    }
    if (useClean) {
      onStartWithCleanData();
    } else {
      onStartWithSampleData();
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container onboarding-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="onboarding-header">
          <div className="onboarding-badge">
            <BookOpen size={13} />
            <span>시작 셋업 가이드</span>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="닫기">
            <X size={16} />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="onboarding-step-indicator">
          <div className={`step-pill ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`} onClick={() => setStep(1)}>
            <span className="pill-num">{step > 1 ? '✓' : '1'}</span>
            <span>템플릿 복제</span>
          </div>
          <div className="pill-divider" />
          <div className={`step-pill ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`} onClick={() => setStep(2)}>
            <span className="pill-num">{step > 2 ? '✓' : '2'}</span>
            <span>노션 연결</span>
          </div>
          <div className="pill-divider" />
          <div className={`step-pill ${step === 3 ? 'active' : ''}`} onClick={() => setStep(3)}>
            <span className="pill-num">3</span>
            <span>작업 모드 선택</span>
          </div>
        </div>

        {/* Body based on Step */}
        <div className="onboarding-body">
          {step === 1 && (
            <div className="onboarding-step-content fade-in">
              <div className="onboarding-icon-box">
                <span className="notion-box-letter">N</span>
              </div>
              <h2 className="onboarding-title">노션 템플릿을 내 워크스페이스에 복제하세요</h2>
              <p className="onboarding-desc">
                무료로 공유해 드리는 <strong>Ministry Second Brain PARA</strong> 원본 템플릿을 개인 노션 계정에 복제(Duplicate)하셔야 
                자유롭게 사역 내용을 기록하고 편집하실 수 있습니다.
              </p>

              <div className="onboarding-card-box">
                <div className="card-item">
                  <span className="bullet">1</span>
                  <p>아래 <strong>[무료 원본 노션 템플릿 열기]</strong>를 클릭하여 페이지로 이동합니다.</p>
                </div>
                <div className="card-item">
                  <span className="bullet">2</span>
                  <p>열린 노션 페이지 우측 상단의 <strong>[복제(Duplicate)]</strong>를 클릭합니다.</p>
                </div>
                <div className="card-item">
                  <span className="bullet">3</span>
                  <p>본인 노션 워크스페이스에 복제가 완료되면 <strong>다음 단계</strong>로 진행하세요.</p>
                </div>
              </div>

              <div className="onboarding-actions">
                <a
                  href={DEFAULT_ORIGINAL_TEMPLATE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary-lg"
                >
                  <span>무료 원본 노션 템플릿 열기</span>
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => setStep(2)}
                  className="btn-secondary-lg"
                >
                  <span>이미 복제했습니다 (다음)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="onboarding-step-content fade-in">
              <div className="onboarding-icon-box link-icon">
                <Link size={24} />
              </div>
              <h2 className="onboarding-title">복제한 내 노션 페이지 주소를 등록하세요</h2>
              <p className="onboarding-desc">
                복제된 개인 노션 페이지 주소를 등록해 두시면, 상단 바에서 <strong>[내 노션 열기]</strong> 원클릭으로 
                언제든 작업 중인 노션으로 즉시 이동할 수 있습니다.
              </p>

              <div className="url-copy-guide">
                <p>💡 <strong>링크 복사 방법</strong>: 내 노션 페이지 우측 상단 <strong>[공유] ➡️ [링크 복사]</strong> 클릭 후 붙여넣기</p>
              </div>

              <form onSubmit={handleSaveUrl} className="onboarding-url-form">
                <div className="url-input-container">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://www.notion.so/my-workspace/Ministry-Second-Brain-..."
                    className="onboarding-input"
                  />
                  <button type="submit" className="onboarding-save-btn">
                    {savedSuccess ? '저장됨 ✓' : '등록'}
                  </button>
                </div>
                {savedSuccess && (
                  <p className="url-save-notice text-success">
                    <CheckCircle2 size={13} /> 노션 주소가 안전하게 저장되었습니다.
                  </p>
                )}
              </form>

              <div className="onboarding-actions">
                <button onClick={() => setStep(1)} className="btn-secondary-lg">
                  이전
                </button>
                <button onClick={() => setStep(3)} className="btn-primary-lg">
                  <span>다음 단계로</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="onboarding-step-content fade-in">
              <h2 className="onboarding-title">어떤 환경으로 시작하시겠습니까?</h2>
              <p className="onboarding-desc">
                목회 현장의 필요에 맞추어 시작 방식을 선택하세요. 언제든 상단 메뉴에서 예시 데이터로 초기화하거나 백업할 수 있습니다.
              </p>

              <div className="start-mode-grid">
                <div className="start-mode-card" onClick={() => handleFinish(false)}>
                  <div className="mode-badge sample">권장</div>
                  <div className="mode-icon">📖</div>
                  <h3>실전 모범 예시로 시작하기</h3>
                  <p>로마서 8주 강해 설교, 수련회 WBS, 새가족 정착 시스템 등 정돈된 예시 데이터를 참고하며 작업합니다.</p>
                  <button className="mode-select-btn primary">
                    <span>예시 데이터로 시작</span>
                  </button>
                </div>

                <div className="start-mode-card" onClick={() => handleFinish(true)}>
                  <div className="mode-badge clean">클린</div>
                  <div className="mode-icon">📄</div>
                  <h3>빈 워크스페이스로 시작하기</h3>
                  <p>예시 항목들을 비우고, 본인 교회의 프로젝트와 설교, 심방 기록만을 새롭게 등록하여 단정하게 시작합니다.</p>
                  <button className="mode-select-btn secondary">
                    <span>깨끗한 캔버스로 시작</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
