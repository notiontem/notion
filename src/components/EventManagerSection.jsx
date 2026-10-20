import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Plus,
  Users,
  Copy,
  Trash2,
  MoreVertical,
  Clock,
  MapPin,
  Settings,
  Search,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  UserPlus,
  Send,
  Sparkles,
  Phone,
  ShieldAlert,
  ShieldCheck,
  ClipboardCheck,
  FileSpreadsheet,
  ChevronRight,
  CheckSquare,
  Square,
  X,
  Edit2
} from 'lucide-react';
import {
  DEFAULT_EVENTS,
  EVENT_TEMPLATES,
  APPLICATION_STATUS_CONFIG,
  EVENT_STATUS_CONFIG
} from '../data/defaultEvents';

const EVENTS_STORAGE_KEY = 'ministry_second_brain_events_v2';

export default function EventManagerSection({ events: propEvents, setEvents: propSetEvents }) {
  const [internalEvents, setInternalEvents] = useState(() => {
    try {
      const saved = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse events from storage:', e);
    }
    return DEFAULT_EVENTS;
  });

  const events = propEvents || internalEvents;
  const setEvents = propSetEvents || setInternalEvents;

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'templates'
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Modals
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [appsModalEvent, setAppsModalEvent] = useState(null);
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');
  const [selectedAppIds, setSelectedAppIds] = useState(new Set());

  // New Applicant Modal
  const [newAppModalOpen, setNewAppModalOpen] = useState(false);
  const [newAppForm, setNewAppForm] = useState({
    student_name: '',
    grade: '',
    department: '',
    birth_date: '',
    gender: 'male',
    parent_name: '',
    parent_phone: '',
    emergency_phone: '',
    health_notes: '',
    allergies: '',
    payment_status: 'deposited',
    status: 'confirmed'
  });

  // Toast & File Input Ref
  const [toast, setToast] = useState({ visible: false, message: '' });
  const csvFileInputRef = useRef(null);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  // Keep modal event synced when events change
  useEffect(() => {
    if (appsModalEvent) {
      const found = events.find(e => e.id === appsModalEvent.id);
      if (found) setAppsModalEvent(found);
    }
  }, [events]);

  // Calculations
  const totalEvents = events.length;
  const openEvents = events.filter(e => e.status === 'open').length;
  const totalApplicants = events.reduce((sum, e) => sum + (e.applications?.length || 0), 0);
  const checkedInCount = events.reduce((sum, e) => {
    return sum + (e.applications?.filter(a => a.check_in_status === 'checked_in').length || 0);
  }, 0);

  // Copy Kakao Invitation
  const handleCopyKakaoInvite = (event) => {
    const dateStr = event.start_date
      ? new Date(event.start_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }) +
        (event.end_date && event.end_date !== event.start_date
          ? ' ~ ' + new Date(event.end_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
          : '')
      : '추후 공지';

    const deadlineStr = event.deadline
      ? new Date(event.deadline).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) + '까지'
      : '';

    const lines = [];
    lines.push(`💌 우리 아이들과 함께하는`);
    lines.push(`   [${event.title}]에 초대합니다!`);
    lines.push('');
    lines.push(`📅 일시: ${dateStr}`);
    if (event.location) lines.push(`📍 장소: ${event.location}`);
    if (deadlineStr) lines.push(`⏰ 마감: ${deadlineStr}`);
    if (event.capacity) lines.push(`👥 정원: 선착순 ${event.capacity}명`);
    if (event.description) {
      lines.push('');
      lines.push(event.description);
    }
    if (event.contact_info) {
      lines.push('');
      lines.push(`📞 문의: ${event.contact_info}`);
    }
    lines.push('');
    lines.push('선생님들이 기도하며 기다리고 있습니다 😊');
    lines.push('참석을 희망하시는 가정은 아래 연락처 또는 신청서를 제출해주세요!');

    navigator.clipboard.writeText(lines.join('\n'));
    setMenuOpenId(null);
    showToast('카카오톡 초대 문구가 클립보드에 복사되었습니다.');
  };

  // Clone Event
  const handleCloneEvent = (event) => {
    const cloned = {
      ...event,
      id: `event-${Date.now()}`,
      title: `${event.title} (복제본)`,
      status: 'draft',
      applications: [],
      created_at: new Date().toISOString()
    };
    setEvents([cloned, ...events]);
    setMenuOpenId(null);
    showToast('행사가 복제되었습니다.');
  };

  // Delete Event
  const handleDeleteEvent = (id) => {
    if (!window.confirm('이 행사를 삭제하시겠습니까? 등록된 모든 신청자 정보도 함께 삭제됩니다.')) return;
    setEvents(events.filter(e => e.id !== id));
    if (appsModalEvent?.id === id) setAppsModalEvent(null);
    setMenuOpenId(null);
    showToast('행사가 삭제되었습니다.');
  };

  // Save Event (Create or Edit)
  const handleSaveEvent = (e) => {
    e.preventDefault();
    const form = e.target;
    const title = form.title.value.trim();
    if (!title) {
      alert('행사명을 입력해주세요.');
      return;
    }

    const newEventData = {
      title,
      description: form.description.value,
      location: form.location.value,
      start_date: form.start_date.value || null,
      end_date: form.end_date.value || null,
      deadline: form.deadline.value || null,
      capacity: form.capacity.value ? parseInt(form.capacity.value, 10) : null,
      status: form.status.value,
      contact_info: form.contact_info.value,
      is_template: false,
      link_token: editingEvent?.link_token || `event-${Date.now()}`,
      custom_fields: editingEvent?.custom_fields || []
    };

    if (editingEvent) {
      setEvents(events.map(ev => ev.id === editingEvent.id ? { ...ev, ...newEventData } : ev));
      showToast('행사 정보가 수정되었습니다.');
    } else {
      const created = {
        id: `event-${Date.now()}`,
        ...newEventData,
        applications: [],
        created_at: new Date().toISOString()
      };
      setEvents([created, ...events]);
      showToast('새 행사가 개설되었습니다.');
    }

    setEventModalOpen(false);
    setEditingEvent(null);
  };

  // Create Event from Template
  const handleCreateFromTemplate = (tpl) => {
    const newEv = {
      id: `event-${Date.now()}`,
      title: tpl.title.replace('[템플릿] ', ''),
      description: tpl.description,
      location: tpl.location,
      start_date: '',
      end_date: '',
      deadline: '',
      capacity: tpl.capacity,
      status: 'draft',
      is_template: false,
      link_token: `event-${Date.now()}`,
      contact_info: tpl.contact_info,
      custom_fields: tpl.custom_fields || [],
      applications: [],
      created_at: new Date().toISOString()
    };
    setEvents([newEv, ...events]);
    setActiveTab('list');
    showToast(`'${newEv.title}' 행사가 생성되었습니다. 상세 일정을 등록해보세요!`);
  };

  // Applicant Operations
  const handleToggleCheckin = (eventId, appId) => {
    setEvents(events.map(ev => {
      if (ev.id !== eventId) return ev;
      return {
        ...ev,
        applications: (ev.applications || []).map(a => {
          if (a.id !== appId) return a;
          const isCurrentlyChecked = a.check_in_status === 'checked_in';
          return {
            ...a,
            check_in_status: isCurrentlyChecked ? 'not_checked_in' : 'checked_in',
            check_in_at: isCurrentlyChecked ? null : new Date().toISOString()
          };
        })
      };
    }));
  };

  const handleUpdateAppStatus = (eventId, appId, newStatus) => {
    setEvents(events.map(ev => {
      if (ev.id !== eventId) return ev;
      return {
        ...ev,
        applications: (ev.applications || []).map(a => a.id === appId ? { ...a, status: newStatus } : a)
      };
    }));
    showToast('신청자 상태가 변경되었습니다.');
  };

  const handleDeleteApplicant = (eventId, appId) => {
    if (!window.confirm('이 신청자를 명단에서 삭제하시겠습니까?')) return;
    setEvents(events.map(ev => {
      if (ev.id !== eventId) return ev;
      return {
        ...ev,
        applications: (ev.applications || []).filter(a => a.id !== appId)
      };
    }));
    showToast('신청자가 삭제되었습니다.');
  };

  // Batch Status Update
  const handleBatchStatus = (eventId, newStatus) => {
    if (selectedAppIds.size === 0) {
      alert('일괄 변경할 신청자를 먼저 선택해주세요.');
      return;
    }
    setEvents(events.map(ev => {
      if (ev.id !== eventId) return ev;
      return {
        ...ev,
        applications: (ev.applications || []).map(a => {
          if (selectedAppIds.has(a.id)) {
            return { ...a, status: newStatus };
          }
          return a;
        })
      };
    }));
    setSelectedAppIds(new Set());
    showToast(`선택한 신청자들의 상태가 [${APPLICATION_STATUS_CONFIG[newStatus]?.label || newStatus}]로 변경되었습니다.`);
  };

  // Add Manual Applicant
  const handleAddApplicantSubmit = (e) => {
    e.preventDefault();
    if (!appsModalEvent) return;
    if (!newAppForm.student_name.trim()) {
      alert('학생 이름을 입력해주세요.');
      return;
    }

    const newApp = {
      id: `app-${Date.now()}`,
      ...newAppForm,
      privacy_consent: true,
      photo_consent: true,
      check_in_status: 'not_checked_in',
      check_in_at: null,
      custom_responses: {},
      created_at: new Date().toISOString()
    };

    setEvents(events.map(ev => {
      if (ev.id !== appsModalEvent.id) return ev;
      return {
        ...ev,
        applications: [newApp, ...(ev.applications || [])]
      };
    }));

    setNewAppModalOpen(false);
    setNewAppForm({
      student_name: '',
      grade: '',
      department: '',
      birth_date: '',
      gender: 'male',
      parent_name: '',
      parent_phone: '',
      emergency_phone: '',
      health_notes: '',
      allergies: '',
      payment_status: 'deposited',
      status: 'confirmed'
    });
    showToast('신청자가 명단에 등록되었습니다.');
  };

  // Copy Notion-Formatted Event Report (클립보드 복사 후 노션에 Ctrl+V)
  const handleCopyNotionReport = (event) => {
    const apps = event.applications || [];
    const totalApps = apps.length;
    const checkedIn = apps.filter(a => a.check_in_status === 'checked_in').length;
    const notCheckedIn = totalApps - checkedIn;
    const rate = totalApps > 0 ? Math.round((checkedIn / totalApps) * 100) : 0;
    const deposited = apps.filter(a => a.payment_status === 'deposited').length;
    const waiting = totalApps - deposited;
    const allergiesList = apps.filter(a => a.allergies && a.allergies !== '없음');

    const dateStr = event.start_date
      ? new Date(event.start_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }) +
        (event.end_date && event.end_date !== event.start_date
          ? ' ~ ' + new Date(event.end_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
          : '')
      : '일정 미정';

    const lines = [];
    lines.push(`# 🎪 [행사 결과 보고] ${event.title}`);
    lines.push(`> 📅 **일시:** ${dateStr} | 📍 **장소:** ${event.location || '미정'}`);
    lines.push(`> 📊 **참석 현황:** 참석률 **${rate}%** (총 ${totalApps}명 중 **${checkedIn}명 출석** / ${notCheckedIn}명 미출석)`);
    lines.push(`> 💳 **회비 납부:** 입금완료 ${deposited}명 / 미납·입금대기 ${waiting}명`);
    if (event.contact_info) lines.push(`> 📞 **행사 담당 문의:** ${event.contact_info}`);
    lines.push('');

    if (allergiesList.length > 0) {
      lines.push(`### ⚠️ 건강 주의 및 알레르기 관리 대상 (${allergiesList.length}명)`);
      allergiesList.forEach(a => {
        lines.push(`- **${a.student_name}** (${a.department || ''} ${a.grade || ''}) : 🚨 ${a.allergies}${a.health_notes ? ` | 특이사항: ${a.health_notes}` : ''} (보호자: ${a.parent_name || ''} ${a.parent_phone || ''})`);
      });
      lines.push('');
    }

    lines.push('### 📋 참가 신청자 전체 출석 및 납부 명단');
    lines.push('| 번호 | 학생명 | 성별 | 학년/부서 | 출석 여부 | 회비 상태 | 보호자 연락처 |');
    lines.push('| :---: | :---: | :---: | :---: | :---: | :---: | :---: |');
    apps.forEach((a, idx) => {
      const isAttended = a.check_in_status === 'checked_in' ? '✅ 출석' : '⏳ 미출석';
      const pay = a.payment_status === 'deposited' ? '입금완료' : '입금대기';
      const gender = a.gender === 'female' ? '여' : '남';
      const deptGrade = [a.department, a.grade].filter(Boolean).join(' ') || '-';
      lines.push(`| ${idx + 1} | **${a.student_name}** | ${gender} | ${deptGrade} | ${isAttended} | ${pay} | ${a.parent_phone || '-'} |`);
    });
    lines.push('');
    lines.push(`*생성 일시: ${new Date().toLocaleString('ko-KR')} | Ministry Second Brain*`);

    navigator.clipboard.writeText(lines.join('\n'));
    setMenuOpenId(null);
    showToast(`'${event.title}' 노션 행사 보고서가 복사되었습니다! 노션에 Ctrl+V 하세요.`);
  };

  // CSV Applicant Parser (Google Forms, Tally, Excel 호환)
  const parseApplicantCsv = (csvText) => {
    const clean = csvText.replace(/^\uFEFF/, '').trim();
    if (!clean) return [];

    const parseLine = (line) => {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const rawLines = clean.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (rawLines.length < 2) return [];

    const headers = parseLine(rawLines[0]).map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

    const findCol = (...keywords) => {
      return headers.findIndex(h => keywords.some(k => h.includes(k)));
    };

    const colName = findCol('학생', '이름', '성명', '참가자', 'name');
    const colGender = findCol('성별', 'gender', '남/여');
    const colGrade = findCol('학년', 'grade', '연령', '나이');
    const colDept = findCol('부서', '반', '소속', 'department');
    const colBirth = findCol('생년', '생일', 'birth');
    const colParentName = findCol('학부모', '보호자', '부모', 'parent');
    const colPhone = findCol('연락처', '전화', '핸드폰', '휴대폰', 'phone');
    const colEmergency = findCol('비상', '긴급', 'emergency');
    const colAllergies = findCol('알레르기', '알러지', 'allergy');
    const colHealth = findCol('건강', '지병', '특이사항', '메모', 'health');

    const applicants = [];
    for (let i = 1; i < rawLines.length; i++) {
      const cols = parseLine(rawLines[i]);
      const studentName = colName !== -1 ? cols[colName] : cols[0];
      if (!studentName || studentName.trim() === '') continue;

      const rawGender = colGender !== -1 ? (cols[colGender] || '') : '';
      const isFemale = rawGender.includes('여') || rawGender.toLowerCase().includes('female');

      applicants.push({
        id: `app-csv-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        student_name: studentName.replace(/^["']|["']$/g, ''),
        gender: isFemale ? 'female' : 'male',
        grade: colGrade !== -1 ? (cols[colGrade]?.replace(/^["']|["']$/g, '') || '') : '',
        department: colDept !== -1 ? (cols[colDept]?.replace(/^["']|["']$/g, '') || '') : '',
        birth_date: colBirth !== -1 ? (cols[colBirth]?.replace(/^["']|["']$/g, '') || '') : '',
        parent_name: colParentName !== -1 ? (cols[colParentName]?.replace(/^["']|["']$/g, '') || '') : '',
        parent_phone: colPhone !== -1 ? (cols[colPhone]?.replace(/^["']|["']$/g, '') || '') : '',
        emergency_phone: colEmergency !== -1 ? (cols[colEmergency]?.replace(/^["']|["']$/g, '') || '') : '',
        allergies: colAllergies !== -1 ? (cols[colAllergies]?.replace(/^["']|["']$/g, '') || '') : '',
        health_notes: colHealth !== -1 ? (cols[colHealth]?.replace(/^["']|["']$/g, '') || '') : '',
        privacy_consent: true,
        photo_consent: true,
        payment_status: 'deposited',
        status: 'confirmed',
        check_in_status: 'not_checked_in',
        check_in_at: null,
        custom_responses: {},
        created_at: new Date().toISOString()
      });
    }

    return applicants;
  };

  // CSV File Upload Handler
  const handleCsvFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !appsModalEvent) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseApplicantCsv(text);
        if (parsed.length === 0) {
          alert('CSV 파일에서 유효한 신청자 명단을 찾을 수 없습니다. 열 이름(이름, 연락처, 학년 등)을 확인해주세요.');
          return;
        }

        setEvents(events.map(ev => {
          if (ev.id !== appsModalEvent.id) return ev;
          return {
            ...ev,
            applications: [...parsed, ...(ev.applications || [])]
          };
        }));
        showToast(`🎉 ${parsed.length}명의 신청자 명단을 성공적으로 불러왔습니다!`);
      } catch (err) {
        console.error(err);
        alert('CSV 파일을 분석하는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  // Export Applicants to CSV (Notion DB 호환 포맷 + UTF-8 BOM)
  const handleExportCSV = (event) => {
    const apps = event.applications || [];
    if (apps.length === 0) {
      alert('내보낼 신청자 데이터가 없습니다.');
      return;
    }

    const headers = [
      '학생명', '성별', '학년', '부서', '생년월일',
      '학부모명', '학부모연락처', '비상연락망', '건강메모', '알레르기',
      '결제상태', '신청상태', '출석체크', '출석시간', '신청일시'
    ];

    const rows = apps.map(a => [
      `"${(a.student_name || '').replace(/"/g, '""')}"`,
      `"${a.gender === 'female' ? '여' : '남'}"`,
      `"${(a.grade || '').replace(/"/g, '""')}"`,
      `"${(a.department || '').replace(/"/g, '""')}"`,
      `"${(a.birth_date || '').replace(/"/g, '""')}"`,
      `"${(a.parent_name || '').replace(/"/g, '""')}"`,
      `"${(a.parent_phone || '').replace(/"/g, '""')}"`,
      `"${(a.emergency_phone || '').replace(/"/g, '""')}"`,
      `"${(a.health_notes || '').replace(/"/g, '""')}"`,
      `"${(a.allergies || '').replace(/"/g, '""')}"`,
      `"${a.payment_status === 'deposited' ? '입금완료' : '입금대기'}"`,
      `"${APPLICATION_STATUS_CONFIG[a.status]?.label || a.status}"`,
      `"${a.check_in_status === 'checked_in' ? '출석' : '미출석'}"`,
      `"${a.check_in_at ? new Date(a.check_in_at).toLocaleString('ko-KR') : ''}"`,
      `"${a.created_at ? new Date(a.created_at).toLocaleDateString('ko-KR') : ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title}_신청자명단_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('노션 DB 호환 엑셀(CSV) 다운로드가 완료되었습니다.');
  };

  return (
    <div className="event-manager-container fade-in">
      {/* Toast Notification */}
      {toast.visible && (
        <div className="custom-toast-notification">
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Hero Banner */}
      <div className="event-hero-card">
        <div className="event-hero-left">
          <div className="event-tag">
            <Calendar size={14} />
            <span>교회학교 행사 운영 시스템</span>
          </div>
          <h2>행사 관리 & 참가자 접수</h2>
          <p>
            성경학교, 수련회, 캠프, 세미나를 한눈에 관리하고 학부모 초대 메시지 전송과 현장 체크인까지 간편하게 진행하세요.
          </p>
        </div>

        <div className="event-hero-stats">
          <div className="event-stat-box">
            <span className="stat-label">진행 중 행사</span>
            <span className="stat-val">{openEvents} / {totalEvents}</span>
          </div>
          <div className="event-stat-box">
            <span className="stat-label">총 신청자 수</span>
            <span className="stat-val primary">{totalApplicants}명</span>
          </div>
          <div className="event-stat-box">
            <span className="stat-label">현장 체크인</span>
            <span className="stat-val accent">{checkedInCount}명</span>
          </div>
        </div>
      </div>

      {/* Privacy & Notion Bridge Reassurance Card */}
      <div className="event-privacy-bridge-card">
        <div className="bridge-icon-wrap">
          <ShieldCheck size={22} className="bridge-shield-icon" />
        </div>
        <div className="bridge-text-wrap">
          <div className="bridge-title-row">
            <h4>개인정보 완벽 보호 로컬 모드 & 노션 템플릿 연동</h4>
            <span className="badge-local-secure">🔒 100% 브라우저 로컬 저장 (서버 전송 없음)</span>
          </div>
          <p>
            등록된 모든 행사와 참가자 개인정보(이름, 연락처, 비상망, 알레르기)는 외부 서버로 전송되지 않고 <strong>담당자의 브라우저(기기)에만 안전하게 보관</strong>됩니다.
            사역 보고나 데이터 보관이 필요할 땐 <strong>[📋 노션 보고서 복사]</strong>와 <strong>[📥 노션 DB 호환 CSV]</strong>로 내 노션 템플릿에 손쉽게 붙여넣으세요!
          </p>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="event-action-bar">
        <div className="event-tab-switch">
          <button
            onClick={() => setActiveTab('list')}
            className={`event-sub-tab ${activeTab === 'list' ? 'active' : ''}`}
          >
            <Calendar size={15} />
            <span>행사 목록 ({events.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`event-sub-tab ${activeTab === 'templates' ? 'active' : ''}`}
          >
            <FileText size={15} />
            <span>행사 템플릿 ({EVENT_TEMPLATES.length})</span>
          </button>
        </div>

        <button
          onClick={() => { setEditingEvent(null); setEventModalOpen(true); }}
          className="btn-create-event"
        >
          <Plus size={15} />
          <span>새 행사 개설</span>
        </button>
      </div>

      {/* Tab 1: Event List View */}
      {activeTab === 'list' && (
        <div className="event-cards-grid">
          {events.length === 0 ? (
            <div className="event-empty-box">
              <Calendar size={48} className="empty-icon" />
              <h3>등록된 행사가 없습니다.</h3>
              <p>우측 상단의 '새 행사 개설' 버튼이나 '행사 템플릿'에서 1초 만에 행사를 만들어보세요.</p>
              <button
                onClick={() => { setEditingEvent(null); setEventModalOpen(true); }}
                className="btn-create-event mt-3"
              >
                <Plus size={15} />
                <span>행사 만들기</span>
              </button>
            </div>
          ) : (
            events.map((event) => {
              const apps = event.applications || [];
              const capacity = event.capacity;
              const fillPercent = capacity ? Math.min(100, Math.round((apps.length / capacity) * 100)) : 0;
              const statusCfg = EVENT_STATUS_CONFIG[event.status] || EVENT_STATUS_CONFIG.draft;

              return (
                <div key={event.id} className="church-event-card">
                  {/* Card Header */}
                  <div className="event-card-head">
                    <div className="event-card-title-wrap">
                      <span className={`event-status-pill ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <h3 className="event-card-title">{event.title}</h3>
                    </div>

                    <div className="event-menu-anchor">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === event.id ? null : event.id)}
                        className="btn-event-menu"
                        title="더보기"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {menuOpenId === event.id && (
                        <div className="event-dropdown-menu">
                          <button onClick={() => handleCopyNotionReport(event)}>
                            <ClipboardCheck size={14} />
                            <span>노션 보고서 복사</span>
                          </button>
                          <button onClick={() => handleCopyKakaoInvite(event)}>
                            <Copy size={14} />
                            <span>카톡 초대문 복사</span>
                          </button>
                          <button onClick={() => { setEditingEvent(event); setEventModalOpen(true); setMenuOpenId(null); }}>
                            <Settings size={14} />
                            <span>행사 정보 수정</span>
                          </button>
                          <button onClick={() => handleCloneEvent(event)}>
                            <Copy size={14} />
                            <span>행사 복제</span>
                          </button>
                          <button onClick={() => handleExportCSV(event)}>
                            <Download size={14} />
                            <span>노션 DB CSV 다운</span>
                          </button>
                          <div className="menu-divider" />
                          <button onClick={() => handleDeleteEvent(event.id)} className="menu-delete">
                            <Trash2 size={14} />
                            <span>행사 삭제</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Description */}
                  {event.description && (
                    <p className="event-card-desc">{event.description}</p>
                  )}

                  {/* Key Metadata Info */}
                  <div className="event-card-meta-list">
                    {event.start_date && (
                      <div className="meta-item">
                        <Calendar size={14} />
                        <span>
                          {new Date(event.start_date).toLocaleDateString('ko-KR')}
                          {event.end_date && event.end_date !== event.start_date && ` ~ ${new Date(event.end_date).toLocaleDateString('ko-KR')}`}
                        </span>
                      </div>
                    )}
                    {event.location && (
                      <div className="meta-item">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.deadline && (
                      <div className="meta-item warning">
                        <Clock size={14} />
                        <span>마감: {new Date(event.deadline).toLocaleDateString('ko-KR')}</span>
                      </div>
                    )}
                  </div>

                  {/* Applicants Progress & Box */}
                  <div
                    onClick={() => setAppsModalEvent(event)}
                    className="event-applicants-box"
                    title="신청자 관리 패널 열기"
                  >
                    <div className="apps-box-header">
                      <div className="apps-box-left">
                        <Users size={15} />
                        <span className="apps-box-label">신청자 현황</span>
                      </div>
                      <span className="apps-box-count">
                        <strong>{apps.length}명</strong>
                        {capacity ? <span className="apps-capacity"> / {capacity}명 정원</span> : ''}
                      </span>
                    </div>

                    {capacity && (
                      <div className="capacity-progress-track">
                        <div
                          className="capacity-progress-fill"
                          style={{
                            width: `${fillPercent}%`,
                            backgroundColor: fillPercent >= 90 ? '#ef4444' : fillPercent >= 60 ? '#f59e0b' : '#10b981'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="event-card-footer">
                    <button
                      onClick={() => handleCopyNotionReport(event)}
                      className="btn-card-notion"
                      title="출석 통계 및 요약 보고서를 노션 마크다운으로 복사"
                    >
                      <ClipboardCheck size={13} />
                      <span>노션 보고서</span>
                    </button>

                    <button
                      onClick={() => handleCopyKakaoInvite(event)}
                      className="btn-card-secondary"
                      title="학부모 카카오톡 초대 메시지 생성 및 복사"
                    >
                      <Send size={13} />
                      <span>카톡 초대</span>
                    </button>

                    <button
                      onClick={() => setAppsModalEvent(event)}
                      className="btn-card-primary"
                    >
                      <Users size={13} />
                      <span>명단 / 체크인 ({apps.length})</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Template Library */}
      {activeTab === 'templates' && (
        <div className="templates-grid">
          {EVENT_TEMPLATES.map((tpl) => (
            <div key={tpl.id} className="event-template-card">
              <div className="template-top">
                <span className="template-badge">공식 템플릿</span>
                <h4>{tpl.title}</h4>
                <p>{tpl.description}</p>
              </div>

              <div className="template-specs">
                <div className="tpl-spec-item">
                  <MapPin size={13} />
                  <span>기본 장소: {tpl.location}</span>
                </div>
                <div className="tpl-spec-item">
                  <Users size={13} />
                  <span>권장 정원: {tpl.capacity}명</span>
                </div>
                <div className="tpl-spec-item">
                  <FileText size={13} />
                  <span>특화 설문: {tpl.custom_fields.map(f => f.label).join(', ')}</span>
                </div>
              </div>

              <button
                onClick={() => handleCreateFromTemplate(tpl)}
                className="btn-use-template"
              >
                <Plus size={14} />
                <span>이 템플릿으로 행사 개설</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Create / Edit Event */}
      {eventModalOpen && (
        <div className="modal-backdrop" onClick={() => setEventModalOpen(false)}>
          <div className="event-modal-window" onClick={e => e.stopPropagation()}>
            <div className="event-modal-header">
              <div className="modal-header-title">
                <Calendar size={18} />
                <h3>{editingEvent ? '행사 정보 수정' : '새 행사 개설'}</h3>
              </div>
              <button onClick={() => setEventModalOpen(false)} className="btn-modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="event-modal-form">
              <div className="form-group">
                <label>행사명 *</label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="예: 2026 유초등부 여름성경학교"
                  defaultValue={editingEvent?.title || ''}
                />
              </div>

              <div className="form-group">
                <label>행사 소개 / 설명</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="행사의 목적, 주제 성구, 주요 프로그램 안내 등"
                  defaultValue={editingEvent?.description || ''}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>시작일</label>
                  <input
                    name="start_date"
                    type="date"
                    defaultValue={editingEvent?.start_date || ''}
                  />
                </div>
                <div className="form-group">
                  <label>종료일</label>
                  <input
                    name="end_date"
                    type="date"
                    defaultValue={editingEvent?.end_date || ''}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>신청 마감일</label>
                  <input
                    name="deadline"
                    type="date"
                    defaultValue={editingEvent?.deadline || ''}
                  />
                </div>
                <div className="form-group">
                  <label>모집 정원 (명)</label>
                  <input
                    name="capacity"
                    type="number"
                    placeholder="미입력 시 무제한"
                    defaultValue={editingEvent?.capacity || ''}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>행사 장소</label>
                  <input
                    name="location"
                    type="text"
                    placeholder="예: 교회 본당 2층, 수양관"
                    defaultValue={editingEvent?.location || ''}
                  />
                </div>
                <div className="form-group">
                  <label>신청 상태</label>
                  <select name="status" defaultValue={editingEvent?.status || 'open'}>
                    <option value="open">신청 접수 중 (공개)</option>
                    <option value="closed">신청 마감</option>
                    <option value="draft">임시저장 (비공개)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>문의 / 담당자 연락처</label>
                <input
                  name="contact_info"
                  type="text"
                  placeholder="예: 초등부 디렉터 김목사 (010-0000-0000)"
                  defaultValue={editingEvent?.contact_info || ''}
                />
              </div>

              <div className="modal-footer-btns">
                <button type="button" onClick={() => setEventModalOpen(false)} className="btn-modal-cancel">
                  취소
                </button>
                <button type="submit" className="btn-modal-submit">
                  {editingEvent ? '수정 내용 저장' : '행사 등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Applications Management & Check-in Panel */}
      {appsModalEvent && (
        <div className="modal-backdrop" onClick={() => setAppsModalEvent(null)}>
          <div className="apps-management-modal" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="apps-modal-header">
              <div className="apps-modal-title-area">
                <div className="title-row">
                  <Users size={20} className="icon-primary" />
                  <h3>{appsModalEvent.title}</h3>
                  <span className="badge-total-apps">
                    신청 {(appsModalEvent.applications || []).length}명
                  </span>
                </div>
                <p className="apps-modal-sub">
                  {appsModalEvent.start_date && `📅 ${appsModalEvent.start_date}`}
                  {appsModalEvent.location && ` | 📍 ${appsModalEvent.location}`}
                </p>
              </div>

              <div className="apps-modal-head-actions">
                <input
                  type="file"
                  ref={csvFileInputRef}
                  onChange={handleCsvFileChange}
                  accept=".csv"
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => csvFileInputRef.current?.click()}
                  className="btn-head-action secondary"
                  title="구글 폼 또는 엑셀에서 내려받은 신청자 CSV 명단 자동 일괄 등록"
                >
                  <Upload size={14} />
                  <span>CSV 명단 가져오기</span>
                </button>
                <button
                  onClick={() => handleCopyNotionReport(appsModalEvent)}
                  className="btn-head-action secondary"
                  title="참석률, 입금현황, 알레르기 요약 보고서를 노션 서식(Callout, Table)으로 복사"
                >
                  <ClipboardCheck size={14} />
                  <span>노션 보고서 복사</span>
                </button>
                <button
                  onClick={() => handleExportCSV(appsModalEvent)}
                  className="btn-head-action"
                  title="노션 DB 호환 엑셀(CSV) 다운로드"
                >
                  <Download size={14} />
                  <span>CSV 내보내기</span>
                </button>
                <button
                  onClick={() => setNewAppModalOpen(true)}
                  className="btn-head-action primary"
                >
                  <UserPlus size={14} />
                  <span>신청자 수기 등록</span>
                </button>
                <button onClick={() => setAppsModalEvent(null)} className="btn-modal-close">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="apps-filter-bar">
              <div className="apps-search-box">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="학생 이름, 학부모, 연락처 검색..."
                  value={appSearch}
                  onChange={e => setAppSearch(e.target.value)}
                />
                {appSearch && (
                  <button onClick={() => setAppSearch('')} className="btn-clear-search">
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="apps-filter-right">
                <select
                  value={appStatusFilter}
                  onChange={e => setAppStatusFilter(e.target.value)}
                  className="apps-status-select"
                >
                  <option value="all">전체 상태</option>
                  <option value="submitted">신청완료</option>
                  <option value="confirmed">참가확정</option>
                  <option value="waiting_deposit">입금대기</option>
                  <option value="deposited">입금완료</option>
                  <option value="cancelled">취소됨</option>
                </select>

                {selectedAppIds.size > 0 && (
                  <div className="batch-action-group">
                    <span className="batch-selected-count">{selectedAppIds.size}명 선택</span>
                    <button
                      onClick={() => handleBatchStatus(appsModalEvent.id, 'confirmed')}
                      className="btn-batch confirm"
                    >
                      일괄 참가확정
                    </button>
                    <button
                      onClick={() => handleBatchStatus(appsModalEvent.id, 'deposited')}
                      className="btn-batch deposit"
                    >
                      일괄 입금완료
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Table Area */}
            <div className="apps-table-container">
              {(() => {
                const list = (appsModalEvent.applications || []).filter(a => {
                  const matchSearch = !appSearch ||
                    a.student_name?.toLowerCase().includes(appSearch.toLowerCase()) ||
                    a.parent_name?.toLowerCase().includes(appSearch.toLowerCase()) ||
                    a.parent_phone?.includes(appSearch);
                  const matchStatus = appStatusFilter === 'all' || a.status === appStatusFilter;
                  return matchSearch && matchStatus;
                });

                if (list.length === 0) {
                  return (
                    <div className="apps-empty-view">
                      <Users size={32} />
                      <p>조건에 일치하는 신청자가 없습니다.</p>
                    </div>
                  );
                }

                const allSelected = list.length > 0 && list.every(a => selectedAppIds.has(a.id));

                return (
                  <table className="apps-custom-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (allSelected) {
                                setSelectedAppIds(new Set());
                              } else {
                                setSelectedAppIds(new Set(list.map(a => a.id)));
                              }
                            }}
                            className="btn-th-checkbox"
                          >
                            {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                          </button>
                        </th>
                        <th>학생 정보</th>
                        <th>소속 / 학년</th>
                        <th>학부모 & 연락처</th>
                        <th>건강 / 알레르기</th>
                        <th>신청 상태</th>
                        <th>현장 체크인</th>
                        <th style={{ width: '60px' }}>삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((a) => {
                        const isChecked = selectedAppIds.has(a.id);
                        const isCheckedIn = a.check_in_status === 'checked_in';
                        const stCfg = APPLICATION_STATUS_CONFIG[a.status] || APPLICATION_STATUS_CONFIG.submitted;

                        return (
                          <tr key={a.id} className={isChecked ? 'row-selected' : ''}>
                            <td>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = new Set(selectedAppIds);
                                  if (next.has(a.id)) next.delete(a.id);
                                  else next.add(a.id);
                                  setSelectedAppIds(next);
                                }}
                                className="btn-td-checkbox"
                              >
                                {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                              </button>
                            </td>

                            {/* Student Info */}
                            <td>
                              <div className="student-cell">
                                <span className="student-name">{a.student_name}</span>
                                <span className="student-sub">
                                  {a.gender === 'female' ? '여' : '남'} · {a.birth_date || '생일 미기재'}
                                </span>
                              </div>
                            </td>

                            {/* Department / Grade */}
                            <td>
                              <div className="dept-cell">
                                <span className="dept-badge">{a.department || '교회학교'}</span>
                                <span className="grade-text">{a.grade}</span>
                              </div>
                            </td>

                            {/* Parent Info */}
                            <td>
                              <div className="parent-cell">
                                <span className="parent-name">{a.parent_name} (보호자)</span>
                                <a href={`tel:${a.parent_phone}`} className="parent-phone">
                                  <Phone size={12} />
                                  <span>{a.parent_phone}</span>
                                </a>
                              </div>
                            </td>

                            {/* Health / Allergies */}
                            <td>
                              <div className="health-cell">
                                {a.allergies ? (
                                  <span className="allergy-tag">
                                    <ShieldAlert size={12} />
                                    <span>{a.allergies}</span>
                                  </span>
                                ) : (
                                  <span className="text-muted-sub">특이사항 없음</span>
                                )}
                                {a.health_notes && (
                                  <span className="health-notes-sub">{a.health_notes}</span>
                                )}
                              </div>
                            </td>

                            {/* Status Change Selector */}
                            <td>
                              <select
                                value={a.status}
                                onChange={e => handleUpdateAppStatus(appsModalEvent.id, a.id, e.target.value)}
                                className={`table-status-select ${stCfg.color}`}
                              >
                                <option value="submitted">신청완료</option>
                                <option value="confirmed">참가확정</option>
                                <option value="waiting_deposit">입금대기</option>
                                <option value="deposited">입금완료</option>
                                <option value="cancelled">취소됨</option>
                              </select>
                            </td>

                            {/* Check-in Toggle */}
                            <td>
                              <button
                                onClick={() => handleToggleCheckin(appsModalEvent.id, a.id)}
                                className={`btn-checkin-toggle ${isCheckedIn ? 'checked' : ''}`}
                                title={isCheckedIn ? `체크인 완료: ${new Date(a.check_in_at).toLocaleTimeString('ko-KR')}` : '클릭 시 현장 출석 체크'}
                              >
                                <CheckCircle2 size={14} />
                                <span>{isCheckedIn ? '출석완료' : '미출석'}</span>
                              </button>
                            </td>

                            {/* Delete Action */}
                            <td>
                              <button
                                onClick={() => handleDeleteApplicant(appsModalEvent.id, a.id)}
                                className="btn-del-app"
                                title="신청자 삭제"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Manual Applicant Add */}
      {newAppModalOpen && (
        <div className="modal-backdrop-sub" onClick={() => setNewAppModalOpen(false)}>
          <div className="new-app-modal-window" onClick={e => e.stopPropagation()}>
            <div className="event-modal-header">
              <div className="modal-header-title">
                <UserPlus size={18} />
                <h3>신청자 수기 추가</h3>
              </div>
              <button onClick={() => setNewAppModalOpen(false)} className="btn-modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddApplicantSubmit} className="event-modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>학생 이름 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 김민준"
                    value={newAppForm.student_name}
                    onChange={e => setNewAppForm({ ...newAppForm, student_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>성별</label>
                  <select
                    value={newAppForm.gender}
                    onChange={e => setNewAppForm({ ...newAppForm, gender: e.target.value })}
                  >
                    <option value="male">남학생</option>
                    <option value="female">여학생</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>학년</label>
                  <input
                    type="text"
                    placeholder="예: 초등 3학년"
                    value={newAppForm.grade}
                    onChange={e => setNewAppForm({ ...newAppForm, grade: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>소속 부서</label>
                  <input
                    type="text"
                    placeholder="예: 초등 1부, 유치부"
                    value={newAppForm.department}
                    onChange={e => setNewAppForm({ ...newAppForm, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>학부모(보호자) 성함</label>
                  <input
                    type="text"
                    placeholder="예: 김철수"
                    value={newAppForm.parent_name}
                    onChange={e => setNewAppForm({ ...newAppForm, parent_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>학부모 연락처</label>
                  <input
                    type="text"
                    placeholder="예: 010-1234-5678"
                    value={newAppForm.parent_phone}
                    onChange={e => setNewAppForm({ ...newAppForm, parent_phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>알레르기 및 건강 주의사항</label>
                <input
                  type="text"
                  placeholder="예: 땅콩 알레르기, 비염약 복용 등"
                  value={newAppForm.allergies}
                  onChange={e => setNewAppForm({ ...newAppForm, allergies: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>신청 상태</label>
                  <select
                    value={newAppForm.status}
                    onChange={e => setNewAppForm({ ...newAppForm, status: e.target.value })}
                  >
                    <option value="confirmed">참가확정</option>
                    <option value="submitted">신청완료</option>
                    <option value="waiting_deposit">입금대기</option>
                    <option value="deposited">입금완료</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>회비 입금 여부</label>
                  <select
                    value={newAppForm.payment_status}
                    onChange={e => setNewAppForm({ ...newAppForm, payment_status: e.target.value })}
                  >
                    <option value="deposited">입금완료</option>
                    <option value="waiting_deposit">입금대기</option>
                    <option value="pending">해당없음/무료</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer-btns">
                <button type="button" onClick={() => setNewAppModalOpen(false)} className="btn-modal-cancel">
                  취소
                </button>
                <button type="submit" className="btn-modal-submit">
                  신청자 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
