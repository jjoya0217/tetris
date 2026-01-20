// 테트리스 게임 로직

// 게임 상수
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    '#000000', // 빈 공간
    '#FF0D72', // I
    '#0DC2FF', // J
    '#0DFF72', // L
    '#F538FF', // O
    '#FF8E0D', // S
    '#FFE138', // T
    '#3877FF'  // Z
];

// 테트로미노 모양 정의
const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[2, 0, 0], [2, 2, 2]], // J
    [[0, 0, 3], [3, 3, 3]], // L
    [[4, 4], [4, 4]], // O
    [[0, 5, 5], [5, 5, 0]], // S
    [[0, 6, 0], [6, 6, 6]], // T
    [[7, 7, 0], [0, 7, 7]]  // Z
];

// 게임 클래스
class TetrisGame {
    constructor(canvasId, nextCanvasId, isPlayer = true) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById(nextCanvasId);
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.isPlayer = isPlayer; // 플레이어 조작 가능 여부
        this.board = this.createBoard();
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.gameOver = false;
        
        this.currentPiece = null;
        this.nextPiece = this.randomPiece();
        
        if (isPlayer) {
            this.dropInterval = 1000; // 1초
            this.lastDrop = Date.now();
        }
        
        this.scale = isPlayer ? BLOCK_SIZE : BLOCK_SIZE / 2;
    }

    createBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    randomPiece() {
        const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        return {
            shape: shape,
            x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
            y: 0,
            color: shape[0][0]
        };
    }

    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.randomPiece();
        
        if (this.collision()) {
            this.gameOver = true;
            return false;
        }
        return true;
    }

    collision() {
        const piece = this.currentPiece;
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = piece.x + x;
                    const newY = piece.y + y;
                    
                    if (newX < 0 || newX >= COLS || newY >= ROWS) {
                        return true;
                    }
                    if (newY >= 0 && this.board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    merge() {
        const piece = this.currentPiece;
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newY = piece.y + y;
                    const newX = piece.x + x;
                    if (newY >= 0) {
                        this.board[newY][newX] = piece.color;
                    }
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let y = ROWS - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(COLS).fill(0));
                linesCleared++;
                y++; // 같은 줄 다시 확인
            }
        }
        
        if (linesCleared > 0) {
            this.linesCleared += linesCleared;
            
            // 점수 계산
            const points = [0, 100, 300, 500, 800];
            this.score += points[linesCleared] * this.level;
            
            // 레벨 업 (10줄마다)
            this.level = Math.floor(this.linesCleared / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
        }
        
        return linesCleared;
    }

    addGarbageLines(count) {
        // 상대방 공격으로 아래에 줄 추가
        for (let i = 0; i < count; i++) {
            this.board.shift(); // 맨 위 줄 제거
            const garbageLine = Array(COLS).fill(8); // 회색 블록
            const hole = Math.floor(Math.random() * COLS);
            garbageLine[hole] = 0; // 구멍 하나
            this.board.push(garbageLine);
        }
    }

    move(dir) {
        if (!this.currentPiece) return false;
        
        this.currentPiece.x += dir;
        if (this.collision()) {
            this.currentPiece.x -= dir;
            return false;
        }
        return true;
    }

    rotate() {
        if (!this.currentPiece) return false;
        
        const piece = this.currentPiece;
        const rotated = piece.shape[0].map((_, i) =>
            piece.shape.map(row => row[i]).reverse()
        );
        
        const oldShape = piece.shape;
        piece.shape = rotated;
        
        if (this.collision()) {
            piece.shape = oldShape;
            return false;
        }
        return true;
    }

    drop() {
        if (!this.currentPiece) return false;
        
        this.currentPiece.y++;
        if (this.collision()) {
            this.currentPiece.y--;
            this.merge();
            const cleared = this.clearLines();
            this.spawnPiece();
            return cleared;
        }
        return 0;
    }

    hardDrop() {
        if (!this.currentPiece) return 0;
        
        let dropDistance = 0;
        while (true) {
            this.currentPiece.y++;
            if (this.collision()) {
                this.currentPiece.y--;
                break;
            }
            dropDistance++;
        }
        
        this.merge();
        const cleared = this.clearLines();
        this.score += dropDistance * 2; // 즉시 낙하 보너스
        this.spawnPiece();
        return cleared;
    }

    update(deltaTime) {
        if (this.gameOver || !this.isPlayer) return;
        
        this.lastDrop += deltaTime;
        if (this.lastDrop > this.dropInterval) {
            this.drop();
            this.lastDrop = 0;
        }
    }

    draw() {
        // 보드 그리기
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 격자 그리기
        this.ctx.strokeStyle = '#222';
        for (let y = 0; y <= ROWS; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.scale);
            this.ctx.lineTo(COLS * this.scale, y * this.scale);
            this.ctx.stroke();
        }
        for (let x = 0; x <= COLS; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.scale, 0);
            this.ctx.lineTo(x * this.scale, ROWS * this.scale);
            this.ctx.stroke();
        }
        
        // 고정된 블록 그리기
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(x, y, this.board[y][x]);
                }
            }
        }
        
        // 현재 블록 그리기
        if (this.currentPiece) {
            const piece = this.currentPiece;
            for (let y = 0; y < piece.shape.length; y++) {
                for (let x = 0; x < piece.shape[y].length; x++) {
                    if (piece.shape[y][x]) {
                        this.drawBlock(piece.x + x, piece.y + y, piece.color);
                    }
                }
            }
        }
    }

    drawBlock(x, y, color) {
        this.ctx.fillStyle = COLORS[color];
        this.ctx.fillRect(
            x * this.scale + 1,
            y * this.scale + 1,
            this.scale - 2,
            this.scale - 2
        );
        
        // 입체감
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(
            x * this.scale + 1,
            y * this.scale + 1,
            this.scale - 2,
            this.scale / 4
        );
    }

    drawNextPiece() {
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const piece = this.nextPiece;
            const blockSize = this.isPlayer ? 20 : 12;
            const offsetX = (this.nextCanvas.width - piece.shape[0].length * blockSize) / 2;
            const offsetY = (this.nextCanvas.height - piece.shape.length * blockSize) / 2;
            
            for (let y = 0; y < piece.shape.length; y++) {
                for (let x = 0; x < piece.shape[y].length; x++) {
                    if (piece.shape[y][x]) {
                        this.nextCtx.fillStyle = COLORS[piece.color];
                        this.nextCtx.fillRect(
                            offsetX + x * blockSize + 1,
                            offsetY + y * blockSize + 1,
                            blockSize - 2,
                            blockSize - 2
                        );
                    }
                }
            }
        }
    }

    getState() {
        return {
            board: this.board,
            score: this.score,
            level: this.level,
            gameOver: this.gameOver,
            currentPiece: this.currentPiece,
            nextPiece: this.nextPiece
        };
    }

    setState(state) {
        this.board = state.board;
        this.score = state.score;
        this.level = state.level;
        this.gameOver = state.gameOver;
        this.currentPiece = state.currentPiece;
        this.nextPiece = state.nextPiece;
    }
}
