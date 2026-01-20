# 🎮 테트리스 배틀 - 온라인 대전 게임

친구와 실시간으로 대결하는 온라인 테트리스 게임입니다!

## ✨ 주요 기능

- 🎯 **방 코드로 친구 초대**: 6자리 코드를 공유해서 친구와 대결
- ⚡ **실시간 대전**: Firebase를 통한 실시간 게임 동기화
- 🎭 **3판 2선승제**: 라운드 시스템으로 더 치열한 대결
- 💥 **공격 시스템**: 줄을 없애면 상대방에게 공격!
- 📊 **전적 기록**: 승률과 통계를 추적
- 🎨 **직관적인 UI**: 깔끔하고 사용하기 쉬운 디자인

## 🎮 게임 규칙

### 기본 조작
- ← → : 블록 이동
- ↓ : 빠르게 떨어뜨리기
- ↑ : 블록 회전
- Space : 즉시 낙하

### 공격 시스템
- 1줄 제거 → 상대방에게 1줄 추가
- 2줄 제거 → 상대방에게 2줄 추가
- 3줄 이상 제거 → 보너스! (제거한 줄 + 1줄 추가)

### 난이도
- 게임이 진행될수록 블록이 점점 빨라집니다
- 10줄을 제거할 때마다 레벨 UP!

## 🚀 시작하기

### 1단계: Firebase 프로젝트 생성

Firebase는 구글에서 제공하는 무료 백엔드 서비스입니다. 

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: tetris-battle)
4. Google 애널리틱스는 선택사항 (안 해도 됨)
5. "프로젝트 만들기" 클릭

### 2단계: Realtime Database 설정

1. Firebase 콘솔 왼쪽 메뉴에서 "Realtime Database" 클릭
2. "데이터베이스 만들기" 클릭
3. 위치 선택: `asia-southeast1` (싱가포르 - 한국과 가까움)
4. 보안 규칙: "테스트 모드에서 시작" 선택
5. "사용 설정" 클릭

### 3단계: Firebase 설정 복사

1. Firebase 콘솔에서 ⚙️ (설정) 아이콘 클릭
2. "프로젝트 설정" 클릭
3. 아래로 스크롤해서 "내 앱" 섹션 찾기
4. 웹 앱 추가 (</> 아이콘) 클릭
5. 앱 닉네임 입력 (예: Tetris Battle Web)
6. Firebase SDK 스니펫에서 "구성" 선택
7. firebaseConfig 객체를 복사

### 4단계: 코드에 Firebase 설정 적용

`js/firebase-config.js` 파일을 열고 다음 부분을 수정하세요:

```javascript
const firebaseConfig = {
    apiKey: "여기에_복사한_API_KEY",
    authDomain: "여기에_복사한_AUTH_DOMAIN",
    databaseURL: "여기에_복사한_DATABASE_URL",
    projectId: "여기에_복사한_PROJECT_ID",
    storageBucket: "여기에_복사한_STORAGE_BUCKET",
    messagingSenderId: "여기에_복사한_SENDER_ID",
    appId: "여기에_복사한_APP_ID"
};
```

### 5단계: GitHub Pages로 배포

1. GitHub 저장소 생성
2. 코드 업로드:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/사용자명/저장소명.git
git push -u origin main
```

3. GitHub 저장소 설정에서 "Pages" 메뉴 클릭
4. Source: "Deploy from a branch" 선택
5. Branch: "main" 선택, 폴더: "/ (root)" 선택
6. "Save" 클릭

5-10분 후 `https://사용자명.github.io/저장소명` 에서 게임 플레이 가능!

## 📂 파일 구조

```
tetris-battle/
├── index.html              # 시작 화면
├── game.html              # 게임 화면
├── css/
│   └── style.css          # 스타일시트
├── js/
│   ├── firebase-config.js # Firebase 설정 (수정 필요!)
│   ├── tetris.js          # 테트리스 게임 로직
│   └── multiplayer.js     # 온라인 대전 로직
└── README.md              # 이 파일
```

## 🎯 사용 방법

### 게임 시작하기

1. 이름 입력
2. 두 가지 옵션:
   - **방 만들기**: 새 게임방 생성 → 친구에게 코드 공유
   - **방 참가하기**: 친구가 준 코드 입력

### 게임 플레이

1. 라운드 시작 카운트다운 (5초)
2. 블록 조작하며 줄 제거
3. 줄을 제거하면 상대방에게 공격!
4. 상대방보다 오래 버티면 라운드 승리
5. 2라운드를 먼저 이기면 최종 승리!

## 🔧 문제 해결

### 게임이 시작되지 않아요
- Firebase 설정이 올바른지 확인하세요
- 브라우저 콘솔(F12)에서 에러 메시지 확인

### 상대방이 안 보여요
- 인터넷 연결 확인
- 방 코드가 정확한지 확인
- Firebase Realtime Database가 활성화되어 있는지 확인

### 게임이 느려요
- Firebase 무료 플랜은 충분히 빠릅니다
- 브라우저를 최신 버전으로 업데이트하세요

## 📱 지원 브라우저

- Chrome (권장)
- Firefox
- Safari
- Edge

## 🎓 교육용 활용

이 프로젝트는 중학생 코딩 교육에 활용 가능합니다:

- HTML/CSS/JavaScript 기초
- Firebase 실시간 데이터베이스
- 게임 로직 구현
- 온라인 멀티플레이어 개념

## 📝 라이선스

교육용으로 자유롭게 사용 가능합니다!

## 🙋 도움이 필요하신가요?

Firebase 설정이나 배포에 문제가 있다면 언제든지 질문하세요!

---

즐거운 테트리스 대결 되세요! 🎮✨
