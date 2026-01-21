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

// 게임 오버 이벤트 전송
function sendGameOver(roomCode, isHost) {
    const gameOverKey = isHost ? 'player1GameOver' : 'player2GameOver';
    database.ref(`rooms/${roomCode}/${gameOverKey}`).set({
        gameOver: true,
        timestamp: Date.now()
    });
}

// 상대방 게임 오버 감지
function watchOpponentGameOver(roomCode, isHost, callback) {
    const opponentGameOverKey = isHost ? 'player2GameOver' : 'player1GameOver';
    
    database.ref(`rooms/${roomCode}/${opponentGameOverKey}`).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && data.gameOver) {
            callback();
            // 한 번만 실행되도록 제거
            database.ref(`rooms/${roomCode}/${opponentGameOverKey}`).off();
        }
    });
}

// ========== 리더보드 함수들 ==========

// 플레이어 ID 생성 (닉네임#번호에서 특수문자 제거)
function getPlayerId(displayName) {
    return displayName.replace(/[.#$[\]]/g, '_');
}

// 리더보드에 기록 저장/업데이트
async function updateLeaderboard(playerData) {
    const playerId = getPlayerId(playerData.displayName);
    const playerRef = database.ref(`leaderboard/${playerId}`);
    
    try {
        // 기존 데이터 가져오기
        const snapshot = await playerRef.once('value');
        const existing = snapshot.val();
        
        if (existing) {
            // 기존 기록 업데이트
            const updates = {
                displayName: playerData.displayName,
                bestScore: Math.max(existing.bestScore || 0, playerData.score),
                totalGames: (existing.totalGames || 0) + 1,
                totalWins: (existing.totalWins || 0) + (playerData.won ? 1 : 0),
                lastPlayed: new Date().toISOString().split('T')[0],
                maxStreak: Math.max(existing.maxStreak || 0, playerData.streak || 0)
            };
            
            // 승률 계산
            updates.winRate = Math.round((updates.totalWins / updates.totalGames) * 100);
            
            await playerRef.update(updates);
        } else {
            // 새 플레이어 기록
            await playerRef.set({
                displayName: playerData.displayName,
                bestScore: playerData.score,
                totalGames: 1,
                totalWins: playerData.won ? 1 : 0,
                winRate: playerData.won ? 100 : 0,
                lastPlayed: new Date().toISOString().split('T')[0],
                maxStreak: playerData.streak || 0
            });
        }
    } catch (error) {
        console.error('리더보드 업데이트 오류:', error);
    }
}

// 리더보드 가져오기
async function fetchLeaderboard(type) {
    try {
        const leaderboardRef = database.ref('leaderboard');
        const snapshot = await leaderboardRef.once('value');
        const data = snapshot.val();
        
        if (!data) return [];
        
        // 객체를 배열로 변환
        const players = Object.values(data);
        
        // 정렬
        if (type === 'score') {
            players.sort((a, b) => b.bestScore - a.bestScore);
        } else if (type === 'wins') {
            players.sort((a, b) => {
                if (b.totalWins !== a.totalWins) {
                    return b.totalWins - a.totalWins;
                }
                return b.winRate - a.winRate;
            });
        }
        
        // 상위 5명만 반환
        return players.slice(0, 5);
    } catch (error) {
        console.error('리더보드 불러오기 오류:', error);
        return [];
    }
}
