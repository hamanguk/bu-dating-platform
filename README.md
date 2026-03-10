###캠퍼스 데이트 — 기술 명세서###
1. 서비스 개요
항목	내용
서비스명	캠퍼스 데이트 (Campus Date)
타겟 유저	백석대학교 재학생 (@bu.ac.kr 이메일 보유자)
핵심 가치	학교 메일 인증 기반의 신뢰할 수 있는 캠퍼스 소개팅 플랫폼
서비스 형태	모바일 우선 반응형 웹앱 (PWA-ready, max-width 480px)
핵심 기능 3가지:

1:1 소개팅 — 개인 프로필 기반 매칭 후 실시간 채팅
과팅 (N:N) — 그룹 단위 만남 모집 및 그룹 채팅
익명/실명 선택 — 사용자가 노출 수준을 직접 제어
2. 전체 기술 스택

┌─────────────────────────────────────────────────┐
│                   클라이언트                      │
│  React 18 + Vite + Tailwind CSS                  │
│  React Router v6 · Axios · Socket.io-client      │
│  Google Identity Services (OAuth)                │
│  Vercel (프론트엔드 배포)                          │
├─────────────────────────────────────────────────┤
│                    서버                           │
│  Node.js + Express.js                            │
│  Socket.io (WebSocket 실시간 통신)                │
│  JWT (jsonwebtoken) 인증                         │
│  Render.com (백엔드 배포, Free Tier)              │
├─────────────────────────────────────────────────┤
│                 데이터 & 스토리지                  │
│  MongoDB Atlas (Mongoose ODM)                    │
│  Cloudinary (이미지 업로드/CDN)                   │
└─────────────────────────────────────────────────┘
계층	기술	비고
프론트엔드	React 18, Vite, Tailwind CSS	SPA, CSR
라우팅	React Router v6	보호 라우트 (PrivateRoute)
상태 관리	React Context (AuthContext)	localStorage 캐싱으로 persistent login
HTTP 클라이언트	Axios	JWT 자동 첨부 인터셉터, 401 자동 로그아웃
실시간 통신	Socket.io	채팅, 타이핑 표시, 읽음 확인
백엔드	Node.js + Express	RESTful API + WebSocket
데이터베이스	MongoDB Atlas	Mongoose ODM
인증	Google OAuth 2.0 → 서버 JWT	학교 메일 도메인 검증
이미지	Cloudinary	multer → cloudinary 업로드 파이프라인
프론트 배포	Vercel	GitHub 연동 자동 배포
백엔드 배포	Render (Free)	90초 cold start → 스켈레톤 UI로 대응
3. 데이터 아키텍처
3.1 ERD (Entity Relationship)

User ──┬── 1:N ──→ Post (author)
       ├── N:M ──→ ChatRoom (participants)
       ├── 1:N ──→ Message (sender)
       ├── 1:N ──→ Report (reporter / reportedUser)
       └── N:M ──→ Post.likes (좋아요)

Post ──── 1:1 ──→ ChatRoom (group 타입 시 postId 연결)
ChatRoom ── 1:N ──→ Message (roomId)
Post ──── 1:N ──→ Report (reportedPost)
3.2 모델 상세
User


{
  googleId, email, name, profileImage,
  department, studentId, gender, mbti, height, bio,
  interests: [String],
  isAnonymous: Boolean,
  profileComplete: Boolean,
  role: 'user' | 'admin',
  suspendedUntil: Date
}
Post


{
  author: → User,
  title, description,
  type: 'one' | 'group',
  participantsCount: Number,    // 과팅 시 N:N
  genderPreference: 'male' | 'female' | 'any',
  isAnonymous: Boolean,
  images: [String],             // Cloudinary URLs
  likes: [→ User],
  likeCount: Number
}
ChatRoom


{
  type: 'direct' | 'group',
  participants: [→ User],
  postId: → Post,              // group 타입 시
  lastMessage: { content, timestamp },
  unreadCount: Number           // 가상 필드 (aggregate)
}
Message


{
  room: → ChatRoom,
  sender: → User,
  content: String,
  readBy: [→ User],            // 읽음 확인용
  createdAt: Date
}
Report


{
  reporter: → User,
  reportedUser: → User,
  reportedPost: → Post,
  reason: 'spam' | 'inappropriate' | 'harassment' | 
          'fake_profile' | 'underage' | 'other',
  status: 'pending' | 'reviewed' | 'resolved'
}
4. 핵심 비즈니스 로직
4.1 인증 프로세스

[사용자] ─→ Google OAuth 팝업 ─→ Google ID Token 획득
                                      │
                                      ▼
[프론트] ─→ POST /api/auth/google { idToken }
                                      │
                                      ▼
[백엔드] ─→ Google Token 검증 (google-auth-library)
         ─→ 이메일 도메인 검사 (@bu.ac.kr 필수)
            ※ ADMIN_EMAILS 환경변수에 포함 시 도메인 검사 우회
         ─→ User upsert (googleId 기준)
         ─→ JWT 발급 (7일 만료)
                                      │
                                      ▼
[프론트] ─→ JWT를 localStorage 저장
         ─→ user 객체도 localStorage 캐싱 (persistent login)
         ─→ profileComplete 여부에 따라 홈 or 프로필 설정으로 이동
Persistent Login 흐름:

앱 로드 시 localStorage에서 token + user 즉시 복원 (깜빡임 없음)
백그라운드로 GET /api/auth/me 호출하여 유효성 검증
실패 시 자동 로그아웃 (401 인터셉터, /auth/me는 제외)
4.2 게시물 → 채팅 매칭 흐름

[작성자] ─→ 게시물 작성 (이미지 + 제목 + 유형 선택)
              │
              ▼
[열람자] ─→ 게시물 상세 페이지 → "채팅하기" 버튼 클릭
              │
              ├─ type === 'one' (1:1)
              │   └→ POST /api/chat/room { type: 'direct', targetUserId }
              │      → 기존 방 있으면 반환, 없으면 생성
              │
              └─ type === 'group' (과팅)
                  └→ POST /api/chat/room { type: 'group', postId }
                     → 해당 게시물의 그룹 채팅방 참여
              │
              ▼
[채팅방] ─→ Socket.io 연결
         ─→ join_room → send_message → new_message 브로드캐스트
4.3 실시간 채팅 (Socket.io)

클라이언트 이벤트 (emit)          서버 이벤트 (broadcast)
─────────────────────          ──────────────────────
join_room { roomId }      →   (방 입장 처리)
send_message { roomId,    →   new_message (방 전체)
  content }                    room_updated (참여자 개인 룸)
read_messages { roomId }  →   messages_read { userId } (방 전체)
typing { roomId,          →   user_typing { name, isTyping }
  isTyping }
leave_room { roomId }     →   (방 퇴장 처리)
읽음 확인 로직:

채팅방 입장 시 read_messages emit → 해당 방의 내 미읽 메시지 전부 readBy에 추가
새 메시지 수신 시 (상대방 메시지) 자동으로 read_messages emit
상대방에게 messages_read 이벤트 전달 → UI에서 체크마크 변경 (done → done_all)
하단 네비게이션에 총 미읽 수 뱃지 표시 (room_updated 이벤트로 실시간 갱신)
4.4 신고 시스템 & 관리자 제어

[일반 유저] ─→ 게시물 상세 → "신고" → 사유 선택 → POST /api/reports
                                                      │
                                                      ▼
[관리자] ─→ /admin 대시보드
           ├─ 통계 탭: 총 유저/게시물/신고 수 + 오늘 증가분
           ├─ 신고 탭: 상태 변경 (pending → reviewed → resolved)
           ├─ 유저 탭: 검색 + 필터 (전체/정지/관리자)
           │          유저 정지 (N일) / 정지 해제
           ├─ 게시물 탭: 관리자 강제 삭제
           └─ 활동 탭: 최근 가입/게시물/신고 타임라인
관리자 권한 설정:

MongoDB Atlas에서 users 컬렉션의 role 필드를 "admin"으로 직접 설정
ADMIN_EMAILS 환경변수: 해당 이메일은 @bu.ac.kr 도메인 검사 우회
5. UI/UX 디자인 컨셉
5.1 디자인 철학
"20대 대학생이 쓰는 힙한 데이팅 앱" — Tinder/Bumble 감성

5.2 핵심 디자인 포인트
요소	적용 내용
색상	메인: #FF6B81 (코랄 핑크), 그라데이션: #FF6B81 → #FF9278
라운딩	카드 rounded-3xl, 버튼/입력 rounded-2xl, 모달 rounded-3xl
유리 효과	헤더/하단탭/채팅 입력창에 backdrop-blur(20px) + bg-white/72%
여백	넉넉한 padding/gap으로 시원시원한 레이아웃
폰트	Plus Jakarta Sans + Noto Sans KR, letter-spacing: -0.03em
그림자	카드: 0 2px 20px rgba(255,107,129,0.08), hover 시 강화
애니메이션	페이지 트랜지션(fade+slide), 스켈레톤 shimmer, 타이핑 bounce
5.3 모바일 우선 레이아웃

┌──────────── max-width: 480px ────────────┐
│ [Glass 상단 배너] 백석대 인증 플랫폼       │
│ [Glass 헤더] 캠퍼스 데이트    [관리자]      │
│                                           │
│ [배너 카드 rounded-3xl]                    │
│ [세그먼트 필터 rounded-2xl]                │
│                                           │
│ [PostCard rounded-3xl]                    │
│   ┌─────────────────┐                     │
│   │ 4:5 커버 이미지   │                     │
│   ├─────────────────┤                     │
│   │ 제목    [♥ 2xl]  │                     │
│   │ 설명 · 날짜      │                     │
│   └─────────────────┘                     │
│                                           │
│ [Glass 하단탭 rounded-t-3xl]               │
│   채팅(뱃지)  홈  프로필                    │
└───────────────────────────────────────────┘
6. 프로젝트 구조

campus-date/
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── BottomNav.jsx    # 하단 탭바 (미읽 뱃지)
│   │   │   ├── Layout.jsx       # 공통 레이아웃
│   │   │   ├── PostCard.jsx     # 게시물 카드
│   │   │   ├── Skeleton.jsx     # 스켈레톤 UI (5종)
│   │   │   ├── EmptyState.jsx   # 빈 상태 컴포넌트
│   │   │   ├── PageTransition.jsx
│   │   │   └── ConfirmModal.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # 인증 상태 (persistent)
│   │   ├── services/
│   │   │   ├── api.js           # Axios 인스턴스 + API 함수들
│   │   │   └── socket.js        # Socket.io 클라이언트
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── MainFeedPage.jsx
│   │   │   ├── PostDetailPage.jsx
│   │   │   ├── ChatListPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── AdminPage.jsx
│   │   └── index.css            # Tailwind + 커스텀 유틸리티
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                     # Express API
│   └── src/
│       ├── controllers/         # 비즈니스 로직
│       ├── models/              # Mongoose 스키마 (5개)
│       ├── routes/              # REST 엔드포인트
│       ├── socket/              # Socket.io 이벤트 핸들러
│       ├── middleware/          # JWT 검증, 관리자 체크
│       └── config/              # DB, Cloudinary 설정
│
└── mobile/                      # (개발 중) Expo React Native
7. API 엔드포인트 요약
Method	Endpoint	설명
POST	/api/auth/google	Google OAuth 로그인
GET	/api/auth/me	현재 유저 정보
PUT	/api/users/profile	프로필 수정
POST	/api/users/profile-image	프로필 이미지 업로드
GET	/api/posts	게시물 목록 (페이지네이션, 타입 필터)
POST	/api/posts	게시물 작성
PUT/DELETE	/api/posts/:id	게시물 수정/삭제
POST	/api/posts/:id/like	좋아요 토글
POST	/api/chat/room	채팅방 생성/조회
GET	/api/chat/rooms	내 채팅방 목록
GET	/api/chat/rooms/:id/messages	메시지 조회
GET	/api/chat/unread-count	총 미읽 메시지 수
POST	/api/reports	신고 접수
GET	/api/admin/stats	관리자 통계
GET	/api/admin/reports	신고 목록
PATCH	/api/admin/reports/:id	신고 상태 변경
POST	/api/admin/users/:id/suspend	유저 정지
GET	/api/admin/activity	최근 활동 타임라인
8. 현재 개발 현황 및 향후 과제
완료된 기능 (약 95%)
 Google OAuth + 학교 메일 인증
 게시물 CRUD (이미지 다중 업로드)
 실시간 1:1/그룹 채팅 (Socket.io)
 채팅 읽음 확인 (done/done_all)
 미읽 메시지 뱃지
 신고 시스템
 관리자 대시보드 (통계, 유저 관리, 활동 로그)
 Persistent Login (새로고침/탭 유지)
 스켈레톤 UI (Render cold start 대응)
 힙한 데이팅 앱 스타일 UI (Glass, Gradient, Rounding)
 프론트 Vercel + 백엔드 Render 배포
향후 과제 (약 5%)
우선순위	과제	설명
높음	푸시 알림	Firebase Cloud Messaging으로 새 메시지/매칭 알림
높음	이미지 최적화	Cloudinary 변환 파라미터로 썸네일 자동 생성
중간	테스트 코드	Jest + React Testing Library 기본 테스트
중간	Render 유료 전환	cold start 90초 → 상시 가동으로 UX 개선
중간	차단 기능	특정 유저 차단 시 게시물/채팅 숨김
낮음	PWA 설정	manifest.json + service worker로 홈 화면 추가
낮음	React Native 앱	/mobile 디렉토리에 Expo 기반 네이티브 앱 (개발 초기)
낮음	다크 모드 토글	현재 시스템 설정 따름 → 수동 전환 옵션 추가
작성일: 2026-03-10
프로젝트 저장소: github.com/hamanguk/bu-dating-platform
배포 URL: Vercel (프론트) + Render (백엔드)
