import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Save, Plus, Trash2, Calendar, Tag, CheckSquare, Layers, BookOpen, Clock, AlignLeft, ShieldCheck, ListChecks, FileText } from 'lucide-react';
import {
  formatProjectForNotion,
  formatAreaForNotion,
  formatResourceForNotion,
  formatArchiveForNotion,
  copyToNotionClipboard
} from '../utils/notionFormatter';

export default function ItemModal({
  isOpen,
  onClose,
  type, // 'Project' | 'Area' | 'Resource' | 'Archive'
  item,
  isNew,
  areas = [],
  onSave
}) {
  const [formData, setFormData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'notion-preview'

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    } else {
      // Default empty structure
      if (type === 'Project') {
        setFormData({
          id: `proj-${Date.now()}`,
          title: '',
          areaId: areas[0]?.id || 'area-1',
          status: '시작 전',
          deadline: new Date().toISOString().split('T')[0],
          goal: '',
          tags: ['사역'],
          notionCallout: '사역의 비전과 핵심 말씀을 기록하세요.',
          wbs: [{ id: `w-${Date.now()}`, task: '사역 기획안 작성 및 조율', done: false }],
          notes: ''
        });
      } else if (type === 'Area') {
        setFormData({
          id: `area-${Date.now()}`,
          name: '',
          code: 'CUSTOM',
          icon: '🏛️',
          leader: '담당 사역자',
          importance: "★★★★★",
          satisfaction: 3,
          standard: '',
          routines: ['주간 핵심 루틴 점검']
        });
      } else if (type === 'Resource') {
        setFormData({
          id: `res-${Date.now()}`,
          title: '',
          category: '설교 예화',
          tags: ['사역자료'],
          quantity: 1,
          summary: '',
          content: '### 📖 사역 본문 및 적용 내용\n\n- 내용 입력'
        });
      } else if (type === 'Archive') {
        setFormData({
          id: `arch-${Date.now()}`,
          title: '',
          completedDate: new Date().toISOString().split('T')[0],
          originalArea: areas[0]?.id || 'area-1',
          completedCount: 1,
          sermonSeries: '',
          summary: '',
          retrospective: '### 🎯 사역 평가 (AAR)\n- **Keep (지속할 점)**:\n- **Problem (아쉬운 점)**:\n- **Try (개선 시도)**:'
        });
      }
    }
    setActiveTab('edit');
  }, [item, type, isOpen]);

  if (!isOpen || !formData) return null;

  const getNotionMarkdown = () => {
    if (type === 'Project') {
      const area = areas.find(a => a.id === formData.areaId);
      return formatProjectForNotion(formData, area?.name);
    }
    if (type === 'Area') {
      return formatAreaForNotion(formData);
    }
    if (type === 'Resource') {
      return formatResourceForNotion(formData);
    }
    if (type === 'Archive') {
      const area = areas.find(a => a.id === formData.originalArea);
      return formatArchiveForNotion(formData, area?.name);
    }
    return '';
  };

  const handleCopy = async () => {
    const md = getNotionMarkdown();
    const res = await copyToNotionClipboard(md, '노션 완성형 서식으로 복사되었습니다.');
    if (res.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSave(type, formData);
    onClose();
  };

  // WBS Handlers
  const handleAddWbs = () => {
    setFormData(prev => ({
      ...prev,
      wbs: [...(prev.wbs || []), { id: `w-${Date.now()}`, task: '', done: false }]
    }));
  };

  const handleRemoveWbs = (index) => {
    setFormData(prev => ({
      ...prev,
      wbs: prev.wbs.filter((_, i) => i !== index)
    }));
  };

  // Routine Handlers
  const handleAddRoutine = () => {
    setFormData(prev => ({
      ...prev,
      routines: [...(prev.routines || []), '']
    }));
  };

  const handleRemoveRoutine = (index) => {
    setFormData(prev => ({
      ...prev,
      routines: prev.routines.filter((_, i) => i !== index)
    }));
  };

  const getTypeColorClass = () => {
    switch (type) {
      case 'Project': return 'type-project';
      case 'Area': return 'type-area';
      case 'Resource': return 'type-resource';
      case 'Archive': return 'type-archive';
      default: return '';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container peek-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Header Bar */}
        <div className="peek-modal-header">
          <div className="peek-header-left">
            <span className={`peek-type-pill ${getTypeColorClass()}`}>
              {type}
            </span>
            <span className="peek-header-separator">/</span>
            <span className="peek-header-title-sub">
              {isNew ? '신규 등록' : (formData.title || formData.name || '상세 보기')}
            </span>
          </div>

          <div className="peek-header-actions">
            <button
              type="button"
              onClick={handleCopy}
              className={`peek-copy-btn ${copied ? 'copied' : ''}`}
              title="노션에 붙여넣을 수 있는 완성형 마크다운 복사"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? '복사됨' : '노션 복사'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="peek-close-btn"
              title="닫기 (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Peek View Mode Switcher (Tab) */}
        <div className="peek-tab-strip">
          <button
            type="button"
            className={`peek-tab-item ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            <AlignLeft size={13} />
            <span>속성 및 내용 편집</span>
          </button>
          <button
            type="button"
            className={`peek-tab-item ${activeTab === 'notion-preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('notion-preview')}
          >
            <FileText size={13} />
            <span>노션 서식 미리보기</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="peek-modal-body">
          {activeTab === 'notion-preview' ? (
            <div className="peek-preview-pane fade-in">
              <div className="peek-preview-callout">
                <span className="callout-icon">💡</span>
                <div>
                  아래 내용은 노션 페이지에 <code>Ctrl + V</code> (Mac은 <code>Cmd + V</code>) 했을 때 
                  <strong>콜아웃 박스, 체크리스트, 구분선, 속성 정보</strong>로 완벽하게 자동 변환됩니다.
                </div>
              </div>
              <div className="peek-code-block">
                <pre>{getNotionMarkdown()}</pre>
              </div>
            </div>
          ) : (
            <form id="item-modal-form" onSubmit={handleFormSubmit} className="peek-form">
              {/* Common Title Section */}
              <div className="peek-title-section">
                <input
                  type="text"
                  required
                  value={type === 'Area' ? formData.name : formData.title}
                  onChange={(e) => {
                    if (type === 'Area') {
                      setFormData({ ...formData, name: e.target.value });
                    } else {
                      setFormData({ ...formData, title: e.target.value });
                    }
                  }}
                  className="peek-title-input"
                  placeholder={
                    type === 'Project' ? '프로젝트 제목을 입력하세요 (예: 2026 청년부 여름 수련회)' :
                    type === 'Area' ? '책임 영역 이름 (예: 말씀 & 설교 사역)' :
                    type === 'Resource' ? '리소스 제목 (예: 헤르만 바빙크의 은혜와 순종)' :
                    '보관 사역 제목'
                  }
                  autoFocus={isNew}
                />
              </div>

              {/* =========================================
                  TYPE: PROJECT (프로젝트)
                  ========================================= */}
              {type === 'Project' && (
                <div className="peek-properties-section">
                  <div className="properties-grid">
                    <div className="prop-row">
                      <div className="prop-name">
                        <Layers size={13} />
                        <span>책임 영역</span>
                      </div>
                      <div className="prop-value">
                        <select
                          value={formData.areaId}
                          onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
                          className="prop-select"
                        >
                          {areas.map(a => (
                            <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="prop-row">
                      <div className="prop-name">
                        <Clock size={13} />
                        <span>진행 상태</span>
                      </div>
                      <div className="prop-value">
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="prop-select"
                        >
                          <option value="시작 전">시작 전</option>
                          <option value="진행 중">진행 중</option>
                          <option value="완료">완료</option>
                          <option value="보류">보류</option>
                        </select>
                      </div>
                    </div>

                    <div className="prop-row">
                      <div className="prop-name">
                        <Calendar size={13} />
                        <span>마감일</span>
                      </div>
                      <div className="prop-value">
                        <input
                          type="date"
                          value={formData.deadline}
                          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                          className="prop-input-date"
                        />
                      </div>
                    </div>

                    <div className="prop-row">
                      <div className="prop-name">
                        <Tag size={13} />
                        <span>태그</span>
                      </div>
                      <div className="prop-value">
                        <input
                          type="text"
                          value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                          onChange={(e) => {
                            const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                            setFormData({ ...formData, tags });
                          }}
                          placeholder="쉼표로 구분 (예: 수련회, 청년부, 예배)"
                          className="prop-input-text"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Goal Callout Box */}
                  <div className="peek-block-field">
                    <label className="block-field-label">🎯 핵심 목표 및 기대 결과 (Goal)</label>
                    <input
                      type="text"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      placeholder="사역의 핵심 목표를 선명한 문장으로 적어보세요"
                      className="block-text-input"
                    />
                  </div>

                  {/* Notion Callout Box */}
                  <div className="peek-block-field">
                    <label className="block-field-label">💡 비전 콜아웃 문구 (Notion Callout)</label>
                    <input
                      type="text"
                      value={formData.notionCallout || ''}
                      onChange={(e) => setFormData({ ...formData, notionCallout: e.target.value })}
                      placeholder="노션 상단에 강조 표시될 성구 또는 비전 문구"
                      className="block-text-input"
                    />
                  </div>

                  {/* WBS Checklist Section */}
                  <div className="peek-block-field">
                    <div className="wbs-section-header">
                      <label className="block-field-label">
                        <CheckSquare size={13} />
                        <span>실행 계획 및 과업 (WBS 체크리스트)</span>
                      </label>
                      <button type="button" onClick={handleAddWbs} className="btn-add-item-subtle">
                        <Plus size={12} />
                        <span>과업 추가</span>
                      </button>
                    </div>

                    <div className="peek-wbs-container">
                      {(formData.wbs || []).map((item, index) => (
                        <div key={item.id || index} className="peek-wbs-row">
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={(e) => {
                              const newWbs = [...formData.wbs];
                              newWbs[index].done = e.target.checked;
                              setFormData({ ...formData, wbs: newWbs });
                            }}
                            className="peek-wbs-check"
                          />
                          <input
                            type="text"
                            value={item.task}
                            onChange={(e) => {
                              const newWbs = [...formData.wbs];
                              newWbs[index].task = e.target.value;
                              setFormData({ ...formData, wbs: newWbs });
                            }}
                            placeholder="할 일을 입력하세요"
                            className="peek-wbs-input"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveWbs(index)}
                            className="peek-btn-del"
                            title="과업 삭제"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes / Markdown Body */}
                  <div className="peek-block-field">
                    <label className="block-field-label">📝 사역 메모 및 리소스 연결 (Notes)</label>
                    <textarea
                      rows={4}
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="사역 준비에 필요한 추가 메모, 참고 링크, 장소 등을 적어두세요."
                      className="peek-textarea"
                    />
                  </div>
                </div>
              )}

              {/* =========================================
                  TYPE: AREA (책임 영역)
                  ========================================= */}
              {type === 'Area' && (
                <div className="peek-properties-section">
                  <div className="properties-grid">
                    <div className="prop-row">
                      <div className="prop-name">
                        <span>아이콘 / 이모지</span>
                      </div>
                      <div className="prop-value">
                        <input
                          type="text"
                          value={formData.icon || '🏛️'}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                          className="prop-input-text"
                          style={{ width: '60px' }}
                        />
                      </div>
                    </div>

                    <div className="prop-row">
                      <div className="prop-name">
                        <span>사역 코드</span>
                      </div>
                      <div className="prop-value">
                        <input
                          type="text"
                          value={formData.code || ''}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          placeholder="SERMON, ADMIN 등"
                          className="prop-input-text"
                        />
                      </div>
                    </div>

                    <div className="prop-row">
                      <div className="prop-name">
                        <span>담당 리더 / 팀</span>
                      </div>
                      <div className="prop-value">
                        <input
                          type="text"
                          value={formData.leader || ''}
                          onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                          placeholder="담당 교역자 / 부서팀"
                          className="prop-input-text"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 중요도 / 만족도: 노션 '영역별 균형 트래커' 열과 1:1 매칭 */}
                  <div className="properties-grid">
                    <div className="prop-row">
                      <div className="prop-name">
                        <span>사역적 중요도</span>
                      </div>
                      <div className="prop-value">
                        <select
                          value={formData.importance === '★★★★☆' ? '★★★★☆' : '★★★★★'}
                          onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
                          className="prop-select"
                        >
                          <option value="★★★★★">★★★★★ 핵심</option>
                          <option value="★★★★☆">★★★★☆ 준핵심</option>
                        </select>
                      </div>
                    </div>
                    <div className="prop-row">
                      <div className="prop-name">
                        <span>현재 만족도 (1-5)</span>
                      </div>
                      <div className="prop-value">
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={formData.satisfaction ?? 3}
                          onChange={(e) => setFormData({ ...formData, satisfaction: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="prop-input-text"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Standard */}
                  <div className="peek-block-field">
                    <label className="block-field-label">
                      <ShieldCheck size={13} />
                      <span>책임 영역 기준 및 헌장 (Standard)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.standard || ''}
                      onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
                      placeholder="이 사역 영역에서 반드시 지켜야 할 질적 기준과 원칙을 작성하세요."
                      className="peek-textarea"
                    />
                  </div>

                  {/* Routines */}
                  <div className="peek-block-field">
                    <div className="wbs-section-header">
                      <label className="block-field-label">
                        <ListChecks size={13} />
                        <span>주간 및 정기 핵심 루틴 (SOP)</span>
                      </label>
                      <button type="button" onClick={handleAddRoutine} className="btn-add-item-subtle">
                        <Plus size={12} />
                        <span>루틴 추가</span>
                      </button>
                    </div>

                    <div className="peek-wbs-container">
                      {(formData.routines || []).map((routine, idx) => (
                        <div key={idx} className="peek-wbs-row">
                          <span className="routine-num-dot">▸</span>
                          <input
                            type="text"
                            value={routine}
                            onChange={(e) => {
                              const newRoutines = [...formData.routines];
                              newRoutines[idx] = e.target.value;
                              setFormData({ ...formData, routines: newRoutines });
                            }}
                            placeholder="예: 월요일 본문 묵상, 목요일 콘티 점검"
                            className="peek-wbs-input"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveRoutine(idx)}
                            className="peek-btn-del"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================
                  TYPE: RESOURCE (자료 지식)
                  ========================================= */}
              {type === 'Resource' && (
                <div className="peek-properties-section">
                  <div className="properties-grid">
                    <div className="prop-row">
                      <div className="prop-name">
                        <BookOpen size={13} />
                        <span>자료 분류</span>
                      </div>
                      <div className="prop-value">
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="prop-select"
                        >
                          <option value="설교 예화">설교 예화</option>
                          <option value="심방/상담 가이드">심방/상담 가이드</option>
                          <option value="찬양 콘티">찬양 콘티</option>
                          <option value="소그룹 공과">소그룹 공과</option>
                          <option value="사역 매뉴얼">사역 매뉴얼</option>
                        </select>
                      </div>
                    </div>

                    <div className="prop-row">
                      <div className="prop-name">
                        <Tag size={13} />
                        <span>태그</span>
                      </div>
                      <div className="prop-value">
                        <input
                          type="text"
                          value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                          onChange={(e) => {
                            const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                            setFormData({ ...formData, tags });
                          }}
                          placeholder="쉼표로 구분 (예: 교리, 칭의, 은혜)"
                          className="prop-input-text"
                        />
                      </div>
                    </div>

                    <div className="prop-row">
                      <div className="prop-name">
                        <span>보관 수량</span>
                      </div>
                      <div className="prop-value">
                        <input
                          type="number"
                          min="0"
                          value={formData.quantity ?? ''}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value === '' ? '' : Number(e.target.value) })}
                          placeholder="예: 1"
                          className="prop-input-text"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="peek-block-field">
                    <label className="block-field-label">💡 핵심 요약 (Summary)</label>
                    <input
                      type="text"
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      placeholder="이 자료의 핵심 내용을 1~2문장으로 요약하세요"
                      className="block-text-input"
                    />
                  </div>

                  {/* Content Markdown */}
                  <div className="peek-block-field">
                    <label className="block-field-label">📖 상세 내용 및 사역 적용 자료 (Content)</label>
                    <textarea
                      rows={8}
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="설교 본문 주해, 심방 권면 구절, 찬양 곡 리스트 등을 자유롭게 작성하세요."
                      className="peek-textarea code-font"
                    />
                  </div>
                </div>
              )}

              {/* =========================================
                  TYPE: ARCHIVE (보관함)
                  ========================================= */}
              {type === 'Archive' && (
                <div className="peek-properties-section">
                  <div className="properties-grid">
                    <div className="prop-row">
                      <div className="prop-name">
                        <Calendar size={13} />
                        <span>완료일자</span>
                      </div>
                      <div className="prop-value">
                        <input
                          type="date"
                          value={formData.completedDate}
                          onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
                          className="prop-input-date"
                        />
                      </div>
                    </div>

                    <div className="prop-row">
                      <div className="prop-name">
                        <span>완료된 사역 수</span>
                      </div>
                      <div className="prop-value">
                        <input
                          type="number"
                          min="0"
                          value={formData.completedCount ?? ''}
                          onChange={(e) => setFormData({ ...formData, completedCount: e.target.value === '' ? '' : Number(e.target.value) })}
                          placeholder="예: 3"
                          className="prop-input-text"
                        />
                      </div>
                    </div>

                    <div className="prop-row">
                      <div className="prop-name">
                        <span>설교 시리즈</span>
                      </div>
                      <div className="prop-value">
                        <input
                          type="text"
                          value={formData.sermonSeries || ''}
                          onChange={(e) => setFormData({ ...formData, sermonSeries: e.target.value })}
                          placeholder="예: 2025 상반기 주일 설교 24편"
                          className="prop-input-text"
                        />
                      </div>
                    </div>

                    <div className="prop-row">
                      <div className="prop-name">
                        <Layers size={13} />
                        <span>소속 영역</span>
                      </div>
                      <div className="prop-value">
                        <select
                          value={formData.originalArea}
                          onChange={(e) => setFormData({ ...formData, originalArea: e.target.value })}
                          className="prop-select"
                        >
                          {areas.map(a => (
                            <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="peek-block-field">
                    <label className="block-field-label">📋 사역 성과 요약 (Summary)</label>
                    <input
                      type="text"
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      placeholder="행사 인원, 은혜의 열매 등을 간략히 기록하세요"
                      className="block-text-input"
                    />
                  </div>

                  <div className="peek-block-field">
                    <label className="block-field-label">🔍 AAR 사역 회고 및 사후 평가 (Retrospective)</label>
                    <textarea
                      rows={7}
                      value={formData.retrospective || ''}
                      onChange={(e) => setFormData({ ...formData, retrospective: e.target.value })}
                      placeholder="Keep(지속할 점), Problem(아쉬웠던 점), Try(다음 개선점)을 정리하세요."
                      className="peek-textarea code-font"
                    />
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="peek-modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn-peek-secondary"
          >
            닫기
          </button>
          {activeTab === 'edit' && (
            <button
              type="submit"
              form="item-modal-form"
              className="btn-peek-primary"
            >
              <Save size={14} />
              <span>{isNew ? '등록하기' : '저장하기'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
