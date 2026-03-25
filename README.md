# 🍚 혼밥친구 (HonBab Chingu)

> 백석대학교 재학생 전용 공강 시간 밥 매칭 플랫폼

[![Deploy](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://bu-eating.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://render.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)

---

## 📋 서비스 소개

혼밥친구는 **백석대학교(@bu.ac.kr) 이메일 인증** 기반의 공강 시간 밥 매칭 플랫폼입니다.
공강 시간표와 음식 취향을 기반으로 같이 밥 먹을 친구를 찾아주는 서비스입니다.

### 핵심 기능

- **공강 시간 매칭** — 5x9 시간표 기반, 현재 공강인 친구를 자동 추천
- **메뉴 취향 매칭** — 한식/중식/일식/양식/치킨/피자/분식/카페/맥주/소주 중 겹치는 메뉴로 매칭 점수 산정
- **밥약속 게시판** — 메뉴 카테고리(복수 선택) + 식사 시간(아침/점심/저녁/야식)으로 약속 올리기
- **실시간 채팅** — Socket.io 기반 1:1/그룹 채팅 + 읽음 표시
- **학교 이메일 인증** — `@bu.ac.kr` 도메인만 허용하는 Google OAuth 로그인
- **인앱 브라우저 대응** — Instagram/에브리타임 등 인앱 브라우저 감지 + 외부 브라우저 유도
- **푸시 알림** — FCM + Browser Notification API로 새 메시지 알림
- **PWA 지원** — 홈 화면 추가, iOS/Android 설치 배너
- **익명 모드** — 프로필 비공개 옵션
- **관리자 대시보드** — 유저 관리, 신고 처리, 통계 조회

---

## 🛠 기술 스택

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

## 📁 프로젝트 구조

```
campus-date/
├── frontend/                    # React SPA (PWA)
│   ├── src/
│   │   ├── components/
│   │   │   ├── BottomNav.jsx    # 하단 네비게이션
│   │   │   ├── PostCard.jsx     # 게시물 카드 (2열 그리드)
│   │   │   ├── TimetableSelector.jsx # 에브리타임 스타일 시간표 입력
│   │   │   ├── Skeleton.jsx     # 로딩 스켈레톤 UI
│   │   │   ├── EmptyState.jsx   # 빈 상태 화면
│   │   │   ├── PageTransition.jsx # 페이지 전환 애니메이션
│   │   │   └── ConfirmModal.jsx # 확인 모달
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # 인증 + 알림 상태 관리
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx    # 로그인 + 인앱 브라우저 탈출 안내
│   │   │   ├── MainFeedPage.jsx # 메인 피드 (2열 그리드 + 공강 매칭)
│   │   │   ├── CreatePostPage.jsx # 밥약속 작성 (메뉴 복수선택 + 시간대)
│   │   │   ├── PostDetailPage.jsx # 게시물 상세
│   │   │   ├── ChatListPage.jsx # 채팅 목록
│   │   │   ├── ChatPage.jsx     # 채팅방
│   │   │   ├── ProfilePage.jsx  # 프로필 (시간표 + 음식 취향)
│   │   │   └── AdminPage.jsx    # 관리자 대시보드
│   │   └── services/
│   │       ├── api.js           # Axios API 클라이언트
│   │       ├── firebase.js      # Firebase 초기화
│   │       ├── notification.js  # FCM + 브라우저 알림
│   │       └── socket.js        # Socket.io 클라이언트
│   ├── public/
│   │   ├── manifest.json        # PWA 매니페스트
│   │   └── firebase-messaging-sw.js # FCM 서비스 워커
│   └── vercel.json              # Vercel 배포 설정
│
├── backend/                     # Express API 서버
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js          # 시간표(5x9) + 음식취향 + 식사스타일
│   │   │   ├── Post.js          # 메뉴카테고리(배열) + 식사시간
│   │   │   ├── Room.js
│   │   │   ├── Message.js
│   │   │   └── Report.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── postController.js
│   │   │   ├── userController.js
│   │   │   ├── chatController.js
│   │   │   ├── matchController.js # KST 기반 공강 매칭 알고리즘
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

## 🗄 데이터 모델

### User

```javascript
{
  email, name, googleId,              // 인증 정보
  department, studentId,              // 학교 정보
  gender, mbti, height, bio,          // 프로필
  timetable: Boolean[5][9],           // 공강 시간표 (월~금, 1~9교시)
  foodPreferences: [String],          // 선호 메뉴 (복수)
  diningStyle: 'quiet' | 'chatty',   // 식사 스타일
  profileImage,                       // 프로필 이미지 URL
  isAnonymous: Boolean,              // 익명 모드
  profileComplete: Boolean,           // 프로필 완성 여부 (학과 + 시간표 필수)
  role: 'user' | 'admin',
  status: 'active' | 'suspended'
}
```

### Post

```javascript
{
  author: ObjectId → User,
  title, description,
  menuCategory: [String],             // 복수 선택: korean, chinese, japanese, western,
                                      //   cafe, chicken, pizza, snack, beer, soju, other
  mealTime: 'breakfast' | 'lunch' | 'dinner' | 'late_night',
  participantsCount: 2 | 3 | 4,
  genderPreference: 'male' | 'female' | 'any',
  images: [String],                   // Cloudinary URLs
  isAnonymous: Boolean,
  likes: [ObjectId → User]
}
```

### Room & Message

```javascript
// Room (채팅방)
{ type: 'direct' | 'group', participants: [User], relatedPost: Post }

// Message (메시지)
{ room: Room, sender: User, content: String, readBy: [User] }
```

---

## 🔍 공강 매칭 알고리즘

```
현재 KST 시간 → 요일(월~금) + 교시(1~9) 계산
  → User.timetable[요일][교시] === true 인 유저 필터
  → 내 foodPreferences와 겹치는 메뉴 수로 정렬
  → 상위 매칭 유저 반환

* 주말: 모든 유저 공강 취급
* 18시 이후: "🍺 술 한잔?" 뱃지 표시
```

---

## 🔐 인증 흐름

```
사용자 → Google OAuth (Firebase) → Firebase ID Token
  → Backend POST /api/auth/google (토큰 검증)
    → @bu.ac.kr 도메인 체크
    → User upsert
    → JWT 발급 (7일) → localStorage 저장
    → 이후 모든 API: Authorization: Bearer <JWT>
```

- **인앱 브라우저 감지**: Instagram/에브리타임/카카오톡 등 UA 감지 → 외부 브라우저 유도 안내
- **Android 자동 탈출**: `intent://` 스키마로 Chrome 자동 실행
- **프로필 미완성 시**: 학과 입력 + 공강 시간표 설정 완료까지 `/profile`로 리다이렉트

---

## 💬 실시간 채팅 시스템

### Socket.io 이벤트

| 이벤트 | 방향 | 설명 |
|--------|------|------|
| `join_room` | 클→서 | 채팅방 입장 |
| `leave_room` | 클→서 | 채팅방 퇴장 |
| `send_message` | 클→서 | 메시지 전송 |
| `new_message` | 서→클 | 새 메시지 수신 |
| `read_messages` | 클→서 | 메시지 읽음 처리 |
| `messages_read` | 서→클 | 읽음 상태 업데이트 |
| `room_updated` | 서→클 | 채팅방 정보 갱신 + 브라우저 알림 |
| `typing` / `user_typing` | 양방향 | 타이핑 표시 |

---

## 🎨 UI/UX 디자인

### 디자인 컨셉 — "Warm Orange"

따뜻한 오렌지 톤의 모바일 최적화 UI

### 컬러 시스템

| 토큰 | 값 | 용도 |
|------|-----|------|
| `primary` | `#FF8C00` | 메인 오렌지 |
| `accent` | `#FF6B81` | 그라데이션 핑크 |
| `background-light` | `#FFFAF5` | 라이트 모드 배경 |
| `background-dark` | `#1A0F05` | 다크 모드 배경 |

### 주요 UI 특징

- **2열 인스타그램 스타일 그리드** — 게시물 카드 컴팩트 레이아웃
- **에브리타임 스타일 시간표** — 교시 + 시간 표시, 점심 피크타임 뱃지
- **저녁+술 네온 효과** — 저녁/야식 + 맥주/소주 조합 시 보라색 글로우 테두리
- **Glass Morphism** — `backdrop-blur` 헤더/네비게이션
- **다크 모드** — Tailwind `dark:` 클래스 전체 지원
- **스켈레톤 UI** — Render 콜드 스타트(~90초) 대비 로딩 UX
- **Pull-to-Refresh** — 메인 피드 터치 새로고침

---

## 📡 API 엔드포인트

### 인증

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/google` | Google OAuth 로그인/회원가입 |
| GET | `/api/auth/me` | 내 정보 조회 (전체 프로필) |

### 게시물

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/posts` | 게시물 목록 (페이지네이션) |
| POST | `/api/posts` | 밥약속 작성 (메뉴 복수선택 + 시간대) |
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
| GET | `/api/chat/unread-count` | 총 미읽 메시지 수 |

### 사용자

| Method | Endpoint | 설명 |
|--------|----------|------|
| PUT | `/api/users/profile` | 프로필 수정 |
| POST | `/api/users/profile-image` | 프로필 이미지 업로드 |
| GET | `/api/users/:id` | 사용자 공개 프로필 |

### 관리자

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/admin/stats` | 대시보드 통계 |
| GET | `/api/admin/users` | 유저 목록 |
| GET | `/api/admin/activity` | 최근 활동 |
| DELETE | `/api/admin/posts/:id` | 게시물 삭제 |

---

## 🛡 보안

- **이메일 도메인 강제**: `@bu.ac.kr`만 허용 (서버 측 검증)
- **JWT 인증**: 모든 API 요청에 토큰 검증
- **인앱 브라우저 감지**: Google OAuth 차단 방지를 위한 외부 브라우저 유도
- **파일 업로드 제한**: jpg/jpeg/png만 허용, 5MB 제한
- **Rate Limiting**: 인증 20회/15분, 게시물 10회/1시간
- **CORS**: 지정된 클라이언트 URL만 허용
- **Helmet**: HTTP 보안 헤더 자동 설정

---

## 🚀 실행 방법

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

## 🏗 배포

### Frontend — Vercel

1. GitHub 연동 → 자동 배포
2. Root Directory: `frontend/`
3. `vercel.json`에 API 프록시 리라이트 포함

### Backend — Render

1. GitHub 연동 → Web Service 생성
2. Root Directory: `backend/`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. 환경변수는 Render 대시보드에서 설정

> **참고**: Render Free tier는 비활성 시 ~90초 콜드 스타트가 발생합니다. 스켈레톤 UI + 서버 ping으로 UX를 개선했습니다.

---

## 📱 페이지 구성

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/login` | 로그인 | Google OAuth + 인앱 브라우저 탈출 안내 |
| `/` | 메인 피드 | 2열 그리드 게시물 + 공강 매칭 슬라이더 |
| `/profile` | 프로필 | 시간표 입력 + 음식 취향 + 식사 스타일 |
| `/create-post` | 밥약속 작성 | 메뉴 복수선택 + 시간대 + 이미지 업로드 |
| `/posts/:id` | 게시물 상세 | 이미지 슬라이더 + 채팅 CTA |
| `/posts/:id/edit` | 게시물 수정 | 기존 데이터 편집 |
| `/chat` | 채팅 목록 | 채팅방 리스트 + 미읽 뱃지 |
| `/chat/:roomId` | 채팅방 | 실시간 1:1/그룹 채팅 |
| `/admin` | 관리자 | 통계 + 유저관리 + 신고처리 |

---

## 📄 라이선스

이 프로젝트는 비공개 저장소로 관리됩니다.

---

<p align="center">
  <b>🍚 혼밥친구</b> — 백석대학교 공강 시간 밥 매칭 플랫폼<br>
  Made By Ham YeongUk
</p>
