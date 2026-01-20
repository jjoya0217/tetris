// ⚠️ 이 파일은 Firebase 프로젝트 설정 후 수정이 필요합니다!
// Firebase 콘솔에서 받은 설정 정보로 아래 내용을 교체하세요.

const firebaseConfig = {
  apiKey: "AIzaSyAvx_D4_ww4GRfxmxw4_7Sgu80J5Sgahg0",
  authDomain: "tetris-d420a.firebaseapp.com",
  databaseURL: "https://tetris-d420a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tetris-d420a",
  storageBucket: "tetris-d420a.firebasestorage.app",
  messagingSenderId: "943207460746",
  appId: "1:943207460746:web:81ba2c972afd78a9f9e273"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 방 생성
async function createRoom(roomCode, playerName) {
    const roomRef = database.ref('rooms/' + roomCode);
    
    // 방이 이미 존재하는지 확인
    const snapshot = await roomRef.once('value');
    if (snapshot.exists()) {
        throw new Error('이미 존재하는 방 코드입니다.');
    }
    
    // 새 방 생성
    await roomRef.set({
        host: playerName,
        player1: playerName,
        player2: null,
        status: 'waiting',
        createdAt: Date.now()
    });

    // 상대방 참가 감지
    roomRef.child('player2').on('value', (snapshot) => {
        const player2 = snapshot.val();
        if (player2) {
            document.getElementById('player2Name').textContent = player2;
            // 잠시 후 게임 시작
            setTimeout(() => {
                startGame(roomCode, playerName, true);
            }, 1000);
        }
    });
}

// 방 참가
async function joinRoom(roomCode, playerName) {
    const roomRef = database.ref('rooms/' + roomCode);
    
    // 방 존재 확인
    const snapshot = await roomRef.once('value');
    if (!snapshot.exists()) {
        return false;
    }
    
    const roomData = snapshot.val();
    
    // 이미 게임 중이거나 꽉 찬 방인지 확인
    if (roomData.status !== 'waiting' || roomData.player2) {
        return false;
    }
    
    // 방 참가
    await roomRef.update({
        player2: playerName,
        status: 'playing'
    });
    
    return true;
}

// 방 취소
async function cancelRoom(roomCode) {
    const roomRef = database.ref('rooms/' + roomCode);
    await roomRef.remove();
}

// 게임 상태 업데이트
function updateGameState(roomCode, isHost, gameState) {
    const playerKey = isHost ? 'player1State' : 'player2State';
    database.ref(`rooms/${roomCode}/${playerKey}`).set(gameState);
}

// 상대방 게임 상태 감지
function watchOpponentState(roomCode, isHost, callback) {
    const opponentKey = isHost ? 'player2State' : 'player1State';
    database.ref(`rooms/${roomCode}/${opponentKey}`).on('value', (snapshot) => {
        const state = snapshot.val();
        if (state) {
            callback(state);
        }
    });
}

// 라운드 정보 업데이트 (호스트만)
function updateRoundInfo(roomCode, roundNumber) {
    database.ref(`rooms/${roomCode}/round`).set(roundNumber);
}

// 라운드 정보 감지
function watchRoundInfo(roomCode, callback) {
    database.ref(`rooms/${roomCode}/round`).on('value', (snapshot) => {
        const round = snapshot.val();
        if (round) {
            callback(round);
        }
    });
}

// 게임 종료 처리
async function endGame(roomCode, winner, loser) {
    await database.ref(`rooms/${roomCode}`).update({
        status: 'finished',
        winner: winner,
        loser: loser,
        endedAt: Date.now()
    });
}

// 방 정리 (게임 종료 후)
async function cleanupRoom(roomCode) {
    // 연결 해제
    database.ref(`rooms/${roomCode}`).off();
    
    // 잠시 후 방 삭제
    setTimeout(async () => {
        await database.ref(`rooms/${roomCode}`).remove();
    }, 5000);
}
