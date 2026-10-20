import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clipboard,
  Check,
  RefreshCw,
  Info,
  Mail,
  MessageSquare,
  ListTodo,
  Heart,
  Clock,
  Star,
  X,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Pencil,
  Share2,
  FolderPlus,
  Send,
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import {
  SITUATIONS,
  TARGETS,
  TONES,
  noticeTemplates
} from '../data/noticeTemplates';

// 공지문 생성 엔진 (템플릿 기반 플레이스홀더 치환 + 맞춤형 결합)
function generateNotices({ situation, target, tone, extraInfo }) {
  // 1. 상황, 대상, 톤이 매치되는 템플릿 탐색
  let matched = noticeTemplates.find(
    t => t.situation === situation && t.target === target && t.tone === tone && t.isActive
  );

  // 2. 안 맞으면 상황과 대상 매치 탐색
  if (!matched) {
    matched = noticeTemplates.find(
      t => t.situation === situation && t.target === target && t.isActive
    );
  }

  // 3. 그래도 안 맞으면 상황 매치 탐색
  if (!matched) {
    matched = noticeTemplates.find(
      t => t.situation === situation && t.isActive
    );
  }

  // 4. 최종 폴백
  const template = matched || noticeTemplates[0];

  const child = extraInfo.childName?.trim() || '하준이';
  const parent = '학부모님';
  const teacher = extraInfo.teacherName?.trim() || '담임교사';
  const dateStr = extraInfo.date?.trim();
  const placeStr = extraInfo.place?.trim();
  const notesStr = extraInfo.notes?.trim();

  const replacePlaceholders = (text) => {
    if (!text) return '';
    let res = text
      .replace(/\[자녀이름\]/g, child)
      .replace(/\[학부모님 성함\]/g, parent)
      .replace(/\[선생님 이름\]/g, teacher);

    const additions = [];
    if (dateStr) additions.push(`📅 일시: ${dateStr}`);
    if (placeStr) additions.push(`📍 장소: ${placeStr}`);
    if (notesStr) additions.push(`📌 안내사항: ${notesStr}`);

    if (additions.length > 0) {
      res += `\n\n${additions.join('\n')}`;
    }
    return res;
  };

  return {
    version1: replacePlaceholders(template.shortVersion),
    version2: replacePlaceholders(template.kakaoVersion),
    version3: replacePlaceholders(template.detailVersion),
    version4: replacePlaceholders(template.remindVersion)
  };
}

export default function NoticeWriterSection({ onSaveToResource }) {
  const [situation, setSituation] = useState('welcome');
  const [target, setTarget] = useState('kinder_parents');
  const [tone, setTone] = useState('warm');

  const [showExtra, setShowExtra] = useState(false);
  const [extraInfo, setExtraInfo] = useState({
    childName: '',
    teacherName: '',
    date: '',
    place: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const [copiedId, setCopiedId] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const [editIdx, setEditIdx] = useState(null);
  const [editText, setEditText] = useState('');

  const [liked, setLiked] = useState([false, false, false, false]);
  const [savedCombos, setSavedCombos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cs_notice_combos') || '[]');
    } catch {
      return [];
    }
  });
  const [showCombos, setShowCombos] = useState(false);

  const [historyNotices, setHistoryNotices] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cs_saved_notices') || '[]');
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);

  const showToastMsg = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  };

  // 초기 렌더 시 한 번 자동 생성
  useEffect(() => {
    handleGenerate();
  }, []);

  const handleGenerate = (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setEditIdx(null);
    setEditText('');

    setTimeout(() => {
      const generated = generateNotices({ situation, target, tone, extraInfo });
      setResults(generated);
      setLoading(false);
      showToastMsg('상황에 맞는 4가지 스타일 공지문이 완성되었습니다.');
    }, 200);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToastMsg('클립보드에 복사되었습니다.');
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleKakaoShare = (text) => {
    navigator.clipboard.writeText(text);
    window.open('kakaotalk://', '_blank');
    showToastMsg('공지문이 복사되었습니다. 카카오톡 창을 열어 붙여넣기 하세요!');
  };

  const toggleLike = (idx) => {
    const updated = [...liked];
    updated[idx] = !updated[idx];
    setLiked(updated);
  };

  const saveCurrentCombo = () => {
    const sitLabel = SITUATIONS.find(s => s.value === situation)?.label || situation;
    const tgtLabel = TARGETS.find(t => t.value === target)?.label || target;
    const toneLabel = TONES.find(t => t.value === tone)?.label || tone;

    const combo = { situation, target, tone, label: `${sitLabel} · ${tgtLabel} · ${toneLabel}` };
    const existing = savedCombos.find(c => c.situation === situation && c.target === target && c.tone === tone);
    if (existing) {
      showToastMsg('이미 즐겨찾기에 등록된 조합입니다.');
      return;
    }
    const updated = [combo, ...savedCombos].slice(0, 10);
    setSavedCombos(updated);
    localStorage.setItem('cs_notice_combos', JSON.stringify(updated));
    showToastMsg('현재 조건이 즐겨찾기에 저장되었습니다.');
  };

  const deleteCombo = (idx) => {
    const updated = savedCombos.filter((_, i) => i !== idx);
    setSavedCombos(updated);
    localStorage.setItem('cs_notice_combos', JSON.stringify(updated));
  };

  const applyCombo = (combo) => {
    setSituation(combo.situation);
    setTarget(combo.target);
    setTone(combo.tone);
    setShowCombos(false);
    showToastMsg('선택한 조건 조합이 적용되었습니다.');
  };

  const handleStartEdit = (idx) => {
    const contents = [results?.version1, results?.version2, results?.version3, results?.version4];
    setEditIdx(idx);
    setEditText(contents[idx] || '');
  };

  const handleConfirmEdit = () => {
    if (!results || editIdx === null) return;
    const key = `version${editIdx + 1}`;
    setResults({ ...results, [key]: editText });
    setEditIdx(null);
    setEditText('');
    showToastMsg('수정 내용이 반영되었습니다.');
  };

  const handleSaveToHistory = (text, versionIdx) => {
    const sitLabel = SITUATIONS.find(s => s.value === situation)?.label || '공지';
    const tgtLabel = TARGETS.find(t => t.value === target)?.label || '대상';
    const typeLabel = ['짧은문자형', '카톡공지형', '상세안내형', '리마인드형'][versionIdx];
    const title = `${sitLabel} - ${tgtLabel} (${typeLabel})`;

    const newEntry = {
      id: `notice-hist-${Date.now()}`,
      title,
      content: text,
      createdAt: new Date().toLocaleDateString('ko-KR')
    };

    const updated = [newEntry, ...historyNotices].slice(0, 50);
    setHistoryNotices(updated);
    localStorage.setItem('cs_saved_notices', JSON.stringify(updated));

    // 상위 콜백으로 지식 창고(Resource)에도 저장
    if (onSaveToResource) {
      onSaveToResource({
        title,
        type: '공지문/서식',
        summary: text.slice(0, 120) + (text.length > 120 ? '...' : ''),
        content: text,
        areaId: 'area-1',
        url: ''
      });
      showToastMsg('지식 창고(Resource) 및 공지 보관함에 저장되었습니다.');
    } else {
      showToastMsg('공지문 보관함에 저장되었습니다.');
    }
  };

  const cards = [
    {
      title: '1. 짧은 문자형 (SMS / 알림톡)',
      subtitle: '80바이트 이내 또는 핵심 내용만 군더더기 없이 전달',
      icon: Mail,
      badge: 'SMS',
      color: '#1e3a8a',
      content: results?.version1 || ''
    },
    {
      title: '2. 카톡 공지형 (단톡방 / 채널)',
      subtitle: '이모지와 줄바꿈을 활용하여 시각적으로 가독성이 높은 형태',
      icon: MessageSquare,
      badge: 'KakaoTalk',
      color: '#eab308',
      content: results?.version2 || ''
    },
    {
      title: '3. 상세 안내형 (가정통신문 / 주보)',
      subtitle: '목적, 프로그램, 일정, 계좌/준비물 등을 품격 있게 작성',
      icon: ListTodo,
      badge: 'Detailed',
      color: '#10b981',
      content: results?.version3 || ''
    },
    {
      title: '4. 리마인드형 (전날 / 당일 아침)',
      subtitle: '행사 시작 전 꼭 챙겨야 할 준비물과 시간을 빠르게 알림',
      icon: Clock,
      badge: 'Reminder',
      color: '#f97316',
      content: results?.version4 || ''
    }
  ];

  return (
    <div className="notice-writer-container fade-in">
      {/* Toast Notification */}
      {toast.visible && (
        <div className="custom-toast-notification">
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="notice-hero-card">
        <div className="notice-hero-left">
          <div className="notice-tag">
            <Sparkles size={14} />
            <span>AI 목회 커뮤니케이션</span>
          </div>
          <h2>AI 교회학교 공지문 작성기</h2>
          <p>
            상황과 대상, 말투만 선택하면 학부모님과 교사들에게 보낼 4가지 스타일의 완성형 공지문을 즉시 완성합니다.
          </p>
        </div>

        <div className="notice-hero-actions">
          <button
            onClick={() => setShowCombos(!showCombos)}
            className="btn-notice-subtle"
            title="자주 쓰는 조건 조합"
          >
            <Bookmark size={15} />
            <span>즐겨찾기 ({savedCombos.length})</span>
          </button>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn-notice-subtle"
            title="최근 저장한 공지문"
          >
            <Clock size={15} />
            <span>보관함 ({historyNotices.length})</span>
          </button>
        </div>
      </div>

      {/* Favorite Combos Dropdown */}
      {showCombos && (
        <div className="notice-combos-panel">
          <div className="combos-header">
            <h4>⭐ 자주 쓰는 조합</h4>
            <span className="combos-hint">원하는 프리셋을 클릭하면 입력 양식이 자동 설정됩니다.</span>
          </div>
          {savedCombos.length === 0 ? (
            <p className="combos-empty">저장된 조합이 없습니다. 아래에서 조건을 선택 후 '현재 조건 저장'을 눌러보세요.</p>
          ) : (
            <div className="combos-grid">
              {savedCombos.map((c, i) => (
                <div key={i} className="combo-chip">
                  <button onClick={() => applyCombo(c)} className="combo-btn-apply">
                    {c.label}
                  </button>
                  <button onClick={() => deleteCombo(i)} className="combo-btn-del" title="삭제">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Drawer Modal */}
      {showHistory && (
        <div className="notice-history-modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="notice-history-modal" onClick={e => e.stopPropagation()}>
            <div className="history-modal-header">
              <div className="history-header-title">
                <Clock size={18} />
                <h3>저장된 공지문 보관함</h3>
              </div>
              <button onClick={() => setShowHistory(false)} className="btn-close-modal">
                <X size={18} />
              </button>
            </div>

            <div className="history-modal-body">
              {historyNotices.length === 0 ? (
                <div className="history-empty">
                  <p>보관함에 저장된 공지문이 없습니다.</p>
                  <span>공지문 카드의 '보관' 버튼을 눌러 기록해 보세요.</span>
                </div>
              ) : (
                historyNotices.map((hist, idx) => (
                  <div key={hist.id || idx} className="history-item-card">
                    <div className="history-item-top">
                      <span className="history-item-title">{hist.title}</span>
                      <span className="history-item-date">{hist.createdAt}</span>
                    </div>
                    <pre className="history-item-content">{hist.content}</pre>
                    <div className="history-item-actions">
                      <button
                        onClick={() => handleCopy(hist.content, `hist-${idx}`)}
                        className="btn-history-action"
                      >
                        <Clipboard size={13} /> 복사
                      </button>
                      <button
                        onClick={() => handleKakaoShare(hist.content)}
                        className="btn-history-action kakao"
                      >
                        <Send size={13} /> 카톡 발송
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Control Panel: Situation, Target, Tone */}
      <div className="notice-control-card">
        <div className="control-grid">
          {/* Situation Selector */}
          <div className="control-field">
            <label className="field-label">
              <span className="label-badge">1</span>
              <span>상황 선택</span>
            </label>
            <select
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              className="notice-select-input"
            >
              {SITUATIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Target Selector */}
          <div className="control-field">
            <label className="field-label">
              <span className="label-badge">2</span>
              <span>발송 대상</span>
            </label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="notice-select-input"
            >
              {TARGETS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Tone Selector */}
          <div className="control-field">
            <label className="field-label">
              <span className="label-badge">3</span>
              <span>말투 및 어조</span>
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="notice-select-input"
            >
              {TONES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggle Detailed Extra Info */}
        <div className="extra-toggle-row">
          <button
            type="button"
            onClick={() => setShowExtra(!showExtra)}
            className="btn-toggle-extra"
          >
            <SlidersHorizontal size={14} />
            <span>세부 정보 입력 (자녀명, 일시, 장소 등)</span>
            {showExtra ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button
            type="button"
            onClick={saveCurrentCombo}
            className="btn-save-combo"
          >
            <Bookmark size={13} />
            <span>현재 설정 즐겨찾기 저장</span>
          </button>
        </div>

        {/* Extra Information Form */}
        {showExtra && (
          <div className="extra-info-form-grid">
            <div className="extra-input-group">
              <label>자녀/학생 이름</label>
              <input
                type="text"
                placeholder="예: 하준이, 김민준"
                value={extraInfo.childName}
                onChange={e => setExtraInfo({ ...extraInfo, childName: e.target.value })}
              />
            </div>

            <div className="extra-input-group">
              <label>선생님/담당자 성함</label>
              <input
                type="text"
                placeholder="예: 김선생님, 이목사"
                value={extraInfo.teacherName}
                onChange={e => setExtraInfo({ ...extraInfo, teacherName: e.target.value })}
              />
            </div>

            <div className="extra-input-group">
              <label>일시 / 시간</label>
              <input
                type="text"
                placeholder="예: 7월 25일(토) 오전 10시"
                value={extraInfo.date}
                onChange={e => setExtraInfo({ ...extraInfo, date: e.target.value })}
              />
            </div>

            <div className="extra-input-group">
              <label>모임 장소</label>
              <input
                type="text"
                placeholder="예: 교회 본당 2층 초등부실"
                value={extraInfo.place}
                onChange={e => setExtraInfo({ ...extraInfo, place: e.target.value })}
              />
            </div>

            <div className="extra-input-group full-width">
              <label>추가 공지/전달 사항</label>
              <input
                type="text"
                placeholder="예: 준비물(성경책, 물통), 회비 1만원 계좌 입금"
                value={extraInfo.notes}
                onChange={e => setExtraInfo({ ...extraInfo, notes: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="generate-action-row">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-generate-notices"
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="spin-icon" />
                <span>은혜로운 공지문 생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>공지문 4종 즉시 생성하기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Results Grid */}
      <div className="notices-results-section">
        <div className="results-heading">
          <h3>📢 완성된 4가지 공지문</h3>
          <p>마음에 드는 버전을 골라 복사하거나 카카오톡으로 즉시 발송하세요.</p>
        </div>

        <div className="notices-grid">
          {cards.map((card, idx) => (
            <div key={idx} className="notice-card">
              <div className="notice-card-header">
                <div className="card-header-left">
                  <div className="card-badge" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                    <card.icon size={13} />
                    <span>{card.badge}</span>
                  </div>
                  <h4 className="card-title">{card.title}</h4>
                </div>

                <button
                  onClick={() => toggleLike(idx)}
                  className={`btn-like ${liked[idx] ? 'liked' : ''}`}
                  title="즐겨찾기"
                >
                  <Heart size={15} fill={liked[idx] ? '#ef4444' : 'none'} color={liked[idx] ? '#ef4444' : 'currentColor'} />
                </button>
              </div>

              <div className="card-body">
                {editIdx === idx ? (
                  <div className="inline-edit-box">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={10}
                      className="inline-edit-textarea"
                    />
                    <div className="inline-edit-buttons">
                      <button onClick={() => setEditIdx(null)} className="btn-edit-cancel">
                        취소
                      </button>
                      <button onClick={handleConfirmEdit} className="btn-edit-save">
                        수정 완료
                      </button>
                    </div>
                  </div>
                ) : (
                  <pre className="notice-text-content">{card.content}</pre>
                )}
              </div>

              <div className="card-footer">
                <div className="card-footer-buttons">
                  <button
                    onClick={() => handleCopy(card.content, `card-${idx}`)}
                    className="btn-card-action copy"
                    title="클립보드 복사"
                  >
                    {copiedId === `card-${idx}` ? (
                      <>
                        <Check size={14} />
                        <span>복사 완료</span>
                      </>
                    ) : (
                      <>
                        <Clipboard size={14} />
                        <span>복사</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleKakaoShare(card.content)}
                    className="btn-card-action kakao"
                    title="카카오톡으로 공유"
                  >
                    <Send size={14} />
                    <span>카톡 발송</span>
                  </button>

                  <button
                    onClick={() => handleStartEdit(idx)}
                    className="btn-card-action edit"
                    title="문구 직접 다듬기"
                  >
                    <Pencil size={13} />
                    <span>수정</span>
                  </button>

                  <button
                    onClick={() => handleSaveToHistory(card.content, idx)}
                    className="btn-card-action save"
                    title="보관함 및 지식 창고에 저장"
                  >
                    <FolderPlus size={14} />
                    <span>보관</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
