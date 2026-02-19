# 캠퍼스 데이트 — 학교 인증 소개팅/과팅 플랫폼

> **@bu.ac.kr 이메일 인증 기반**의 대학생 전용 소개팅 웹 플랫폼

---

## 🔐 인증 구조 (Firebase Admin SDK 방식 선택 이유)

두 가지 방식을 비교한 결과 **Firebase Admin SDK 방식**을 선택했습니다.

| 항목 | Firebase Admin SDK (선택) | Google OAuth 직접 처리 |
|---|---|---|
| 구현 복잡도 | 낮음 (클라이언트 → Firebase → 서버) | 높음 (서버에서 OAuth 콜백 직접 구현) |
| 토큰 보안 | Firebase가 단기 ID 토큰 자동 관리 | Refresh 토큰 직접 관리 필요 |
| 기존 Firebase 연동 | ✅ 기존 프로젝트 그대로 사용 | Firebase 불필요 |
| 이메일 도메인 강제 | 서버에서 검증 (안전) | 동일 |

**흐름:**
```
클라이언트 (Firebase Google 로그인)
    → Firebase ID 토큰 발급
    → POST /api/auth/google { idToken }
    → 서버: Firebase Admin SDK로 토큰 검증
    → @bu.ac.kr 도메인 확인
    → MongoDB 사용자 저장/조회
    → 자체 JWT 발급 (7일)
    → 이후 모든 API: Authorization: Bearer <JWT>
```

---

## 📦 기술 스택

**Backend**
- Node.js v20+ / Express
- MongoDB + Mongoose
- Firebase Admin SDK (토큰 검증)
- JWT (세션 관리)
- Socket.io (실시간 채팅)
- Multer (이미지 업로드)
- express-rate-limit, helmet, cors

**Frontend**
- React 18 + Vite
- React Router v6
- Tailwind CSS
- Firebase SDK (클라이언트 Google 로그인)
- Socket.io-client
- Axios

---

## 📁 프로젝트 구조

```
campus-date/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB 연결
│   │   │   └── firebase.js        # Firebase Admin SDK 초기화
│   │   ├── controllers/
│   │   │   ├── authController.js  # Google 로그인, JWT 발급
│   │   │   ├── userController.js  # 프로필 관리
│   │   │   ├── postController.js  # 게시물 CRUD
│   │   │   ├── chatController.js  # 채팅방 생성/조회
│   │   │   ├── reportController.js# 신고 접수
│   │   │   └── adminController.js # 관리자 기능
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT 인증, 관리자 검사
│   │   │   ├── rateLimiter.js     # Rate limiting
│   │   │   └── upload.js          # Multer 파일 업로드
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Post.js
│   │   │   ├── ChatRoom.js
│   │   │   ├── Message.js
│   │   │   └── Report.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── posts.js
│   │   │   ├── chat.js
│   │   │   ├── reports.js
│   │   │   └── admin.js
│   │   └── socket/
│   │       └── chatSocket.js      # Socket.io 실시간 채팅
│   ├── uploads/                   # 업로드된 이미지 저장
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── BottomNav.jsx
    │   │   ├── PostCard.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── MainFeedPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── CreatePostPage.jsx
    │   │   ├── PostDetailPage.jsx
    │   │   ├── ChatListPage.jsx
    │   │   ├── ChatPage.jsx
    │   │   └── AdminPage.jsx
    │   ├── services/
    │   │   ├── api.js             # Axios API 호출
    │   │   ├── firebase.js        # Firebase 클라이언트 설정
    │   │   └── socket.js          # Socket.io 클라이언트
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## ⚙️ 환경 설정

### 1. Firebase 설정

**클라이언트 (frontend/.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

**서버 (backend/.env):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/campus-date
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
CLIENT_URL=http://localhost:5173
ALLOWED_EMAIL_DOMAIN=bu.ac.kr
MAX_FILE_SIZE=5242880
```

**Firebase Admin SDK 키 발급 방법:**
1. Firebase Console → Project Settings
2. Service Accounts 탭
3. "Generate new private key" 클릭
4. 다운로드된 JSON에서 `project_id`, `private_key`, `client_email` 복사

---

## 🚀 실행 방법

### 1. MongoDB 실행
```bash
# MongoDB가 설치된 경우
mongod

# 또는 MongoDB Atlas 사용 (MONGODB_URI를 Atlas URI로 변경)
```

### 2. 백엔드 실행
```bash
cd backend
cp .env.example .env
# .env 파일에 Firebase 키 및 MongoDB URI 입력

npm install
npm run dev    # nodemon으로 개발 서버 실행
# 또는
npm start      # 프로덕션 실행
```

### 3. 프론트엔드 실행
```bash
cd frontend
cp .env.example .env
# .env 파일에 Firebase 웹 앱 설정 입력

npm install
npm run dev    # Vite 개발 서버 (http://localhost:5173)
```

---

## 🗺️ API 엔드포인트

### 인증
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/google` | Firebase ID 토큰으로 로그인 |
| GET | `/api/auth/me` | 내 정보 조회 |
| POST | `/api/auth/logout` | 로그아웃 |

### 사용자
| 메서드 | 경로 | 설명 |
|--------|------|------|
| PUT | `/api/users/profile` | 프로필 수정 |
| POST | `/api/users/profile-image` | 프로필 이미지 업로드 |
| GET | `/api/users/:id` | 사용자 공개 프로필 조회 |

### 게시물
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/posts` | 게시물 목록 (`?type=one\|group&page=1`) |
| GET | `/api/posts/:id` | 게시물 상세 |
| POST | `/api/posts` | 게시물 작성 (multipart/form-data) |
| DELETE | `/api/posts/:id` | 게시물 삭제 (작성자만) |
| POST | `/api/posts/:id/like` | 좋아요 토글 |

### 채팅
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/chat/room` | 채팅방 생성/조회 |
| GET | `/api/chat/rooms` | 내 채팅방 목록 |
| GET | `/api/chat/rooms/:roomId/messages` | 메시지 목록 |

### Socket.io 이벤트
| 이벤트 | 방향 | 설명 |
|--------|------|------|
| `join_room` | 클→서 | 채팅방 입장 |
| `leave_room` | 클→서 | 채팅방 퇴장 |
| `send_message` | 클→서 | 메시지 전송 |
| `new_message` | 서→클 | 새 메시지 수신 |
| `typing` | 클→서 | 타이핑 중 |
| `user_typing` | 서→클 | 상대방 타이핑 표시 |

---

## 🛡 보안 기능

- **이메일 도메인 강제**: `@bu.ac.kr`만 허용 (서버 측 검증)
- **JWT 인증**: 모든 API 요청에 토큰 검증
- **파일 업로드**: jpg/jpeg/png만 허용, 5MB 제한
- **Rate Limiting**: 인증 20회/15분, 게시물 10회/1시간
- **CORS**: 지정된 클라이언트 URL만 허용
- **Helmet**: HTTP 보안 헤더 자동 설정
- **계정 정지 자동 만료**: 정지 기간 이후 자동 해제

---

## 👤 관리자 설정

MongoDB에서 특정 사용자를 관리자로 설정:

```javascript
// MongoDB Shell 또는 Compass에서 실행
db.users.updateOne(
  { email: "admin@bu.ac.kr" },
  { $set: { role: "admin" } }
)
```

---

## 📱 페이지 구성

| 경로 | 설명 |
|------|------|
| `/login` | Google 로그인 |
| `/` | 메인 피드 (게시물 목록) |
| `/profile` | 내 프로필 편집 |
| `/create-post` | 게시물 작성 |
| `/posts/:id` | 게시물 상세 + 채팅하기 |
| `/chat` | 채팅 목록 |
| `/chat/:roomId` | 실시간 채팅 |
| `/admin` | 관리자 패널 (관리자 전용) |
