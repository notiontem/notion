import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import NotionBanner from './components/NotionBanner';
import SmartAIAssistant from './components/SmartAIAssistant';
import ProjectSection from './components/ProjectSection';
import AreaSection from './components/AreaSection';
import ResourceSection from './components/ResourceSection';
import ArchiveSection from './components/ArchiveSection';
import ItemModal from './components/ItemModal';
import NotionGuideModal from './components/NotionGuideModal';
import SetNotionUrlModal from './components/SetNotionUrlModal';
import OnboardingModal from './components/OnboardingModal';
import PresetLibraryModal from './components/PresetLibraryModal';
import Ambient3DBackground from './components/Ambient3DBackground';
import UserGuidePage from './components/UserGuidePage';
import NoticeWriterSection from './components/NoticeWriterSection';
import EventManagerSection from './components/EventManagerSection';
import DashboardHome from './components/DashboardHome';
import { INITIAL_DATA } from './data/defaultData';
import { DEFAULT_EVENTS } from './data/defaultEvents';
import { Layers, CheckCircle2, BookOpen, Archive as ArchiveIcon, LayoutDashboard, Sparkles, Package, MessageSquareText, CalendarDays, ChevronDown, Check } from 'lucide-react';
import './App.css';

const STORAGE_KEY = 'ministry_second_brain_data_v1';
const THEME_KEY = 'ministry_second_brain_theme_v1';
const USER_NOTION_URL_KEY = 'ministry_user_custom_notion_url_v1';
const ONBOARDING_SEEN_KEY = 'ministry_second_brain_onboarding_seen_v1';
const CSV_NEW_ONLY_KEY = 'ministry_second_brain_csv_new_only_v1';

/**
 * 기존 사용자의 저장 데이터에 새 속성이 없으면 기본값을 채워준다.
 * (Areas 중요도/만족도, Resources 보관 수량, Archives 완료 사역 수/설교 시리즈)
 * 이 값들은 노션 템플릿의 '영역별 균형 트래커'·'아카이브' DB 열과 1:1로 매칭된다.
 */
function migrateData(saved) {
  if (!saved) return saved;

  const sampleAreaMap = {};
  INITIAL_DATA.areas.forEach(a => {
    sampleAreaMap[a.id] = a;
    sampleAreaMap[a.code] = a;
  });

  const sampleArchiveMap = {};
  INITIAL_DATA.archives.forEach(a => { sampleArchiveMap[a.id] = a; });

  // 상태 표기를 노션 템플릿 옵션(시작 전 / 진행 중 / 완료)과 동일하게 맞춘다.
  const STATUS_ALIASES = {
    '기획중': '시작 전',
    '진행중': '진행 중',
    '대기': '시작 전',
    '시작 전': '시작 전',
    '진행 중': '진행 중',
    '완료': '완료',
    '보류': '보류'
  };

  // 구 Areas 체계(6영역: WORSHIP·DISCIPLESHIP 포함)를 노션 템플릿 5영역으로 교체한다.
  // 사용자가 직접 만든 영역(기본 id가 아닌 것)은 그대로 둔다.
  const OLD_DEFAULT_AREA_IDS = new Set(['area-1', 'area-2', 'area-3', 'area-4', 'area-5', 'area-6']);
  const AREA_ID_REMAP = {
    'area-1': 'area-1',
    'area-2': 'area-2',
    'area-3': 'area-5',
    'area-4': 'area-5',
    'area-5': 'area-5',
    'area-6': 'area-3'
  };
  const hasOldAreas = (saved.areas || []).some(a =>
    a.code === 'WORSHIP' || a.code === 'DISCIPLESHIP' ||
    (a.name || '').includes('예배 & 찬양') || (a.name || '').includes('소그룹 & 제자양육')
  );

  let areas = (saved.areas || []).map(a => {
    const sample = sampleAreaMap[a.id] || sampleAreaMap[a.code] || {};
    return {
      ...a,
      importance: a.importance != null ? a.importance : (sample.importance != null ? sample.importance : '★★★★☆'),
      satisfaction: a.satisfaction != null ? a.satisfaction : (sample.satisfaction != null ? sample.satisfaction : 3)
    };
  });

  let finalProjects = (saved.projects || []).map(p => ({
    ...p,
    status: STATUS_ALIASES[p.status] || p.status
  }));

  let archives = saved.archives || [];

  if (hasOldAreas) {
    const customAreas = areas.filter(a => !OLD_DEFAULT_AREA_IDS.has(a.id));
    areas = [...INITIAL_DATA.areas, ...customAreas];
    finalProjects = finalProjects.map(p => ({
      ...p,
      areaId: AREA_ID_REMAP[p.areaId] || p.areaId
    }));
    archives = archives.map(ar => ({
      ...ar,
      originalArea: AREA_ID_REMAP[ar.originalArea] || ar.originalArea
    }));
  }

  return {
    ...saved,
    projects: finalProjects,
    areas,
    resources: (saved.resources || []).map(r => ({
      ...r,
      quantity: r.quantity != null ? r.quantity : 1
    })),
    archives: archives.map(ar => {
      const sample = sampleArchiveMap[ar.id] || {};
      return {
        ...ar,
        completedCount: ar.completedCount != null && ar.completedCount !== '' ? ar.completedCount : (sample.completedCount != null ? sample.completedCount : ''),
        sermonSeries: ar.sermonSeries || sample.sermonSeries || ''
      };
    })
  };
}

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'dark';
  });

  // User personalized Notion template URL
  const [userNotionUrl, setUserNotionUrl] = useState(() => {
    return localStorage.getItem(USER_NOTION_URL_KEY) || '';
  });

  // Main data state
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return migrateData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse stored data:', e);
      }
    }
    return INITIAL_DATA;
  });

  // Events data state
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('ministry_second_brain_events_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse events:', e);
    }
    return DEFAULT_EVENTS;
  });

  useEffect(() => {
    localStorage.setItem('ministry_second_brain_events_v2', JSON.stringify(events));
  }, [events]);

  // CSV 내보내기 모드: true면 '신규·수정 항목만' 내보낸다 (중복 병합 방지)
  const [csvOnlyNew, setCsvOnlyNew] = useState(() => {
    return localStorage.getItem(CSV_NEW_ONLY_KEY) === '1';
  });

  useEffect(() => {
    localStorage.setItem(CSV_NEW_ONLY_KEY, csvOnlyNew ? '1' : '0');
  }, [csvOnlyNew]);

  // Active Tab: 'dashboard' | 'projects' | 'areas' | 'resources' | 'archives' | 'guide' | 'notice-writer' | 'events'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Second Brain Dropdown Menu
  const [paraMenuOpen, setParaMenuOpen] = useState(false);
  const paraMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (paraMenuRef.current && !paraMenuRef.current.contains(e.target)) {
        setParaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isParaActive = ['projects', 'areas', 'resources', 'archives'].includes(activeTab);
  const paraItemMap = {
    projects: { label: '프로젝트', letter: 'P', badgeClass: 'p-badge' },
    areas: { label: '책임 영역', letter: 'A', badgeClass: 'a-badge' },
    resources: { label: '지식 창고', letter: 'R', badgeClass: 'r-badge' },
    archives: { label: '보관함', letter: 'A', badgeClass: 'arch-badge' }
  };
  const activeParaItem = paraItemMap[activeTab];

  // Modals state
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(() => {
    // Show onboarding automatically for first-time visitors
    return !localStorage.getItem(ONBOARDING_SEEN_KEY);
  });

  const [itemModalState, setItemModalState] = useState({
    isOpen: false,
    type: 'Project',
    item: null,
    isNew: false
  });

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Sync data to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Handlers for Project WBS Toggle
  const handleToggleWbs = (projectId, wbsId) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          updatedAt: Date.now(),
          wbs: p.wbs.map(w => w.id === wbsId ? { ...w, done: !w.done } : w)
        };
      })
    }));
  };

  // Add / Edit / Delete handlers
  const handleSaveItem = (type, itemData) => {
    const stamped = { ...itemData, updatedAt: Date.now() };
    setData(prev => {
      const collectionKey = type === 'Project' ? 'projects' :
                            type === 'Area' ? 'areas' :
                            type === 'Resource' ? 'resources' : 'archives';
      
      const currentList = prev[collectionKey] || [];
      const existsIndex = currentList.findIndex(item => item.id === stamped.id);

      if (existsIndex >= 0) {
        const updated = [...currentList];
        updated[existsIndex] = stamped;
        return { ...prev, [collectionKey]: updated };
      } else {
        return { ...prev, [collectionKey]: [stamped, ...currentList] };
      }
    });
  };

  // CSV 내보내기 완료 기록: 내보낸 항목에 exportedAt을 찍어 다음 '신규만' 내보내기에서 제외한다.
  const handleCsvExported = (type, ids) => {
    const idSet = new Set(ids);
    const now = Date.now();
    setData(prev => {
      const collectionKey = type === 'Project' ? 'projects' :
                            type === 'Area' ? 'areas' :
                            type === 'Resource' ? 'resources' : 'archives';
      return {
        ...prev,
        [collectionKey]: (prev[collectionKey] || []).map(item =>
          idSet.has(item.id) ? { ...item, exportedAt: now } : item
        )
      };
    });
  };

  const handleDeleteItem = (collectionKey, id) => {
    setData(prev => ({
      ...prev,
      [collectionKey]: prev[collectionKey].filter(item => item.id !== id)
    }));
  };

  // Open detail / edit modal
  const handleOpenDetail = (item, type) => {
    setItemModalState({
      isOpen: true,
      type,
      item,
      isNew: false
    });
  };

  const handleOpenNew = (type) => {
    setItemModalState({
      isOpen: true,
      type,
      item: null,
      isNew: true
    });
  };

  // Add preset pack to user data
  const handleAddPresetToData = (pack) => {
    const timestamp = Date.now();
    if (pack.type === 'Project') {
      const newProj = {
        ...pack.data,
        id: `proj-preset-${timestamp}`,
        areaId: data.areas[0]?.id || 'area-1',
        updatedAt: timestamp
      };
      setData(prev => ({
        ...prev,
        projects: [newProj, ...prev.projects]
      }));
    } else if (pack.type === 'Resource') {
      const newRes = {
        ...pack.data,
        id: `res-preset-${timestamp}`,
        updatedAt: timestamp
      };
      setData(prev => ({
        ...prev,
        resources: [newRes, ...prev.resources]
      }));
    } else if (pack.type === 'Archive') {
      const newArch = {
        ...pack.data,
        id: `arch-preset-${timestamp}`,
        updatedAt: timestamp
      };
      setData(prev => ({
        ...prev,
        archives: [newArch, ...prev.archives]
      }));
    }
  };

  // Export & Import & Reset
  const BACKUP_SCHEMA_VERSION = 2;

  const handleExportData = () => {
    // 데이터 + 설정(노션 링크·테마)을 함께 백업한다.
    const payload = {
      app: 'ministry-second-brain',
      schemaVersion: BACKUP_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      settings: {
        notionUrl: userNotionUrl || '',
        theme
      },
      data
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ministry_second_brain_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (imported) => {
    // 1) 새 형식({ data, settings })과 2) 예전 형식(평면 데이터) 둘 다 지원
    const payload = imported && imported.data ? imported : { data: imported, settings: null };
    const nextData = payload.data;

    if (!nextData || !nextData.projects || !nextData.areas || !nextData.resources || !nextData.archives) {
      alert('올바른 사역 세컨드 브레인 백업 파일 형식이 아닙니다.');
      return;
    }

    if (!confirm('현재 데이터를 백업 파일로 덮어씁니다. 계속할까요?')) return;

    setData(migrateData(nextData));

    const settings = payload.settings;
    if (settings) {
      if (typeof settings.notionUrl === 'string' && settings.notionUrl) {
        handleSaveNotionUrl(settings.notionUrl);
      }
      if (settings.theme === 'light' || settings.theme === 'dark') {
        setTheme(settings.theme);
      }
    }

    alert('사역 데이터와 설정이 복원되었습니다.');
  };

  const handleResetData = () => {
    if (confirm('기본 실전 예시 사역 데이터로 복원하시겠습니까? (현재 변경사항이 덮어씌워집니다)')) {
      setData(INITIAL_DATA);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Start with clean slate for new users
  const handleStartWithCleanData = () => {
    setData({
      projects: [],
      areas: INITIAL_DATA.areas.map(a => ({ ...a, activeProjectsCount: 0, resourcesCount: 0 })),
      resources: [],
      archives: []
    });
    localStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
  };

  const handleStartWithSampleData = () => {
    setData(INITIAL_DATA);
    localStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
  };

  // Save custom Notion URL
  const handleSaveNotionUrl = (url) => {
    setUserNotionUrl(url);
    if (url) {
      localStorage.setItem(USER_NOTION_URL_KEY, url);
    } else {
      localStorage.removeItem(USER_NOTION_URL_KEY);
    }
  };

  const handleCloseOnboarding = () => {
    localStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    setOnboardingOpen(false);
  };

  const assistantRef = React.useRef(null);
  const scrollToAssistant = () => {
    setActiveTab('dashboard');
    setTimeout(() => {
      assistantRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="app-container">
      {/* Interactive 3D Ambient Wave & Constellation Background */}
      <Ambient3DBackground theme={theme} />

      {/* Top Header */}
      <Header
        theme={theme}
        setTheme={setTheme}
        userNotionUrl={userNotionUrl}
        data={data}
        onOpenSetUrlModal={() => setUrlModalOpen(true)}
        onOpenOnboarding={() => setOnboardingOpen(true)}
        onOpenPresetModal={() => setPresetModalOpen(true)}
        onOpenGuide={() => setActiveTab('guide')}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
        csvOnlyNew={csvOnlyNew}
        onCsvModeChange={setCsvOnlyNew}
        onCsvExported={handleCsvExported}
      />

      <main className="main-content">
        {/* Notion Connection Guide Banner */}
        <NotionBanner
          userNotionUrl={userNotionUrl}
          onOpenSetUrlModal={() => setUrlModalOpen(true)}
          onOpenAssistant={scrollToAssistant}
          onOpenPresetModal={() => setPresetModalOpen(true)}
        />

        {/* Categorized Modern Navigation Bar - Fits at a Glance Without Horizontal Scroll */}
        <nav className="tab-navigation-bar">
          <div className="tab-nav-left-cluster">
            {/* 1. Dashboard / Home */}
            <button
              onClick={() => { setActiveTab('dashboard'); setParaMenuOpen(false); }}
              className={`nav-tab-btn dashboard ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={15} />
              <span>대시보드</span>
            </button>

            <div className="tab-nav-divider" />

            {/* 2. Notice Writer */}
            <button
              onClick={() => { setActiveTab('notice-writer'); setParaMenuOpen(false); }}
              className={`nav-tab-btn notice-tab ${activeTab === 'notice-writer' ? 'active' : ''}`}
            >
              <MessageSquareText size={15} />
              <span>공지문 작성기</span>
              <span className="nav-tag-badge hot">NEW</span>
            </button>

            {/* 3. Event Manager */}
            <button
              onClick={() => { setActiveTab('events'); setParaMenuOpen(false); }}
              className={`nav-tab-btn event-tab ${activeTab === 'events' ? 'active' : ''}`}
            >
              <CalendarDays size={15} />
              <span>행사 관리</span>
              <span className="nav-tag-badge hot">NEW</span>
            </button>

            <div className="tab-nav-divider" />

            {/* 4. Second Brain (PARA) Dropdown Hub */}
            <div className="para-dropdown-wrap" ref={paraMenuRef}>
              <button
                onClick={() => setParaMenuOpen(!paraMenuOpen)}
                className={`nav-tab-btn para-main-btn ${isParaActive ? 'active' : ''}`}
                title="프로젝트, 책임 영역, 지식 창고, 보관함 (PARA) 메뉴 열기"
              >
                {activeParaItem ? (
                  <span className={`tab-badge-letter ${activeParaItem.badgeClass}`}>
                    {activeParaItem.letter}
                  </span>
                ) : (
                  <Layers size={15} />
                )}
                <span>Second Brain</span>
                {activeParaItem && <span className="active-para-label">({activeParaItem.label})</span>}
                <ChevronDown size={13} className={`chevron-arrow ${paraMenuOpen ? 'open' : ''}`} />
              </button>

              {paraMenuOpen && (
                <div className="para-dropdown-menu fade-in">
                  <div className="para-dropdown-header">
                    <span className="para-dropdown-tag">PARA 지식 관리</span>
                    <p>목회 과제와 지식 데이터베이스</p>
                  </div>

                  <button
                    onClick={() => { setActiveTab('projects'); setParaMenuOpen(false); }}
                    className={`para-menu-item ${activeTab === 'projects' ? 'selected' : ''}`}
                  >
                    <span className="item-letter p">P</span>
                    <div className="item-text">
                      <strong>Projects (사역 프로젝트)</strong>
                      <small>사역 일정, 수련회 WBS 태스크 ({data.projects.length}개)</small>
                    </div>
                    {activeTab === 'projects' && <Check size={14} className="check-icon" />}
                  </button>

                  <button
                    onClick={() => { setActiveTab('areas'); setParaMenuOpen(false); }}
                    className={`para-menu-item ${activeTab === 'areas' ? 'selected' : ''}`}
                  >
                    <span className="item-letter a">A</span>
                    <div className="item-text">
                      <strong>Areas (책임 영역)</strong>
                      <small>예배·교육·행정 5대 사역 균형 ({data.areas.length}개)</small>
                    </div>
                    {activeTab === 'areas' && <Check size={14} className="check-icon" />}
                  </button>

                  <button
                    onClick={() => { setActiveTab('resources'); setParaMenuOpen(false); }}
                    className={`para-menu-item ${activeTab === 'resources' ? 'selected' : ''}`}
                  >
                    <span className="item-letter r">R</span>
                    <div className="item-text">
                      <strong>Resources (지식 창고)</strong>
                      <small>설교 자료, 공과 교재, 행정 서식 ({data.resources.length}개)</small>
                    </div>
                    {activeTab === 'resources' && <Check size={14} className="check-icon" />}
                  </button>

                  <button
                    onClick={() => { setActiveTab('archives'); setParaMenuOpen(false); }}
                    className={`para-menu-item ${activeTab === 'archives' ? 'selected' : ''}`}
                  >
                    <span className="item-letter arch">A</span>
                    <div className="item-text">
                      <strong>Archives (완료 보관함)</strong>
                      <small>완료된 사역 기록 및 지난 자료 ({data.archives.length}개)</small>
                    </div>
                    {activeTab === 'archives' && <Check size={14} className="check-icon" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="tab-nav-right-cluster">
            {/* 5. Guide */}
            <button
              onClick={() => { setActiveTab('guide'); setParaMenuOpen(false); }}
              className={`nav-tab-btn guide-nav-tab ${activeTab === 'guide' ? 'active' : ''}`}
            >
              <BookOpen size={15} />
              <span>활용 가이드</span>
            </button>
          </div>
        </nav>

        {/* PARA Sub-navigation Header when browsing PARA components */}
        {['projects', 'areas', 'resources', 'archives'].includes(activeTab) && (
          <div className="para-subnav-banner fade-in">
            <div className="para-subnav-left">
              <span className="para-subnav-title">Second Brain (PARA) 지식 관리 시스템</span>
              <span className="para-subnav-desc">목회 사역과 지식을 4단계(Projects, Areas, Resources, Archives)로 정리합니다.</span>
            </div>
            <div className="para-subnav-pills">
              <button
                onClick={() => setActiveTab('projects')}
                className={`para-pill ${activeTab === 'projects' ? 'active p-active' : ''}`}
              >
                <span className="tab-badge-letter p-badge">P</span>
                <span>Projects ({data.projects.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('areas')}
                className={`para-pill ${activeTab === 'areas' ? 'active a-active' : ''}`}
              >
                <span className="tab-badge-letter a-badge">A</span>
                <span>Areas ({data.areas.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`para-pill ${activeTab === 'resources' ? 'active r-active' : ''}`}
              >
                <span className="tab-badge-letter r-badge">R</span>
                <span>Resources ({data.resources.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('archives')}
                className={`para-pill ${activeTab === 'archives' ? 'active arch-active' : ''}`}
              >
                <span className="tab-badge-letter arch-badge">A</span>
                <span>Archives ({data.archives.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab: Dashboard Command Center */}
        {activeTab === 'dashboard' && (
          <DashboardHome
            data={data}
            events={events}
            onNavigateTab={setActiveTab}
            onOpenNew={handleOpenNew}
            onOpenDetail={handleOpenDetail}
            onToggleWbs={handleToggleWbs}
            onOpenPresetModal={() => setPresetModalOpen(true)}
            onSaveItem={handleSaveItem}
            assistantRef={assistantRef}
          />
        )}

        {/* Tab: Projects Only */}
        {activeTab === 'projects' && (
          <div className="fade-in">
            <ProjectSection
              projects={data.projects}
              areas={data.areas}
              onAddProject={() => handleOpenNew('Project')}
              onUpdateProject={(p) => handleSaveItem('Project', p)}
              onDeleteProject={(id) => handleDeleteItem('projects', id)}
              onToggleWbs={handleToggleWbs}
              onOpenDetail={handleOpenDetail}
              csvOnlyNew={csvOnlyNew}
              onCsvExported={handleCsvExported}
            />
          </div>
        )}

        {/* Tab: Areas Only */}
        {activeTab === 'areas' && (
          <div className="fade-in">
            <AreaSection
              areas={data.areas}
              projects={data.projects}
              resources={data.resources}
              onOpenDetail={handleOpenDetail}
            />
          </div>
        )}

        {/* Tab: Resources Only */}
        {activeTab === 'resources' && (
          <div className="fade-in">
            <ResourceSection
              resources={data.resources}
              onAddResource={() => handleOpenNew('Resource')}
              onDeleteResource={(id) => handleDeleteItem('resources', id)}
              onOpenDetail={handleOpenDetail}
              csvOnlyNew={csvOnlyNew}
              onCsvExported={handleCsvExported}
            />
          </div>
        )}

        {/* Tab: Archives Only */}
        {activeTab === 'archives' && (
          <div className="fade-in">
            <ArchiveSection
              archives={data.archives}
              areas={data.areas}
              onAddArchive={() => handleOpenNew('Archive')}
              onDeleteArchive={(id) => handleDeleteItem('archives', id)}
              onOpenDetail={handleOpenDetail}
            />
          </div>
        )}

        {/* Tab: Notice Writer */}
        {activeTab === 'notice-writer' && (
          <div className="fade-in">
            <NoticeWriterSection
              onSaveToResource={(resItem) => handleSaveItem('Resource', resItem)}
            />
          </div>
        )}

        {/* Tab: Event Manager */}
        {activeTab === 'events' && (
          <div className="fade-in">
            <EventManagerSection
              events={events}
              setEvents={setEvents}
            />
          </div>
        )}

        {/* Tab: Guide Page */}
        {activeTab === 'guide' && (
          <div className="fade-in">
            <UserGuidePage
              onNavigateTab={setActiveTab}
              onOpenSetUrlModal={() => setUrlModalOpen(true)}
              onOpenPresetModal={() => setPresetModalOpen(true)}
              userNotionUrl={userNotionUrl}
            />
          </div>
        )}
      </main>

      {/* Item Detail/Edit Modal */}
      <ItemModal
        isOpen={itemModalState.isOpen}
        onClose={() => setItemModalState(prev => ({ ...prev, isOpen: false }))}
        type={itemModalState.type}
        item={itemModalState.item}
        isNew={itemModalState.isNew}
        areas={data.areas}
        onSave={handleSaveItem}
      />

      {/* Preset Library Modal */}
      <PresetLibraryModal
        isOpen={presetModalOpen}
        onClose={() => setPresetModalOpen(false)}
        onAddPresetToData={handleAddPresetToData}
      />

      {/* Buyer Welcome Onboarding Modal */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={handleCloseOnboarding}
        currentNotionUrl={userNotionUrl}
        onSaveNotionUrl={handleSaveNotionUrl}
        onStartWithCleanData={handleStartWithCleanData}
        onStartWithSampleData={handleStartWithSampleData}
      />

      {/* Notion Quick Guide Modal */}
      <NotionGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />

      {/* Set User Personalized Notion URL Modal */}
      <SetNotionUrlModal
        isOpen={urlModalOpen}
        onClose={() => setUrlModalOpen(false)}
        currentUrl={userNotionUrl}
        onSaveUrl={handleSaveNotionUrl}
      />

      {/* Footer */}
      <footer className="footer-wrap">
        <p className="footer-text">
          Ministry Second Brain (PARA) Official Companion Studio &copy; 2026. 사역의 모든 순간에 하나님의 지혜와 은혜가 함께하길 축복합니다.
        </p>
      </footer>
    </div>
  );
}
