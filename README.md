# 💘 캠퍼스 데이트 (Campus Date)
> **백석대학교 학생 전용 실시간 소개팅 및 과팅 플랫폼**

---

## 1. 서비스 개요
| 항목 | 내용 |
| :--- | :--- |
| **타겟 유저** | 백석대학교 재학생 (@bu.ac.kr 이메일 보유자) |
| **핵심 가치** | 학교 메일 인증 기반의 신뢰할 수 있는 캠퍼스 매칭 |
| **서비스 형태** | 모바일 우선 반응형 웹앱 (max-width 480px) |

### 🚀 핵심 기능
* **1:1 소개팅**: 개인 프로필 기반 매칭 및 실시간 채팅
* **과팅 (N:N)**: 그룹 단위 미팅 모집 및 그룹 채팅
* **익명/실명 선택**: 유저가 직접 노출 수준 제어

---

## 2. 전체 기술 스택

### 🎨 Frontend
`React 18` `Vite` `Tailwind CSS` `React Router v6` `Axios` `Socket.io-client`
- **배포**: Vercel

### ⚙️ Backend
`Node.js` `Express.js` `Socket.io` `JWT`
- **배포**: Render.com (Free Tier)

### 💾 Data & Storage
`MongoDB Atlas` `Mongoose` `Cloudinary`

---

## 3. 데이터 아키텍처 (ERD)

```mermaid
erDiagram
    USER ||--o{ POST : author
    USER ||--o{ CHATROOM : participants
    USER ||--o{ MESSAGE : sender
    USER ||--o{ REPORT : reporter
    POST ||--|| CHATROOM : "matching (1:1 or group)"
    CHATROOM ||--o{ MESSAGE : contains
    POST ||--o{ REPORT : reported
Gemini의 응답
이미지에서 보셨던 것처럼 텍스트로 만든 박스나 선들은 모바일이나 웹 브라우저 환경에 따라 무조건 깨지게 되어 있습니다. 이를 해결하기 위해 GitHub가 가장 예쁘게 렌더링하는 마크다운(Markdown) 문법으로 싹 정리해 드립니다.

이 내용을 그대로 복사해서 README.md에 붙여넣으세요. **표(Table)**와 코드 블록 기능을 써서 어떤 기기에서도 줄이 딱 맞게 보이도록 조정했습니다.

Markdown
# 💘 캠퍼스 데이트 (Campus Date)
> **백석대학교 학생 전용 실시간 소개팅 및 과팅 플랫폼**

---

## 1. 서비스 개요
| 항목 | 내용 |
| :--- | :--- |
| **타겟 유저** | 백석대학교 재학생 (@bu.ac.kr 이메일 보유자) |
| **핵심 가치** | 학교 메일 인증 기반의 신뢰할 수 있는 캠퍼스 매칭 |
| **서비스 형태** | 모바일 우선 반응형 웹앱 (max-width 480px) |

### 🚀 핵심 기능
* **1:1 소개팅**: 개인 프로필 기반 매칭 및 실시간 채팅
* **과팅 (N:N)**: 그룹 단위 미팅 모집 및 그룹 채팅
* **익명/실명 선택**: 유저가 직접 노출 수준 제어

---

## 2. 전체 기술 스택

### 🎨 Frontend
`React 18` `Vite` `Tailwind CSS` `React Router v6` `Axios` `Socket.io-client`
- **배포**: Vercel

### ⚙️ Backend
`Node.js` `Express.js` `Socket.io` `JWT`
- **배포**: Render.com (Free Tier)

### 💾 Data & Storage
`MongoDB Atlas` `Mongoose` `Cloudinary`

---

## 3. 데이터 아키텍처 (ERD)

```mermaid
erDiagram
    USER ||--o{ POST : author
    USER ||--o{ CHATROOM : participants
    USER ||--o{ MESSAGE : sender
    USER ||--o{ REPORT : reporter
    POST ||--|| CHATROOM : "matching (1:1 or group)"
    CHATROOM ||--o{ MESSAGE : contains
    POST ||--o{ REPORT : reported
4. 핵심 비즈니스 로직
🔐 인증 프로세스 (Google OAuth)
Google Login: @bu.ac.kr 도메인만 허용하도록 서버 측 검증.

JWT Issue: 인증 성공 시 7일 만료 JWT 발급 및 localStorage 저장.

Persistent Login: 앱 리로드 시 토큰 유효성 즉시 검사 (/api/auth/me).

💬 실시간 채팅 (Socket.io)
이벤트	방향	설명
join_room	Client → Server	특정 채팅방 입장 및 미확인 메시지 읽음 처리
send_message	Client → Server	메시지 전송 및 DB 저장
new_message	Server → Client	상대방에게 실시간 메시지 전달
typing	Client → Server	"입력 중..." 표시 활성화
5. UI/UX 디자인 포인트
Color: #FF6B81 (Coral Pink) 기반의 트렌디한 그라데이션.

Glassmorphism: 헤더 및 하단 탭바에 backdrop-blur 적용.

Shape: 카드 rounded-3xl, 버튼 rounded-2xl로 부드러운 인상.

UX: Render 무료 티어의 Cold Start(90초)를 대응하는 Skeleton UI 구현.

6. API 엔드포인트 요약
Method	Endpoint	설명
POST	/api/auth/google	Google OAuth 로그인
GET	/api/posts	게시물 목록 조회 (필터링 포함)
POST	/api/chat/room	채팅방 생성 및 기존 방 조회
GET	/api/admin/stats	관리자 통계 대시보드
7. 향후 과제 (Roadmap)
[ ] 푸시 알림: Firebase Cloud Messaging 연동

[ ] 이미지 최적화: Cloudinary 변환 API로 데이터 절감

[ ] PWA: 홈 화면 추가 및 오프라인 대응

[ ] 차단 기능: 특정 유저 블랙리스트 처리

작성일: 2026-03-10

개발자: [내 닉네임 또는 GitHub ID]


---

### 💡 수정 팁
1. **Mermaid 차트**: 위 코드에서 `mermaid`라고 적힌 부분은 GitHub가 자동으로 화살표가 있는 깔끔한 그림으로 바꿔줍니다. (줄 맞출 필요가 전혀 없어요!)
2. **Preview 탭**: GitHub 편집창 상단의 **Preview**를 눌러보세요. 표가 예쁘게 그려진 걸 확인하실 수 있습니다.
3. **배포 주소**: 맨 밑에 실제 서비스 주소(`bu-dating-platform.vercel.app` 등)를 링크로 걸어두면 사람들이 바로 접속해볼 수 있어 더 좋습니다.

이제 이 코드로 갈아 끼워보시겠어요? 훨씬 프로 개발자가 짠 문서처럼 보일 거예요! 또 수정하고 싶은 부분이 있으면 말씀해 주세요.
말씀하신 내용
하나의 글로 만들어줘

Gemini의 응답
아래의 내용을 그대로 복사해서 GitHub의 README.md에 붙여넣으세요. 텍스트로만 되어 있던 명세서를 GitHub 마크다운 규격에 맞춰 최적화했기 때문에, 저장하고 나면 아주 깔끔하고 전문적인 문서로 변신할 거예요!

💘 캠퍼스 데이트 (Campus Date)
백석대학교 학생들을 위한 실시간 학교 인증 소개팅 & 과팅 플랫폼

백석대학교 이메일(@bu.ac.kr) 인증을 통해 신뢰할 수 있는 캠퍼스 매칭 서비스를 제공합니다. 1:1 소개팅부터 다대다 과팅까지, 트렌디한 UI와 실시간 채팅으로 새로운 인연을 만나보세요.

1. 📋 서비스 개요
항목	내용
타겟 유저	백석대학교 재학생 및 휴학생 (@bu.ac.kr 계정 보유자)
핵심 가치	학교 메일 인증 기반의 안전하고 신뢰할 수 있는 만남
서비스 형태	모바일 우선 반응형 웹앱 (PWA-ready, max-width 480px)
✨ 주요 기능
1:1 소개팅: 개인 프로필 기반 매칭 후 실시간 1:1 채팅

과팅 (N:N): 그룹 단위 미팅 모집 및 단체 채팅방 생성

익명/실명 선택: 사용자가 자신의 노출 수준을 직접 설정 가능

관리자 시스템: 신고 처리 및 유저 관리 대시보드 제공

🛠 2. 기술 스택
[Frontend]
Library: React 18, Vite

Styling: Tailwind CSS (Glassmorphism, Custom Theme)

Routing: React Router v6 (Protected Routes)

State: React Context API (Auth, Persistent Login)

Deployment: Vercel

[Backend & Database]
Runtime: Node.js, Express.js

Real-time: Socket.io (채팅, 읽음 표시, 타이핑 인디케이터)

Database: MongoDB Atlas (Mongoose ODM)

Storage: Cloudinary (이미지 업로드 및 CDN)

Deployment: Render.com (Free Tier)

📊 3. 데이터 아키텍처 (ERD)
코드 스니펫
erDiagram
    USER ||--o{ POST : "작성"
    USER ||--o{ CHATROOM : "참여"
    USER ||--o{ MESSAGE : "발신"
    USER ||--o{ REPORT : "신고"
    POST ||--|| CHATROOM : "매칭 시 생성"
    CHATROOM ||--o{ MESSAGE : "포함"
🔐 4. 핵심 비즈니스 로직
1) 인증 및 보안 (Auth)
Google OAuth: 구글 로그인을 통한 간편 인증.

학교 메일 검증: 서버 측에서 @bu.ac.kr 도메인 여부를 엄격히 체크.

JWT 시스템: 인증 성공 시 7일 만료 JWT 발급, localStorage를 활용한 로그인 유지.

2) 실시간 매칭 흐름
게시물 작성: 1:1 혹은 N:N 유형 선택 후 이미지와 함께 게시.

채팅 요청: 열람자가 '채팅하기' 클릭 시 즉시 ChatRoom 생성 혹은 기존 방 연결.

Socket.io 연결: 방 입장 시 실시간 메시지 교환 및 readBy 필드를 활용한 읽음 확인(✓/✓✓) 기능.

🎨 5. UI/UX 디자인 컨셉
Main Color: #FF6B81 (Coral Pink) — 20대의 설렘을 담은 트렌디한 컬러.

Component: rounded-3xl 이상의 부드러운 곡률과 shadow-xl을 이용한 입체감 있는 카드 UI.

UX Detail: Render 무료 티어의 Cold Start(서버 대기 시간)를 고려한 시각적 스켈레톤 UI 적용.

🚀 6. 현재 상태 및 향후 과제
[x] v1.0 런칭 준비 완료 (95%)

[ ] Push Notification: Firebase(FCM)를 통한 실시간 알림 추가 예정

[ ] Image Optimization: Cloudinary 자동 리사이징 적용

[ ] PWA: 홈 화면 설치 기능을 통해 앱과 유사한 경험 제공

🔗 관련 링크
Frontend 배포: 서비스 접속하기

Backend API: API 서버 (Render)

Last Updated: 2026-03-10

Developed by: [내 이름 또는 ID]

