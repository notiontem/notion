import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, BookOpen, Download, Upload, RotateCcw, ExternalLink, Link2, FileSpreadsheet, Package, HelpCircle, ChevronDown } from 'lucide-react';
import { exportProjectsToCsv, exportResourcesToCsv, exportAreasToCsv, exportArchivesToCsv, isUnsyncedItem } from '../utils/notionCsvExporter';

export default function Header({
  theme,
  setTheme,
  userNotionUrl,
  data,
  onOpenSetUrlModal,
  onOpenOnboarding,
  onOpenPresetModal,
  onOpenGuide,
  onExportData,
  onImportData,
  onResetData,
  csvOnlyNew,
  onCsvModeChange,
  onCsvExported
}) {
  const fileInputRef = useRef(null);
  const [showCsvMenu, setShowCsvMenu] = useState(false);
  const csvMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (csvMenuRef.current && !csvMenuRef.current.contains(e.target)) {
        setShowCsvMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          onImportData(parsed);
        } catch {
          alert('올바른 백업 JSON 파일이 아닙니다.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="header-container">
      <div className="header-inner">
        {/* Brand Logo & Title */}
        <div className="brand-box">
          <div className="brand-mark">
            <span className="brand-symbol">N</span>
          </div>
          <div className="brand-text-block">
            <div className="brand-title-wrap">
              <h1 className="brand-title">Ministry Second Brain</h1>
              <span className="brand-version-tag">PARA</span>
            </div>
            <p className="brand-subtitle">사역자를 위한 노션 지식 관리 데스크</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="header-actions">
          {/* Quick jump to User's Notion */}
          {userNotionUrl ? (
            <button
              onClick={() => window.open(userNotionUrl, '_blank', 'noopener,noreferrer')}
              className="action-btn header-notion-btn"
              title="내 노션 워크스페이스 바로 열기"
            >
              <ExternalLink size={14} />
              <span className="btn-label">내 노션 열기</span>
            </button>
          ) : (
            <button
              onClick={onOpenSetUrlModal}
              className="action-btn header-subtle-btn"
              title="복제한 내 노션 페이지 링크 등록"
            >
              <Link2 size={14} />
              <span className="btn-label">노션 연결</span>
            </button>
          )}

          {/* Preset Library Button */}
          <button
            onClick={onOpenPresetModal}
            className="action-btn"
            title="실전 사역 템플릿 컬렉션 열기"
          >
            <Package size={14} />
            <span className="btn-label">사역 템플릿</span>
          </button>

          {/* Notion CSV Export Dropdown */}
          <div className="csv-dropdown-container" ref={csvMenuRef}>
            <button
              onClick={() => setShowCsvMenu(!showCsvMenu)}
              className="action-btn header-csv-btn"
              title="노션 데이터베이스 일괄 업로드용 CSV 내보내기"
            >
              <FileSpreadsheet size={14} />
              <span className="btn-label">CSV 내보내기</span>
              <ChevronDown size={12} className="chevron-icon" />
            </button>

            {showCsvMenu && (
              <div className="csv-dropdown-menu fade-in">
                <div className="csv-dropdown-header">
                  <span>노션 데이터베이스 맞춤 CSV</span>
                </div>
                {/* 신규·수정 항목만 내보내기: 노션 병합 시 중복 행 방지를 위한 기본값 권장 */}
                <button
                  onClick={() => onCsvModeChange(!csvOnlyNew)}
                  className={`csv-mode-toggle ${csvOnlyNew ? 'active' : ''}`}
                  role="switch"
                  aria-checked={!!csvOnlyNew}
                  title="켜면 아직 노션에 보내지 않았거나 수정된 항목만 내보냅니다"
                >
                  <span className={`csv-switch ${csvOnlyNew ? 'on' : ''}`} />
                  <span>신규·수정 항목만</span>
                </button>
                <button
                  onClick={() => {
                    const list = csvOnlyNew ? data.projects.filter(isUnsyncedItem) : data.projects;
                    if (!list.length) return;
                    exportProjectsToCsv(list, data.areas, csvOnlyNew ? '신규' : '');
                    onCsvExported('Project', list.map(i => i.id));
                    setShowCsvMenu(false);
                  }}
                  className="csv-dropdown-item"
                  disabled={csvOnlyNew && !data.projects.some(isUnsyncedItem)}
                >
                  <span className="item-badge p">P</span>
                  <div>
                    <strong>Projects (프로젝트 DB)</strong>
                    <small>{csvOnlyNew ? `신규 ${data.projects.filter(isUnsyncedItem).length} / 전체 ${data.projects.length}` : `${data.projects.length}개 항목`}</small>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const list = csvOnlyNew ? data.resources.filter(isUnsyncedItem) : data.resources;
                    if (!list.length) return;
                    exportResourcesToCsv(list, csvOnlyNew ? '신규' : '');
                    onCsvExported('Resource', list.map(i => i.id));
                    setShowCsvMenu(false);
                  }}
                  className="csv-dropdown-item"
                  disabled={csvOnlyNew && !data.resources.some(isUnsyncedItem)}
                >
                  <span className="item-badge r">R</span>
                  <div>
                    <strong>Resources (자료창고 DB)</strong>
                    <small>{csvOnlyNew ? `신규 ${data.resources.filter(isUnsyncedItem).length} / 전체 ${data.resources.length}` : `${data.resources.length}개 항목`}</small>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const list = csvOnlyNew ? data.areas.filter(isUnsyncedItem) : data.areas;
                    if (!list.length) return;
                    exportAreasToCsv(list, csvOnlyNew ? '신규' : '');
                    onCsvExported('Area', list.map(i => i.id));
                    setShowCsvMenu(false);
                  }}
                  className="csv-dropdown-item"
                  disabled={csvOnlyNew && !data.areas.some(isUnsyncedItem)}
                >
                  <span className="item-badge a">A</span>
                  <div>
                    <strong>Areas (책임영역 DB)</strong>
                    <small>{csvOnlyNew ? `신규 ${data.areas.filter(isUnsyncedItem).length} / 전체 ${data.areas.length}` : `${data.areas.length}개 항목`}</small>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const list = csvOnlyNew ? data.archives.filter(isUnsyncedItem) : data.archives;
                    if (!list.length) return;
                    exportArchivesToCsv(list, data.areas, csvOnlyNew ? '신규' : '');
                    onCsvExported('Archive', list.map(i => i.id));
                    setShowCsvMenu(false);
                  }}
                  className="csv-dropdown-item"
                  disabled={csvOnlyNew && !data.archives.some(isUnsyncedItem)}
                >
                  <span className="item-badge arch">A</span>
                  <div>
                    <strong>Archives (보관함 DB)</strong>
                    <small>{csvOnlyNew ? `신규 ${data.archives.filter(isUnsyncedItem).length} / 전체 ${data.archives.length}` : `${data.archives.length}개 항목`}</small>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onOpenGuide}
            className="action-btn"
            title="사용 가이드 및 팁"
          >
            <BookOpen size={14} />
            <span className="btn-label">가이드</span>
          </button>

          <button
            onClick={onOpenOnboarding}
            className="action-btn icon-only"
            title="시작 셋업 가이드"
          >
            <HelpCircle size={15} />
          </button>

          <div className="header-divider"></div>

          {/* Backup & Restore JSON */}
          <button
            onClick={onExportData}
            className="action-btn icon-only"
            title="데이터 백업 (JSON 다운로드)"
          >
            <Download size={14} />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="action-btn icon-only"
            title="데이터 복원 (JSON 불러오기)"
          >
            <Upload size={14} />
          </button>

          <button
            onClick={onResetData}
            className="action-btn icon-only subtle-danger"
            title="예시 데이터로 초기화"
          >
            <RotateCcw size={14} />
          </button>

          <div className="header-divider"></div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="theme-toggle-btn"
            title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
}
