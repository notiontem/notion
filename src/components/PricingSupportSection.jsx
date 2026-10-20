import React, { useState, useEffect } from 'react';
import {
  Heart,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Coffee,
  BookOpen,
  Apple,
  Server,
  Cpu,
  FileText,
  Share2,
  MessageSquareText,
  CalendarDays,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PARTNER_STORES = [
  {
    id: 'store-1',
    name: '벙커 목양',
    badge: '디지털 말씀 플래너',
    title: '굿노트 말씀 다이어리 & QT 플래너',
    desc: '말씀과 일상을 하나로 잇다. 17개월 올인원 하이퍼링크, 성경 통독 365, SOAP 묵상 서식 등 크리스천의 영적 루틴을 돕는 프리미엄 디지털 플래너 전문 숍.',
    tags: ['굿노트 다이어리', '하이퍼링크 QT', '성경 통독 365', 'SOAP 묵상'],
    url: 'https://smartstore.naver.com/roaster',
    image: '/main.jpg',
    accentColor: '#10b981',
    buttonColorClass: 'btn-store-emerald',
    icon: BookOpen
  },
  {
    id: 'store-2',
    name: '거창한벙커',
    badge: '수제 레터링 캔커피',
    title: '감사의 마음을 담는 수제 레터링 캔커피 스토어',
    desc: '선생님 위로회, 수련회 참가자 선물, 절기 및 교회 행사용으로 맞춤 문구를 캔에 새겨드립니다. 하나하나 정성스럽게 수작업 제작되어 감동을 선사합니다.',
    tags: ['교사 감사선물', '수련회 기념', '행사 다과', '맞춤 레터링'],
    url: 'https://smartstore.naver.com/geochangbunker/products/4551068056',
    image: '/can.jpg',
    accentColor: '#f59e0b',
    buttonColorClass: 'btn-store-amber',
    icon: Coffee
  },
  {
    id: 'store-3',
    name: '프레시 네이쳐',
    badge: '신선 과일 전문',
    title: '엄선된 신선한 국산 및 수입 제철 과일 스토어',
    desc: '국내산 제철 과일부터 수입과일까지 산지 직송의 신선함으로 전달합니다. 교회 친교 모임, 부서 행사, 선생님 선물용으로 건강한 과일 다과를 준비해 보세요.',
    tags: ['부서 친교간식', '행사 다과', '제철 과일', '선물세트'],
    url: 'https://smartstore.naver.com/homeggmi',
    image: '/fluit.png',
    accentColor: '#6366f1',
    buttonColorClass: 'btn-store-indigo',
    icon: Apple
  }
];

const FAQS = [
  {
    q: '정말 노션 템플릿과 웹 기능이 100% 영구 무료인가요?',
    a: '네, 그렇습니다! 저희가 제공하는 Ministry Second Brain 노션 템플릿과 웹 솔루션의 모든 기능(AI 사역 기획실, 공지문 작성기, 교회학교 행사 접수, 사역 서식 등)은 판매용이 아니며, 어떠한 결제나 구독료 없이 모든 사역자분들께 100% 평생 무료로 공유됩니다.'
  },
  {
    q: '스토어에서 구매하면 어떻게 후원이 되나요?',
    a: '저희 파트너 스토어(벙커 목양, 거창한벙커, 프레시 네이쳐)에서 교사 감사 선물이나 행사 다과, 디지털 플래너를 구매하시면, 판매 수익금의 일부가 교회학교 서버 인프라 유지비 및 AI 엔진 연동비로 자동 환원됩니다. 별도의 기부금 부담 없이 일상적인 쇼핑으로 자연스럽게 사역을 후원하실 수 있습니다.'
  },
  {
    q: '직접 계좌 후원도 가능한가요?',
    a: '네! 마음이 닿으시는 대로 1,000원부터 자유롭게 자발적 후원이 가능합니다. 보내주신 소중한 후원금은 서버 운용, AI API 비용, 신규 사역 콘텐츠 개발에 100% 투명하게 사용됩니다.'
  },
  {
    q: '제공되는 서식과 문안을 수정해서 사용해도 저작권 문제가 없나요?',
    a: '네, 저희 솔루션에서 제공하는 모든 공지문 문안, 행사 기획 서식, 노션 템플릿은 교회 내부 인쇄 배포, 부서 카카오톡 전송, 주보 수록용 라이선스가 기본 포함되어 있습니다. 현장 상황에 맞추어 자유롭게 변경하여 사용하셔도 됩니다.'
  }
];

export default function PricingSupportSection({ onNavigateTab }) {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState('');

  // 페이지 진입 시 화면 최상단으로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const copyTextToClipboard = async (text, successMsg) => {
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch (e) {
      console.warn('Clipboard API failed, using fallback:', e);
    }

    if (!ok) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        ok = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (e) {
        console.error('Fallback copy failed:', e);
      }
    }

    if (ok) {
      try {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.75 },
          colors: ['#fee500', '#10b981', '#3b82f6', '#f59e0b']
        });
      } catch {}
      showToast(successMsg);
      return true;
    }
    return false;
  };

  const handleCopyAccount = async () => {
    const success = await copyTextToClipboard(
      '3333-07-0197297',
      '카카오뱅크 후원 계좌(3333-07-0197297, 예금주: 전정우)가 복사되었습니다!'
    );
    if (success) {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2500);
    }
  };

  const handleSharePage = async () => {
    const shareData = {
      title: 'Bunker 목양 - 사역을 살리는 따뜻한 동행',
      text: '현장 사역에 꼭 필요한 공지문 작성기와 행사 관리를 영구 무료로 이용해 보세요!',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('공유 창이 열렸습니다.');
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }

    const success = await copyTextToClipboard(
      window.location.href,
      '페이지 링크가 복사되었습니다! 주변 목회자·선생님께 공유해 주세요.'
    );
    if (success) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  return (
    <div className="pricing-support-container fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="custom-toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Hero Banner */}
      <section className="pricing-hero-banner">
        <div className="pricing-hero-content">
          <div className="pricing-hero-tag">
            <Heart size={14} className="heart-pulse-icon" />
            <span>모든 기능 100% 영구 무료 지원</span>
          </div>
          <h2>
            사역을 살리는 <span className="text-gradient-warm">따뜻한 동행</span>
          </h2>
          <p className="pricing-hero-desc">
            교회학교 목회자와 선생님들의 사역 부담을 덜어드리기 위해 모든 기능을 영구 무료로 제공합니다.<br className="hidden-mobile" />
            여러분의 따뜻한 파트너 스토어 이용과 자발적 후원이 이 사역을 든든하게 지속시킵니다.
          </p>

          <div className="pricing-hero-actions">
            <a href="#partner-stores" className="btn-hero-primary">
              <ShoppingBag size={15} />
              <span>파트너 스토어 구경하기</span>
            </a>
            <button type="button" onClick={handleCopyAccount} className="btn-hero-secondary">
              <CreditCard size={15} />
              <span>{copiedAccount ? '계좌번호 복사 완료!' : '자발적 후원 계좌 복사'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Partner Store Section (쇼핑이 사역 후원이 됩니다) */}
      <section id="partner-stores" className="pricing-section">
        <div className="pricing-section-header">
          <span className="section-pill">PARTNER STORE</span>
          <h3>
            일상의 소비가 <span className="highlight-text">사역의 후원</span>이 됩니다
          </h3>
          <p>
            교회 행사, 수련회, 선생님 감사 선물, 다과 구매 시 파트너 스토어를 이용해 보세요.<br />
            구매금액의 일부가 서비스 운영비로 환원되어 모든 사역자가 무료로 이용할 수 있는 기반이 됩니다.
          </p>
        </div>

        <div className="stores-grid">
          {PARTNER_STORES.map((store) => {
            const IconComponent = store.icon;
            return (
              <div key={store.id} className="store-card group">
                {/* Store Product Cover Image */}
                <div className="store-image-wrap">
                  <img
                    src={store.image}
                    alt={store.title}
                    className="store-cover-image"
                    loading="lazy"
                  />
                  <div
                    className="store-badge-overlay"
                    style={{ background: store.accentColor }}
                  >
                    <IconComponent size={12} />
                    <span>{store.badge}</span>
                  </div>
                </div>

                <div className="store-card-body">
                  <div className="store-brand-row">
                    <span className="store-brand-name" style={{ color: store.accentColor }}>{store.name}</span>
                  </div>
                  <h4 className="store-title">{store.title}</h4>
                  <p className="store-desc">{store.desc}</p>

                  <div className="store-tags-wrap">
                    {store.tags.map((tag, idx) => (
                      <span key={idx} className="store-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="store-card-footer">
                  <a
                    href={store.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn-store-visit ${store.buttonColorClass}`}
                  >
                    <span>스토어에서 구경 & 구매하기</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div className="stores-safety-notice">
          <ShieldCheck size={16} />
          <span>파트너 스토어 구매 건은 네이버 스마트스토어의 안전 결제 시스템을 통해 별도의 수수료 없이 안전하게 지원됩니다.</span>
        </div>
      </section>

      {/* 3. Direct Voluntary Account Support Section */}
      <section className="pricing-section account-support-section">
        <div className="pricing-section-header">
          <span className="section-pill warm">DONATION</span>
          <h3>
            직접 따뜻한 마음을 <span className="highlight-warm">후원하기</span>
          </h3>
          <p>
            정해진 후원 금액이나 부담스러운 정기 결제는 없습니다.<br />
            마음이 감동하시는 대로 자유롭게 응원해 주세요.
          </p>
        </div>

        {/* Bank Account Card */}
        <div className="account-box-card">
          <div className="account-box-header">
            <div className="bank-logo-badge">
              <span className="bank-logo-text">kakao</span>
              <span className="bank-label">카카오뱅크</span>
            </div>
            <span className="account-holder">예금주: 전정우</span>
          </div>

          <div className="account-number-row">
            <span className="account-number-display">3333-07-0197297</span>
            <button
              type="button"
              onClick={handleCopyAccount}
              className={`btn-copy-account ${copiedAccount ? 'copied' : ''}`}
            >
              {copiedAccount ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedAccount ? '계좌번호 복사 완료!' : '계좌번호 1-초 복사하기'}</span>
            </button>
          </div>

          <p className="account-notice-text">
            💡 버튼을 누르면 계좌번호가 클립보드에 복사됩니다. 카카오뱅크 또는 보유하신 은행 앱에서 간편하게 송금해 주세요.
          </p>
        </div>

        {/* 3 Pillars of Transparent Usage */}
        <div className="transparency-grid">
          <div className="transparency-card">
            <div className="transparency-icon-box">
              <Server size={22} />
            </div>
            <h4>서버 유지 인프라 비용</h4>
            <p>전국 교회학교 현장에서 365일 중단 없이 안정적으로 접속할 수 있는 클라우드 서버와 데이터 백업을 유지합니다.</p>
          </div>

          <div className="transparency-card">
            <div className="transparency-icon-box">
              <Cpu size={22} />
            </div>
            <h4>AI 공지문 생성 엔진 연동비</h4>
            <p>교회 사역 상황에 꼭 맞춘 정중하고 따뜻한 4가지 시안을 실시간 생성하는 최신 AI API 비용으로 사용됩니다.</p>
          </div>

          <div className="transparency-card">
            <div className="transparency-icon-box">
              <FileText size={22} />
            </div>
            <h4>신규 사역 서식 & 템플릿 제작</h4>
            <p>목회자와 교사들이 현장에서 바로 활용할 수 있는 고품질 노션 템플릿 및 사역 도구를 지속적으로 연구·개발합니다.</p>
          </div>
        </div>

        {/* 3 Promises Bar */}
        <div className="promises-bar">
          <div className="promise-item">
            <span className="promise-emoji">💛</span>
            <div className="promise-text">
              <strong>부담 없는 후원</strong>
              <small>1,000원부터 얼마든지 자유롭게 마음을 전하실 수 있습니다.</small>
            </div>
          </div>
          <div className="promise-item">
            <span className="promise-emoji">🔍</span>
            <div className="promise-text">
              <strong>투명한 사용</strong>
              <small>오직 서버 및 AI 연동 비용 등 운영 목적으로만 투명하게 쓰입니다.</small>
            </div>
          </div>
          <div className="promise-item">
            <span className="promise-emoji">🎁</span>
            <div className="promise-text">
              <strong>사역자 영구 무료 지원</strong>
              <small>전국 모든 교회학교 목회자가 계속 영구 무료로 사용할 수 있습니다.</small>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Frequently Asked Questions (FAQ) */}
      <section className="pricing-section faq-section">
        <div className="pricing-section-header">
          <span className="section-pill">FAQ</span>
          <h3>자주 묻는 질문</h3>
          <p>궁금하신 점을 빠르게 해결해 드립니다.</p>
        </div>

        <div className="faq-accordion-wrap">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={index} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                >
                  <div className="faq-q-left">
                    <span className="faq-badge-q">Q</span>
                    <span className="faq-q-title">{faq.q}</span>
                  </div>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {isOpen && (
                  <div className="faq-answer-content fade-in">
                    <div className="faq-answer-inner">
                      <span className="faq-badge-a">A</span>
                      <p>{faq.a}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Bottom Engagement Banner */}
      <section className="pricing-bottom-cta">
        <div className="cta-left">
          <span className="cta-sub">함께하는 사역 동역자</span>
          <h3>당신의 관심과 후원이 다음 세대를 살립니다</h3>
          <p>지금 바로 공지문 작성기와 행사 관리 시스템을 이용해 보세요. 주변 목회자와 선생님들에게도 이 무료 솔루션을 널리 공유해 주세요!</p>
        </div>

        <div className="cta-right-btns">
          {onNavigateTab && (
            <>
              <button
                type="button"
                onClick={() => onNavigateTab('notice-writer')}
                className="btn-cta-link"
              >
                <MessageSquareText size={15} />
                <span>공지문 작성기 가기</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('events')}
                className="btn-cta-link secondary"
              >
                <CalendarDays size={15} />
                <span>행사 관리 가기</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleSharePage}
            className="btn-cta-share"
          >
            {copiedUrl ? <Check size={15} /> : <Share2 size={15} />}
            <span>{copiedUrl ? '링크 복사 완료!' : '이 페이지 공유하기'}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
