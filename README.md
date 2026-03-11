# 🎓 캠퍼스 데이트 (Campus Date)

> 백석대학교 재학생 전용 인증 소개팅 플랫폼

[![Deploy](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://bu-dating-platform.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://render.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)

---

## 📋 서비스 소개

캠퍼스 데이트는 **백석대학교(@bu.ac.kr) 이메일 인증** 기반의 소개팅 플랫폼입니다.
1:1 소개팅부터 N:N 과팅까지, 학교 인증된 사용자만 참여할 수 있는 안전한 만남의 공간을 제공합니다.

### 핵심 기능

- **학교 이메일 인증** — `@bu.ac.kr` 도메인만 허용하는 Google OAuth 로그인
- **1:1 소개팅 & N:N 과팅** — 게시물 기반 매칭 시스템
- **실시간 채팅** — Socket.io 기반 1:1/그룹 채팅 + 읽음 표시
- **익명 모드** — 프로필 비공개 옵션으로 부담 없는 소통
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
| Firebase SDK | Google OAuth |

### Backend

| 기술 | 용도 |
|------|------|
| Node.js + Express | REST API 서버 |
| MongoDB + Mongoose | 데이터베이스 |
| Socket.io | WebSocket 서버 |
| JWT (jsonwebtoken) | 토큰 인증 |
| Cloudinary | 이미지 업로드/CDN |
| Firebase Admin SDK | OAuth 토큰 검증 |
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
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── components/          # 공통 컴포넌트
│   │   │   ├── BottomNav.jsx    # 하단 네비게이션 (glass effect)
│   │   │   ├── Layout.jsx       # 레이아웃 래퍼
│   │   │   ├── PostCard.jsx     # 게시물 카드
│   │   │   ├── Skeleton.jsx     # 로딩 스켈레톤 UI
│   │   │   ├── EmptyState.jsx   # 빈 상태 화면
│   │   │   ├── PageTransition.jsx # 페이지 전환 애니메이션
│   │   │   └── ConfirmModal.jsx # 확인 모달
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # 인증 상태 관리
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx    # 로그인
│   │   │   ├── MainFeedPage.jsx # 메인 피드
│   │   │   ├── PostDetailPage.jsx # 게시물 상세
│   │   │   ├── PostCreatePage.jsx # 게시물 작성
│   │   │   ├── ChatListPage.jsx # 채팅 목록
│   │   │   ├── ChatPage.jsx     # 채팅방
│   │   │   ├── ProfilePage.jsx  # 프로필 편집
│   │   │   └── AdminPage.jsx    # 관리자 대시보드
│   │   ├── services/
│   │   │   └── api.js           # Axios API 클라이언트
│   │   └── config/
│   │       └── firebase.js      # Firebase 초기화
│   └── vercel.json              # Vercel 배포 설정
│
├── backend/                     # Express API 서버
│   ├── src/
│   │   ├── models/              # Mongoose 스키마
│   │   │   ├── User.js
│   │   │   ├── Post.js
│   │   │   ├── Room.js
│   │   │   ├── Message.js
│   │   │   └── Report.js
│   │   ├── controllers/         # 비즈니스 로직
│   │   ├── routes/              # API 라우트
│   │   ├── middleware/          # 인증/업로드 미들웨어
│   │   ├── socket/              # Socket.io 핸들러
│   │   └── config/
│   │       ├── db.js            # MongoDB 연결
│   │       ├── firebase.js      # Firebase Admin SDK
│   │       └── cloudinary.js    # Cloudinary 설정
│   └── server.js                # 서버 진입점
│
└── README.md
```

---

## 🗄 데이터 모델

### User

```javascript
{
  firebaseUid, email, name,        // 인증 정보
  department, studentId,            // 학교 정보
  gender, mbti, height, bio,        // 프로필
  interests: [String],              // 관심사
  profileImage,                     // 프로필 이미지 URL
  isAnonymous: Boolean,             // 익명 모드
  profileComplete: Boolean,         // 프로필 완성 여부
  role: 'user' | 'admin',          // 권한
  status: 'active' | 'suspended'    // 계정 상태
}
```

### Post

```javascript
{
  author: ObjectId → User,
  title, description,
  type: 'direct' | 'group',        // 1:1 or N:N
  participantsCount: Number,        // 과팅 인원수
  genderPreference: 'male' | 'female' | 'any',
  images: [String],                 // Cloudinary URLs
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

### Report (신고)

```javascript
{
  reporter: User,
  reportedUser: User,
  reportedPost: Post,
  reason: 'spam' | 'inappropriate' | 'harassment' | 'fake_profile' | 'underage' | 'other',
  status: 'pending' | 'reviewed' | 'resolved'
}
```

---

## 🔐 인증 흐름

```
사용자 → Google OAuth (Firebase) → Firebase ID Token
  → Backend POST /api/auth/google (토큰 검증)
    → @bu.ac.kr 도메인 체크
    → User upsert (findOne + create/update)
    → JWT 발급 (7일) → 프론트엔드 localStorage 저장
    → 이후 모든 API: Authorization: Bearer <JWT>
```

- **도메인 제한**: `ALLOWED_EMAIL_DOMAIN=bu.ac.kr` 환경변수로 제어
- **관리자 우회**: `ADMIN_EMAILS` 환경변수에 등록된 이메일은 도메인 제한 없이 로그인 가능
- **토큰 관리**: JWT를 localStorage에 저장, Axios 인터셉터로 자동 헤더 첨부
- **프로필 미완성 시**: 로그인 후 자동으로 `/profile` 페이지로 리다이렉트

---

## 💬 실시간 채팅 시스템

```
클라이언트 A                    서버                     클라이언트 B
    |                           |                           |
    |-- send_message ---------->|                           |
    |                           |-- new_message ----------->|
    |                           |                           |
    |                           |<-- read_messages ---------|
    |<-- messages_read ---------|                           |
```

### Socket.io 이벤트

| 이벤트 | 방향 | 설명 |
|--------|------|------|
| `join_room` | 클→서 | 채팅방 입장 |
| `leave_room` | 클→서 | 채팅방 퇴장 |
| `send_message` | 클→서 | 메시지 전송 |
| `new_message` | 서→클 | 새 메시지 수신 |
| `read_messages` | 클→서 | 메시지 읽음 처리 |
| `messages_read` | 서→클 | 읽음 상태 업데이트 |
| `room_updated` | 서→클 | 채팅방 정보 갱신 |
| `typing` / `user_typing` | 양방향 | 타이핑 표시 |

### 채팅 특징

- **1:1 채팅**: 게시물 작성자에게 DM (중복 방지: 기존 방 반환)
- **그룹 채팅**: 과팅 게시물 참여 시 자동 그룹방 생성/참여
- **읽음 표시**: `readBy` 배열 기반, `done`/`done_all` 아이콘으로 시각화
- **미읽 뱃지**: BottomNav 채팅 아이콘에 총 미읽 수 표시

---

## 🎨 UI/UX 디자인

### 디자인 컨셉 — "Coral Glass"

Tinder/Bumble 스타일의 모던 데이팅 앱 UI

### 컬러 시스템

| 토큰 | 값 | 용도 |
|------|-----|------|
| `primary` | `#FF6B81` | 메인 코랄 핑크 |
| `accent` | `#FF9278` | 그라데이션 끝점 |
| `coral-gradient` | `#FF6B81 → #FF9278` | CTA 버튼, 채팅 버블 |
| `background-light` | `#fdf6f0` | 라이트 모드 배경 |
| `background-dark` | `#1a0a0e` | 다크 모드 배경 |

### 디자인 요소

- **Glass Morphism**: `backdrop-blur(20px)` + 반투명 배경 (헤더, 네비게이션)
- **Rounded**: 카드 `rounded-3xl`, 버튼/입력 `rounded-2xl`
- **그림자**: `shadow-card`, `shadow-card-hover`, `shadow-nav`
- **애니메이션**: 페이지 전환 (fade + slide), 스켈레톤 shimmer, 버튼 press scale
- **다크 모드**: Tailwind `dark:` 클래스 전체 지원
- **스켈레톤 UI**: Render 콜드 스타트(~90초) 대비 로딩 UX

---

## 📡 API 엔드포인트

### 인증

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/google` | Google OAuth 로그인/회원가입 |

### 게시물

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/posts` | 게시물 목록 (필터/페이지네이션) |
| POST | `/api/posts` | 게시물 작성 (multipart/form-data) |
| GET | `/api/posts/:id` | 게시물 상세 |
| PUT | `/api/posts/:id` | 게시물 수정 |
| DELETE | `/api/posts/:id` | 게시물 삭제 (작성자만) |
| POST | `/api/posts/:id/like` | 좋아요 토글 |

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
| GET | `/api/users/me` | 내 정보 조회 |
| PUT | `/api/users/profile` | 프로필 수정 |
| POST | `/api/users/profile-image` | 프로필 이미지 업로드 |

### 신고

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/reports` | 신고 접수 |

### 관리자 (Admin Only)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/admin/stats` | 대시보드 통계 |
| GET | `/api/admin/users` | 유저 목록 (검색/필터) |
| PUT | `/api/admin/users/:id/role` | 권한 변경 |
| PUT | `/api/admin/users/:id/status` | 정지/활성화 |
| GET | `/api/admin/reports` | 신고 목록 |
| PUT | `/api/admin/reports/:id` | 신고 처리 |
| GET | `/api/admin/activity` | 최근 활동 타임라인 |

---

## 🛡 보안

- **이메일 도메인 강제**: `@bu.ac.kr`만 허용 (서버 측 검증)
- **JWT 인증**: 모든 API 요청에 토큰 검증
- **파일 업로드 제한**: jpg/jpeg/png만 허용, 5MB 제한
- **Rate Limiting**: 인증 20회/15분, 게시물 10회/1시간
- **CORS**: 지정된 클라이언트 URL만 허용
- **Helmet**: HTTP 보안 헤더 자동 설정
- **계정 정지 자동 만료**: 정지 기간 이후 자동 해제

---

## 🚀 실행 방법

### 사전 요구사항

- Node.js 18+
- MongoDB Atlas 계정 (또는 로컬 MongoDB)
- Firebase 프로젝트 (Google OAuth 설정)
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
MAX_FILE_SIZE=5242880
```

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
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

> **참고**: Render Free tier는 비활성 시 ~90초 콜드 스타트가 발생합니다. 프론트엔드에 스켈레톤 UI를 적용하여 로딩 UX를 개선했습니다.

---

## 📱 페이지 구성

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/login` | 로그인 | Google OAuth 인증 |
| `/` | 메인 피드 | 게시물 카드 목록 + 필터 |
| `/profile` | 프로필 | 프로필 편집 + 익명모드 |
| `/create-post` | 게시물 작성 | 이미지 업로드 + 타입 선택 |
| `/posts/:id` | 게시물 상세 | 이미지 슬라이더 + 채팅 CTA |
| `/posts/:id/edit` | 게시물 수정 | 기존 데이터 편집 |
| `/chat` | 채팅 목록 | 채팅방 리스트 + 미읽 뱃지 |
| `/chat/:roomId` | 채팅방 | 실시간 1:1/그룹 채팅 |
| `/admin` | 관리자 | 통계 + 유저관리 + 신고처리 |

---

## 📄 라이선스

이 프로젝트는 학교 프로젝트용으로 제작되었습니다.

---

<p align="center">
  <b>캠퍼스 데이트</b> — 백석대학교 인증 소개팅 플랫폼<br>
  Made By Ham YeongUk
</p>
