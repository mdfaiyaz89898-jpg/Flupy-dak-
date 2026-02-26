// Canvas & Context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// HTML Elements
const title = document.getElementById("title");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

// Bird Image
const birdImg = new Image();
birdImg.src = "Picsart_26-02-26_17-30-25-252.png";

// Game Variables
let bird, gravity, velocity, pipes, score, highScore, gameOver, gameStarted, paused;

highScore = localStorage.getItem("fluppyHighScore") || 0;

// Initialize Game
function initGame(){
    bird = { x:100, y:200, width:60, height:60, velocity:0 };
    gravity = 0.5;
    pipes = [];
    score = 0;
    gameOver = false;
    paused = false;
}

// Create Pipes
function createPipe(){
    let gap = 170;
    let topHeight = Math.random() * (canvas.height - gap - 200) + 50;

    pipes.push({
        x: canvas.width,
        width: 60,
        top: topHeight,
        bottom: canvas.height - topHeight - gap,
        passed:false
    });
}

let pipeInterval;

// Start Game
function startGame(){
    title.style.display="none";
    startBtn.style.display="none";
    restartBtn.style.display="none";

    gameStarted = true;
    initGame();
    pipeInterval = setInterval(createPipe,2000);
    update();
}

// End Game
function endGame(){
    gameOver = true;
    clearInterval(pipeInterval);
    restartBtn.style.display="block";

    if(score > highScore){
        highScore = score;
        localStorage.setItem("fluppyHighScore", highScore);
    }

    // Canvas shake effect
    canvas.style.transform = "translateX(5px)";
    setTimeout(()=> canvas.style.transform="translateX(0px)",100);
}

// Get Medal
function getMedal(score){
    if(score >= 26) return "Gold 🥇";
    if(score >= 16) return "Silver 🥈";
    if(score >= 6) return "Bronze 🥉";
    return "No Medal 😅";
}

// Update Theme
function updateTheme(){
    if(score >= 10){
        canvas.style.background = "#1a1a2e"; // Night
    } else {
        canvas.style.background = "#70c5ce"; // Day
    }
}

// Update Game Loop
function update(){
    if(!gameStarted || gameOver || paused) return;

    bird.velocity += gravity;
    bird.y += bird.velocity;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Draw Bird
    ctx.drawImage(birdImg,bird.x,bird.y,bird.width,bird.height);

    // Draw Pipes
    pipes.forEach(pipe=>{
        pipe.x -= 3;

        ctx.fillStyle="green";
        ctx.fillRect(pipe.x,0,pipe.width,pipe.top);
        ctx.fillRect(pipe.x,canvas.height-pipe.bottom,pipe.width,pipe.bottom);

        // Collision
        if(
            bird.x < pipe.x + pipe.width &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
        ){
            endGame();
        }

        // Score
        if(!pipe.passed && pipe.x + pipe.width < bird.x){
            score++;
            pipe.passed = true;
        }
    });

    // Bird out of bounds
    if(bird.y + bird.height > canvas.height || bird.y < 0){
        endGame();
    }

    // Draw Scores
    ctx.fillStyle="black";
    ctx.font="25px Arial";
    ctx.fillText("Score: "+score,20,40);
    ctx.fillText("High Score: "+highScore,20,70);

    // Medal
    if(gameOver){
        ctx.fillText("Medal: " + getMedal(score), canvas.width/2 - 60, canvas.height/2 + 40);
    }

    // Day/Night
    updateTheme();

    requestAnimationFrame(update);
}

// Jump Event
function jump(){
    if(gameStarted && !gameOver){
        bird.velocity = -10;
    }
}

// Mouse / Touch
document.addEventListener("click", jump);
document.addEventListener("touchstart", function(e){
    e.preventDefault();
    jump();
});

// Buttons
startBtn.addEventListener("click",startGame);
restartBtn.addEventListener("click",startGame);

// Pause Button (Optional)
let pauseBtn = document.createElement("button");
pauseBtn.innerText = "Pause";
pauseBtn.style.position = "absolute";
pauseBtn.style.top = "10px";
pauseBtn.style.right = "10px";
document.body.appendChild(pauseBtn);

pauseBtn.onclick = function(){
    paused = !paused;
    if(!paused && !gameOver) update();
}
