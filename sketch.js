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
let collectedTypes = [];

let selectedAvatar = 0;

// MOBILE
let isMobile = false;

// JOYSTICK
let joystick = { x: 100, y: 350, r: 40, active: false, dx: 0 };

// JUMP BUTTON
let jumpButton = { x: 700, y: 350, r: 35 };

function setup() {
  createCanvas(800, 450);

  isMobile = /Mobi|Android/i.test(navigator.userAgent);

  player = {
    x: 100,
    y: 200,
    w: 30,
    h: 40,
    velX: 0,
    velY: 0,
    onGround: false
  };

  // Ground
  platforms.push({x:0,y:420,w:worldWidth,h:30});

  // Platforms
  platforms.push({x:200,y:330,w:150,h:20});
  platforms.push({x:450,y:270,w:150,h:20});
  platforms.push({x:700,y:210,w:150,h:20});
  platforms.push({x:1000,y:320,w:150,h:20});
  platforms.push({x:1300,y:260,w:150,h:20});
  platforms.push({x:1600,y:200,w:150,h:20});

  // Ingredients
  ingredients.push({x:230,baseY:300,type:"vitc",offset:0});
  ingredients.push({x:500,baseY:240,type:"hyaluronic",offset:50});
  ingredients.push({x:730,baseY:180,type:"niacinamide",offset:100});
  ingredients.push({x:1050,baseY:290,type:"spf",offset:150});
  ingredients.push({x:1330,baseY:230,type:"vitc",offset:200});
  ingredients.push({x:1630,baseY:170,type:"hyaluronic",offset:250});

  // Obstacles
  obstacles.push({x:600,w:40,h:30,baseY:390,offset:0,type:"pollution"});
  obstacles.push({x:900,w:30,h:50,baseY:250,offset:60,type:"uv"});
  obstacles.push({x:1200,w:40,h:30,baseY:390,offset:120,type:"pollution"});

  // Flag
  flag = {x:1850,y:360,w:20,h:60};
}

function draw() {
  background(30);

  if(!checkOrientation()) return;

  if(gameState === "start"){ drawStartScreen(); return; }
  if(gameState === "avatar"){ drawAvatarScreen(); return; }
  if(gameState === "end"){ drawEndScreen(); return; }

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

  fill(255);
  textSize(16);
  text("Collect ingredients to build your bundle",10,25);
}

// ORIENTATION
function checkOrientation(){
  if(window.innerHeight > window.innerWidth){
    background(0);
    fill(255);
    textAlign(CENTER,CENTER);
    textSize(24);
    text("Rotate your device", width/2, height/2);
    return false;
  }
  return true;
}

// MOVEMENT
function movePlayer(){

  if(isMobile){
    if(joystick.dx < -10) player.velX = -5;
    else if(joystick.dx > 10) player.velX = 5;
    else player.velX = 0;
  } else {
    if(keyIsDown(LEFT_ARROW)) player.velX = -5;
    else if(keyIsDown(RIGHT_ARROW)) player.velX = 5;
    else player.velX = 0;
  }
}

// TOUCH CONTROLS
function touchStarted(){

  if(gameState === "start"){ gameState = "avatar"; return; }

  if(gameState === "avatar"){
    if(touchX < width/3) selectedAvatar = 1;
    else if(touchX < width*2/3) selectedAvatar = 2;
    else selectedAvatar = 3;
    gameState = "play";
    return;
  }

  let d = dist(touchX, touchY, joystick.x, joystick.y);
  if(d < joystick.r){ joystick.active = true; }

  let jd = dist(touchX, touchY, jumpButton.x, jumpButton.y);
  if(jd < jumpButton.r && player.onGround){
    player.velY = jumpForce;
    player.onGround = false;
  }
}

function touchMoved(){
  if(joystick.active){
    joystick.dx = touchX - joystick.x;
  }
}

function touchEnded(){
  joystick.active = false;
  joystick.dx = 0;
}

// KEYBOARD
function keyPressed(){

  if(keyCode === ENTER && gameState === "start"){
    gameState = "avatar";
  }

  if(gameState === "avatar"){
    if(key === '1'){ selectedAvatar = 1; gameState = "play"; }
    if(key === '2'){ selectedAvatar = 2; gameState = "play"; }
    if(key === '3'){ selectedAvatar = 3; gameState = "play"; }
  }

  if(key === ' ' && player.onGround){
    player.velY = jumpForce;
    player.onGround = false;
  }

  if(key === 'r' || key === 'R'){
    location.reload();
  }
}

// PHYSICS
function applyPhysics(){
  player.velY += gravity;
  player.x += player.velX;
  player.y += player.velY;
  player.x = constrain(player.x,0,worldWidth-player.w);
}

function checkPlatforms(){
  player.onGround = false;

  for(let p of platforms){
    if(player.x + player.w > p.x &&
       player.x < p.x + p.w &&
       player.y + player.h > p.y &&
       player.y + player.h < p.y + 15 &&
       player.velY >= 0){

        player.y = p.y - player.h;
        player.velY = 0;
        player.onGround = true;
    }
  }
}

// DRAWING
function drawPlayer(){
  if(selectedAvatar === 1) fill(255,100,150);
  else if(selectedAvatar === 2) fill(100,200,255);
  else if(selectedAvatar === 3) fill(180,255,120);
  rect(player.x,player.y,player.w,player.h);
}

function drawPlatforms(){
  fill(120);
  for(let p of platforms){
    rect(p.x,p.y,p.w,p.h);
  }
}

// FLOATING INGREDIENTS
function drawIngredients(){
  for(let i = ingredients.length-1; i >= 0; i--){
    let ing = ingredients[i];

    let floatY = ing.baseY + sin(frameCount*0.05 + ing.offset)*10;
    ing.y = floatY;

    fill(255);
    ellipse(ing.x, ing.y, 18);

    let d = dist(player.x+15, player.y+20, ing.x, ing.y);
    if(d < 20){
      collectedTypes.push(ing.type);
      ingredients.splice(i,1);
    }
  }
}

// FLOATING OBSTACLES
function drawObstacles(){
  for(let o of obstacles){

    let speed = (o.type === "uv") ? 0.08 : 0.04;
    let range = (o.type === "uv") ? 40 : 25;

    o.y = o.baseY + sin(frameCount*speed + o.offset)*range;

    fill(o.type === "uv" ? 'yellow' : 150);
    rect(o.x,o.y,o.w,o.h);

    if(player.x < o.x + o.w &&
       player.x + player.w > o.x &&
       player.y < o.y + o.h &&
       player.y + player.h > o.y){
        gameState = "end";
    }
  }
}

function drawFlag(){
  fill(255);
  rect(flag.x,flag.y,flag.w,flag.h);

  if(player.x + player.w > flag.x &&
     player.x < flag.x + flag.w &&
     player.y + player.h > flag.y){
       gameState = "end";
  }
}

// UI
function drawStartScreen(){
  textAlign(CENTER,CENTER);
  fill(255);
  textSize(36);
  text("Nykaa SkinQuest", width/2, height/2 - 40);
  textSize(18);
  text("Play to build your perfect skincare bundle", width/2, height/2);
  text("Tap to continue", width/2, height/2 + 40);
}

function drawAvatarScreen(){
  textAlign(CENTER,CENTER);
  fill(255);
  textSize(28);
  text("Choose Your Avatar", width/2, 100);

  rect(200,200,50,60);
  rect(375,200,50,60);
  rect(550,200,50,60);
}

function drawEndScreen(){
  background(20);

  textAlign(CENTER,CENTER);
  fill(255);

  textSize(30);
  text("Perfect Bundle Unlocked ✨", width/2, height/2 - 80);

  textSize(18);
  text("College Ready Makeup Kit:", width/2, height/2 - 40);

  text("Lip Liner + Lipstick + Mascara + Gloss", width/2, height/2);

  text("Use Code: NYKAA10", width/2, height/2 + 60);

  text("Tap to Restart", width/2, height/2 + 100);
}

// CONTROLS UI
function drawControls(){
  if(!isMobile) return;

  fill(255,50);
  ellipse(joystick.x, joystick.y, joystick.r*2);

  fill(255);
  ellipse(joystick.x + joystick.dx*0.3, joystick.y, 20);

  fill(255,80);
  ellipse(jumpButton.x, jumpButton.y, jumpButton.r*2);

  fill(0);
  textAlign(CENTER,CENTER);
  text("↑", jumpButton.x, jumpButton.y);
}