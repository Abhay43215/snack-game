// Select canvas and set up context
const canvas = document.getElementById('snake-game');
const ctx = canvas.getContext('2d');

// Responsive canvas sizing
function resizeCanvas() {
    const gameBoard = document.getElementById('game-board');
    if (window.innerWidth <= 768) {
        const size = Math.min(window.innerWidth - 40, 350);
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
    } else {
        canvas.style.width = '';
        canvas.style.height = '';
    }
}

// Initialize canvas size
window.addEventListener('resize', resizeCanvas);
document.addEventListener('DOMContentLoaded', resizeCanvas);

// Game settings
const scale = 20; // Size of each grid square
let rows = canvas.height / scale; // Rows on canvas
let columns = canvas.width / scale; // Columns on canvas

// Game state variables
let snake;
let food;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameStarted = false;
let gameOver = false;
let gameSpeed = 100; // Initial game speed
let initialSpeed = 100;
let gameInterval;
let isMobile = false;

// Check if device is mobile
function checkMobile() {
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    document.body.classList.toggle('mobile-device', isMobile);
    
    // Adjust instructions text
    const instructionsText = document.querySelector('.instructions p');
    if (instructionsText) {
        instructionsText.innerText = isMobile ? 
            "Use touch buttons to control the snake" : 
            "Use arrow keys to control the snake";
    }
}

// DOM elements
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const mobileControls = document.getElementById('mobile-controls');
const upBtn = document.getElementById('up-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const downBtn = document.getElementById('down-btn');

// Initialize score displays
document.addEventListener('DOMContentLoaded', function() {
    // Make sure the DOM is fully loaded before accessing elements
    updateScoreDisplay();
    highScoreDisplay.innerText = `High Score: ${highScore}`;
    checkMobile();
});

// Function to update score display
function updateScoreDisplay() {
    if (scoreDisplay) {
        scoreDisplay.innerText = `Score: ${score}`;
    }
}

// Set up game
function setup() {
    snake = new Snake();
    food = new Food();
    window.setInterval(gameLoop, 100); // Game loop runs every 100ms
})();
    gameStarted = false;
    gameOver = false;
    score = 0;
    gameSpeed = initialSpeed;
    updateScoreDisplay();
    if (gameOverScreen) {
        gameOverScreen.classList.add('hidden');
    }
}

// Game Loop
function gameLoop() {
    if (!gameStarted || gameOver) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    
    // Draw grid background
    drawGrid();
    
    snake.update();
    snake.draw();
    food.draw();
    updateParticles();
    
    // Check if snake eats food
    if (snake.eat(food)) {
        // Add particle effect for eating
        createParticles(food.x * scale, food.y * scale);
        
        food.randomize();
        while (snake.checkFoodCollision(food)) {
            food.randomize(); // Ensure food doesn't spawn on snake
        }
        
        score++;
        updateScoreDisplay();
        
        // Increase game speed as score increases
        if (score % 5 === 0) {
            gameSpeed = Math.max(50, initialSpeed - (score * 2));
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
        
        // Check and update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreDisplay.innerText = `High Score: ${highScore}`;
        }
    }

    // Check for collision with walls or itself
    if (snake.checkCollision()) {
        // Reset game if collision occurs
        score = 0;
        snake = new Snake();
        document.getElementById("score").innerText = "Score: " + score;
        handleGameOver();
    }
}

// Draw grid background
function drawGrid() {
    ctx.strokeStyle = 'rgba(78, 204, 163, 0.2)';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i < rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * scale);
        ctx.lineTo(canvas.width, i * scale);
        ctx.stroke();
    }
    
    for (let j = 0; j < columns; j++) {
        ctx.beginPath();
        ctx.moveTo(j * scale, 0);
        ctx.lineTo(j * scale, canvas.height);
        ctx.stroke();
    }
}

// Handle game over
function handleGameOver() {
    gameOver = true;
    if (finalScoreDisplay) {
        finalScoreDisplay.innerText = `Your score: ${score}`;
    }
    if (gameOverScreen) {
        gameOverScreen.classList.remove('hidden');
    }
    clearInterval(gameInterval);
}

// Snake class definition
function Snake() {
    this.snakeArray = [{ x: 5, y: 5 }];
    this.direction = 'right'; // Initial direction
    this.nextDirection = 'right';
    this.directionChanged = false;
    this.growing = false;

    this.draw = function() {
        this.snakeArray.forEach(function(segment, index) {
            ctx.fillStyle = index === 0 ? "#00FF00" : "#FFFFFF"; // Head is green, body is white
            ctx.fillRect(segment.x * scale, segment.y * scale, scale, scale);
        this.snakeArray.forEach((segment, index) => {
            // Calculate color for gradient effect from head to tail
            const greenValue = Math.floor(150 - (index * 3));
            const blueValue = Math.floor(255 - (index * 5));
            
            // Draw rounded rectangles for segments
            ctx.fillStyle = index === 0 
                ? '#4ecca3' // Head color
                : `rgb(0, ${Math.max(greenValue, 50)}, ${Math.max(blueValue, 50)})`;
                
            const x = segment.x * scale;
            const y = segment.y * scale;
            
            // Draw rounded rectangle for each segment
            // Check if roundRect is supported (not all browsers support it)
            if (ctx.roundRect) {
                ctx.beginPath();
                ctx.roundRect(x, y, scale, scale, index === 0 ? [8, 8, 8, 8] : [5, 5, 5, 5]);
                ctx.fill();
            } else {
                // Fallback if roundRect is not supported
                ctx.fillRect(x, y, scale, scale);
            }
            
            // Draw eyes if it's the head
            if (index === 0) {
                ctx.fillStyle = '#000';
                
                // Position eyes based on direction
                if (this.direction === 'right' || this.direction === 'left') {
                    const eyeX = this.direction === 'right' ? x + scale * 0.7 : x + scale * 0.3;
                    ctx.beginPath();
                    ctx.arc(eyeX, y + scale * 0.3, scale * 0.1, 0, Math.PI * 2);
                    ctx.arc(eyeX, y + scale * 0.7, scale * 0.1, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    const eyeY = this.direction === 'down' ? y + scale * 0.7 : y + scale * 0.3;
                    ctx.beginPath();
                    ctx.arc(x + scale * 0.3, eyeY, scale * 0.1, 0, Math.PI * 2);
                    ctx.arc(x + scale * 0.7, eyeY, scale * 0.1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Add slight glow effect to the snake
            ctx.shadowColor = '#4ecca3';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        });
        // Reset shadow
        ctx.shadowBlur = 0;
    };

    this.update = function() {
        let head = { ...this.snakeArray[0] };

        // Update direction from the queue
        if (!this.directionChanged) {
            this.direction = this.nextDirection;
        }
        this.directionChanged = false;

        // Move head in the current direction
        if (this.direction === 'right') head.x++;
        if (this.direction === 'left') head.x--;
        if (this.direction === 'up') head.y--;
        if (this.direction === 'down') head.y++;

        this.snakeArray.unshift(head); // Add new head at front
        this.snakeArray.pop(); // Remove last part of the tail
        
        // Remove last part unless growing
        if (!this.growing) {
            this.snakeArray.pop();
        } else {
            this.growing = false;
        }
    };

    this.changeDirection = function(event) {
        if (event.keyCode === 37 && this.direction !== 'right') this.direction = 'left'; // Left arrow
        if (event.keyCode === 38 && this.direction !== 'down') this.direction = 'up'; // Up arrow
        if (event.keyCode === 39 && this.direction !== 'left') this.direction = 'right'; // Right arrow
        if (event.keyCode === 40 && this.direction !== 'up') this.direction = 'down'; // Down arrow
    };

    this.eat = function(food) {
        const head = this.snakeArray[0];
        if (head.x === food.x && head.y === food.y) {
            this.growing = true;
            return true;
        }
        return false;
    };

    this.checkFoodCollision = function(food) {
        return this.snakeArray.some(segment => 
            segment.x === food.x && segment.y === food.y
        );
    };

    this.checkCollision = function() {
        const head = this.snakeArray[0];
        
        // Check if the snake hits the walls
        if (head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows) {
            return true;
        }

        // Check if the snake runs into itself
        for (let i = 1; i < this.snakeArray.length; i++) {
        // Check if the snake runs into itself (start checking from the 4th segment)
        for (let i = 4; i < this.snakeArray.length; i++) {
            if (this.snakeArray[i].x === head.x && this.snakeArray[i].y === head.y) {
                return true;
            }
        }

        return false;
    };
}

// Food class definition
function Food() {
    this.x;
    this.y;
    this.color = '#ff6b6b';
    this.pulseSize = 0;
    this.pulseGrowing = true;

    this.randomize = function() {
        this.x = Math.floor(Math.random() * columns);
        this.y = Math.floor(Math.random() * rows);
        // Random warm color for food
        const hue = Math.floor(Math.random() * 60) + 340; // Red to yellow hues
        this.color = `hsl(${hue}, 100%, 65%)`;
    };

    this.draw = function() {
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(this.x * scale, this.y * scale, scale, scale);
        // Pulse animation for food
        if (this.pulseGrowing) {
            this.pulseSize += 0.04;
            if (this.pulseSize >= 1) this.pulseGrowing = false;
        } else {
            this.pulseSize -= 0.04;
            if (this.pulseSize <= 0) this.pulseGrowing = true;
        }
        
        // Draw glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        // Draw apple-like shape
        const centerX = this.x * scale + scale/2;
        const centerY = this.y * scale + scale/2;
        const radius = (scale/2) + this.pulseSize;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.85, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a little stem to the apple
        ctx.fillStyle = '#7c9a42';
        ctx.fillRect(centerX - 1, centerY - radius - 2, 2, 4);
        
        // Reset shadow
        ctx.shadowBlur = 0;
    };

    this.randomize(); // Randomize initial food position
}

// Listen for keyboard events to control snake direction
// Particle effect when snake eats food
const particles = [];

function createParticles(x, y) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x + scale/2,
            y: y + scale/2,
            size: Math.random() * 3 + 1,
            color: `hsl(${Math.random() * 60 + 160}, 100%, 60%)`,
            speedX: Math.random() * 6 - 3,
            speedY: Math.random() * 6 - 3,
            life: 30
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i]) {
            particles[i].x += particles[i].speedX;
            particles[i].y += particles[i].speedY;
            particles[i].life--;
            
            // Draw particle
            ctx.fillStyle = particles[i].color;
            ctx.beginPath();
            ctx.arc(particles[i].x, particles[i].y, particles[i].size, 0, Math.PI * 2);
            ctx.fill();
            
            // Remove dead particles
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
            }
        }
    }
}

// Prevent scrolling on touch devices when interacting with the game
document.addEventListener('touchmove', function(e) {
    if (e.target.id === 'snake-game' || e.target.className.includes('direction-btn')) {
        e.preventDefault();
    }
}, { passive: false });

// Event listeners for keyboard controls
document.addEventListener('keydown', function(event) {
    snake.changeDirection(event);
    if (!gameStarted && !gameOver && event.key.includes('Arrow')) {
        startGame();
    }
    
    if (gameStarted && !gameOver) {
        switch(event.key) {
            case 'ArrowLeft': snake.changeDirection('left'); break;
            case 'ArrowUp': snake.changeDirection('up'); break;
            case 'ArrowRight': snake.changeDirection('right'); break;
            case 'ArrowDown': snake.changeDirection('down'); break;
        }
    }
});

// Event listeners for touch controls
if (upBtn) upBtn.addEventListener('click', function() {
    if (!gameStarted && !gameOver) startGame();
    if (gameStarted && !gameOver) snake.changeDirection('up');
});

if (leftBtn) leftBtn.addEventListener('click', function() {
    if (!gameStarted && !gameOver) startGame();
    if (gameStarted && !gameOver) snake.changeDirection('left');
});

if (rightBtn) rightBtn.addEventListener('click', function() {
    if (!gameStarted && !gameOver) startGame();
    if (gameStarted && !gameOver) snake.changeDirection('right');
});

if (downBtn) downBtn.addEventListener('click', function() {
    if (!gameStarted && !gameOver) startGame();
    if (gameStarted && !gameOver) snake.changeDirection('down');
});

// Add touch events to prevent default behavior
[upBtn, leftBtn, rightBtn, downBtn].forEach(btn => {
    if (btn) {
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
        }, { passive: false });
    }
});

// Add event listeners to buttons
if (startBtn) {
    startBtn.addEventListener('click', startGame);
}
if (restartBtn) {
    restartBtn.addEventListener('click', startGame);
}

// Start game function
function startGame() {
    setup();
    gameStarted = true;
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

// Initialize game
setup();
