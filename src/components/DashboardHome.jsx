import React, { useState } from 'react';
import {
  MessageSquareText,
  CalendarDays,
  Layers,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Package,
  Plus,
  Send,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  SlidersHorizontal,
  Flame,
  Check,
  Heart
} from 'lucide-react';
import SmartAIAssistant from './SmartAIAssistant';

export default function DashboardHome({
  data,
  events = [],
  onNavigateTab,
  onOpenNew,
  onOpenDetail,
  onToggleWbs,
  onOpenPresetModal,
  onSaveItem,
  assistantRef
}) {
  const [showAiAssistant, setShowAiAssistant] = useState(true);
  const [copiedEventId, setCopiedEventId] = useState(null);

  // Statistics
  const activeProjects = data.projects.filter(p => p.status === '진행 중' || p.status === '진행중' || p.status === '시작 전');
  const openEvents = events.filter(e => e.status === 'open');
  const totalApplicants = events.reduce((sum, e) => sum + (e.applications?.length || 0), 0);
  const totalResources = data.resources.length;

  // Copy Kakao invitation for quick event
  const handleQuickCopyInvite = (event) => {
    const dateStr = event.start_date
      ? new Date(event.start_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }) +
        (event.end_date && event.end_date !== event.start_date
          ? ' ~ ' + new Date(event.end_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
          : '')
      : '추후 공지';

    const lines = [
      `💌 [${event.title}]에 초대합니다!`,
      `📅 일시: ${dateStr}`,
      event.location ? `📍 장소: ${event.location}` : '',
      event.deadline ? `⏰ 신청마감: ${new Date(event.deadline).toLocaleDateString('ko-KR')}` : '',
      event.contact_info ? `📞 문의: ${event.contact_info}` : '',
      '',
      '함께할 우리 아이들을 기다립니다 😊'
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedEventId(event.id);
    setTimeout(() => setCopiedEventId(null), 2000);
  };

  return (
    <div className="dashboard-home-container fade-in">
      {/* 1. Welcoming Hero & Quick KPI Bar */}
      <section className="dash-hero-card">
        <div className="dash-hero-content">
          <div className="dash-greeting-badge">
            <span className="pulse-dot" />
            <span>스마트 목회 관제 데스크</span>
          </div>
          <h2 className="dash-hero-title">
            목회의 모든 순간을 잇고 생각을 정리합니다
          </h2>
          <p className="dash-hero-desc">
            교회학교 공지 발송부터 수련회 참가자 접수, 사역 일정(WBS)과 설교 지식 아카이브까지 원하는 서비스를 바로 실행하세요.
          </p>
        </div>

        {/* 4 Key Metric Widgets */}
        <div className="dash-kpi-grid">
          <div className="dash-kpi-item" onClick={() => onNavigateTab('projects')} role="button" title="프로젝트 탭으로 이동">
            <span className="kpi-label">진행 중 사역</span>
            <div className="kpi-val-row">
              <span className="kpi-num p-color">{activeProjects.length}</span>
              <span className="kpi-sub">/ {data.projects.length}건</span>
            </div>
          </div>

          <div className="dash-kpi-item" onClick={() => onNavigateTab('events')} role="button" title="행사 관리 탭으로 이동">
            <span className="kpi-label">모집 중 행사</span>
            <div className="kpi-val-row">
              <span className="kpi-num e-color">{openEvents.length}</span>
              <span className="kpi-sub">개 ({totalApplicants}명 신청)</span>
            </div>
          </div>

          <div className="dash-kpi-item" onClick={() => onNavigateTab('resources')} role="button" title="지식 창고 탭으로 이동">
            <span className="kpi-label">보관 지식·설교</span>
            <div className="kpi-val-row">
              <span className="kpi-num r-color">{totalResources}</span>
              <span className="kpi-sub">개 자료</span>
            </div>
          </div>

          <div className="dash-kpi-item" onClick={() => onNavigateTab('areas')} role="button" title="책임 영역 탭으로 이동">
            <span className="kpi-label">5대 사역 영역</span>
            <div className="kpi-val-row">
              <span className="kpi-num a-color">{data.areas.length}</span>
              <span className="kpi-sub">개 영역 균형</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. [Promoted Golden Zone] AI Smart Ministry Drafting Studio */}
      <section className="dashboard-ai-studio-section" ref={assistantRef}>
        <div className="dash-ai-studio-card">
          <div className="dash-ai-studio-header">
            <div className="dash-ai-studio-title-wrap">
              <div className="dash-ai-studio-icon">
                <Sparkles size={20} />
              </div>
              <div className="dash-ai-studio-text">
                <div className="dash-ai-badge-row">
                  <span className="dash-ai-badge">
                    <Sparkles size={11} />
                    <span>스마트 사역 AI 브레인스토밍</span>
                  </span>
                  <span className="dash-ai-pill">1초 아웃라인 생성</span>
                </div>
                <h3 className="dash-ai-title">오늘 어떤 사역 아이디어를 기획하시겠습니까?</h3>
                <p className="dash-ai-desc">
                  설교 본문 구상, 수련회 일정(WBS), 환우 심방 가이드, 찬양 콘티를 즉시 체계화하고 노션에 저장합니다.
                </p>
              </div>
            </div>

            <div className="dash-ai-header-actions">
              <button
                type="button"
                onClick={() => onNavigateTab('ai-assistant')}
                className="btn-ai-fullscreen"
                title="전용 AI 사역 기획실 전체화면 열기"
              >
                <span>전용 기획실 전체화면</span>
                <ArrowRight size={13} />
              </button>
              <button
                type="button"
                onClick={() => setShowAiAssistant(!showAiAssistant)}
                className="btn-ai-toggle-compact"
                title={showAiAssistant ? "기획실 접기" : "기획실 펼치기"}
              >
                <span>{showAiAssistant ? '기획실 접기' : '기획실 열기'}</span>
                {showAiAssistant ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {showAiAssistant && (
            <div className="dash-ai-studio-body fade-in">
              <SmartAIAssistant
                areas={data.areas}
                onAddGeneratedItem={(type, item) => onSaveItem(type, item)}
                hideHeader={true}
                compactMode={true}
              />
            </div>
          )}
        </div>
      </section>

      {/* 3. Core 4-Service Launcher Hub - "어떤 작업을 시작하시겠습니까?" */}
      <section className="service-launcher-section">
        <div className="section-title-wrap">
          <div className="title-left">
            <span className="sub-tag">Service Hub</span>
            <h3 className="section-main-title">핵심 사역 바로가기</h3>
          </div>
          <span className="section-help-text">원하는 사역 도구를 선택하면 해당 작업 환경으로 바로 이동합니다.</span>
        </div>

        <div className="service-launcher-grid">
          {/* Card 1: Notice Writer */}
          <div
            className="service-card notice"
            onClick={() => onNavigateTab('notice-writer')}
            role="button"
          >
            <div className="card-top">
              <div className="service-icon-box notice">
                <MessageSquareText size={24} />
              </div>
              <span className="service-badge-hot">추천 툴</span>
            </div>
            <div className="card-info">
              <h4 className="service-title">AI 교회학교 공지문 작성기</h4>
              <p className="service-desc">
                새가족·결석심방·성경학교 등 상황과 대상만 선택하면 카톡·SMS 4종 공지문 즉시 완성!
              </p>
            </div>
            <div className="card-footer-action">
              <span>공지문 작성하기</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Card 2: Event Manager */}
          <div
            className="service-card event"
            onClick={() => onNavigateTab('events')}
            role="button"
          >
            <div className="card-top">
              <div className="service-icon-box event">
                <CalendarDays size={24} />
              </div>
              <span className="service-badge-hot">추천 툴</span>
            </div>
            <div className="card-info">
              <h4 className="service-title">행사 관리 & 참가자 접수</h4>
              <p className="service-desc">
                성경학교·수련회 참가자 명단 관리, 알레르기 조사, 카톡 초대장 복사 및 당일 출석 체크인
              </p>
            </div>
            <div className="card-footer-action">
              <span>행사 관리하기</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Card 3: Projects & Tasks */}
          <div
            className="service-card project"
            onClick={() => onNavigateTab('projects')}
            role="button"
          >
            <div className="card-top">
              <div className="service-icon-box project">
                <Layers size={24} />
              </div>
              <span className="service-badge-para">PARA : P</span>
            </div>
            <div className="card-info">
              <h4 className="service-title">사역 프로젝트 & WBS 관리</h4>
              <p className="service-desc">
                예배 기획, 절기 행사, 수련회 준비 일정과 세부 체크리스트를 노션 DB와 1:1로 관리
              </p>
            </div>
            <div className="card-footer-action">
              <span>프로젝트 열기</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Card 4: Knowledge Resources */}
          <div
            className="service-card resource"
            onClick={() => onNavigateTab('resources')}
            role="button"
          >
            <div className="card-top">
              <div className="service-icon-box resource">
                <BookOpen size={24} />
              </div>
              <span className="service-badge-para">PARA : R</span>
            </div>
            <div className="card-info">
              <h4 className="service-title">목회 지식 창고 (자료실)</h4>
              <p className="service-desc">
                설교 시리즈, 공과 교재, 심방 매뉴얼 및 행정 서식을 영구적으로 저장하고 검색
              </p>
            </div>
            <div className="card-footer-action">
              <span>지식 창고 열기</span>
              <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Active Snapshot Preview - "지금 진행 중인 사역과 행사" */}
      <section className="active-snapshot-section">
        <div className="snapshot-2col-grid">
          {/* Column 1: Ongoing Projects Snapshot */}
          <div className="snapshot-card">
            <div className="snapshot-card-head">
              <div className="snapshot-head-left">
                <span className="badge-bullet p-bullet" />
                <h4>진행 중인 사역 프로젝트</h4>
              </div>
              <button
                onClick={() => onNavigateTab('projects')}
                className="btn-snapshot-more"
              >
                <span>전체 보기 ({data.projects.length})</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="snapshot-card-body">
              {activeProjects.length === 0 ? (
                <div className="snapshot-empty">
                  <p>현재 진행 중인 프로젝트가 없습니다.</p>
                  <button onClick={() => onOpenNew('Project')} className="btn-add-mini">
                    <Plus size={13} /> 새 사역 등록
                  </button>
                </div>
              ) : (
                <div className="snapshot-items-list">
                  {activeProjects.slice(0, 3).map(p => {
                    const doneCount = p.wbs?.filter(w => w.done).length || 0;
                    const totalWbs = p.wbs?.length || 0;
                    const percent = totalWbs ? Math.round((doneCount / totalWbs) * 100) : 0;

                    return (
                      <div
                        key={p.id}
                        className="snapshot-project-item"
                        onClick={() => onOpenDetail('Project', p)}
                        role="button"
                      >
                        <div className="item-title-row">
                          <span className="item-title">{p.title}</span>
                          <span className="item-status-tag">{p.status}</span>
                        </div>
                        {p.targetDate && (
                          <div className="item-date">
                            <Clock size={12} />
                            <span>목표일: {p.targetDate}</span>
                          </div>
                        )}
                        {totalWbs > 0 && (
                          <div className="item-progress-wrap">
                            <div className="progress-bar-track">
                              <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="progress-text">{doneCount}/{totalWbs} 과제 완료 ({percent}%)</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Active Events Snapshot */}
          <div className="snapshot-card">
            <div className="snapshot-card-head">
              <div className="snapshot-head-left">
                <span className="badge-bullet e-bullet" />
                <h4>접수 중인 행사 & 신청 현황</h4>
              </div>
              <button
                onClick={() => onNavigateTab('events')}
                className="btn-snapshot-more"
              >
                <span>전체 보기 ({events.length})</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="snapshot-card-body">
              {events.length === 0 ? (
                <div className="snapshot-empty">
                  <p>등록된 행사가 없습니다.</p>
                  <button onClick={() => onNavigateTab('events')} className="btn-add-mini">
                    <Plus size={13} /> 행사 만들기
                  </button>
                </div>
              ) : (
                <div className="snapshot-items-list">
                  {events.slice(0, 3).map(ev => {
                    const appsCount = ev.applications?.length || 0;
                    const capacity = ev.capacity;
                    const capPercent = capacity ? Math.min(100, Math.round((appsCount / capacity) * 100)) : 0;

                    return (
                      <div key={ev.id} className="snapshot-event-item">
                        <div className="event-item-top">
                          <span className="event-item-title">{ev.title}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickCopyInvite(ev);
                            }}
                            className="btn-quick-copy"
                            title="카톡 초대장 복사"
                          >
                            {copiedEventId === ev.id ? (
                              <>
                                <Check size={12} />
                                <span>복사됨</span>
                              </>
                            ) : (
                              <>
                                <Send size={12} />
                                <span>카톡 초대문</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="event-item-meta">
                          {ev.start_date && (
                            <span className="meta-text">
                              <Calendar size={12} />
                              {ev.start_date}
                            </span>
                          )}
                          {ev.location && (
                            <span className="meta-text">
                              <MapPin size={12} />
                              {ev.location}
                            </span>
                          )}
                        </div>

                        <div className="event-item-apps-bar">
                          <div className="apps-bar-label">
                            <span>신청자 {appsCount}명</span>
                            {capacity ? <span>정원 {capacity}명 ({capPercent}%)</span> : null}
                          </div>
                          {capacity ? (
                            <div className="progress-bar-track">
                              <div
                                className="progress-bar-fill event"
                                style={{ width: `${capPercent}%` }}
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Quick Starter Preset Library Highlight */}
      <section className="starter-banner-section">
        <div className="starter-banner-content">
          <div className="starter-banner-left">
            <span className="preset-pill-tag">
              <Package size={13} />
              <span>실전 목회 템플릿 컬렉션</span>
            </span>
            <h4>현장 목회자를 위한 검증된 사역 패키지</h4>
            <p>로마서 8주 강해 설교 시리즈, 여름 수련회 WBS 일정표, 새가족 4주 정착 시스템, 심방 위로 가이드</p>
          </div>
          <button
            onClick={onOpenPresetModal}
            className="btn-starter-open"
          >
            <Package size={14} />
            <span>템플릿 컬렉션 열기</span>
          </button>
        </div>
      </section>

      {/* 4.5 Ministry Support & Partner Store Banner - Redesigned Clean Strip */}
      <section
        className="dashboard-support-strip"
        onClick={() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          onNavigateTab('pricing');
        }}
        role="button"
        title="사역 동행 & 후원 페이지로 이동"
      >
        <div className="support-strip-left">
          <div className="support-strip-icon-box">
            <Heart size={22} className="heart-nav-icon" />
          </div>
          <div className="support-strip-text">
            <div className="support-strip-badge-row">
              <span className="support-strip-badge">
                <Heart size={11} />
                <span>100% 영구 무료 사역 지원</span>
              </span>
            </div>
            <h4 className="support-strip-title">사역을 살리는 따뜻한 동행 (파트너 스토어 & 후원)</h4>
            <p className="support-strip-desc">
              구독료 걱정 없이 평생 무료로 사역하세요. 파트너 스토어 이용과 자발적 후원이 다음 세대 신앙 교육을 지켜줍니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            onNavigateTab('pricing');
          }}
          className="btn-support-strip-action"
        >
          <span>사역 동행 & 후원 보기</span>
          <ArrowRight size={14} />
        </button>
      </section>
    </div>
  );
}
