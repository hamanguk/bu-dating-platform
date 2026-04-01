# 혼밥친구 (HonBab Chingu)

> 백석대학교 재학생 전용 익명 공강 시간 밥 매칭 플랫폼

[![Deploy](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://bu-eating.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://render.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)

---

## 서비스 소개

혼밥친구는 **백석대학교(@bu.ac.kr) 이메일 인증** 기반의 **완전 익명** 밥 친구 매칭 플랫폼입니다.
이름과 학과는 절대 공개되지 않으며, **닉네임 + MBTI + 성별**만으로 가볍고 안전하게 밥 친구를 찾을 수 있습니다.

### 핵심 가치

- **완전 익명** — 이름/학과/프로필 사진 없이 닉네임만으로 활동
- **낮은 진입장벽** — "배고픈 백석인" 같은 귀여운 랜덤 닉네임 자동 부여
- **밥 친구에 집중** — 소개팅이 아닌, 같이 밥 먹을 사람 찾기

### 주요 기능

- **커스텀 닉네임 시스템** — 나만의 별명 설정 + 중복 확인, 미설정 시 랜덤 닉네임 자동 부여
- **공강 시간 매칭 (09:00~21:00)** — 5x13 시간표 기반, 현재 공강인 친구를 자동 추천 + 저녁 시간대 포함
- **실시간 공강 친구** — 홈 화면 상단에 지금 공강인 유저 가로 스크롤 노출, 카드 클릭으로 바로 1:1 채팅
- **공강 겹침 우선 정렬** — 나와 공강 시간이 겹치는 게시물이 피드 최상단에 노출 + [⏰ 공강 일치!] 배지
- **간소화된 게시물 작성** — 제목 + 내용(선택) + 사진(선택)만으로 빠르게 약속 제안
- **메뉴 취향 매칭** — 한식/중식/일식/양식/치킨/피자/분식/카페/맥주/소주 중 겹치는 메뉴로 점수 산정
- **실시간 채팅** — Socket.io 기반 1:1/그룹 채팅 + 읽음 표시 + 채팅방 나가기(시스템 메시지)
- **프로필 직접 채팅** — 게시물 없이도 공강 유저 카드에서 바로 1:1 채팅 시작
- **학교 이메일 인증** — `@bu.ac.kr` 도메인만 허용하는 Google OAuth 로그인
- **인앱 브라우저 대응** — 카카오톡/인스타/에타 등 앱별 분기 처리
- **푸시 알림** — FCM + Browser Notification API로 새 메시지 알림
- **PWA 지원** — 홈 화면 추가, iOS/Android 설치 배너
- **관리자 대시보드** — 유저 관리, 신고 처리, 통계 조회

---

## 기술 스택

### Frontend

| 기술 | 용도 |
|------|------|
| React 18 | UI 라이브러리 |
| Vite | 빌드 도구 |
| Tailwind CSS | 유틸리티 CSS |
| React Router v6 | SPA 라우팅 |
| Socket.io Client | 실시간 통신 |
| Firebase SDK | Google OAuth + FCM 푸시 알림 |

### Backend

| 기술 | 용도 |
|------|------|
| Node.js + Express | REST API 서버 |
| MongoDB + Mongoose | 데이터베이스 |
| Socket.io | WebSocket 서버 |
| JWT (jsonwebtoken) | 토큰 인증 |
| Cloudinary | 이미지 업로드/CDN |
| Firebase Admin SDK | OAuth 토큰 검증 + FCM 발송 |
| Helmet + CORS + Rate Limiter | API 보안 |

### 인프라

| 서비스 | 용도 |
|--------|------|
| Vercel | 프론트엔드 배포 |
| Render (Free) | 백엔드 배포 |
| MongoDB Atlas | 클라우드 DB |
| Cloudinary | 이미지 스토리지 |

---

## 프로젝트 구조

```
campus-date/
├── frontend/                    # React SPA (PWA)
│   ├── src/
│   │   ├── components/
│   │   │   ├── BottomNav.jsx    # 하단 네비게이션 [매칭, 혜택, 홈(중앙 강조), 채팅, 내정보]
│   │   │   ├── PostCard.jsx     # 게시물 카드 (사진/그라데이션 분기 + 공강 배지)
│   │   │   ├── ProtectedRoute.jsx # 인증 + 닉네임 가드
│   │   │   ├── TimetableSelector.jsx # 시간표 입력 (월~금, 09:00~21:00, 13교시)
│   │   │   ├── Skeleton.jsx     # 로딩 스켈레톤 UI
│   │   │   ├── EmptyState.jsx   # 빈 상태 화면
│   │   │   └── PageTransition.jsx # 페이지 전환 애니메이션
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # 인증 + 알림 상태 관리
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx    # 로그인 + 앱별 인앱 브라우저 분기 처리
│   │   │   ├── MainFeedPage.jsx # 메인 피드 (공강 매칭 우선 정렬 + 실시간 공강 친구)
│   │   │   ├── CreatePostPage.jsx # 약속 제안 (제목 + 내용 + 사진)
│   │   │   ├── PostDetailPage.jsx # 게시물 상세
│   │   │   ├── MatchPage.jsx    # 매칭 페이지
│   │   │   ├── BenefitsPage.jsx # 혜택/이벤트 페이지
│   │   │   ├── ChatListPage.jsx # 채팅 목록 (실시간 업데이트)
│   │   │   ├── ChatPage.jsx     # 채팅방 (나가기 메뉴 + 확인 모달)
│   │   │   ├── ProfilePage.jsx  # 프로필 (닉네임 + MBTI + 성별 + 시간표 직접 입력)
│   │   │   └── AdminPage.jsx    # 관리자 대시보드
│   │   └── services/
│   │       ├── api.js           # Axios API 클라이언트
│   │       ├── firebase.js      # Firebase 초기화
│   │       ├── notification.js  # FCM + 브라우저 알림
│   │       └── socket.js        # Socket.io 클라이언트
│   ├── public/
│   │   ├── manifest.json        # PWA 매니페스트
│   │   └── firebase-messaging-sw.js # FCM 서비스 워커
│   └── vercel.json              # Vercel 배포 설정 (API 프록시)
│
├── backend/                     # Express API 서버
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js          # 닉네임 + 시간표(5x13) + 음식취향
│   │   │   ├── Post.js          # 제목 + 내용(선택) + 이미지(선택)
│   │   │   ├── Event.js         # 비즈니스 이벤트/혜택
│   │   │   ├── Room.js
│   │   │   ├── Message.js
│   │   │   └── Report.js
│   │   ├── controllers/
│   │   │   ├── authController.js    # 구글 로그인 + 닉네임 포함 응답
│   │   │   ├── postController.js    # 공강 겹침 우선 정렬 + 배지
│   │   │   ├── userController.js    # 랜덤 닉네임 생성 + 중복 확인
│   │   │   ├── chatController.js    # 채팅방 CRUD + 1:1 다이렉트 채팅 + 나가기
│   │   │   ├── matchController.js   # KST 기반 실시간 공강 매칭 (13교시)
│   │   │   ├── eventController.js   # 비즈니스 이벤트 관리
│   │   │   └── adminController.js
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── socket/
│   │   └── config/
│   └── server.js
│
├── mobile/                      # Expo React Native 앱 (개발 중)
└── README.md
```

---

## 데이터 모델

### User

```javascript
{
  email, name, googleId,              // 인증 정보 (name은 내부 식별용, 비노출)
  nickname,                           // 유저 고유 식별자 (화면 노출용)
  department,                         // DB 저장만, 타 유저에게 비노출
  gender, mbti, bio,                  // 프로필 (닉네임/MBTI/성별만 공개)
  timetable: Boolean[5][13],          // 공강 시간표 (월~금, 09:00~21:00)
  majorCourses: [String],             // 수강 과목 (매칭용, 최대 20개)
  foodPreferences: [String],          // 선호 메뉴 (복수)
  diningStyle: 'quiet' | 'chatty',   // 식사 스타일
  interests: [String],                // 관심사 (최대 10개)
  profileComplete: Boolean,           // 프로필 완성 여부 (시간표 필수)
  role: 'user' | 'admin'
}
```

### Post

```javascript
{
  author: ObjectId -> User,
  title,                                // 필수
  description,                          // 선택 — 시간, 장소, 하고 싶은 말
  images: [String],                     // 선택 — 없으면 기본 그라데이션 배경
  purpose: 'meal' | 'cafe' | 'study' | 'carpool',
  likes: [ObjectId -> User]
  // 공강 매칭은 작성자 프로필의 timetable 기반으로 서버에서 자동 계산
}
```

### Room & Message

```javascript
// Room (채팅방)
{ type: 'direct' | 'group', participants: [User], relatedPost: Post, isActive: Boolean,
  lastMessage: { content, sender, timestamp } }

// Message (메시지)
{ room: Room, sender: User, content: String, readBy: [User] }
// 나가기 시 "닉네임님이 퇴장하셨습니다." 시스템 메시지 자동 생성
```

---

## 익명성 설계

```
노출되는 정보          노출되지 않는 정보
─────────────         ──────────────────
닉네임 (커스텀/랜덤)    이름 (실명)
MBTI                   학과
성별                   학번
백석대 인증 뱃지        프로필 사진
자기소개               이메일
선호 메뉴 / 식사 스타일
관심사 / 수강 과목
```

- 모든 게시물, 채팅, 매칭 화면에서 `닉네임 (MBTI / 성별)` 형식으로 통일
- 닉네임 옆 "백석대 인증" 뱃지로 신뢰도 확보
- 닉네임 미설정 시 "배고픈 백석인", "졸린 대학생" 등 랜덤 닉네임 자동 부여

---

## 공강 매칭 알고리즘

### 실시간 매칭 (지금 공강인 친구)

```
현재 KST 시간 -> 요일(월~금) + 교시(1~13, 09:00~21:00) 계산
  -> User.timetable[요일][교시] === true 인 유저 필터
  -> 내 foodPreferences와 겹치는 메뉴 수로 정렬
  -> 상위 매칭 유저 반환 -> 카드 클릭으로 바로 1:1 채팅

* 주말: 모든 유저 공강 취급
* 18시 이후: 술 한잔? 뱃지 표시 + 10~13교시(저녁) 매칭 활성화
```

### 게시물 공강 겹침 정렬 + 배지

```
게시물 리스트 조회 시:
  -> 글 작성자의 timetable과 내 timetable 비교 (서버 측, 13교시 대응)
  -> 겹치는 공강 시간대가 1개 이상이면 timetableMatch = true
  -> 공강 겹치는 게시물을 최상단에 우선 정렬
  -> 프론트에서 [⏰ 공강 일치!] 배지 표시

* timetable 원본은 프론트에 전달하지 않음 (프라이버시 보호)
* 본인 게시물에는 배지 미표시
```

---

## 인증 흐름

```
사용자 -> Google OAuth (Firebase) -> Firebase ID Token
  -> Backend POST /api/auth/google (토큰 검증)
    -> @bu.ac.kr 도메인 체크
    -> User upsert
    -> JWT 발급 (7일) -> localStorage 저장
    -> 이후 모든 API: Authorization: Bearer <JWT>
```

### 인앱 브라우저 분기 처리

| 앱 | iOS | Android |
|----|-----|---------|
| 카카오톡 | 로그인 허용 + "Safari로 열기" 소프트 팁 | intent://로 자동 크롬 탈출 |
| 인스타/에타 | 로그인 버튼 클릭 시 하단 모달 안내 | 모달 + 크롬 열기 버튼 |
| 네이버/라인 | 하단 모달 안내 | 모달 + 크롬 열기 버튼 |

### 프로필 가드

- 닉네임 미설정 또는 시간표 미완성 시 모든 페이지에서 `/profile`로 강제 리다이렉트
- 닉네임은 서버(MongoDB)에 영구 저장, 로그인 시 `getMe` API로 복원

---

## 게시물 시스템

### 작성 화면 (메신저 스타일)

- **제목** (필수) — 랜덤 placeholder: "학식 같이 먹을 사람!", "자취방 근처 번개!" 등 7종
- **내용** (선택) — "구체적인 시간, 장소, 하고 싶은 말을 적어보세요!"
- **사진** (선택) — 제목 옆 작은 클립 아이콘으로 추가, 최대 5장
- 작성 시 작성자의 공강 시간표가 자동으로 매칭에 반영

### 카드 디자인

- **사진 있는 게시물** — 4:3 비율 커버 이미지 + 그라데이션 오버레이
- **사진 없는 게시물** — 그라데이션 배경 + 제목 중심 슬림 카드
- **공강 매칭 배지** — 나와 공강이 겹치면 [⏰ 공강 일치!] 표시

---

## 실시간 채팅 시스템

### 채팅 진입 경로

1. **게시물 상세** — "채팅하기" 버튼으로 그룹/1:1 채팅 시작
2. **공강 유저 카드** — 홈 화면에서 카드 클릭으로 바로 1:1 다이렉트 채팅

### Socket.io 이벤트

| 이벤트 | 방향 | 설명 |
|--------|------|------|
| `join_room` | Client -> Server | 채팅방 입장 |
| `leave_room` | Client -> Server | 채팅방 퇴장 |
| `send_message` | Client -> Server | 메시지 전송 |
| `new_message` | Server -> Client | 새 메시지 수신 |
| `read_messages` | Client -> Server | 메시지 읽음 처리 |
| `messages_read` | Server -> Client | 읽음 상태 업데이트 |
| `room_updated` | Server -> Client | 채팅방 정보 갱신 + 브라우저 알림 |
| `typing` / `user_typing` | 양방향 | 타이핑 표시 |

---

## UI/UX 디자인

### 디자인 컨셉 -- "Warm Orange"

따뜻한 오렌지 톤의 모바일 최적화 UI

### 컬러 시스템

| 토큰 | 값 | 용도 |
|------|-----|------|
| `primary` | `#FF8C00` | 메인 오렌지 |
| `accent` | `#FF6B81` | 그라데이션 핑크 |
| `background-light` | `#FFFAF5` | 라이트 모드 배경 |
| `background-dark` | `#1A0F05` | 다크 모드 배경 |

### 하단 네비게이션

```
[매칭]  [혜택]  [🏠 홈]  [채팅]  [내정보]
                  ↑
          중앙 플로팅 원형 버튼
          (그라데이션 + 크기 강조)
```

### 주요 UI 특징

- **2열 인스타그램 스타일 그리드** — 게시물 카드 컴팩트 레이아웃
- **시간표 직접 입력** — 월~금, 09:00~21:00 (13교시) 그리드, 저녁 시간대 포함
- **공강 친구 가로 슬라이더** — 닉네임 + MBTI + 메뉴 겹침 + "채팅하기" 버튼
- **메신저 스타일 게시물 작성** — 제목 + 내용 + 클립 아이콘 사진 첨부
- **Glass Morphism** — `backdrop-blur` 헤더/네비게이션
- **다크 모드** — Tailwind `dark:` 클래스 전체 지원
- **스켈레톤 UI** — Render 콜드 스타트(~90초) 대비 로딩 UX
- **Pull-to-Refresh** — 메인 피드 터치 새로고침
- **익명 아이콘** — 프로필 사진 대신 그라데이션 아이콘으로 통일

---

## API 엔드포인트

### 인증

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/google` | Google OAuth 로그인/회원가입 |
| GET | `/api/auth/me` | 내 정보 조회 (닉네임 포함) |

### 게시물

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/posts` | 게시물 목록 (공강 겹침 우선 정렬) |
| POST | `/api/posts` | 약속 제안 (제목 필수, 내용/사진 선택) |
| GET | `/api/posts/:id` | 게시물 상세 |
| PUT | `/api/posts/:id` | 게시물 수정 |
| DELETE | `/api/posts/:id` | 게시물 삭제 |
| POST | `/api/posts/:id/like` | 좋아요 토글 |

### 매칭

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/users/match` | 실시간 공강 친구 (시간표 + 메뉴 취향, 13교시 대응) |

### 채팅

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/chat/room` | 채팅방 생성/조회 (direct: 1:1, group: 그룹) |
| GET | `/api/chat/rooms` | 내 채팅방 목록 |
| GET | `/api/chat/rooms/:id/messages` | 메시지 조회 |
| POST | `/api/chat/rooms/:id/leave` | 채팅방 나가기 (시스템 메시지 + 실시간 알림) |
| GET | `/api/chat/unread-count` | 총 미읽 메시지 수 |

### 사용자

| Method | Endpoint | 설명 |
|--------|----------|------|
| PUT | `/api/users/profile` | 프로필 수정 (닉네임/MBTI/성별/시간표/관심사 등) |
| GET | `/api/users/check-nickname` | 닉네임 중복 확인 |
| GET | `/api/users/:id` | 사용자 공개 프로필 (닉네임/MBTI/성별만) |

### 이벤트 (비즈니스 혜택)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/events` | 이벤트 목록 |
| POST | `/api/events` | 이벤트 생성 (비즈니스 계정) |
| DELETE | `/api/events/:id` | 이벤트 삭제 |
| POST | `/api/events/:id/like` | 이벤트 좋아요 토글 |

### 관리자

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/admin/stats` | 대시보드 통계 |
| GET | `/api/admin/users` | 유저 목록 |
| GET | `/api/admin/activity` | 최근 활동 |
| DELETE | `/api/admin/posts/:id` | 게시물 삭제 |

---

## 보안

- **이메일 도메인 강제**: `@bu.ac.kr`만 허용 (서버 측 검증)
- **JWT 인증**: 모든 API 요청에 토큰 검증
- **익명성 보장**: API 응답에서 이름/학과/프로필 사진 제외
- **인앱 브라우저 분기**: 앱별 맞춤 안내 (카톡 iOS 소프트 팁 vs 인스타 하드 모달)
- **파일 업로드 제한**: jpg/jpeg/png만 허용, 5MB 제한
- **Rate Limiting**: 인증 20회/15분, 게시물 10회/1시간
- **CORS**: 지정된 클라이언트 URL만 허용
- **Helmet**: HTTP 보안 헤더 자동 설정

---

## 실행 방법

### 사전 요구사항

- Node.js 18+
- MongoDB Atlas 계정
- Firebase 프로젝트 (Google OAuth + FCM)
- Cloudinary 계정

### 환경 변수

**Backend** (`backend/.env`):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ALLOWED_EMAIL_DOMAIN=bu.ac.kr
ADMIN_EMAILS=admin@example.com
CLIENT_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

### 로컬 실행

```bash
# Backend
cd backend
npm install
npm run dev          # localhost:5000

# Frontend (새 터미널)
cd frontend
npm install
npm run dev          # localhost:5173
```

---

## 배포

### Frontend -- Vercel

1. GitHub 연동 -> 자동 배포
2. Root Directory: `frontend/`
3. `vercel.json`에 API 프록시 리라이트 포함

### Backend -- Render

1. GitHub 연동 -> Web Service 생성
2. Root Directory: `backend/`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. 환경변수는 Render 대시보드에서 설정

> **참고**: Render Free tier는 비활성 시 ~90초 콜드 스타트가 발생합니다. 스켈레톤 UI + 서버 ping으로 UX를 개선했습니다.

---

## 페이지 구성

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/login` | 로그인 | Google OAuth + 앱별 인앱 브라우저 분기 처리 |
| `/` | 메인 피드 | 공강 매칭 우선 정렬 + 실시간 공강 친구 슬라이더 + 약속 제안 버튼 |
| `/profile` | 프로필 | 닉네임 + MBTI/성별 + 시간표(13교시) + 수강 과목 + 관심사 |
| `/create-post` | 약속 제안 | 제목 + 내용(선택) + 사진 클립 첨부 |
| `/posts/:id` | 게시물 상세 | 이미지 또는 그라데이션 헤더 + 채팅 CTA |
| `/posts/:id/edit` | 게시물 수정 | 기존 데이터 편집 |
| `/match` | 매칭 | 공강 기반 유저 매칭 |
| `/benefits` | 혜택 | 비즈니스 이벤트/할인 정보 |
| `/chat` | 채팅 목록 | 채팅방 리스트 + 미읽 뱃지 |
| `/chat/:roomId` | 채팅방 | 실시간 1:1/그룹 채팅 |
| `/admin` | 관리자 | 통계 + 유저관리 + 신고처리 |

---

## 라이선스

이 프로젝트는 비공개 저장소로 관리됩니다.

---

<p align="center">
  <b>혼밥친구</b> — 백석대학교 익명 공강 시간 밥 매칭 플랫폼<br>
  Made By Ham YeongUk
</p>
