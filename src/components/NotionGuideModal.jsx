import React from 'react';
import { X, ExternalLink, BookOpen, Layers, CheckCircle2, Copy, Sparkles, Database } from 'lucide-react';

export default function NotionGuideModal({ isOpen, onClose }) {
  const notionUrl = "https://lava-child-76b.notion.site/Ministry-Second-Brain-PARA-faa57f770752494db4bf529eaf689998";

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container guide-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <span className="logo-emoji">🕊️</span>
            <div>
              <h3 className="modal-title">사역 세컨드 브레인(PARA) 노션 템플릿 활용 가이드</h3>
              <p className="modal-sub">사역의 본질에 집중할 수 있도록 돕는 디지털 지식 관리 프레임워크</p>
            </div>
          </div>

          <button onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body guide-body">
          {/* Notion Link Banner */}
          <div className="guide-notion-link-card">
            <div>
              <strong>🔗 연동 노션 템플릿 링크</strong>
              <p className="text-muted">내 노션 계정에 이 템플릿을 복제(Duplicate)해 두고 본 사이트와 함께 사용하세요.</p>
            </div>
            <a
              href={notionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="notion-link-btn"
            >
              <span>노션 템플릿 바로가기</span>
              <ExternalLink size={15} />
            </a>
          </div>

          {/* Section 1: PARA 프레임워크 이해 */}
          <div className="guide-section">
            <h4 className="guide-sec-title">
              <Layers size={18} className="text-primary" />
              <span>1. 사역자를 위한 PARA 프레임워크란?</span>
            </h4>
            <div className="para-explainer-grid">
              <div className="para-card-mini project">
                <span className="para-badge project-badge">P</span>
                <h5>Projects (사역 프로젝트)</h5>
                <p>마감일과 완료 목표가 명확한 단기 사역 (예: 2026 청년부 수련회, 8주 로마서 강해, 성탄 전도축제)</p>
              </div>

              <div className="para-card-mini area">
                <span className="para-badge area-badge">A</span>
                <h5>Areas (사역 책임 영역)</h5>
                <p>마감일 없이 목회자로서 지속적으로 일정 수준의 영적 품질을 유지해야 하는 본질적 영역 (말씀 연구 및 설교, 심방 및 영혼 돌봄, 개인 경건 및 기도, 사역자 가정 및 건강, 부서 행정 및 동역)</p>
              </div>

              <div className="para-card-mini resource">
                <span className="para-badge resource-badge">R</span>
                <h5>Resources (사역 지식 자산)</h5>
                <p>언제든 설교나 교육에 꺼내 쓸 수 있는 축적형 지식 (설교 예화, 성경 주해, 심방 질문지, 찬양 콘티, 사역 매뉴얼)</p>
              </div>

              <div className="para-card-mini archive">
                <span className="para-badge archive-badge">A</span>
                <h5>Archives (사역 보관함)</h5>
                <p>완료된 프로젝트와 사후 평가(AAR: After Action Review). 다음 해 같은 사역을 준비할 때 소중한 길잡이가 됩니다.</p>
              </div>
            </div>
          </div>

          {/* Section 2: 노션에 복사해서 채우는 3단계 워크플로우 */}
          <div className="guide-section">
            <h4 className="guide-sec-title">
              <CheckCircle2 size={18} className="text-success" />
              <span>2. 노션에 콘텐츠를 채워 넣는 3단계 실전 팁</span>
            </h4>
            <div className="workflow-card">
              <div className="flow-step">
                <div className="flow-badge">Step 1</div>
                <div>
                  <strong>웹에서 콘텐츠 생성 또는 선택</strong>
                  <p>상단 '스마트 사역 AI 어시스턴트'에 사역 키워드를 넣거나, 기존에 등록된 템플릿(WBS, 루틴, 예화)을 클릭합니다.</p>
                </div>
              </div>

              <div className="flow-step">
                <div className="flow-badge">Step 2</div>
                <div>
                  <strong>[노션으로 복사] 원클릭 실행</strong>
                  <p>카드나 상세창의 [노션 복사] 버튼을 누르면, 노션이 인식하는 콜아웃(`&gt; 💡`), 체크박스(`- [ ]`), 인용구, 대지 서식으로 클립보드에 복사됩니다.</p>
                </div>
              </div>

              <div className="flow-step">
                <div className="flow-badge">Step 3</div>
                <div>
                  <strong>노션 페이지 본문에 붙여넣기 (Ctrl + V)</strong>
                  <p>노션 데이터베이스의 새 페이지를 열고 본문 영역에 붙여넣으면 콜아웃 상자와 체크박스가 시각적으로 깔끔하게 자동 렌더링됩니다!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: 노션 데이터베이스 관계형(Relation) 연결 팁 */}
          <div className="guide-section">
            <h4 className="guide-sec-title">
              <Database size={18} className="text-info" />
              <span>3. 노션 데이터베이스 관계형(Relation) 추천 연결법</span>
            </h4>
            <div className="relation-tips-box">
              <ul className="relation-list">
                <li>
                  <strong>Projects ↔ Areas 연결:</strong> 모든 프로젝트는 1개의 책임 영역에 연결하세요. 예: 청년부 수련회 ➡️ '5. 부서 행정 및 동역', 설교 시리즈 ➡️ '1. 말씀 연구 및 설교'. Projects DB의 <strong>소속 영역</strong> 열에서 직접 고를 수 있습니다. CSV 병합으로는 관계형이 들어가지 않으니 병합 뒤에 한 번씩 연결해 주세요.
                </li>
                <li>
                  <strong>완료된 사역의 보관:</strong> 마감일이 지나 사역이 끝나면 상태를 '완료'로 바꾸고 AAR(Keep/Problem/Try)을 작성한 뒤, 해당 행을 Archives 보관함 DB로 직접 옮기세요. (노션에 자동 이동 기능은 없습니다.)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn-primary">
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
}
