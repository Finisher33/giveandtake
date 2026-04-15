# GiveAndTake (Be Giver, Be Taker) 프로젝트

## 프로젝트 개요

현대자동차그룹 등 기업 교육/연수 프로그램 참가자들이 서로의 지식과 경험을 주고받을 수 있는 네트워킹 앱.
- 참가자가 줄 수 있는 것(Giver)과 받고 싶은 것(Taker)를 등록하면 AI가 연결해줌
- 세션 인사이트 공유, 네트워크 맵 시각화, 티타임 요청 기능 포함

**배포 URL**: https://giveandtake-gray.vercel.app
**GitHub**: https://github.com/Finisher33/giveandtake
**로컬 경로**: `C:/Users/냥뭉/Downloads/be-giver-claude-temp/`

## 개발 환경 실행

```bash
cd "C:/Users/냥뭉/Downloads/be-giver-claude-temp"
npm run dev
```

환경변수: `.env.local`에 `VITE_GEMINI_API_KEY` 설정됨

## 배포

```bash
git add -A && git commit -m "변경사항 설명"
git push origin main
vercel --prod
```

## 기술 스택

- **Frontend**: React 19 + TypeScript + Vite 6
- **Styling**: TailwindCSS 4
- **Backend**: Express (`server.ts`) + tsx로 실행
- **DB**: Firebase Firestore (실시간 onSnapshot)
- **Auth**: Firebase Auth (익명 로그인으로 Firestore 접근, 실제 인증은 이름+회사+과정ID)
- **AI**: Gemini API (`@google/genai`) — 임베딩, 키워드 매칭
- **시각화**: D3.js — NetworkMap, PeopleMap, KEYWORD BUBBLE
- **PDF**: jsPDF + html2canvas — UserReportPDF

## 프로젝트 구조

```
src/
├── App.tsx              # 최상위 라우팅 (view, subView 상태 관리)
├── store.tsx            # 전역 상태 + Firebase CRUD (StoreProvider/useStore)
├── firebase.ts          # Firebase 초기화, 익명 인증
├── main.tsx             # 엔트리포인트
├── index.css            # 전역 스타일 (CSS 변수로 테마 관리)
├── components/
│   ├── MainView.tsx         # 로그인/회원가입 화면
│   ├── AppView.tsx          # 메인 앱 (탭: map, network, library, insight)
│   ├── AdminView.tsx        # 관리자 화면
│   ├── LandingPageView.tsx  # 로그인 후 메뉴 선택 화면
│   ├── InsightView.tsx      # 세션 인사이트 + KEYWORD BUBBLE 차트
│   ├── MyProfile.tsx        # 프로필 등록/수정 (Giver/Taker 키워드)
│   ├── MyNetwork.tsx        # SNS(Social Network Analysis) 종합 분석 + 티타임
│   ├── NetworkMap.tsx       # D3 네트워크 맵 시각화
│   ├── PeopleMap.tsx        # D3 사람 맵 (연결된 노드만 표시)
│   ├── LibraryView.tsx      # 라이브러리
│   ├── TotalInsight.tsx     # 전체 인사이트 집계
│   ├── UserReportPDF.tsx    # 개인 리포트 PDF 생성
│   ├── TeaTimeModal.tsx     # 티타임 요청/응답 모달
│   ├── NotificationBell.tsx # 알림 벨
│   ├── LocationAutocomplete.tsx  # 지역 자동완성
│   └── ErrorBoundary.tsx    # 에러 경계
├── services/
│   ├── embeddingService.ts  # Gemini 임베딩 + 코사인 유사도
│   ├── geminiService.ts     # Gemini AI 기능
│   └── mockData.ts          # 데모 모드용 목 데이터 생성
├── constants/
│   ├── companies.ts         # 현대차그룹 계열사 목록
│   └── districts.ts         # 지역 목록
└── utils/
    └── networkUtils.ts      # SNA 계산 (마당발/게이트키퍼/전파자)
```

## 핵심 데이터 모델 (store.tsx)

```typescript
Course    { id, name, password? }
Session   { id, courseId, name, time, module, day, isActive, objectives?, contents?, instructor? }
User      { id, company, name, department, title, location, courseId, profilePic? }
Interest  { id, userId, type: 'giver'|'taker', keyword, canonicalId?, description }
TeaTimeRequest { id, fromUserId, toUserId, message, status: 'pending'|'accepted'|'rejected', responseMessage? }
UserInsight    { id, userId, sessionId, keyword, canonicalId?, description, likes?: string[] }
CanonicalTerm  { id, term, embedding?: number[] }
PresetInterest { id, keyword }
```

## 라우팅 구조 (App.tsx)

- `view`: `'main'` | `'admin'`
- `subView`: `'landing'` | `'app'` | `'insight'` | `'profile'`
- `appViewTab`: `'map'` | `'network'` | `'library'` | `'insight'` (AppView 내부)

## Firebase 구조

- Firestore 컬렉션: `courses`, `sessions`, `users`, `interests`, `teaTimeRequests`, `userInsights`, `canonicalTerms`, `presetInterests`
- 인증: 익명 로그인으로 Firestore 접근 권한 확보, 실제 사용자 식별은 `{courseId}_{company}_{name}` 기반 ID
- 설정파일: `firebase-applet-config.json`

## 주요 패턴

- **전역 상태**: `useStore()` 훅 (Context API 기반)
- **실시간 DB**: Firestore `onSnapshot`으로 변경 감지
- **AI 매칭**: Gemini 임베딩으로 코사인 유사도 계산해 Giver-Taker 매칭
- **데모 모드**: `isDemoMode` 상태로 목 데이터 전환 가능
- **CSS 변수 테마**: `index.css`에서 `--color-primary` 등으로 색상 관리

## 최근 구현 내역 (2026-04-16)

### InsightView.tsx
- KEYWORD BUBBLE: D3 `forceCenter` + `forceCollide` 시뮬레이션으로 버블 중앙 클러스터링
- 블러 효과 제거 → 클릭 전 `touch_app` 아이콘만 표시, 탭 시 키워드 공개
- 섹션 순서: KEYWORD BUBBLE → BEST INSIGHTS (Semantic Density 삭제)
- 전체화면 모드 지원 (Fullscreen API)
- MY INSIGHT: 중복 방지(동일 sessionId 덮어쓰기), 수정 버튼 명시화, 버블차트 이동 버튼

### PeopleMap.tsx
- 유저 모드: 본인 + 연결된(공유 키워드 ≥1) 노드만 표시
- 관리자 모드(`adminCourseId`): 전체 노드 표시 유지

### networkUtils.ts + MyNetwork.tsx
- 마당발(연결중심성): `myNeighborCount === 0`이면 점수 0 (키워드 있어도)
- 전체 점수 0일 때 `allZero: true` 반환 → 유형 미결정 안내 메시지 표시
- 타이틀: `SNS(Social Network Analysis) 종합 분석`

## 개발 시 유의사항

- 한글 주석/UI 사용
- Firestore 에러는 `handleFirestoreError()`로 처리 후 re-throw
- 컴포넌트 추가 시 `AppView.tsx`의 탭 구조 확인
- PDF 생성은 `UserReportPDF.tsx` 참고 (html2canvas → jsPDF)
- `saveUserInsight`는 Firestore `setDoc`으로 동작 → 같은 ID 전달 시 덮어쓰기
