# 🔥 Firebase 설정 가이드 (초보자용)

이 문서는 테트리스 배틀 게임에 필요한 Firebase 설정을 **처음부터 끝까지** 쉽게 설명합니다!

---

## 📌 Firebase가 뭔가요?

Firebase는 구글에서 만든 **무료 백엔드 서비스**입니다. 
우리 게임에서는 두 명의 플레이어가 실시간으로 데이터를 주고받기 위해 사용합니다.

**무료 플랜으로 충분합니다!** 💰

---

## 🎯 STEP 1: Google 계정으로 로그인

1. 구글 계정이 있어야 합니다 (Gmail 계정)
2. [Firebase Console](https://console.firebase.google.com/) 접속
3. Google 계정으로 로그인

---

## 🎯 STEP 2: 새 프로젝트 만들기

### 2-1. 프로젝트 추가

1. "프로젝트 추가" 또는 "Add project" 버튼 클릭
2. 프로젝트 이름 입력 (예: `tetris-battle` 또는 원하는 이름)
3. "계속" 버튼 클릭

### 2-2. Google 애널리틱스 설정 (선택사항)

- "이 프로젝트에서 Google 애널리틱스 사용 설정" 끄기 (OFF) 
- 또는 켜도 상관없지만 게임에는 필요 없습니다
- "프로젝트 만들기" 버튼 클릭

### 2-3. 대기

- 프로젝트 생성 중... (약 30초 소요)
- "새 프로젝트가 준비되었습니다!" 메시지가 나오면 "계속" 클릭

---

## 🎯 STEP 3: Realtime Database 만들기

### 3-1. 데이터베이스 메뉴 찾기

1. 왼쪽 사이드바에서 "빌드" 또는 "Build" 섹션 찾기
2. "Realtime Database" 클릭

### 3-2. 데이터베이스 만들기

1. "데이터베이스 만들기" 또는 "Create Database" 버튼 클릭
2. 위치 선택:
   - 권장: `asia-southeast1` (싱가포르 - 한국과 가장 가까움)
   - 다른 옵션: `us-central1` (미국 중부)
3. "다음" 버튼 클릭

### 3-3. 보안 규칙 설정

**중요!** 다음 중 하나를 선택하세요:

#### 옵션 1: 테스트 모드 (간단, 초보자 추천)
- "테스트 모드에서 시작" 선택
- 30일 동안 누구나 읽기/쓰기 가능 (테스트용)
- "사용 설정" 버튼 클릭

#### 옵션 2: 잠금 모드 (나중에 규칙 설정)
- "잠금 모드에서 시작" 선택
- "사용 설정" 클릭 후 아래 규칙으로 변경 필요:

나중에 "규칙" 탭에서 다음으로 변경:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

"게시" 버튼 클릭!

---

## 🎯 STEP 4: Web 앱 추가

### 4-1. 프로젝트 설정 열기

1. 왼쪽 상단의 ⚙️ (톱니바퀴) 아이콘 클릭
2. "프로젝트 설정" 또는 "Project settings" 클릭

### 4-2. 앱 추가

1. 아래로 스크롤해서 "내 앱" 섹션 찾기
2. "앱이 없습니다" 메시지 아래 웹 아이콘 (</>) 클릭
3. 앱 닉네임 입력 (예: `Tetris Battle Web`)
4. "앱 등록" 버튼 클릭

### 4-3. Firebase SDK 구성 복사

1. "Firebase SDK snippet" 화면이 나타남
2. **"구성"** 라디오 버튼 선택 (CDN 아님!)
3. `const firebaseConfig = { ... }` 부분 **전체 복사**

예시:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDpR3x...",
  authDomain: "tetris-battle-xxxxx.firebaseapp.com",
  databaseURL: "https://tetris-battle-xxxxx-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tetris-battle-xxxxx",
  storageBucket: "tetris-battle-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**이 부분을 복사해두세요!** 📋

---

## 🎯 STEP 5: 코드에 설정 적용

### 5-1. firebase-config.js 파일 열기

프로젝트 폴더에서 `js/firebase-config.js` 파일을 VS Code나 메모장으로 엽니다.

### 5-2. 설정 교체

파일 상단의 다음 부분을 찾으세요:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

**이 부분 전체를** Firebase에서 복사한 설정으로 **교체**합니다!

### 5-3. 저장

파일을 저장합니다 (Ctrl+S 또는 Cmd+S)

---

## 🎯 STEP 6: 로컬에서 테스트

### 6-1. Live Server 사용 (VS Code)

1. VS Code에서 프로젝트 폴더 열기
2. `index.html` 파일 우클릭
3. "Open with Live Server" 선택
4. 브라우저가 자동으로 열림

### 6-2. 또는 간단한 서버 실행

Python이 설치되어 있다면:

```bash
# Python 3
python -m http.server 8000

# 브라우저에서 http://localhost:8000 접속
```

### 6-3. 테스트 방법

1. 두 개의 브라우저 탭 열기 (또는 시크릿 모드 사용)
2. 첫 번째 탭: 이름 입력 → "방 만들기"
3. 방 코드 복사
4. 두 번째 탭: 이름 입력 → 방 코드 입력 → "참가하기"
5. 게임이 시작되면 성공! 🎉

---

## ❗ 문제 해결

### "Permission denied" 오류

**원인:** 보안 규칙이 잘못 설정됨

**해결:**
1. Firebase Console → Realtime Database → 규칙 탭
2. 다음과 같이 변경:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

3. "게시" 클릭

### 데이터베이스 URL이 없어요

**원인:** databaseURL이 설정되지 않음

**해결:**
1. Firebase Console → Realtime Database
2. "데이터" 탭에서 URL 확인 (예: `https://프로젝트명-default-rtdb.asia-southeast1.firebasedatabase.app`)
3. `firebase-config.js`에 추가:

```javascript
databaseURL: "복사한_URL",
```

### 브라우저 콘솔에 에러가 나와요

**F12 키**를 눌러 개발자 도구를 열고 Console 탭에서 에러 메시지를 확인하세요.

일반적인 에러:
- `Firebase: No Firebase App '[DEFAULT]' has been created`
  → firebase-config.js의 설정을 확인하세요
  
- `PERMISSION_DENIED`
  → 보안 규칙을 확인하세요

---

## 🚀 GitHub Pages 배포

### 전제 조건

- GitHub 계정이 있어야 합니다
- Git이 설치되어 있어야 합니다

### 배포 과정

#### 1. GitHub에 저장소 생성

1. [GitHub](https://github.com)에 로그인
2. 우측 상단 "+" → "New repository" 클릭
3. Repository name: `tetris-battle` (또는 원하는 이름)
4. Public 선택
5. "Create repository" 클릭

#### 2. 로컬에서 Git 설정

터미널/명령 프롬프트에서:

```bash
cd tetris-battle  # 프로젝트 폴더로 이동

git init
git add .
git commit -m "Initial commit: Tetris Battle game"
git branch -M main
git remote add origin https://github.com/사용자명/tetris-battle.git
git push -u origin main
```

> **주의:** `사용자명`을 실제 GitHub 사용자명으로 변경하세요!

#### 3. GitHub Pages 활성화

1. GitHub 저장소 페이지 접속
2. "Settings" 탭 클릭
3. 왼쪽 사이드바에서 "Pages" 클릭
4. Source: "Deploy from a branch" 선택
5. Branch: "main" 선택, 폴더: "/ (root)" 선택
6. "Save" 버튼 클릭

#### 4. 배포 완료 대기

- 5-10분 정도 소요
- 상단에 초록색으로 "Your site is live at..." 메시지가 나타나면 완료!
- URL: `https://사용자명.github.io/tetris-battle`

---

## ✅ 최종 체크리스트

설정이 제대로 됐는지 확인하세요:

- [ ] Firebase 프로젝트가 생성됨
- [ ] Realtime Database가 활성화됨
- [ ] 보안 규칙이 설정됨
- [ ] firebase-config.js에 설정이 적용됨
- [ ] 로컬에서 테스트가 완료됨
- [ ] (선택) GitHub Pages에 배포 완료

---

## 🎓 다음 단계

게임이 잘 작동한다면:

1. 친구들과 게임을 즐기세요! 🎮
2. 코드를 수정해서 나만의 기능 추가해보기
3. 디자인 변경해보기 (css/style.css)

---

## 💬 도움이 필요하신가요?

Firebase 설정 중 막히는 부분이 있다면 언제든 질문하세요!

**행운을 빕니다!** 🍀
