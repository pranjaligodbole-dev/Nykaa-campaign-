let player;
let gravity = 0.8;
let jumpForce = -15;

let platforms = [];
let ingredients = [];
let obstacles = [];

let worldWidth = 2000;
let cameraX = 0;

let flag;

let gameState = "start";
let selectedAvatar = 0;

let moveLeft = false;
let moveRight = false;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);

  player = {
    x: 100,
    y: 200,
    w: 30,
    h: 40,
    velX: 0,
    velY: 0,
    onGround: false
  };

  platforms.push({x:0,y:420,w:worldWidth,h:30});
  platforms.push({x:200,y:330,w:150,h:20});
  platforms.push({x:450,y:270,w:150,h:20});
  platforms.push({x:700,y:210,w:150,h:20});

  ingredients.push({x:230,baseY:300,offset:0});
  ingredients.push({x:500,baseY:240,offset:50});

  obstacles.push({x:600,baseY:390,offset:0});
  obstacles.push({x:900,baseY:250,offset:60});

  flag = {x:1200,y:360,w:20,h:60};
}

function draw() {
  background(30);

  if(gameState === "start"){ drawStart(); return; }
  if(gameState === "avatar"){ drawAvatar(); return; }
  if(gameState === "end"){ drawEnd(); return; }

  updateCamera();

  push();
  translate(-cameraX,0);

  movePlayer();
  applyPhysics();
  checkPlatforms();

  drawPlatforms();
  drawIngredients();
  drawObstacles();
  drawFlag();
  drawPlayer();

  pop();

  drawControls();
}

// ✅ TOUCH INPUT (FIXED PROPERLY)
function touchStarted(){

  let tx = touches[0].x;

  if(gameState === "start"){
    gameState = "avatar";
    return false;
  }

  if(gameState === "avatar"){
    if(tx < width/3) selectedAvatar = 1;
    else if(tx < width*2/3) selectedAvatar = 2;
    else selectedAvatar = 3;

    gameState = "play";
    return false;
  }

  if(gameState === "play"){

    if(tx < width/3){
      moveLeft = true;
    }
    else if(tx > width*2/3){
      moveRight = true;
    }
    else{
      if(player.onGround){
        player.velY = jumpForce;
        player.onGround = false;
      }
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
  return false;
}

// MOVEMENT
function movePlayer(){
  if(moveLeft) player.velX = -5;
  else if(moveRight) player.velX = 5;
  else player.velX = 0;
}

// PHYSICS
function applyPhysics(){
  player.velY += gravity;
  player.x += player.velX;
  player.y += player.velY;
}

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

function updateCamera(){
  cameraX = player.x - width/2;
  cameraX = constrain(cameraX,0,worldWidth-width);
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
    let y = ing.baseY + sin(frameCount*0.05+ing.offset)*10;

    ellipse(ing.x,y,15);

    if(dist(player.x,player.y,ing.x,y)<20){
      ingredients.splice(i,1);
    }
  }
}

function drawObstacles(){
  for(let o of obstacles){
    let y = o.baseY + sin(frameCount*0.04+o.offset)*20;

    rect(o.x,y,30,30);

    if(player.x < o.x+30 &&
       player.x+player.w > o.x &&
       player.y < y+30 &&
       player.y+player.h > y){
        gameState = "end";
    }
  }
}

function drawFlag(){
  rect(flag.x,flag.y,flag.w,flag.h);

  if(player.x > flag.x){
    gameState = "end";
  }
}

// UI
function drawStart(){
  fill(255);
  textAlign(CENTER,CENTER);
  textSize(30);
  text("Nykaa SkinQuest", width/2,height/2);
  textSize(16);
  text("Tap to start", width/2,height/2+40);
}

function drawAvatar(){
  fill(255);
  textAlign(CENTER,CENTER);
  text("Choose Avatar", width/2,100);

  fill(255,100,150);
  rect(0,150,width/3,200);

  fill(100,200,255);
  rect(width/3,150,width/3,200);

  fill(180,255,120);
  rect(width*2/3,150,width/3,200);
}

function drawEnd(){
  fill(255);
  textAlign(CENTER,CENTER);
  text("Perfect Bundle Unlocked ✨", width/2,height/2);
  text("Tap to restart", width/2,height/2+40);
}

function drawControls(){
  fill(255,50);
  rect(0,height-80,width/3,80);
  rect(width*2/3,height-80,width/3,80);

  fill(255);
  textAlign(CENTER,CENTER);
  text("<",width/6,height-40);
  text(">",width*5/6,height-40);
}
