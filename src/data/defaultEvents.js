/**
 * 교회학교 및 목회 행사 기본 데이터 및 템플릿
 */

export const DEFAULT_EVENTS = [
  {
    id: 'event-1',
    title: '2026 유초등부 여름성경학교 (Jesus Camp)',
    description: '말씀 안에서 믿음의 뿌리를 내리는 2026 유초등부 여름성경학교에 우리 귀한 자녀들을 초대합니다! 은혜로운 찬양, 말씀 공과, 신나는 물놀이 코너학습이 준비되어 있습니다.',
    location: '교회 본관 대예배실 & 소예배실',
    start_date: '2026-07-24',
    end_date: '2026-07-26',
    deadline: '2026-07-15',
    capacity: 50,
    status: 'open',
    is_template: false,
    link_token: 'vbs-2026-jesus-camp',
    contact_info: '유초등부 디렉터 김목사 (010-1234-5678)',
    custom_fields: [
      { id: 'f_tshirt', label: '단체 티셔츠 사이즈 (130~170)', required: true },
      { id: 'f_pool', label: '물놀이 활동 참여 여부 (예/아니오)', required: true }
    ],
    applications: [
      {
        id: 'app-1',
        student_name: '김하준',
        grade: '초등 3학년',
        department: '초등 1부',
        birth_date: '2017-05-12',
        gender: 'male',
        parent_name: '김영수',
        parent_phone: '010-9876-5432',
        emergency_phone: '010-1111-2222',
        health_notes: '비염약 복용 중',
        allergies: '복숭아 알레르기',
        privacy_consent: true,
        photo_consent: true,
        payment_status: 'deposited',
        status: 'confirmed',
        check_in_status: 'checked_in',
        check_in_at: '2026-07-24T09:15:00',
        custom_responses: { f_tshirt: '140', f_pool: '예' },
        created_at: '2026-06-10T14:20:00'
      },
      {
        id: 'app-2',
        student_name: '이서아',
        grade: '초등 2학년',
        department: '초등 1부',
        birth_date: '2018-09-03',
        gender: 'female',
        parent_name: '박지영',
        parent_phone: '010-3333-4444',
        emergency_phone: '010-5555-6666',
        health_notes: '특이사항 없음',
        allergies: '땅콩 알레르기 주의',
        privacy_consent: true,
        photo_consent: true,
        payment_status: 'deposited',
        status: 'confirmed',
        check_in_status: 'not_checked_in',
        check_in_at: null,
        custom_responses: { f_tshirt: '130', f_pool: '예' },
        created_at: '2026-06-11T10:15:00'
      },
      {
        id: 'app-3',
        student_name: '박시우',
        grade: '초등 5학년',
        department: '초등 2부',
        birth_date: '2015-11-20',
        gender: 'male',
        parent_name: '박준형',
        parent_phone: '010-7777-8888',
        emergency_phone: '010-9999-0000',
        health_notes: '운동 시 천식 스프레이 소지',
        allergies: '갑각류 알레르기',
        privacy_consent: true,
        photo_consent: true,
        payment_status: 'waiting_deposit',
        status: 'submitted',
        check_in_status: 'not_checked_in',
        check_in_at: null,
        custom_responses: { f_tshirt: '160', f_pool: '예' },
        created_at: '2026-06-15T18:40:00'
      },
      {
        id: 'app-4',
        student_name: '정지안',
        grade: '초등 4학년',
        department: '초등 2부',
        birth_date: '2016-03-25',
        gender: 'female',
        parent_name: '최은경',
        parent_phone: '010-2222-7777',
        emergency_phone: null,
        health_notes: '멀미 심함 (차량 이동 시 주의)',
        allergies: '없음',
        privacy_consent: true,
        photo_consent: true,
        payment_status: 'deposited',
        status: 'confirmed',
        check_in_status: 'checked_in',
        check_in_at: '2026-07-24T09:22:00',
        custom_responses: { f_tshirt: '150', f_pool: '예' },
        created_at: '2026-06-18T11:05:00'
      }
    ],
    created_at: '2026-06-01T09:00:00'
  },
  {
    id: 'event-2',
    title: '2026 중고등부 하계 비전 캠프 (Arise & Shine)',
    description: '청소년 시기 일생일대의 하나님과의 인격적 만남! 가평 유스호스텔에서 2박 3일간 펼쳐지는 영적 재충전의 시간입니다.',
    location: '경기도 가평 드림 유스호스텔',
    start_date: '2026-08-06',
    end_date: '2026-08-08',
    deadline: '2026-07-25',
    capacity: 40,
    status: 'open',
    is_template: false,
    link_token: 'youth-2026-vision-camp',
    contact_info: '청소년부 담당 전도사 (010-8765-4321)',
    custom_fields: [
      { id: 'f_roommate', label: '희망 룸메이트 (선택)', required: false }
    ],
    applications: [
      {
        id: 'app-y1',
        student_name: '최민준',
        grade: '중학교 2학년',
        department: '중등부',
        birth_date: '2012-07-18',
        gender: 'male',
        parent_name: '최진호',
        parent_phone: '010-4444-9999',
        emergency_phone: null,
        health_notes: null,
        allergies: null,
        privacy_consent: true,
        photo_consent: true,
        payment_status: 'deposited',
        status: 'confirmed',
        check_in_status: 'not_checked_in',
        check_in_at: null,
        custom_responses: { f_roommate: '김도윤' },
        created_at: '2026-07-02T16:30:00'
      },
      {
        id: 'app-y2',
        student_name: '윤채원',
        grade: '고등학교 1학년',
        department: '고등부',
        birth_date: '2010-02-14',
        gender: 'female',
        parent_name: '정유미',
        parent_phone: '010-6666-1111',
        emergency_phone: '010-8888-2222',
        health_notes: '소화불량 잦음',
        allergies: null,
        privacy_consent: true,
        photo_consent: true,
        payment_status: 'waiting_deposit',
        status: 'submitted',
        check_in_status: 'not_checked_in',
        check_in_at: null,
        custom_responses: { f_roommate: '임수빈' },
        created_at: '2026-07-05T20:10:00'
      }
    ],
    created_at: '2026-06-20T10:00:00'
  },
  {
    id: 'event-3',
    title: '상반기 교회학교 학부모 초청 간담회 & 기도회',
    description: '가정과 교회가 한마음으로 다음세대를 세우는 귀한 나눔의 시간입니다. 1부 부서별 사역 보고, 2부 자녀 신앙 교육 특강 및 합심 기도회로 진행됩니다.',
    location: '교회 비전홀 (3층)',
    start_date: '2026-05-16',
    end_date: '2026-05-16',
    deadline: '2026-05-10',
    capacity: 60,
    status: 'closed',
    is_template: false,
    link_token: 'parents-prayer-2026',
    contact_info: '교육부 총괄 위원장 (010-5555-1234)',
    custom_fields: [],
    applications: [
      {
        id: 'app-p1',
        student_name: '김하은',
        grade: '유치부 7세',
        department: '유치부',
        birth_date: '2019-04-10',
        gender: 'female',
        parent_name: '김성민',
        parent_phone: '010-1234-9988',
        emergency_phone: null,
        health_notes: null,
        allergies: null,
        privacy_consent: true,
        photo_consent: true,
        payment_status: 'deposited',
        status: 'confirmed',
        check_in_status: 'checked_in',
        check_in_at: '2026-05-16T10:02:00',
        custom_responses: {},
        created_at: '2026-05-01T14:00:00'
      }
    ],
    created_at: '2026-04-20T11:00:00'
  }
];

export const EVENT_TEMPLATES = [
  {
    id: 'tpl-vbs',
    title: '[템플릿] 여름성경학교 / VBS 등록 접수',
    description: '매년 진행되는 여름성경학교 신청 템플릿입니다. 티셔츠 사이즈 및 알레르기 조사 항목이 기본 탑재되어 있습니다.',
    location: '교회 본당 및 교육관',
    capacity: 60,
    contact_info: '교회학교 담당 (010-0000-0000)',
    custom_fields: [
      { id: 'f_tshirt', label: '티셔츠 사이즈', required: true },
      { id: 'f_snack', label: '간식 알레르기 유무', required: false }
    ]
  },
  {
    id: 'tpl-market',
    title: '[템플릿] 교회학교 달란트 잔치 & 성경 골든벨',
    description: '분기별 달란트 시장 및 성경 퀴즈대회 참가 신청 양식입니다.',
    location: '교회 친교실',
    capacity: 80,
    contact_info: '초등부 부장교사 (010-0000-0000)',
    custom_fields: [
      { id: 'f_team', label: '참여 부서 / 반', required: true }
    ]
  },
  {
    id: 'tpl-teacher',
    title: '[템플릿] 교육부서 교사 영성 수련회 및 워크숍',
    description: '사역의 든든한 동역자인 선생님들을 위한 1박 2일 힐링 & 역량 강화 수련회 접수 템플릿입니다.',
    location: '강화도 말씀수양관',
    capacity: 30,
    contact_info: '교육 디렉터 (010-0000-0000)',
    custom_fields: [
      { id: 'f_transport', label: '이동 수단 (교회 버스 / 자차)', required: true }
    ]
  },
  {
    id: 'tpl-camp',
    title: '[템플릿] 중고등부 하계/동계 비전 캠프',
    description: '청소년 수련회 등록 접수 및 부모님 동의서 통합 양식입니다.',
    location: '수련원',
    capacity: 50,
    contact_info: '청소년부 담당 (010-0000-0000)',
    custom_fields: [
      { id: 'f_roommate', label: '희망 룸메이트', required: false }
    ]
  }
];

export const APPLICATION_STATUS_CONFIG = {
  submitted: { label: '신청완료', color: 'badge-blue' },
  confirmed: { label: '참가확정', color: 'badge-green' },
  waiting_deposit: { label: '입금대기', color: 'badge-orange' },
  deposited: { label: '입금완료', color: 'badge-emerald' },
  cancelled: { label: '신청취소', color: 'badge-red' }
};

export const EVENT_STATUS_CONFIG = {
  open: { label: '신청 접수 중', color: 'status-open' },
  closed: { label: '접수 마감', color: 'status-closed' },
  draft: { label: '임시저장', color: 'status-draft' }
};
