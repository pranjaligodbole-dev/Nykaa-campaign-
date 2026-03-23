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
let isMobile = /Mobi|Android/i.test(navigator.userAgent);

// JOYSTICK
let joystick = { x: 100, y: 350, r: 40, active: false, dx: 0 };

// JUMP BUTTON
let jumpButton = { x: 700, y: 350, r: 35 };

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
  platforms.push({x:1000,y:320,w:150,h:20});
  platforms.push({x:1300,y:260,w:150,h:20});
  platforms.push({x:1600,y:200,w:150,h:20});

  ingredients.push({x:230,baseY:300,type:"vitc",offset:0});
  ingredients.push({x:500,baseY:240,type:"hyaluronic",offset:50});
  ingredients.push({x:730,baseY:180,type:"niacinamide",offset:100});
  ingredients.push({x:1050,baseY:290,type:"spf",offset:150});
  ingredients.push({x:1330,baseY:230,type:"vitc",offset:200});
  ingredients.push({x:1630,baseY:170,type:"hyaluronic",offset:250});

  obstacles.push({x:600,w:40,h:30,baseY:390,offset:0,type:"pollution"});
  obstacles.push({x:900,w:30,h:50,baseY:250,offset:60,type:"uv"});
  obstacles.push({x:1200,w:40,h:30,baseY:390,offset:120,type:"pollution"});

  flag = {x:1850,y:360,w:20,h:60};
}

function windowResized(){
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
  background(30);

  if(gameState === "start"){ drawStartScreen(); return; }
  if(gameState === "avatar"){ drawAvatarScreen(); return; }
  if(gameState === "end"){ drawEndScreen(); return; }

  updateCamera();

  joystick.x = 100;
  joystick.y = height - 80;

  jumpButton.x = width - 100;
  jumpButton.y = height - 80;

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

// TOUCH (FIXED)
function touchStarted(){

  if(gameState === "start"){
    gameState = "avatar";
    return;
  }

  if(gameState === "avatar"){
    if(touchX < width/3) selectedAvatar = 1;
    else if(touchX < width*2/3) selectedAvatar = 2;
    else selectedAvatar = 3;

    gameState = "play";
    return;
  }

  if(gameState === "play"){
    let d = dist(touchX, touchY, joystick.x, joystick.y);
    if(d < joystick.r) joystick.active = true;

    let jd = dist(touchX, touchY, jumpButton.x, jumpButton.y);
    if(jd < jumpButton.r && player.onGround){
      player.velY = jumpForce;
      player.onGround = false;
    }
  }

  if(gameState === "end"){
    location.reload();
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

function movePlayer(){
  if(isMobile){
    if(joystick.dx < -10) player.velX = -5;
    else if(joystick.dx > 10) player.velX = 5;
    else player.velX = 0;
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

function updateCamera(){
  cameraX = player.x - width/2;
  cameraX = constrain(cameraX,0,worldWidth-width);
}

function drawPlayer(){
  fill(selectedAvatar===1?'pink':selectedAvatar===2?'cyan':'lightgreen');
  rect(player.x,player.y,player.w,player.h);
}

function drawPlatforms(){
  fill(120);
  for(let p of platforms) rect(p.x,p.y,p.w,p.h);
}

function drawIngredients(){
  for(let i=ingredients.length-1;i>=0;i--){
    let ing = ingredients[i];
    ing.y = ing.baseY + sin(frameCount*0.05+ing.offset)*10;

    ellipse(ing.x, ing.y, 18);

    if(dist(player.x+15,player.y+20,ing.x,ing.y)<20){
      collectedTypes.push(ing.type);
      ingredients.splice(i,1);
    }
  }
}

function drawObstacles(){
  for(let o of obstacles){
    let speed = o.type==="uv"?0.08:0.04;
    let range = o.type==="uv"?40:25;

    o.y = o.baseY + sin(frameCount*speed+o.offset)*range;

    fill(o.type==="uv"?'yellow':150);
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
  rect(flag.x,flag.y,flag.w,flag.h);

  if(player.x + player.w > flag.x &&
     player.x < flag.x + flag.w &&
     player.y + player.h > flag.y){
       gameState = "end";
  }
}

function drawStartScreen(){
  textAlign(CENTER,CENTER);
  fill(255);
  textSize(32);
  text("Nykaa SkinQuest", width/2, height/2);
  textSize(16);
  text("Tap to start", width/2, height/2+40);
}

function drawAvatarScreen(){
  textAlign(CENTER,CENTER);
  fill(255);
  textSize(24);
  text("Choose Avatar", width/2, 100);

  rect(width/6,200,50,60);
  rect(width/2-25,200,50,60);
  rect(width*5/6-25,200,50,60);
}

function drawEndScreen(){
  background(20);
  textAlign(CENTER,CENTER);
  fill(255);
  textSize(28);
  text("Perfect Bundle Unlocked ✨", width/2, height/2);
  textSize(16);
  text("Tap to Restart", width/2, height/2+40);
}

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
