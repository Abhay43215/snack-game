// Select canvas and set up context
const canvas = document.getElementById('snake-game');
const ctx = canvas.getContext('2d');

// Game settings
const scale = 20; // Size of each grid square
const rows = canvas.height / scale; // Rows on canvas
const columns = canvas.width / scale; // Columns on canvas

let snake;
let food;
let score = 0;

// Snake object
(function setup() {
    snake = new Snake();
    food = new Food();
    window.setInterval(gameLoop, 100); // Game loop runs every 100ms
})();

// Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    snake.update();
    snake.draw();
    food.draw();
    
    // Check if snake eats food
    if (snake.eat(food)) {
        food.randomize();
        score++;
        document.getElementById("score").innerText = "Score: " + score;
    }

    // Check for collision with walls or itself
    if (snake.checkCollision()) {
        // Reset game if collision occurs
        score = 0;
        snake = new Snake();
        document.getElementById("score").innerText = "Score: " + score;
    }
}

// Snake class definition
function Snake() {
    this.snakeArray = [{ x: 5, y: 5 }];
    this.direction = 'right'; // Initial direction

    this.draw = function() {
        this.snakeArray.forEach(function(segment, index) {
            ctx.fillStyle = index === 0 ? "#00FF00" : "#FFFFFF"; // Head is green, body is white
            ctx.fillRect(segment.x * scale, segment.y * scale, scale, scale);
        });
    };

    this.update = function() {
        let head = { ...this.snakeArray[0] };

        // Move head in the current direction
        if (this.direction === 'right') head.x++;
        if (this.direction === 'left') head.x--;
        if (this.direction === 'up') head.y--;
        if (this.direction === 'down') head.y++;

        this.snakeArray.unshift(head); // Add new head at front
        this.snakeArray.pop(); // Remove last part of the tail
    };

    this.changeDirection = function(event) {
        if (event.keyCode === 37 && this.direction !== 'right') this.direction = 'left'; // Left arrow
        if (event.keyCode === 38 && this.direction !== 'down') this.direction = 'up'; // Up arrow
        if (event.keyCode === 39 && this.direction !== 'left') this.direction = 'right'; // Right arrow
        if (event.keyCode === 40 && this.direction !== 'up') this.direction = 'down'; // Down arrow
    };

    this.eat = function(food) {
        const head = this.snakeArray[0];
        return head.x === food.x && head.y === food.y;
    };

    this.checkCollision = function() {
        const head = this.snakeArray[0];
        
        // Check if the snake hits the walls
        if (head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows) {
            return true;
        }

        // Check if the snake runs into itself
        for (let i = 1; i < this.snakeArray.length; i++) {
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

    this.randomize = function() {
        this.x = Math.floor(Math.random() * columns);
        this.y = Math.floor(Math.random() * rows);
    };

    this.draw = function() {
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(this.x * scale, this.y * scale, scale, scale);
    };

    this.randomize(); // Randomize initial food position
}

// Listen for keyboard events to control snake direction
document.addEventListener('keydown', function(event) {
    snake.changeDirection(event);
});
