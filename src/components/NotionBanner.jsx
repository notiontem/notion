import React from 'react';
import { ExternalLink, ArrowRight, Settings, Link2, CheckCircle2, Package, PenTool, BookOpen } from 'lucide-react';

const DEFAULT_ORIGINAL_TEMPLATE = "https://lava-child-76b.notion.site/Ministry-Second-Brain-PARA-faa57f770752494db4bf529eaf689998";

export default function NotionBanner({
  userNotionUrl,
  onOpenSetUrlModal,
  onOpenAssistant,
  onOpenPresetModal
}) {
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
    <section className="notion-banner-wrap">
      <div className="notion-banner">
        <div className="notion-banner-header">
          <div className="notion-banner-tag-group">
            <span className="notion-pill-tag">구매자 공식 동반 도구</span>
            {userNotionUrl ? (
              <span className="notion-status-chip connected" onClick={onOpenSetUrlModal} role="button" title="등록된 내 노션 페이지로 이동">
                <CheckCircle2 size={12} />
                <span>내 노션 연동 완료</span>
              </span>
            ) : (
              <span className="notion-status-chip pending" onClick={onOpenSetUrlModal} role="button" title="복제한 내 노션 페이지 URL 등록">
                <Link2 size={12} />
                <span>내 노션 링크 등록 필요</span>
              </span>
            )}
          </div>

          <div className="notion-banner-cta-group">
            {userNotionUrl && (
              <button
                onClick={handleOpenMyNotion}
                className="btn-editorial-primary"
                title="복제한 내 노션 워크스페이스 열기"
              >
                <span>내 노션 템플릿 열기</span>
                <ExternalLink size={13} />
              </button>
            )}

            <button
              onClick={handleOpenOriginalTemplate}
              className={`btn-editorial-secondary ${!userNotionUrl ? 'highlight' : ''}`}
              title="구매하신 원본 노션 템플릿 열기 & 복제"
            >
              <span>{userNotionUrl ? '원본 템플릿 보기' : '원본 템플릿 복제하러 가기'}</span>
              <ExternalLink size={13} />
            </button>

            <button
              onClick={onOpenSetUrlModal}
              className="btn-editorial-icon"
              title="내 노션 링크 설정 및 변경"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>

        <div className="notion-banner-body">
          <h2 className="notion-banner-headline">
            Ministry Second Brain PARA 템플릿을<br />
            가장 빠르고 알차게 채워 넣는 공식 스튜디오
          </h2>
          <p className="notion-banner-subtext">
            이 웹사이트는 <strong>Ministry Second Brain PARA</strong> 템플릿을 구매하신 사역자를 위해 최적화된 동반 도구입니다. 
            템플릿의 4대 핵심 데이터베이스(<strong>Projects, Areas, Resources, Archives</strong>) 구조와 1:1로 일치하도록 설계되어, 
            설교 시리즈·심방 노트·수련회 일정을 여기서 작성하고 <strong>원클릭 서식 복사</strong> 또는 <strong>CSV 일괄 가져오기</strong>로 
            본인의 노션 워크스페이스에 단숨에 채워 넣을 수 있습니다.
          </p>
        </div>

        <div className="notion-flow-row">
          <div className="flow-step-card">
            <span className="flow-step-index">01</span>
            <div className="flow-step-text">
              <strong>템플릿 복제 & 링크 연결</strong>
              <p>구매한 원본 템플릿을 내 노션에 복제(Duplicate) 후 링크 등록</p>
            </div>
          </div>

          <div className="flow-step-divider">
            <ArrowRight size={14} />
          </div>

          <div className="flow-step-card">
            <span className="flow-step-index">02</span>
            <div className="flow-step-text">
              <strong>사역 콘텐츠 기획 & 선택</strong>
              <p>실전 템플릿 컬렉션(설교, 수련회, 심방) 또는 자유 초안 작성</p>
            </div>
          </div>

          <div className="flow-step-divider">
            <ArrowRight size={14} />
          </div>

          <div className="flow-step-card">
            <span className="flow-step-index">03</span>
            <div className="flow-step-text">
              <strong>내 노션 템플릿에 채우기</strong>
              <p>페이지 본문 붙여넣기(Ctrl+V) 또는 노션 DB용 CSV 일괄 가져오기</p>
            </div>
          </div>
        </div>

        <div className="notion-banner-footer-actions">
          <button
            onClick={onOpenPresetModal}
            className="btn-secondary-pill"
          >
            <Package size={14} />
            <span>실전 사역 템플릿 컬렉션</span>
          </button>
          <button
            onClick={onOpenAssistant}
            className="btn-secondary-pill"
          >
            <PenTool size={14} />
            <span>사역 아웃라인 작성기</span>
          </button>
          <a
            href="#user-guide"
            onClick={(e) => {
              // Scroll to guide or switch tab
            }}
            className="btn-secondary-pill link"
          >
            <BookOpen size={13} />
            <span>템플릿 100% 활용 매뉴얼</span>
          </a>
        </div>
      </div>
    </section>
  );
}
