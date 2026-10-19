import React, { useState } from 'react';
import { Plus, Copy, Check, Search, Tag, BookMarked, Trash2, FileText, Music, HeartHandshake, HelpCircle, FileSpreadsheet } from 'lucide-react';
import { formatResourceForNotion, copyToNotionClipboard } from '../utils/notionFormatter';
import { exportResourcesToCsv, isUnsyncedItem } from '../utils/notionCsvExporter';

const CATEGORIES = [
  "전체",
  "설교 예화",
  "심방/상담 가이드",
  "찬양 콘티",
  "소그룹 공과",
  "사역 매뉴얼"
];

export default function ResourceSection({
  resources,
  onAddResource,
  onDeleteResource,
  onOpenDetail,
  csvOnlyNew,
  onCsvExported
}) {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const filteredResources = resources.filter(res => {
    const matchesCategory = selectedCategory === "전체" || res.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleCopy = async (res, e) => {
    e.stopPropagation();
    const markdown = formatResourceForNotion(res);
    const result = await copyToNotionClipboard(markdown, `'${res.title}' 노션 서식 복사 완료!`);
    if (result.success) {
      setCopiedId(res.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case '설교 예화': return <BookMarked size={14} />;
      case '심방/상담 가이드': return <HeartHandshake size={14} />;
      case '찬양 콘티': return <Music size={14} />;
      case '소그룹 공과': return <HelpCircle size={14} />;
      default: return <FileText size={14} />;
    }
  };

  return (
    <div className="section-container">
      {/* Section Header */}
      <div className="section-toolbar">
        <div>
          <div className="section-title-wrap">
            <span className="para-badge resource-badge">R</span>
            <h2 className="section-title">Resources (사역 지식 창고)</h2>
          </div>
          <p className="section-desc">
            현재 및 미래 사역(설교, 심방, 예배, 양육)에 언제든 꺼내어 활용할 수 있는 축적형 지식과 실전 템플릿
          </p>
        </div>

        <div className="toolbar-actions">
          <button
            onClick={() => {
              const list = csvOnlyNew ? resources.filter(isUnsyncedItem) : resources;
              if (!list.length) return;
              exportResourcesToCsv(list, csvOnlyNew ? '신규' : '');
              if (onCsvExported) onCsvExported('Resource', list.map(i => i.id));
            }}
            disabled={csvOnlyNew && !resources.some(isUnsyncedItem)}
            className="action-btn csv-btn"
            title="노션 Resources 데이터베이스로 가져올 수 있는 CSV 다운로드"
          >
            <FileSpreadsheet size={15} />
            <span>노션 CSV 내보내기</span>
          </button>

          <button
            onClick={onAddResource}
            className="create-btn resource-btn"
          >
            <Plus size={16} />
            <span>새 리소스 등록</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="resource-filter-bar">
        <div className="categories-pill-list">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="search-input-wrap">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="제목, 요약, 태그(#칭의, #심방 등) 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Resources Grid */}
      <div className="cards-grid">
        {filteredResources.length === 0 ? (
          <div className="empty-state">
            <p>조건에 맞는 사역 리소스가 없습니다.</p>
            <button onClick={onAddResource} className="empty-action-btn">
              <Plus size={16} />
              <span>새 리소스 추가하기</span>
            </button>
          </div>
        ) : (
          filteredResources.map(res => (
            <div
              key={res.id}
              className="resource-card"
              onClick={() => onOpenDetail(res, 'Resource')}
            >
              {/* Category & Tags */}
              <div className="card-top-meta">
                <span className="category-tag">
                  {getCategoryIcon(res.category)}
                  <span>{res.category}</span>
                </span>

                <div className="tags-list">
                  {res.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="tag-chip">#{tag}</span>
                  ))}
                </div>
              </div>

              {/* Title */}
              <h3 className="card-title">{res.title}</h3>

              {/* Summary */}
              <p className="resource-summary">{res.summary}</p>

              {/* Preview Content Snippet */}
              <div className="resource-content-preview">
                <p>{res.content.replace(/[#>*-]/g, '').trim().substring(0, 140)}...</p>
              </div>

              {/* Card Footer Actions */}
              <div className="card-footer" onClick={(e) => e.stopPropagation()}>
                <span className="read-more-text">클릭하여 전체 보기</span>

                <div className="card-actions">
                  <button
                    onClick={(e) => handleCopy(res, e)}
                    className={`card-copy-btn ${copiedId === res.id ? 'copied' : ''}`}
                    title="노션에 붙여넣을 수 있는 마크다운 복사"
                  >
                    {copiedId === res.id ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedId === res.id ? '복사됨' : '노션 복사'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`'${res.title}' 리소스를 삭제하시겠습니까?`)) {
                        onDeleteResource(res.id);
                      }
                    }}
                    className="card-delete-btn"
                    title="삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
