# Sparkfit

<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
  <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/yarn-2C8EBB?style=for-the-badge&logo=yarn&logoColor=white" />
  <img src="https://img.shields.io/badge/reactrouter-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" />
  <img src="https://img.shields.io/badge/supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/tailwindcss-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/zustand-000000?style=for-the-badge&logo=zustand&logoColor=white" />
  <img src="https://img.shields.io/badge/sweetalert2-FF5F5F?style=for-the-badge&logo=sweetalert&logoColor=white" />
  <img src="https://img.shields.io/badge/day.js-FF2D20?style=for-the-badge&logo=dayjs&logoColor=white" />
  <img src="https://img.shields.io/badge/naver map api-03C75A?style=for-the-badge&logo=naver&logoColor=white" />
</div>

---

### ✔️ 프로젝트 개요

"**지도 기반 운동 번개 모임 플랫폼**"

사용자들이 위치 기반으로 운동 모임을 생성하거나 참여할 수 있는 플랫폼입니다. 지도를 통해 주변 모임을 시각적으로 탐색하고, 직접 생성하거나 신청할 수 있습니다.

**🔧 주요 확장 및 개선 사항**:

- **모임 승인 절차 도입**: 승인이 필요한 모임은 주최자의 수락 후 참여 확정
- **실시간 알림 시스템 개선**: Supabase Realtime 활용
  - 새 모임 생성 시: **모임 아이콘에 알림 표시**
  - 내 모임에 참여 신청 발생 시: **계정 아이콘에 알림 배지 표시**

---

### ✔️ 주요 기능

1. **운동 모임 등록**  
   지도에서 장소 선택 → 날짜/시간/종목/승인 여부 설정 → 등록

2. **모임 검색 및 참여**  
   현재 위치 기반 모임 탐색, 필터링 가능 (최신순/마감 임박 등)

3. **실시간 알림**  
   Supabase Realtime으로 알림 전송 → UI 상단 뱃지 표시

4. **마이페이지**  
   프로필 수정, 내가 생성/참여한 모임 관리, 승인 대기 목록 확인

5. **회원가입/로그인**  
   비밀번호 보기 토글, 아이디 기억, 약관 UI 개선 등 UX 향상

6. **UX 개선 요소**
   - 반응형 대응 및 길이 초과 시 텍스트 이클립스 처리
   - 공통 컴포넌트화 (모달, 버튼 등)
   - 스타일 코드 컴포넌트별 분리

---

### 📁 프로젝트 구조

프로젝트 폴더 구조는 다음과 같습니다:

```tree
├── App.jsx
├── main.jsx
├── index.css
├── assets/                # 로고 및 이미지
├── api/                   # API 호출 함수
├── components/            # 재사용 가능한 UI 컴포넌트들
│   ├── common/            # 공용 컴포넌트 (로딩, 에러, 가이드 등)
│   ├── DetailPage/        # 상세 페이지 관련 모달/기능
│   ├── GatheringPage/     # 모임 리스트 관련 컴포넌트
│   ├── myPage/            # 마이페이지 관련 컴포넌트
│   └── navermap/          # 지도 관련 컴포넌트
├── constants/             # 상수 관리
├── hooks/                # 커스텀 훅
├── layout/                # 레이아웃, 사이드바, 모달
├── pages/                 # 라우팅되는 주요 페이지들
├── router/                # 라우터 설정
├── supabase/              # Supabase 클라이언트
├── providers/             # 전역 Provider 설정
├── zustand/               # 전역 상태 관리 (Zustand)
├── utils/                 # 유틸 함수들
```

### 🛠 사용 기술 스택

- **Frontend**: React, Vite, TailwindCSS, Styled-components
- **State Management**: Zustand, TanStack Query
- **Backend & Auth**: Supabase (Realtime 포함)
- **지도 연동**: Naver Map API
- **기타 라이브러리**: SweetAlert2, React-Select, Day.js, Headless UI

---

### ✨ 기대 효과

- 사용자들의 운동 모임 참여 활성화 및 접근성 향상
- 모임 주최자와 참여자 간의 효율적인 소통 및 승인 관리
- 위치 기반 맞춤형 운동 커뮤니티 형성
- 실시간 알림 및 알림 뱃지 기능으로 **사용자 인터랙션 증가**
- 가입, 프로필 수정, 모임 신청 등 **UX 개선으로 사용자 경험 향상**

---

### 🏃🏻 역할 분담

| 태그 |  이름  |                                   역할                                   |
| :--: | :----: | :----------------------------------------------------------------------: |
| 팀장 |  오은  |                    메인페이지 : 지도 API로 맵UI 구현                     |
| 팀원 | 최혜미 | 마이페이지 (닉네임, 프로필 수정), 신청한 모임(모집 활성/비활성 상태표기) |
| 팀원 |  김용  |            사이드바(마이페이지로 가기, 검색, 로그아웃, 알람)             |
| 팀원 | 양이준 |    모임 페이지 : 접속 사용자의 위경도 기준 / 마감기한 / 최신순 필터링    |
| 팀원 | 한효림 |                    모집 상세페이지 + 모임 가입, 생성                     |
| 팀원 | 최예진 |                             로그인/회원가입                              |

---

### 🔧 개인 작업 요약

> 💡 부트캠프 이후 개인 포크를 통해 Sparkfit 프로젝트를 **리팩토링/기능 개선/구조 개선**하였습니다.

전역 상태 관리 도입(zustand), 컴포넌트 분리, 폴더 구조 재정비, 성능 개선 등 유지보수성과 확장성을 높이는 데 집중했습니다.

**✅ 기능 개선**

- 전체 UI 리팩토링
  - 색상, 여백, 아이콘 등의 UI 요소를 일관성 있게 통일
  - TailwindCSS와 Styled-Components를 혼용하여 유연한 스타일링 적용
- 공용 컴포넌트화
  - 로그인/회원가입, 약관 체크, 입력 필드, 버튼 등 재사용 가능한 컴포넌트 분리
  - 중복 코드 제거 및 유지보수성 향상
- 검색 및 모임 필터링 개선
  - 검색창: keyword 상태를 Zustand와 URL query string으로 연동해 새로고침/공유 시 상태 유지
  - 필터: React-Select를 활용해 UX 높은 셀렉트 UI 제공
- 로딩 및 에러 처리 개선
  - Loading.jsx, Error.jsx를 공통 컴포넌트로 추출
  - API 호출 전/후 사용자 피드백 명확화

**⚙️ 성능 최적화 및 구조 개선**

- 전역 상태 관리 개선
  - Zustand 도입으로 모달, 검색 키워드, 로그인 상태 등 전역 상태 간결하게 관리
  - 기존 props drilling 문제 해결, 코드 가독성 개선
- 실시간 알림 기능 개선
  - 기존 useEffect 폴링 방식 → Supabase Realtime으로 대체
  - 내 모임에 참여 요청 시 내 계정 아이콘에 알림 뱃지 표시, 새 모임 생성 시 모임 아이콘에 알림 표시
- 스타일 코드 분리
  - 컴포넌트별 스타일을 styled-components 파일로 분리하여 유지보수성 향상
  - UI 요소 스타일링의 명확한 책임 분리
- 렌더링 최적화
  - useMemo, useCallback, React.memo 등을 적극 도입
  - 불필요한 리렌더링 방지로 성능 향상 및 렌더 속도 개선
  - 특히 모임 리스트 및 지도 연동 컴포넌트에서 효과적
