import React, { useState } from 'react';
import { ExternalLink, ArrowRight, Settings, Link2, CheckCircle2, ChevronDown, ChevronUp, Package, BookOpen } from 'lucide-react';

const DEFAULT_ORIGINAL_TEMPLATE = "https://lava-child-76b.notion.site/Ministry-Second-Brain-PARA-faa57f770752494db4bf529eaf689998";

export default function NotionBanner({
  userNotionUrl,
  onOpenSetUrlModal,
  onOpenPresetModal
}) {
  const [expanded, setExpanded] = useState(false);

  const handleOpenMyNotion = () => {
    if (userNotionUrl && userNotionUrl.trim()) {
      window.open(userNotionUrl, '_blank', 'noopener,noreferrer');
    } else {
      onOpenSetUrlModal();
    }
  };

  const handleOpenOriginalTemplate = () => {
    window.open(DEFAULT_ORIGINAL_TEMPLATE, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="sleek-notion-banner-wrap">
      <div className="sleek-notion-banner">
        <div className="sleek-banner-main">
          {/* Left info */}
          <div className="sleek-banner-left">
            <div className="sleek-notion-tag">
              <span className="notion-symbol-pill">N</span>
              <span>Notion PARA 동반 도구</span>
            </div>
            <div className="sleek-banner-titles">
              <h3>Ministry Second Brain</h3>
              <p>설교·행사·사역 데이터를 정리하고 내 노션 데이터베이스로 원클릭 내보내기</p>
            </div>
          </div>

          {/* Right status & actions */}
          <div className="sleek-banner-right">
            {userNotionUrl ? (
              <div className="notion-status-badge connected" onClick={onOpenSetUrlModal} role="button" title="노션 설정">
                <CheckCircle2 size={13} />
                <span>내 노션 연동됨</span>
              </div>
            ) : (
              <div className="notion-status-badge pending" onClick={onOpenSetUrlModal} role="button" title="노션 링크 연결하기">
                <Link2 size={13} />
                <span>노션 링크 등록</span>
              </div>
            )}

            <div className="sleek-btn-group">
              {userNotionUrl ? (
                <button
                  onClick={handleOpenMyNotion}
                  className="btn-sleek-primary"
                  title="내 노션 워크스페이스 열기"
                >
                  <span>내 노션 열기</span>
                  <ExternalLink size={13} />
                </button>
              ) : (
                <button
                  onClick={handleOpenOriginalTemplate}
                  className="btn-sleek-highlight"
                  title="구매한 원본 템플릿 열기"
                >
                  <span>원본 템플릿 복제</span>
                  <ExternalLink size={13} />
                </button>
              )}

              <button
                onClick={onOpenSetUrlModal}
                className="btn-sleek-icon"
                title="노션 링크 설정"
              >
                <Settings size={14} />
              </button>

              <button
                onClick={() => setExpanded(!expanded)}
                className="btn-sleek-toggle"
                title="노션 연동 3단계 가이드"
              >
                <span>{expanded ? '가이드 접기' : '연동 가이드'}</span>
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          </div>
        </div>

        {/* Expandable 3-Step Guide Drawer */}
        {expanded && (
          <div className="sleek-banner-expanded fade-in">
            <div className="sleek-steps-grid">
              <div className="sleek-step-card">
                <span className="step-num">01</span>
                <div className="step-content">
                  <strong>원본 템플릿 복제</strong>
                  <p>구매하신 공식 노션 템플릿을 본인의 워크스페이스에 [복제(Duplicate)]합니다.</p>
                </div>
              </div>

              <div className="sleek-step-divider">
                <ArrowRight size={14} />
              </div>

              <div className="sleek-step-card">
                <span className="step-num">02</span>
                <div className="step-content">
                  <strong>사역 콘텐츠 기획</strong>
                  <p>공지문 작성기, 행사 관리, 설교 아웃라인 등 필요한 콘텐츠를 여기서 간편하게 완성합니다.</p>
                </div>
              </div>

              <div className="sleek-step-divider">
                <ArrowRight size={14} />
              </div>

              <div className="sleek-step-card">
                <span className="step-num">03</span>
                <div className="step-content">
                  <strong>노션에 일괄 반영</strong>
                  <p>상단 [CSV 내보내기] 또는 원클릭 복사로 본인의 노션 DB에 단숨에 채워 넣습니다.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
