let player;
let gravity = 0.8;
let jumpForce = -15;

let platforms = [];
let products = [];
let slots = [null, null, null];

let worldWidth = 2000;
let cameraX = 0;

let gameState = "start";

let moveLeft = false;
let moveRight = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  initGame();
}

function initGame(){

  player = {
    x: 100,
    y: height - 200,
    w: 30,
    h: 40,
    velX: 0,
    velY: 0,
    onGround: false
  };

  // Platforms (SMOOTHED)
  platforms = [];

  platforms.push({x:0,y:height-30,w:worldWidth,h:30});

  platforms.push({x:200,y:height-120,w:120,h:20});
  platforms.push({x:350,y:height-180,w:120,h:20});
  platforms.push({x:500,y:height-220,w:120,h:20});
  platforms.push({x:650,y:height-260,w:120,h:20});
  platforms.push({x:800,y:height-300,w:120,h:20});

  platforms.push({x:1000,y:height-180,w:120,h:20});
  platforms.push({x:1150,y:height-220,w:120,h:20});
  platforms.push({x:1300,y:height-260,w:120,h:20});
  platforms.push({x:1450,y:height-300,w:120,h:20});

  platforms.push({x:1650,y:height-220,w:150,h:20});

  // Products
  products = [
    {x:230,y:height-150,label:"Primer"},
    {x:500,y:height-250,label:"Foundation"},
    {x:730,y:height-350,label:"Concealer"},
    {x:1050,y:height-210,label:"Blush"},
    {x:1330,y:height-310,label:"Mascara"},
    {x:1630,y:height-260,label:"Lipstick"}
  ];
}

function draw() {

  if(height > width){
    background(255,240,245);
    fill(0);
    textAlign(CENTER,CENTER);
    textSize(20);
    text("Rotate your phone to play", width/2, height/2);
    return;
  }

  if(gameState === "start"){
    drawStartScreen();
    return;
  }

  if(gameState === "end"){
    drawEndScreen();
    return;
  }

  background(30);

  updateCamera();

  push();
  translate(-cameraX,0);

  movePlayer();
  applyPhysics();
  checkPlatforms();

  drawPlatforms();
  drawProducts();
  drawPlayer();

  pop();

  drawSlots();
  drawControls();

  handleTouches(); // 🔥 important

  if(!slots.includes(null)){
    gameState = "end";
  }
}

// 🎬 START
function drawStartScreen(){
  background(255,240,245);

  textAlign(CENTER,CENTER);

  fill(0);
  textSize(32);
  text("Build Your Makeup Kit ✨", width/2, height/2 - 40);

  textSize(18);
  text("Collect any 3 products", width/2, height/2);

  fill(255,0,120);
  rect(width/2 - 80, height/2 + 40, 160, 50, 10);

  fill(255);
  text("Tap to Play", width/2, height/2 + 65);
}

// 🎁 END
function drawEndScreen(){
  background(255,240,245);

  textAlign(CENTER);

  fill(0);
  textSize(28);
  text("Your Makeup Kit ✨", width/2, 100);

  let spacing = 110;
  let totalWidth = spacing * (slots.length - 1);
  let startX = width/2 - totalWidth/2;

  for(let i=0;i<slots.length;i++){
    let x = startX + i * spacing;
    let y = height/2 - 40;

    fill(255);
    rect(x,y,90,90,15);

    if(slots[i]){
      fill(0);
      textSize(12);
      text(slots[i].label,x+45,y+50);
    }
  }

  fill(255,0,120);
  textSize(22);
  text("20% OFF UNLOCKED", width/2, height/2 + 100);

  fill(0);
  textSize(18);
  text("CODE: NYKAA20", width/2, height/2 + 140);

  textSize(14);
  text("Tap to restart", width/2, height/2 + 180);
}

// 🧴 PRODUCTS
function drawProducts(){
  for(let p of products){

    if(p.collected) continue;

    fill(255,220,235);
    rect(p.x-20,p.y-20,60,60,10);

    fill(0);
    textSize(10);
    textAlign(CENTER);
    text(p.label,p.x+10,p.y+5);

    let d = dist(player.x+15,player.y+20,p.x,p.y);

    if(d < 30 && player.onGround){
      collectProduct(p);
    }
  }
}

function collectProduct(p){
  if(p.collected) return;

  let index = slots.indexOf(null);

  if(index !== -1){
    slots[index] = p;
    p.collected = true;
  }
}

// 🎯 SLOTS
function drawSlots(){

  let spacing = 70;
  let totalWidth = spacing * (slots.length - 1);
  let startX = width/2 - totalWidth/2;

  let y = height - 130;

  for(let i=0;i<slots.length;i++){
    let x = startX + i*spacing;

    fill(255);
    rect(x,y,60,60,12);

    if(slots[i]){
      fill(0);
      textSize(10);
      textAlign(CENTER,CENTER);
      text(slots[i].label, x+30, y+30);
    }
  }
}

// 🎮 CONTROLS (UPDATED)
function drawControls(){

  textAlign(CENTER, CENTER);

  // LEFT
  fill(255,150);
  rect(20, height-80, 60, 60, 12);
  fill(0);
  text("<", 50, height-50);

  // RIGHT
  fill(255,150);
  rect(width-80, height-80, 60, 60, 12);
  fill(0);
  text(">", width-50, height-50);

  // JUMP LEFT
  fill(255,150);
  rect(20, height-150, 60, 60, 12);
  fill(0);
  text("^", 50, height-120);

  // JUMP RIGHT
  fill(255,150);
  rect(width-80, height-150, 60, 60, 12);
  fill(0);
  text("^", width-50, height-120);
}

// 📱 MULTI-TOUCH HANDLER
function handleTouches(){

  moveLeft = false;
  moveRight = false;

  for(let t of touches){

    let x = t.x;
    let y = t.y;

    if(x > 20 && x < 80 && y > height-80){
      moveLeft = true;
    }

    if(x > width-80 && y > height-80){
      moveRight = true;
    }

    if(x > 20 && x < 80 && y > height-150 && y < height-90){
      jump();
    }

    if(x > width-80 && y > height-150 && y < height-90){
      jump();
    }
  }
}

function jump(){
  if(player.onGround){
    player.velY = jumpForce;
    player.onGround = false;
  }
}

// ⚙️ CORE
function updateCamera(){
  cameraX = player.x - width/2;
  cameraX = constrain(cameraX,0,worldWidth-width);
}

function movePlayer(){
  if(moveLeft){
    player.velX = -5;
  }
  else if(moveRight){
    player.velX = 5;
  }
  else{
    player.velX = 0;
  }
}

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
       player.x < p.x + p.w){

      if(player.y + player.h <= p.y + player.velY &&
         player.y + player.h + player.velY >= p.y){

        player.y = p.y - player.h;
        player.velY = 0;
        player.onGround = true;
      }

      if(player.y >= p.y + p.h &&
         player.y + player.velY <= p.y + p.h){

        player.y = p.y + p.h;
        player.velY = 0;
      }
    }
  }
}

function drawPlayer(){
  fill(0,200,255);
  rect(player.x,player.y,player.w,player.h,10);
}

function drawPlatforms(){
  fill(120);
  for(let p of platforms){
    rect(p.x,p.y,p.w,p.h);
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  initGame();
}
