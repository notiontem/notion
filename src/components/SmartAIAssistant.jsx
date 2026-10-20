import React, { useState } from 'react';
import { PenTool, Copy, Check, Plus, RefreshCw, FileText, Sparkles } from 'lucide-react';
import { generateMinistryContent, classifyPARA } from '../utils/aiGenerator';
import {
  formatProjectForNotion,
  formatAreaForNotion,
  formatResourceForNotion,
  formatArchiveForNotion,
  copyToNotionClipboard
} from '../utils/notionFormatter';

const SAMPLE_PROMPTS = [
  { text: "로마서 8장 '결코 정죄함이 없나니' 4주 강해 설교", tag: "설교" },
  { text: "청년부 여름 수련회 기획안과 WBS 일정", tag: "행사" },
  { text: "질병과 상실을 겪는 가정을 위한 심방 위로 가이드", tag: "심방" },
  { text: "예배 회복과 결단을 위한 주일 찬양 5곡 콘티", tag: "예배" },
  { text: "새가족 4주 정착 바나바 사역 매뉴얼", tag: "양육" },
  { text: "풍랑 속의 닻과 소망 (설교 예화 메모)", tag: "자료" }
];

export default function SmartAIAssistant({
  onAddGeneratedItem,
  areas,
  hideHeader = false,
  compactMode = false
}) {
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState('auto');
  const [generatedResult, setGeneratedResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      const result = generateMinistryContent(prompt, selectedType);
      setGeneratedResult(result);
      setIsGenerating(false);
    }, 350);
  };

  const handleQuickPrompt = (text) => {
    setPrompt(text);
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateMinistryContent(text, selectedType);
      setGeneratedResult(result);
      setIsGenerating(false);
    }, 250);
  };

  const handleCopyNotion = async () => {
    if (!generatedResult) return;

    let markdown = '';
    if (generatedResult.type === 'Project') {
      markdown = formatProjectForNotion(generatedResult);
    } else if (generatedResult.type === 'Area') {
      markdown = formatAreaForNotion(generatedResult);
    } else if (generatedResult.type === 'Resource') {
      markdown = formatResourceForNotion(generatedResult);
    } else if (generatedResult.type === 'Archive') {
      markdown = formatArchiveForNotion(generatedResult);
    }

    const res = await copyToNotionClipboard(markdown, '노션 서식으로 복사되었습니다. 노션 페이지에 붙여넣기(Ctrl+V) 하세요.');
    if (res.success) {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2200);
    }
  };

  const handleSaveToWorkspace = () => {
    if (!generatedResult) return;

    // 주제에서 판별한 영역 코드를 실제 Areas DB의 id로 연결한다. (CSV 담당자·영역 자동 채움)
    const matchedArea = (areas || []).find(a => a.code === generatedResult.areaCode);

    const newItem = {
      ...generatedResult,
      areaId: matchedArea ? matchedArea.id : undefined,
      leader: matchedArea ? matchedArea.leader : generatedResult.leader,
      id: `${generatedResult.type.toLowerCase()}-${Date.now()}`
    };

    onAddGeneratedItem(generatedResult.type, newItem);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  return (
    <section className={`assistant-card ${compactMode ? 'compact-desk' : ''}`}>
      {!hideHeader && (
        <div className="assistant-header">
          <div className="assistant-badge">
            <PenTool size={13} />
            <span>사역 초안 작성기 (Drafting Desk)</span>
          </div>
          <h3 className="assistant-title">사역 아이디어와 메모를 노션 체계로 정돈합니다</h3>
          <p className="assistant-desc">
            설교 본문 구상, 수련회 일정, 심방 성도 메모를 자유롭게 적어보세요. 
            티아고 포르테의 PARA 구조(프로젝트, 영역, 리소스, 보관함)에 맞추어 노션에 바로 붙여넣을 수 있는 아웃라인을 정리합니다.
          </p>
        </div>
      )}

      {/* Input area */}
      <div className="assistant-input-box">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="작성하고 싶은 사역 주제를 입력하세요 (예: '로마서 8장 4주 설교 개요', '청년부 수련회 WBS 일정', '환우 심방 위로 가이드')"
          className="assistant-textarea"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleGenerate();
            }
          }}
        />

        <div className="assistant-controls">
          <div className="category-selector">
            <span className="control-label">분류 대상:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="control-select"
            >
              <option value="auto">자동 분석 (추천)</option>
              <option value="Project">프로젝트 (Projects)</option>
              <option value="Area">책임 영역 (Areas)</option>
              <option value="Resource">사역 지식 (Resources)</option>
              <option value="Archive">보관함 (Archives)</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="generate-btn"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={14} className="spin-icon" />
                <span>정리하는 중...</span>
              </>
            ) : (
              <>
                <FileText size={14} />
                <span>사역 아웃라인 생성</span>
              </>
            )}
          </button>
        </div>

        {/* Quick prompt suggestions */}
        <div className="quick-chips-wrap">
          <span className="chips-label">원클릭 추천 주제:</span>
          <div className="chips-list">
            {SAMPLE_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(p.text)}
                className="chip-btn"
                title={`클릭 시 '${p.text}' 초안 즉시 생성`}
              >
                <span className="chip-tag">{p.tag}</span>
                <span>{p.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Result Preview */}
      {generatedResult && (
        <div className="assistant-result-wrap fade-in">
          <div className="result-header">
            <div className="result-type-tag">
              <span className={`para-badge-dot ${generatedResult.type.toLowerCase()}`}></span>
              <strong>{generatedResult.type}</strong>
              <span className="result-badge-desc">
                {generatedResult.type === 'Project' ? '사역 프로젝트' :
                 generatedResult.type === 'Area' ? '책임 영역' :
                 generatedResult.type === 'Resource' ? '사역 지식 창고' : '보관함'}
              </span>
            </div>

            <div className="result-actions">
              <button
                onClick={handleCopyNotion}
                className={`btn-subtle-action ${copyFeedback ? 'copied' : ''}`}
              >
                {copyFeedback ? <Check size={14} /> : <Copy size={14} />}
                <span>{copyFeedback ? '노션 복사 완료' : '노션 서식 복사'}</span>
              </button>

              <button
                onClick={handleSaveToWorkspace}
                className="btn-subtle-action primary"
              >
                {saveFeedback ? <Check size={14} /> : <Plus size={14} />}
                <span>{saveFeedback ? '보관함에 저장됨' : '내 보관함에 추가'}</span>
              </button>
            </div>
          </div>

            <div className="result-content-box">
              <h4 className="result-title">
                {generatedResult.title || generatedResult.name}
              </h4>

              <div className="result-meta-line">
                {generatedResult.areaLabel && <span className="meta-chip">{generatedResult.areaLabel}</span>}
                {generatedResult.deadline
                  ? <span className="meta-chip">마감 {generatedResult.deadline}</span>
                  : <span className="meta-chip muted">마감일 미정 (직접 입력)</span>}
              </div>

            {generatedResult.notionCallout && (
              <div className="callout-preview">
                <div>{generatedResult.notionCallout}</div>
              </div>
            )}

            {generatedResult.goal && (
              <div className="result-field">
                <strong>핵심 목표:</strong>
                <p>{generatedResult.goal}</p>
              </div>
            )}

            {generatedResult.wbs && (
              <div className="result-field">
                <strong>세부 실행 일정 (WBS):</strong>
                <ul className="wbs-preview-list">
                  {generatedResult.wbs.map((item, idx) => (
                    <li key={idx} className="wbs-preview-item">
                      <span className="check-box-preview">◻</span>
                      <span>{item.task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {generatedResult.standard && (
              <div className="result-field">
                <strong>사역 기준 및 헌장:</strong>
                <p>{generatedResult.standard}</p>
              </div>
            )}

            {generatedResult.routines && (
              <div className="result-field">
                <strong>정기 핵심 루틴:</strong>
                <ul className="routine-preview-list">
                  {generatedResult.routines.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {generatedResult.summary && (
              <div className="result-field">
                <strong>한 줄 요약:</strong>
                <p>{generatedResult.summary}</p>
              </div>
            )}

            {generatedResult.content && (
              <div className="result-field">
                <strong>본문 및 사역 적용 자료:</strong>
                <pre className="markdown-pre">{generatedResult.content}</pre>
              </div>
            )}

            {generatedResult.retrospective && (
              <div className="result-field">
                <strong>사역 회고 (AAR):</strong>
                <pre className="markdown-pre">{generatedResult.retrospective}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
