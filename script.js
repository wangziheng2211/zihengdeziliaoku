let snake, food, direction, gameLoop;
let score = 0;
const gridSize = 20;
const tileCount = 20;
const gameSpeed = 100; // 控制游戏速度，数值越小越快

// 添加音效
const eatSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...'); // 这里需要添加实际的音效文件
const gameOverSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...'); // 这里需要添加实际的音效文件

function startGame() {
    score = 0;
    updateScore();
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    const canvas = document.getElementById('gameCanvas');
    canvas.width = canvas.height = gridSize * tileCount;
    
    initGame();
    gameLoop = setInterval(updateGame, gameSpeed);
}

function updateScore() {
    document.getElementById('scoreValue').textContent = score;
}

function initGame() {
    const canvas = document.getElementById('gameCanvas');
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    direction = 'right';
    createFood();
    
    document.addEventListener('keydown', changeDirection);
    // 添加触摸控制支持
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
}

// 触摸控制相关变量
let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown) return;

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;

    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0 && direction !== 'right') {
            direction = 'left';
        } else if (xDiff < 0 && direction !== 'left') {
            direction = 'right';
        }
    } else {
        if (yDiff > 0 && direction !== 'down') {
            direction = 'up';
        } else if (yDiff < 0 && direction !== 'up') {
            direction = 'down';
        }
    }

    xDown = null;
    yDown = null;
}

function createFood() {
    // 确保食物不会出现在蛇身上
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
}

function changeDirection(event) {
    const keyPressed = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    if (keyPressed === LEFT && direction !== 'right') direction = 'left';
    if (keyPressed === UP && direction !== 'down') direction = 'up';
    if (keyPressed === RIGHT && direction !== 'left') direction = 'right';
    if (keyPressed === DOWN && direction !== 'up') direction = 'down';
}

function updateGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // 移动蛇
    const head = {x: snake[0].x, y: snake[0].y};
    switch(direction) {
        case 'right': head.x++; break;
        case 'left': head.x--; break;
        case 'up': head.y--; break;
        case 'down': head.y++; break;
    }
    
    // 检查游戏结束条件
    if (head.x < 0 || head.x >= tileCount || 
        head.y < 0 || head.y >= tileCount || 
        checkCollision(head)) {
        clearInterval(gameLoop);
        gameOverSound.play();
        gameOver();
        return;
    }
    
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        eatSound.play();
        createFood();
        // 添加视觉效果
        createFoodEffect(food.x * gridSize, food.y * gridSize);
    } else {
        snake.pop();
    }
    
    // 绘制游戏
    drawGame(ctx, canvas);
}

function drawGame(ctx, canvas) {
    // 清空画布
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 画网格
    ctx.strokeStyle = '#e0e0e0';
    for(let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // 画蛇
    snake.forEach((segment, index) => {
        if (index === 0) {
            // 蛇头
            ctx.fillStyle = '#2E7D32';
        } else {
            // 蛇身
            ctx.fillStyle = '#4CAF50';
        }
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
    
    // 画食物
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2,
        gridSize/2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function createFoodEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'food-effect';
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    document.getElementById('gameScreen').appendChild(effect);
    
    setTimeout(() => effect.remove(), 500);
}

function checkCollision(head) {
    return snake.some((segment, index) => {
        if (index === 0) return false;
        return segment.x === head.x && segment.y === head.y;
    });
}

function createRainEffect() {
    const rain = document.getElementById('rain');
    rain.style.display = 'block';
    rain.innerHTML = ''; // 清除之前的雨滴
    
    // 创建更多雨滴，使效果更密集
    for (let i = 0; i < 150; i++) {
        const raindrop = document.createElement('div');
        raindrop.className = 'raindrop';
        raindrop.style.left = Math.random() * 100 + '%';
        raindrop.style.animationDuration = Math.random() * 1 + 0.5 + 's';
        raindrop.style.animationDelay = Math.random() * 2 + 's';
        // 随机设置雨滴的长度
        raindrop.style.height = Math.random() * 60 + 40 + 'px';
        // 随机设置雨滴的透明度
        raindrop.style.opacity = Math.random() * 0.4 + 0.2;
        rain.appendChild(raindrop);
    }
}

function gameOver() {
    createRainEffect();
    
    // 添加延迟显示弹窗，让雨滴效果先显示
    setTimeout(() => {
        const modal = document.getElementById('gameOverModal');
        modal.style.display = 'flex';
        
        // 添加安慰语句数组
        const comfortWords = [
            "不哭不哭~ 建杭疼你 ❤️",
            "没关系的，建杭州疼你，再来一次吧！",
            "建杭相信你可以的！",
            "加油！建杭希望你下次会更好！",
            "失败是成功之母，建杭爱你！"
        ];
        
        // 随机选择一句安慰语
        const randomIndex = Math.floor(Math.random() * comfortWords.length);
        document.querySelector('.modal-content p').textContent = comfortWords[randomIndex];
    }, 500);
}

function restartGame() {
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('rain').style.display = 'none';
    document.getElementById('rain').innerHTML = '';
    startGame();
} 
