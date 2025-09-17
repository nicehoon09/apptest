const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const frameScoresEl = document.getElementById('frameScores');
const resetBtn = document.getElementById('resetBtn');

const laneWidth = 200;
const laneX = canvas.width/2 - laneWidth/2;

let pins = [];
let ball = null;
let rolling = false;
let score = 0;
let currentFrame = 0; // 0~9
let frameScores = Array(10).fill(0);

// 핀 초기 위치 (180도 반전)
function initPins(){
  pins = [];
  const startX = canvas.width/2;
  const rowGap = 40;
  const colGap = 30;
  let rows = [1,2,3,4]; // 10핀 배치
  rows.forEach((numRow, rIdx)=>{
    for(let i=0;i<numRow;i++){
      let x = startX - (numRow-1)*colGap/2 + i*colGap;
      let y = canvas.height - 50 - rIdx*rowGap; // 화면 아래쪽에서 위로 쌓임
      pins.push({x,y,r:8, knocked:false});
    }
  });
}

// 공 초기화 (위쪽에서 시작)
function initBall(){
  ball = {x:canvas.width/2, y:30, r:12, vx:0, vy:0, moving:false};
}

// 프레임 점수 박스 초기화
function initFrameScores(){
  frameScoresEl.innerHTML = '';
  for(let i=0;i<10;i++){
    const box = document.createElement('div');
    box.classList.add('frameScoreBox');
    box.id = `frame${i}`;
    box.textContent = '0';
    frameScoresEl.appendChild(box);
  }
}

// 그리기
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // 레인
  ctx.fillStyle="#333";
  ctx.fillRect(laneX,0,laneWidth,canvas.height);

  // 핀
  pins.forEach(pin=>{
    ctx.fillStyle = pin.knocked ? "#555" : "white";
    ctx.beginPath();
    ctx.arc(pin.x,pin.y,pin.r,0,Math.PI*2);
    ctx.fill();
  });

  // 공
  if(ball){
    ctx.fillStyle="red";
    ctx.beginPath();
    ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);
    ctx.fill();
  }
}

// 물리 업데이트
function update(){
  if(ball && ball.moving){
    // 감속 효과
    const friction = 0.95;
    ball.vx *= friction;
    ball.vy *= friction;

    ball.x += ball.vx;
    ball.y += ball.vy;

    // 레인 제한
    if(ball.x<laneX+ball.r) ball.x=laneX+ball.r;
    if(ball.x>laneX+laneWidth-ball.r) ball.x=laneX+laneWidth-ball.r;

    // 핀 충돌
    let pinsHitThisRoll = 0;
    pins.forEach(pin=>{
      if(!pin.knocked){
        let dx = ball.x - pin.x;
        let dy = ball.y - pin.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < ball.r + pin.r){
          pin.knocked = true;
          pinsHitThisRoll++;
        }
      }
    });

    if(pinsHitThisRoll>0){
      frameScores[currentFrame] += pinsHitThisRoll;
      document.getElementById(`frame${currentFrame}`).textContent = frameScores[currentFrame];
      score += pinsHitThisRoll;
      scoreDisplay.textContent = `총 점수: ${score} (프레임 ${currentFrame+1}/10)`;
    }

    // 공 속도 거의 0이면 정지 처리
    if(Math.abs(ball.vx) < 0.1 && Math.abs(ball.vy) < 0.1){
      ball.moving=false;
      rolling=false;
      ball.vx=0; ball.vy=0;
      ball.y=30;
      ball.x=canvas.width/2;
      nextFrame();
    }
  }
}

function nextFrame(){
  if(currentFrame<9){
    currentFrame++;
    initPins();
    initBall();
  } else {
    scoreDisplay.textContent += " 🎉 게임 끝!";
  }
}

// 마우스 이벤트
canvas.addEventListener('mousedown',(e)=>{
  if(rolling) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const dx = mouseX - ball.x;
  const dy = mouseY - ball.y;
  const initialSpeed = 15; // 초기 속도
  ball.vx = dx / initialSpeed;
  ball.vy = dy / initialSpeed;
  ball.moving = true;
  rolling = true;
});

// 초기화
function initGame(){
  score = 0;
  currentFrame = 0;
  frameScores = Array(10).fill(0);
  initPins();
  initBall();
  initFrameScores();
  draw();
  scoreDisplay.textContent = `총 점수: 0 (프레임 1/10)`;
}

resetBtn.addEventListener('click', initGame);

// 게임 루프
function gameLoop(){
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

initGame();
gameLoop();
