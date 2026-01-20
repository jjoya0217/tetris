// 멀티플레이어 게임 관리

let myGame;
let opponentGame;
let roomCode;
let playerName;
let isHost;
let currentRound = 1;
let maxRounds = 3;
let myRoundWins = 0;
let opponentRoundWins = 0;
let gameActive = false;
let lastUpdate = Date.now();

// 게임 초기화
function initializeGame(room, name, host) {
    roomCode = room;
    playerName = name;
    isHost = host;
    
    // 게임 인스턴스 생성
    myGame = new TetrisGame('myCanvas', 'myNextCanvas', true);
    opponentGame = new TetrisGame('opponentCanvas', 'opponentNextCanvas', false);
    
    // 키보드 이벤트 리스너
    setupControls();
    
    // 상대방 상태 감지
    watchOpponentState(roomCode, isHost, (state) => {
        opponentGame.setState(state);
        updateOpponentDisplay();
    });
    
    // 호스트가 아니면 라운드 정보 감지
    if (!isHost) {
        watchRoundInfo(roomCode, (round) => {
            currentRound = round;
            document.getElementById('currentRound').textContent = round;
        });
    }
    
    // 첫 라운드 시작
    startRound();
}

// 라운드 시작
function startRound() {
    gameActive = false;
    
    // 라운드 오버레이 표시
    const overlay = document.getElementById('roundOverlay');
    const roundText = document.getElementById('roundText');
    const countdownText = document.getElementById('countdownText');
    
    roundText.textContent = `라운드 ${currentRound}`;
    overlay.classList.remove('hidden');
    
    // 5초 카운트다운
    let countdown = 5;
    countdownText.textContent = countdown;
    
    const countInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownText.textContent = countdown;
        } else {
            clearInterval(countInterval);
            overlay.classList.add('hidden');
            // 게임 시작
            startPlaying();
        }
    }, 1000);
}

// 게임 플레이 시작
function startPlaying() {
    gameActive = true;
    myGame.gameOver = false;
    myGame.board = myGame.createBoard();
    myGame.score = 0;
    myGame.level = 1;
    myGame.linesCleared = 0;
    myGame.spawnPiece();
    
    // 게임 루프 시작
    requestAnimationFrame(gameLoop);
}

// 게임 루프
function gameLoop() {
    if (!gameActive) return;
    
    const now = Date.now();
    const deltaTime = now - lastUpdate;
    lastUpdate = now;
    
    // 내 게임 업데이트
    myGame.update(deltaTime);
    
    // 게임 오버 체크
    if (myGame.gameOver) {
        handleGameOver(false); // 내가 짐
        return;
    }
    
    // 상대방 게임 오버 체크
    if (opponentGame.gameOver) {
        handleGameOver(true); // 내가 이김
        return;
    }
    
    // 그리기
    myGame.draw();
    myGame.drawNextPiece();
    opponentGame.draw();
    opponentGame.drawNextPiece();
    
    // 내 점수 업데이트
    document.getElementById('myScore').textContent = myGame.score;
    
    // Firebase에 내 상태 전송 (0.1초마다)
    if (now % 100 < deltaTime) {
        updateGameState(roomCode, isHost, myGame.getState());
    }
    
    requestAnimationFrame(gameLoop);
}

// 키보드 컨트롤 설정
function setupControls() {
    let fastDrop = false;
    
    document.addEventListener('keydown', (e) => {
        if (!gameActive || myGame.gameOver) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                myGame.move(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                myGame.move(1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (!fastDrop) {
                    myGame.dropInterval = 50;
                    fastDrop = true;
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                myGame.rotate();
                break;
            case ' ':
                e.preventDefault();
                const cleared = myGame.hardDrop();
                handleLinesCleared(cleared);
                break;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowDown') {
            myGame.dropInterval = Math.max(100, 1000 - (myGame.level - 1) * 100);
            fastDrop = false;
        }
    });
}

// 줄 제거 처리
function handleLinesCleared(count) {
    if (count === 0) return;
    
    // 3줄 이상이면 보너스 공격
    let attackLines = count;
    if (count >= 3) {
        attackLines = count + 1; // 보너스 1줄 추가
    }
    
    // 상대방에게 공격
    sendAttack(attackLines);
}

// 공격 전송
function sendAttack(lines) {
    // Firebase를 통해 상대방에게 공격 알림
    const attackKey = isHost ? 'attackToPlayer2' : 'attackToPlayer1';
    database.ref(`rooms/${roomCode}/${attackKey}`).set({
        lines: lines,
        timestamp: Date.now()
    });
}

// 공격 받기 감지
function watchForAttacks() {
    const attackKey = isHost ? 'attackToPlayer1' : 'attackToPlayer2';
    
    database.ref(`rooms/${roomCode}/${attackKey}`).on('value', (snapshot) => {
        const attack = snapshot.val();
        if (attack && gameActive) {
            myGame.addGarbageLines(attack.lines);
            // 공격 받은 후 제거
            database.ref(`rooms/${roomCode}/${attackKey}`).remove();
        }
    });
}

// 상대방 화면 업데이트
function updateOpponentDisplay() {
    document.getElementById('opponentScore').textContent = opponentGame.score;
}

// 게임 오버 처리
function handleGameOver(iWon) {
    gameActive = false;
    
    if (iWon) {
        myRoundWins++;
    } else {
        opponentRoundWins++;
    }
    
    // 3판 2선승제 확인
    if (myRoundWins === 2) {
        // 최종 승리
        showFinalResult(true);
    } else if (opponentRoundWins === 2) {
        // 최종 패배
        showFinalResult(false);
    } else {
        // 다음 라운드
        currentRound++;
        if (isHost) {
            updateRoundInfo(roomCode, currentRound);
        }
        document.getElementById('currentRound').textContent = currentRound;
        
        setTimeout(() => {
            startRound();
        }, 3000);
    }
}

// 최종 결과 표시
function showFinalResult(iWon) {
    const overlay = document.getElementById('gameOverOverlay');
    const resultText = document.getElementById('resultText');
    const myFinalScore = document.getElementById('myFinalScore');
    const opponentFinalScore = document.getElementById('opponentFinalScore');
    
    resultText.textContent = iWon ? '🎉 승리! 🎉' : '😢 패배';
    resultText.style.color = iWon ? '#4CAF50' : '#F44336';
    
    myFinalScore.textContent = myGame.score;
    opponentFinalScore.textContent = opponentGame.score;
    
    overlay.classList.remove('hidden');
    
    // 통계 업데이트
    updateStats(iWon);
    
    // Firebase 정리
    if (isHost) {
        endGame(roomCode, iWon ? playerName : 'opponent', iWon ? 'opponent' : playerName);
    }
    cleanupRoom(roomCode);
}

// 통계 업데이트
function updateStats(won) {
    const stats = JSON.parse(localStorage.getItem('tetrisStats')) || { totalGames: 0, wins: 0 };
    stats.totalGames++;
    if (won) stats.wins++;
    localStorage.setItem('tetrisStats', JSON.stringify(stats));
}

// 페이지 로드 시 공격 감지 시작
window.addEventListener('load', () => {
    setTimeout(() => {
        if (gameActive) {
            watchForAttacks();
        }
    }, 6000); // 라운드 시작 카운트다운 후
});
