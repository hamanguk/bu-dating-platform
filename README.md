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
- **공강 시간 매칭** — 5x9 시간표 기반, 현재 공강인 친구를 자동 추천
- **메뉴 취향 매칭** — 한식/중식/일식/양식/치킨/피자/분식/카페/맥주/소주 중 겹치는 메뉴로 점수 산정
- **밥약속 게시판** — 메뉴 카테고리(복수 선택) + 식사 시간(아침/점심/저녁/야식), 사진은 선택 사항
- **사진 없는 게시물 UI** — 메뉴별 그라데이션 배경 + 이모지로 예쁜 카드 자동 생성
- **저녁+술 네온 테마** — 저녁/야식 + 맥주/소주 조합 시 보라색 글로우 효과 자동 적용
- **실시간 채팅** — Socket.io 기반 1:1/그룹 채팅 + 읽음 표시 + 채팅방 나가기(시스템 메시지)
- **학교 이메일 인증** — `@bu.ac.kr` 도메인만 허용하는 Google OAuth 로그인
- **인앱 브라우저 대응** — 카카오톡/인스타/에타 등 앱별 분기 처리 (카톡 iOS는 소프트 팁, 나머지는 모달)
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
│   │   │   ├── BottomNav.jsx    # 하단 네비게이션
│   │   │   ├── PostCard.jsx     # 게시물 카드 (사진/그라데이션 분기)
│   │   │   ├── ProtectedRoute.jsx # 인증 + 닉네임 가드
│   │   │   ├── TimetableSelector.jsx # 에브리타임 스타일 시간표 입력
│   │   │   ├── Skeleton.jsx     # 로딩 스켈레톤 UI
│   │   │   ├── EmptyState.jsx   # 빈 상태 화면
│   │   │   └── PageTransition.jsx # 페이지 전환 애니메이션
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # 인증 + 알림 상태 관리
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx    # 로그인 + 앱별 인앱 브라우저 분기 처리
│   │   │   ├── MainFeedPage.jsx # 메인 피드 (2열 그리드 + 공강 매칭)
│   │   │   ├── CreatePostPage.jsx # 밥약속 작성 (사진 선택, 미리보기)
│   │   │   ├── PostDetailPage.jsx # 게시물 상세 (이미지/그라데이션 폴백)
│   │   │   ├── ChatListPage.jsx # 채팅 목록 (실시간 업데이트)
│   │   │   ├── ChatPage.jsx     # 채팅방 (나가기 메뉴 + 확인 모달)
│   │   │   ├── ProfilePage.jsx  # 프로필 (닉네임 + MBTI + 성별 + 시간표)
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
│   │   │   ├── User.js          # 닉네임 + 시간표(5x9) + 음식취향
│   │   │   ├── Post.js          # 메뉴카테고리(배열) + 식사시간
│   │   │   ├── Room.js
│   │   │   ├── Message.js
│   │   │   └── Report.js
│   │   ├── controllers/
│   │   │   ├── authController.js    # 구글 로그인 + 닉네임 포함 응답
│   │   │   ├── postController.js    # 닉네임+MBTI+성별만 populate
│   │   │   ├── userController.js    # 랜덤 닉네임 생성 + 중복 확인
│   │   │   ├── chatController.js    # 채팅방 CRUD + 나가기 (시스템 메시지 + 소켓 브로드캐스트)
│   │   │   ├── matchController.js   # KST 기반 공강 매칭 알고리즘
│   │   │   └── adminController.js
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── socket/
│   │   └── config/
│   └── server.js
│
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
  timetable: Boolean[5][9],           // 공강 시간표 (월~금, 1~9교시)
  foodPreferences: [String],          // 선호 메뉴 (복수)
  diningStyle: 'quiet' | 'chatty',   // 식사 스타일
  profileComplete: Boolean,           // 프로필 완성 여부 (시간표 필수)
  role: 'user' | 'admin'
}
```

### Post

```javascript
{
  author: ObjectId -> User,
  title, description,
  menuCategory: [String],             // 복수 선택: korean, chinese, japanese, western,
                                      //   cafe, chicken, pizza, snack, beer, soju, other
  mealTime: 'breakfast' | 'lunch' | 'dinner' | 'late_night',
  participantsCount: 2 | 3 | 4,
  genderPreference: 'male' | 'female' | 'any',
  images: [String],                   // 선택 사항 — 없으면 메뉴별 그라데이션 폴백
  likes: [ObjectId -> User]
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
```

- 모든 게시물, 채팅, 매칭 화면에서 `닉네임 (MBTI / 성별)` 형식으로 통일
- 닉네임 옆 "백석대 인증" 뱃지로 신뢰도 확보
- 닉네임 미설정 시 "배고픈 백석인", "졸린 대학생" 등 랜덤 닉네임 자동 부여

---

## 공강 매칭 알고리즘

```
현재 KST 시간 -> 요일(월~금) + 교시(1~9) 계산
  -> User.timetable[요일][교시] === true 인 유저 필터
  -> 내 foodPreferences와 겹치는 메뉴 수로 정렬
  -> 상위 매칭 유저 반환

* 주말: 모든 유저 공강 취급
* 18시 이후: 술 한잔? 뱃지 표시
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

## 게시물 카드 디자인

### 사진 있는 게시물
- 4:3 비율 커버 이미지 + 하단 그라데이션 오버레이
- 메뉴 이모지 뱃지 + 좋아요 버튼

### 사진 없는 게시물
- 이미지 영역 없이 카드 전체를 오렌지-핑크 그라데이션 배경으로 채움
- 제목을 크게 + 메뉴 이모지 포인트 + 설명 2줄 노출
- 저녁+술 조합 시 보라색 네온 그라데이션으로 자동 전환

---

## 실시간 채팅 시스템

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

### 주요 UI 특징

- **2열 인스타그램 스타일 그리드** -- 게시물 카드 컴팩트 레이아웃
- **에브리타임 스타일 시간표** -- 교시 + 시간 표시, 점심 피크타임 뱃지
- **메뉴별 그라데이션 카드** -- 사진 없는 게시물에 메뉴 카테고리별 배경색 자동 적용
- **저녁+술 네온 효과** -- 저녁/야식 + 맥주/소주 조합 시 보라색 글로우 테두리
- **상단 고정 밥약속 버튼** -- "오늘 밥 약속 제안하기" sticky 버튼
- **Glass Morphism** -- `backdrop-blur` 헤더/네비게이션
- **다크 모드** -- Tailwind `dark:` 클래스 전체 지원
- **스켈레톤 UI** -- Render 콜드 스타트(~90초) 대비 로딩 UX
- **Pull-to-Refresh** -- 메인 피드 터치 새로고침
- **익명 아이콘** -- 프로필 사진 대신 그라데이션 아이콘으로 통일

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
| GET | `/api/posts` | 게시물 목록 (페이지네이션) |
| POST | `/api/posts` | 밥약속 작성 (사진 선택 사항) |
| GET | `/api/posts/:id` | 게시물 상세 |
| PUT | `/api/posts/:id` | 게시물 수정 |
| DELETE | `/api/posts/:id` | 게시물 삭제 |
| POST | `/api/posts/:id/like` | 좋아요 토글 |

### 매칭

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/users/match` | 현재 공강인 친구 매칭 (시간표 + 메뉴 취향) |

### 채팅

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/chat/rooms` | 채팅방 생성/조회 |
| GET | `/api/chat/rooms` | 내 채팅방 목록 |
| GET | `/api/chat/rooms/:id/messages` | 메시지 조회 |
| POST | `/api/chat/rooms/:id/leave` | 채팅방 나가기 (시스템 메시지 + 실시간 알림) |
| GET | `/api/chat/unread-count` | 총 미읽 메시지 수 |

### 사용자

| Method | Endpoint | 설명 |
|--------|----------|------|
| PUT | `/api/users/profile` | 프로필 수정 (닉네임/MBTI/성별/시간표 등) |
| GET | `/api/users/check-nickname` | 닉네임 중복 확인 |
| GET | `/api/users/:id` | 사용자 공개 프로필 (닉네임/MBTI/성별만) |

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
| `/` | 메인 피드 | 2열 그리드 게시물 + 공강 매칭 슬라이더 + 밥약속 제안 버튼 |
| `/profile` | 프로필 | 닉네임 설정 + MBTI/성별 + 시간표 + 음식 취향 |
| `/create-post` | 밥약속 작성 | 메뉴 복수선택 + 시간대 + 이미지(선택) + 미리보기 |
| `/posts/:id` | 게시물 상세 | 이미지 또는 그라데이션 헤더 + 채팅 CTA |
| `/posts/:id/edit` | 게시물 수정 | 기존 데이터 편집 |
| `/chat` | 채팅 목록 | 채팅방 리스트 + 미읽 뱃지 |
| `/chat/:roomId` | 채팅방 | 실시간 1:1/그룹 채팅 |
| `/admin` | 관리자 | 통계 + 유저관리 + 신고처리 |

---

## 라이선스

이 프로젝트는 비공개 저장소로 관리됩니다.

---

<p align="center">
  <b>혼밥친구</b> -- 백석대학교 익명 공강 시간 밥 매칭 플랫폼<br>
  Made By Ham YeongUk
</p>
