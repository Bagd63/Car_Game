const game = document.getElementById('game');
const car = document.getElementById('car');
const overlay = document.getElementById('overlay');
const video = document.getElementById('lossVideo');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart');
const tryAgain = document.getElementById('tryAgain');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

let gameW, gameH;
let carWidth = 56;
let carX = 0;
let obstacleSpeed = 2.2;
let spawnInterval = 1100;
let lastSpawn = 0;
let obstacles = [];
let running = true;
let score = 0;

function resize(){
  gameW = game.clientWidth;
  gameH = game.clientHeight;
  car.style.left = (gameW/2 - carWidth/2) + 'px';
}
window.addEventListener('resize', resize);
resize();

let left=false, right=false;
window.addEventListener('keydown', e=>{
  if(e.key==='ArrowLeft'||e.key==='a') left=true;
  if(e.key==='ArrowRight'||e.key==='d') right=true;
});
window.addEventListener('keyup', e=>{
  if(e.key==='ArrowLeft'||e.key==='a') left=false;
  if(e.key==='ArrowRight'||e.key==='d') right=false;
});

leftBtn.addEventListener('touchstart', ()=>left=true);
leftBtn.addEventListener('touchend', ()=>left=false);
rightBtn.addEventListener('touchstart', ()=>right=true);
rightBtn.addEventListener('touchend', ()=>right=false);

function spawnObstacle(){
  const el=document.createElement('div');
  el.className='obstacle';
  const w=64;
  const minX=12;
  const maxX=gameW-w-12;
  const x=Math.floor(Math.random()*(maxX-minX+1))+minX;
  el.style.left=x+'px';
  el.style.top='-80px';
  const colors=['#6a1b9a','#1e88e5','#ff8f00','#c62828','#2e7d32'];
  el.style.background=colors[Math.floor(Math.random()*colors.length)];
  game.appendChild(el);
  obstacles.push({el,x,y:-80,w:64,h:64});
}

function rectIntersect(a,b){
  return !(a.left>b.right||a.right<b.left||a.top>b.bottom||a.bottom<b.top);
}

function gameOver(){
  running=false;
  overlay.classList.add('show');
  video.currentTime=0;
  video.play().catch(()=>{});
  // Hide game elements
  car.style.display='none';
  obstacles.forEach(o=>{ if(o.el) o.el.style.display='none'; });
  game.style.background = '#0a1a50';
}

tryAgain.addEventListener('click', ()=>reset());
restartBtn.addEventListener('click', ()=>reset());

function reset(){
  obstacles.forEach(o=>{ if(o.el && o.el.parentNode) o.el.parentNode.removeChild(o.el); });
  obstacles=[];
  overlay.classList.remove('show');
  running=true;
  score=0; updateScore();
  obstacleSpeed=2.2; spawnInterval=1100; lastSpawn=performance.now();
  video.pause(); video.currentTime=0;

  // restore visuals
  car.style.display='flex';
  game.style.background='var(--road)';
}

function updateScore(){ scoreEl.textContent='Score: '+Math.floor(score); }

let last=performance.now();
function loop(t){
  const dt=Math.min(40, t-last);
  last=t;
  if(running){
    if(t-lastSpawn>spawnInterval){ spawnObstacle(); lastSpawn=t; }
    for(let i=obstacles.length-1;i>=0;i--){
      const o=obstacles[i];
      o.y+=obstacleSpeed*(dt/16);
      o.el.style.top=o.y+'px';
      if(o.y>gameH+80){ o.el.remove(); obstacles.splice(i,1); score+=1; updateScore(); }
    }
    obstacleSpeed+=0.0008*dt;
    if(spawnInterval>500) spawnInterval-=0.05*(dt/16);
    const moveSpeed=5.2;
    const curLeft=parseFloat(car.style.left)||gameW/2-carWidth/2;
    let target=curLeft;
    if(left) target-=moveSpeed*(dt/16);
    if(right) target+=moveSpeed*(dt/16);
    target=Math.max(6,Math.min(gameW-carWidth-6,target));
    car.style.left=target+'px';
    const carRect=car.getBoundingClientRect();
    const gameRect=game.getBoundingClientRect();
    for(const o of obstacles){
      const oRect=o.el.getBoundingClientRect();
      const carBox={left:carRect.left-gameRect.left,right:carRect.right-gameRect.left,top:carRect.top-gameRect.top,bottom:carRect.bottom-gameRect.top};
      const obsBox={left:oRect.left-gameRect.left,right:oRect.right-gameRect.left,top:oRect.top-gameRect.top,bottom:oRect.bottom-gameRect.top};
      if(rectIntersect(carBox,obsBox)){ gameOver(); break; }
    }
  }
  requestAnimationFrame(loop);
}

lastSpawn=performance.now();
requestAnimationFrame(loop);