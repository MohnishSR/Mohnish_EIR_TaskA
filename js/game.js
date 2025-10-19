//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdFrames = [];
let currentFrame = 0;
let frameCounter = 0;
let frameSpeed = 5;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -1.5; //pipes moving left speed
let baseVelocityX = -1.5; //base speed for difficulty scaling
let velocityY = 1; //bird jump speed
let gravity = 0.2;

let gameOver = false;
let score = 0;
let gameStarted = false;

//scrolling background
let bgX = 0;
let bgSpeed = 1;
let bgImg;

//particles
let particles = [];

//UI elements
let scoreDisplay;
let highScoreDisplay;
let startScreen;
let gameOverScreen;
let finalScore;
let highScoreFinal;
let playBtn;
let restartBtn;
let pauseBtn;
let pauseScreen;
let resumeBtn;
let soundBtn;
let newBadge;
let pauseHomeBtn;
let gameOverHomeBtn;
let leaderboardBtn;
let leaderboardModal;
let leaderboardList;
let closeLeaderboardBtn;

//pipe interval
let pipeIntervalId = null;

//game states
let isPaused = false;
let isMuted = localStorage.getItem('flappyBirdMuted') === 'true';

//high score
let highScore = 0;
let isNewHighScore = false;
let database = new FlappyBirdDatabase();
let currentPlayerName = 'Anonymous';

//sounds
let bgmMusic;
let wingSound;
let hitSound;
let dieSound;
let pointSound;
let swooshSound;

window.onload = async function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //get UI elements
    scoreDisplay = document.getElementById("scoreDisplay");
    highScoreDisplay = document.getElementById("highScoreDisplay");
    startScreen = document.getElementById("startScreen");
    gameOverScreen = document.getElementById("gameOverScreen");
    finalScore = document.getElementById("finalScore");
    highScoreFinal = document.getElementById("highScoreFinal");
    playBtn = document.getElementById("playBtn");
    restartBtn = document.getElementById("restartBtn");
    pauseBtn = document.getElementById("pauseBtn");
    pauseScreen = document.getElementById("pauseScreen");
    resumeBtn = document.getElementById("resumeBtn");
    soundBtn = document.getElementById("soundBtn");
    newBadge = document.getElementById("newBadge");
    pauseHomeBtn = document.getElementById("pauseHomeBtn");
    gameOverHomeBtn = document.getElementById("gameOverHomeBtn");
    leaderboardBtn = document.getElementById("leaderboardBtn");
    leaderboardModal = document.getElementById("leaderboardModal");
    leaderboardList = document.getElementById("leaderboardList");
    closeLeaderboardBtn = document.getElementById("closeLeaderboardBtn");
    
    // Initialize database and load high score
    try {
        await database.init();
        highScore = await database.getHighestScore();
        
        // Load player name from settings
        currentPlayerName = await database.getSetting('playerName', 'Anonymous');
        
        // Load mute setting from database (fallback to localStorage for backward compatibility)
        const dbMuted = await database.getSetting('isMuted');
        if (dbMuted !== null) {
            isMuted = dbMuted;
        }
    } catch (error) {
        console.error('Database initialization failed:', error);
        // Fallback to localStorage if database fails
        highScore = localStorage.getItem('flappyBirdHighScore') ? parseInt(localStorage.getItem('flappyBirdHighScore')) : 0;
    }
    
    //update high score display
    highScoreDisplay.textContent = `High Score: ${highScore}`;
    
    //update sound button
    updateSoundButton();

    //load bird animation frames
    for (let i = 0; i <= 3; i++) {
        let img = new Image();
        img.src = `./assets/images/flappybird${i}.png`;
        birdFrames.push(img);
    }

    //load background image
    bgImg = new Image();
    bgImg.src = "./assets/images/flappybirdbg.png";

    topPipeImg = new Image();
    topPipeImg.src = "./assets/images/toppipe.png";
    topPipeImg.onerror = function() {
        console.error("Failed to load top pipe image");
    };

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./assets/images/bottompipe.png";
    bottomPipeImg.onerror = function() {
        console.error("Failed to load bottom pipe image");
    };

    //load sounds
    bgmMusic = new Audio("./assets/sounds/bgm_mario.mp3");
    wingSound = new Audio("./assets/sounds/sfx_wing.wav");
    hitSound = new Audio("./assets/sounds/sfx_hit.wav");
    dieSound = new Audio("./assets/sounds/sfx_die.wav");
    pointSound = new Audio("./assets/sounds/sfx_point.wav");
    swooshSound = new Audio("./assets/sounds/sfx_swooshing.wav");

    //set sound properties
    bgmMusic.loop = true;
    bgmMusic.volume = 0.3;
    wingSound.volume = 0.5;
    hitSound.volume = 0.5;
    dieSound.volume = 0.5;
    pointSound.volume = 0.5;
    swooshSound.volume = 0.5;

    //event listeners
    playBtn.addEventListener("click", startGame);
    restartBtn.addEventListener("click", resetGame);
    pauseBtn.addEventListener("click", togglePause);
    resumeBtn.addEventListener("click", togglePause);
    soundBtn.addEventListener("click", toggleSound);
    pauseHomeBtn.addEventListener("click", goToHome);
    gameOverHomeBtn.addEventListener("click", goToHome);
    leaderboardBtn.addEventListener("click", showLeaderboard);
    closeLeaderboardBtn.addEventListener("click", hideLeaderboard);
    document.addEventListener("keydown", handleKeyPress);
    board.addEventListener("click", moveBird);
    board.addEventListener("touchstart", function(e) {
        e.preventDefault(); //prevent scrolling on mobile
        moveBird(e);
    }, { passive: false });

    //start animation loop
    requestAnimationFrame(update);
}

function update() {
    requestAnimationFrame(update);
    
    context.clearRect(0, 0, board.width, board.height);
    
    if (!gameStarted) {
        //draw start screen animation
        drawScrollingBackground();
        drawAnimatedBird();
        return;
    }
    
    if (gameOver || isPaused) {
        return;
    }

    //draw scrolling background
    drawScrollingBackground();

    //update bird
    moveBirdInGame();
    drawBird();

    //update pipes
    updatePipes();
    
    //draw pipes
    drawPipes();

    //update particles
    updateParticles();

    //check collision
    checkCollision();

    //update score
    updateScore();
}

function drawScrollingBackground() {
    bgX -= bgSpeed;
    if (bgX <= -boardWidth) {
        bgX = 0;
    }
    
    //draw two background images for seamless scrolling
    context.drawImage(bgImg, bgX, 0, boardWidth, boardHeight);
    context.drawImage(bgImg, bgX + boardWidth, 0, boardWidth, boardHeight);
}

function drawAnimatedBird() {
    //animate bird on start screen
    frameCounter++;
    if (frameCounter >= frameSpeed) {
        currentFrame = (currentFrame + 1) % birdFrames.length;
        frameCounter = 0;
    }
    
    //floating animation
    let floatY = Math.sin(Date.now() * 0.002) * 10;
    let birdY = boardHeight / 2 + floatY;
    
    context.drawImage(birdFrames[currentFrame], birdX, birdY, birdWidth, birdHeight);
}

function drawBird() {
    context.drawImage(birdFrames[currentFrame], bird.x, bird.y, bird.width, bird.height);
    
    //animate bird wings during game
    frameCounter++;
    if (frameCounter >= frameSpeed) {
        currentFrame = (currentFrame + 1) % birdFrames.length;
        frameCounter = 0;
    }
}

function moveBirdInGame() {
    velocityY += gravity;
    bird.y += velocityY;
}

function moveBird(e) {
    if (!gameStarted || gameOver || isPaused) return;
    
    velocityY = -6;
    playSound(wingSound);
}

function placePipes() {
    if (gameOver || isPaused) return;
    
    let randomPipeY = pipeY - pipeHeight/4 - Math.random() * (pipeHeight/2);
    let openingSpace = boardHeight/4;
    
    console.log("Placing pipes at Y:", randomPipeY); // Debug log
    
    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    
    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    
    pipeArray.push(topPipe, bottomPipe);
}

function updatePipes() {
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        
        //remove pipes that are off screen
        if (pipe.x + pipe.width < 0) {
            pipeArray.splice(i, 1);
            i--;
        }
    }
}

function drawPipes() {
    if (pipeArray.length > 0) {
        console.log("Drawing", pipeArray.length, "pipes"); // Debug log
    }
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        if (pipe.img && pipe.img.complete) {
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        }
    }
}

function checkCollision() {
    //check ground and ceiling collision
    if (bird.y + bird.height > boardHeight || bird.y < 0) {
        endGame();
        return;
    }
    
    //check pipe collision
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        if (
            bird.x < pipe.x + pipe.width &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipe.y + pipe.height &&
            bird.y + bird.height > pipe.y
        ) {
            endGame();
            return;
        }
    }
}

function updateScore() {
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            pipe.passed = true;
            score++;
            scoreDisplay.textContent = score;
            playSound(pointSound);
            
            //increase difficulty every 5 points
            if (score % 5 === 0 && score > 0) {
                velocityX -= 0.1;
            }
        }
    }
}

function endGame() {
    if (gameOver) return;
    
    gameOver = true;
    playSound(hitSound);
    playSound(dieSound);
    
    //stop background music
    bgmMusic.pause();
    bgmMusic.currentTime = 0;
    
    //clear pipe interval
    if (pipeIntervalId !== null) {
        clearInterval(pipeIntervalId);
        pipeIntervalId = null;
    }
    
    //create explosion particles
    createExplosion(bird.x + bird.width/2, bird.y + bird.height/2);
    
    //check high score and save to database
    if (score > highScore) {
        highScore = score;
        isNewHighScore = true;
        
        // Save high score to database
        database.addHighScore(score, currentPlayerName).catch(error => {
            console.error('Failed to save high score to database:', error);
            // Fallback to localStorage
            localStorage.setItem('flappyBirdHighScore', highScore);
        });
    } else {
        // Still save the score to database even if it's not a high score
        database.addHighScore(score, currentPlayerName).catch(error => {
            console.error('Failed to save score to database:', error);
        });
    }
    
    //show game over screen after a short delay
    setTimeout(() => {
        showGameOver();
    }, 1000);
}

function showGameOver() {
    let finalScoreValue = Math.floor(score);
    finalScore.textContent = finalScoreValue;
    highScoreFinal.textContent = highScore;
    
    //show/hide new high score badge
    if (isNewHighScore) {
        newBadge.classList.add("show");
    } else {
        newBadge.classList.remove("show");
    }
    
    gameOverScreen.style.display = "block";
    pauseBtn.style.display = "none";
}

function createExplosion(x, y) {
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: Math.random() * 6 + 2,
                size: Math.random() * 6 + 4,
                color: `hsl(${Math.random() * 60 + 40}, 100%, 60%)`,
                life: 60
            });
        }, i * 50);
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life--;
        
        context.globalAlpha = p.life / 40;
        context.fillStyle = p.color;
        context.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        context.globalAlpha = 1;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function startGame() {
    gameStarted = true;
    isPaused = false;
    isNewHighScore = false;
    startScreen.style.display = "none";
    pauseScreen.style.display = "none";
    pauseBtn.style.display = "block";
    
    //reset difficulty
    velocityX = baseVelocityX;
    
    playSound(bgmMusic);
    
    //clear any existing interval before creating a new one
    if (pipeIntervalId !== null) {
        clearInterval(pipeIntervalId);
    }
    pipeIntervalId = setInterval(placePipes, 1500);
}

function togglePause() {
    if (!gameStarted || gameOver) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        pauseScreen.style.display = "block";
        if (!isMuted) {
            bgmMusic.pause();
        }
    } else {
        pauseScreen.style.display = "none";
        playSound(bgmMusic);
    }
}

function resetGame() {
    bird.y = birdY;
    velocityY = 0;
    pipeArray = [];
    score = 0;
    gameOver = false;
    isPaused = false;
    particles = [];
    isNewHighScore = false;
    gameOverScreen.style.display = "none";
    pauseScreen.style.display = "none";
    scoreDisplay.textContent = "0";
    
    //clear existing pipe interval
    if (pipeIntervalId !== null) {
        clearInterval(pipeIntervalId);
        pipeIntervalId = null;
    }
    
    playSound(swooshSound);
    
    //restart the game
    startGame();
}

function goToHome() {
    //stop background music
    bgmMusic.pause();
    bgmMusic.currentTime = 0;
    
    //clear existing pipe interval
    if (pipeIntervalId !== null) {
        clearInterval(pipeIntervalId);
        pipeIntervalId = null;
    }
    
    //reset game state
    bird.y = birdY;
    velocityY = 0;
    pipeArray = [];
    score = 0;
    gameOver = false;
    gameStarted = false;
    isPaused = false;
    particles = [];
    isNewHighScore = false;
    
    //hide all screens and show start screen
    startScreen.style.display = "flex";
    gameOverScreen.style.display = "none";
    pauseScreen.style.display = "none";
    pauseBtn.style.display = "none";
    scoreDisplay.textContent = "0";
    
    playSound(swooshSound);
}

//sound management functions
function playSound(audio) {
    if (isMuted) return;
    audio.currentTime = 0;
    audio.play().catch(e => console.log("Audio play failed:", e));
}

function toggleSound() {
    isMuted = !isMuted;
    
    // Save mute setting to database
    database.saveSetting('isMuted', isMuted).catch(error => {
        console.error('Failed to save mute setting:', error);
        // Fallback to localStorage
        localStorage.setItem('flappyBirdMuted', isMuted);
    });
    
    updateSoundButton();
    
    //toggle background music
    if (isMuted) {
        bgmMusic.pause();
    } else if (gameStarted && !gameOver && !isPaused) {
        playSound(bgmMusic);
    }
}

function updateSoundButton() {
    if (isMuted) {
        soundBtn.textContent = "🔇";
        soundBtn.classList.add("muted");
    } else {
        soundBtn.textContent = "🔊";
        soundBtn.classList.remove("muted");
    }
}

function handleKeyPress(e) {
    if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        moveBird(e);
    } else if (e.code === "Escape") {
        e.preventDefault();
        togglePause();
    }
}

// Leaderboard functions
async function showLeaderboard() {
    try {
        const scores = await database.getTopHighScores(10);
        displayLeaderboard(scores);
        leaderboardModal.style.display = "flex";
        
        // Pause game if it's running
        if (gameStarted && !gameOver && !isPaused) {
            togglePause();
        }
    } catch (error) {
        console.error('Failed to load leaderboard:', error);
        leaderboardList.innerHTML = '<div class="leaderboard-empty">Failed to load high scores</div>';
        leaderboardModal.style.display = "flex";
    }
}

function hideLeaderboard() {
    leaderboardModal.style.display = "none";
}

function displayLeaderboard(scores) {
    if (scores.length === 0) {
        leaderboardList.innerHTML = '<div class="leaderboard-empty">No high scores yet. Start playing to set the first record!</div>';
        return;
    }

    let html = '';
    scores.forEach((score, index) => {
        const rank = index + 1;
        const date = new Date(score.date);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        let rankClass = '';
        let rankEmoji = '';
        if (rank === 1) {
            rankClass = 'gold';
            rankEmoji = '🥇';
        } else if (rank === 2) {
            rankClass = 'silver';
            rankEmoji = '🥈';
        } else if (rank === 3) {
            rankClass = 'bronze';
            rankEmoji = '🥉';
        } else {
            rankEmoji = `${rank}.`;
        }

        html += `
            <div class="leaderboard-item ${rankClass}">
                <div class="leaderboard-rank">${rankEmoji}</div>
                <div class="leaderboard-name">${score.playerName}</div>
                <div class="leaderboard-score">${score.score}</div>
                <div class="leaderboard-date">${formattedDate}</div>
            </div>
        `;
    });

    leaderboardList.innerHTML = html;
}

// Function to set player name (for future enhancement)
async function setPlayerName(name) {
    if (name && name.trim()) {
        currentPlayerName = name.trim();
        try {
            await database.saveSetting('playerName', currentPlayerName);
        } catch (error) {
            console.error('Failed to save player name:', error);
        }
    }
}
