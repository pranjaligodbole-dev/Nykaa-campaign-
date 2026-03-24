let player;
let gravity = 0.8;
let jumpForce = -12;

let platforms = [];
let ingredients = [];
let obstacles = [];

let gameState = "start";
let selectedAvatar = 0;

let moveLeft = false;
let moveRight = false;

// FIXED LANDSCAPE SIZE
let gameWidth = 800;
let gameHeight = 450;

function setup() {
  createCanvas(gameWidth, gameHeight);

  player = {
    x: 100,
    y: 200,
    w: 30,
    h: 40,
    velX: 0,
    velY: 0,
    onGround: false
  };

  platforms.push({x:0,y:420,w:800,h:30});
  platforms.push({x:200,y:330,w:150,h:20});
  platforms.push({x:450,y:270,w:150,h:20});

  ingredients.push({x:230,y:300});
  ingredients.push({x:500,y:240});

  obstacles.push({x:600,y:390});
}

function draw() {

  // CENTER CANVAS (LANDSCAPE EFFECT)
  let offsetX = (window.innerWidth - gameWidth)/2;
  let offsetY = (window.innerHeight - gameHeight)/2;
  translate(offsetX, offsetY);

  background(30);

  if(gameState === "start"){ drawStart(); return; }
  if(gameState === "avatar"){ drawAvatar(); return; }
  if(gameState === "play"){ drawGame(); return; }
  if(gameState === "end"){ drawEnd(); return; }
}

function drawGame(){

  movePlayer();
  applyPhysics();
  checkPlatforms();

  drawPlatforms();
  drawIngredients();
  drawObstacles();
  drawPlayer();

  drawControls();
}

// INPUT (STABLE)
function touchStarted(){

  let tx = touches[0].x;
  let ty = touches[0].y;

  // adjust for centered canvas
  tx -= (window.innerWidth - gameWidth)/2;
  ty -= (window.innerHeight - gameHeight)/2;

  if(gameState === "start"){
    gameState = "avatar";
    return false;
  }

  if(gameState === "avatar"){
    if(tx < gameWidth/3) selectedAvatar = 1;
    else if(tx < gameWidth*2/3) selectedAvatar = 2;
    else selectedAvatar = 3;

    gameState = "play";
    return false;
  }

  if(gameState === "play"){

    if(tx < gameWidth/3){
      moveLeft = true;
    }
    else if(tx > gameWidth*2/3){
      moveRight = true;
    }
    else if(player.onGround){
      player.velY = jumpForce;
      player.onGround = false;
    }
  }

  if(gameState === "end"){
    location.reload();
  }

  return false;
}

function touchEnded(){
  moveLeft = false;
  moveRight = false;
}

// MOVEMENT
function movePlayer(){
  if(moveLeft) player.velX = -4;
  else if(moveRight) player.velX = 4;
  else player.velX = 0;
}

// PHYSICS
function applyPhysics(){
  player.velY += gravity;
  player.x += player.velX;
  player.y += player.velY;
}

// PLATFORM COLLISION
function checkPlatforms(){
  player.onGround = false;

  for(let p of platforms){
    if(player.x + player.w > p.x &&
       player.x < p.x + p.w &&
       player.y + player.h > p.y &&
       player.y + player.h < p.y + 20 &&
       player.velY >= 0){

        player.y = p.y - player.h;
        player.velY = 0;
        player.onGround = true;
    }
  }
}

// DRAW
function drawPlayer(){
  fill(selectedAvatar===1?'pink':selectedAvatar===2?'cyan':'lightgreen');
  rect(player.x,player.y,player.w,player.h);
}

function drawPlatforms(){
  fill(120);
  for(let p of platforms){
    rect(p.x,p.y,p.w,p.h);
  }
}

function drawIngredients(){
  for(let i=ingredients.length-1;i>=0;i--){
    let ing = ingredients[i];

    ellipse(ing.x, ing.y, 15);

    if(dist(player.x,player.y,ing.x,ing.y)<20){
      ingredients.splice(i,1);
    }
  }
}

function drawObstacles(){
  for(let o of obstacles){

    rect(o.x,o.y,30,30);

    if(player.x < o.x+30 &&
       player.x+player.w > o.x &&
       player.y < o.y+30 &&
       player.y+player.h > o.y){
        gameState = "end";
    }
  }
}

// UI
function drawStart(){
  fill(255);
  textAlign(CENTER,CENTER);
  textSize(30);
  text("Nykaa SkinQuest", gameWidth/2,gameHeight/2);
  textSize(16);
  text("Tap to start", gameWidth/2,gameHeight/2+40);
}

function drawAvatar(){
  fill(255);
  textAlign(CENTER,CENTER);
  text("Choose Avatar", gameWidth/2,100);

  fill(255,100,150);
  rect(0,150,gameWidth/3,200);

  fill(100,200,255);
  rect(gameWidth/3,150,gameWidth/3,200);

  fill(180,255,120);
  rect(gameWidth*2/3,150,gameWidth/3,200);
}

function drawEnd(){
  fill(255);
  textAlign(CENTER,CENTER);
  text("Perfect Bundle Unlocked ✨", gameWidth/2,gameHeight/2);
}

// CONTROLS UI
function drawControls(){
  fill(255,50);
  rect(0,gameHeight-60,gameWidth/3,60);
  rect(gameWidth*2/3,gameHeight-60,gameWidth/3,60);

  fill(255);
  text("<",gameWidth/6,gameHeight-30);
  text(">",gameWidth*5/6,gameHeight-30);
}
