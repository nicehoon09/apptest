const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const resetBtn = document.getElementById('resetBtn');

let ball = {x:200, y:500, r:10, vx:3, vy:-5}; // 기본 속도 증가
let flipper = {x:160, y:550, width:80, height:10}; // 하나의 플리퍼 사용
let score = 0;
let lastScore = 0;

// 그리기
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // 공
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
  ctx.fill();

  // 벽
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.strokeRect(0,0,canvas.width,canvas.height);

  // 플리퍼
  ctx.fillStyle = 'yellow';
  ctx.fillRect(flipper.x, flipper.y, flipper.width, flipper.height);
}

// 물리 업데이트
function update(){
  // 공 이동
  ball.x += ball.vx;
  ball.y += ball.vy;

  // 벽 충돌
  if(ball.x-ball.r<0 || ball.x+ball.r>canvas.width) ball.vx *= -1;
  if(ball.y-ball.r<0) ball.vy *= -1;
  if(ball.y+ball.r>canvas.height){
    ball.vy *= -1;
    score = Math.max(0, score-1); // 바닥 맞으면 점수 감소
    updateScore();
  }

  // 플리퍼 충돌
  if(ball.x + ball.r > flipper.x && ball.x - ball.r < flipper.x + flipper.width &&
     ball.y + ball.r > flipper.y && ball.y - ball.r < flipper.y + flipper.height){
    ball.vy = -Math.abs(ball.vy);
    score++;
    updateScore();
  }
}

// 점수 업데이트 및 효과
function updateScore(){
  scoreDisplay.textContent = `점수: ${score}`;

  // 점수 증가 시 배경색 랜덤 변경
  if(score > lastScore){
    const r = Math.floor(Math.random()*256);
    const g = Math.floor(Math.random()*256);
    const b = Math.floor(Math.random()*256);
    document.body.style.backgroundColor = `rgb(${r},${g},${b})`;
    lastScore = score;
  }

  // 10점 단위 속도 증가
  if(score>0 && score % 10 === 0){
    const speedIncrease = 0.5;
    if(Math.abs(ball.vx) < 12) ball.vx += (ball.vx>0 ? speedIncrease : -speedIncrease);
    if(Math.abs(ball.vy) < 12) ball.vy += (ball.vy>0 ? speedIncrease : -speedIncrease);
  }
}

// 마우스 이동으로 플리퍼 위치 조절
canvas.addEventListener('mousemove', (e)=>{
  const rect = canvas.getBoundingClientRect();
  let mouseX = e.clientX - rect.left;
  flipper.x = mouseX - flipper.width/2;

  // 화면 밖으로 나가지 않도록 제한
  if(flipper.x < 0) flipper.x = 0;
  if(flipper.x + flipper.width > canvas.width) flipper.x = canvas.width - flipper.width;
});

// 초기화
function initGame(){
  ball = {x:200, y:500, r:10, vx:3, vy:-5};
  score = 0;
  lastScore = 0;
  flipper.x = 160;
  document.body.style.backgroundColor = '#0b1220';
  updateScore();
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
