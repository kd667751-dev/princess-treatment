// ========================================================
// ROYAL ARCADE (ULTRA EDITION)
// ========================================================

// We assume playChime and burstConfetti are available globally from script.js

// --- ARCADE TAB SWITCHER ---
const arcadeTabBtns = document.querySelectorAll('.arcade-tab-btn');
const arcadeGameViews = document.querySelectorAll('.arcade-game-view');

arcadeTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    arcadeTabBtns.forEach(b => b.classList.remove('active'));
    arcadeGameViews.forEach(v => {
      v.style.display = 'none';
      v.classList.remove('active');
    });

    btn.classList.add('active');
    const targetId = btn.getAttribute('data-game');
    const targetView = document.getElementById(targetId);
    if (targetView) {
      targetView.style.display = 'flex';
      targetView.classList.add('active');

      if (targetId === 'catcherGame') initCatcher();
      if (targetId === 'memoryGame' && memoryCards.length === 0) initMemoryGame();
      if (targetId === 'wheelGame') drawWheel();
      if (targetId === 'tictactoeGame' && !tttInitialized) initTicTacToe();
      if (targetId === 'pianoGame' && !pianoInitialized) initPianoGame();
    }
  });
});

// ========================================================
// GAME 1: CRYSTAL CATCHER (ULTRA)
// ========================================================
const catcherCanvas = document.getElementById('catcherCanvas');
const catcherCtx = catcherCanvas ? catcherCanvas.getContext('2d') : null;
const startCatcherBtn = document.getElementById('startCatcherBtn');
const restartCatcherBtn = document.getElementById('restartCatcherBtn');
const catcherOverlay = document.getElementById('catcherOverlay');
const catcherScoreEl = document.getElementById('catcherScore');
const catcherStreakEl = document.getElementById('catcherStreak');
const catcherLeftBtn = document.getElementById('catcherLeftBtn');
const catcherRightBtn = document.getElementById('catcherRightBtn');

let catcherRunning = false;
let catcherAnimId = null;
let catcherScore = 0;
let catcherStreak = 0;
let catcherMultiplier = 1;
let catcherItems = [];
let catcherParticles = [];
let catcherStars = [];

const catcherPillow = {
  x: 150,
  y: 340,
  width: 100,
  height: 25,
  targetX: 150,
  speed: 0.2 // lerp factor
};

const ITEM_TYPES = [
  { icon: '💎', points: 10, prob: 0.3, type: 'good' },
  { icon: '✨', points: 20, prob: 0.2, type: 'good' },
  { icon: '🌹', points: 15, prob: 0.3, type: 'good' },
  { icon: '🌩️', points: -10, prob: 0.2, type: 'bad' }
];

function initCatcher() {
  if (!catcherCanvas) return;
  // Initialize background stars
  catcherStars = Array.from({length: 50}, () => ({
    x: Math.random() * catcherCanvas.width,
    y: Math.random() * catcherCanvas.height,
    size: Math.random() * 2 + 1,
    speed: Math.random() * 0.5 + 0.1
  }));
  drawCatcher();
}

function spawnCatcherItem() {
  if (Math.random() < 0.03 + (catcherScore/5000)) { // Gets faster
    const r = Math.random();
    let cumulative = 0;
    let selectedType = ITEM_TYPES[0];
    for(let t of ITEM_TYPES) {
      cumulative += t.prob;
      if (r < cumulative) {
        selectedType = t;
        break;
      }
    }
    catcherItems.push({
      x: Math.random() * (catcherCanvas.width - 30) + 15,
      y: -30,
      icon: selectedType.icon,
      points: selectedType.points,
      type: selectedType.type,
      speed: Math.random() * 2 + 2 + (catcherScore/300),
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.1
    });
  }
}

function spawnParticles(x, y, color) {
  for(let i=0; i<15; i++) {
    catcherParticles.push({
      x: x, y: y,
      vx: (Math.random()-0.5)*10,
      vy: (Math.random()-0.5)*10,
      life: 1,
      color: color
    });
  }
}

function updateCatcherLoop() {
  if (!catcherRunning || !catcherCtx) return;
  
  // Clear with semi-transparent black for motion blur
  catcherCtx.fillStyle = 'rgba(26, 11, 46, 0.3)';
  catcherCtx.fillRect(0, 0, catcherCanvas.width, catcherCanvas.height);

  // Update & Draw Stars
  catcherCtx.fillStyle = '#ffffff';
  catcherStars.forEach(star => {
    star.y += star.speed;
    if (star.y > catcherCanvas.height) {
      star.y = 0;
      star.x = Math.random() * catcherCanvas.width;
    }
    catcherCtx.beginPath();
    catcherCtx.arc(star.x, star.y, star.size, 0, Math.PI*2);
    catcherCtx.fill();
  });

  // Lerp pillow
  catcherPillow.x += (catcherPillow.targetX - catcherPillow.x) * catcherPillow.speed;

  // Draw Pillow (Glowing)
  catcherCtx.shadowBlur = 20;
  catcherCtx.shadowColor = '#d4af37';
  catcherCtx.fillStyle = 'linear-gradient(90deg, #d4af37, #fef08a)';
  catcherCtx.beginPath();
  catcherCtx.roundRect(catcherPillow.x, catcherPillow.y, catcherPillow.width, catcherPillow.height, 12);
  catcherCtx.fill();
  catcherCtx.shadowBlur = 0;

  spawnCatcherItem();

  // Update Items
  for (let i = catcherItems.length - 1; i >= 0; i--) {
    let item = catcherItems[i];
    item.y += item.speed;
    item.rot += item.rotSpeed;

    catcherCtx.save();
    catcherCtx.translate(item.x, item.y);
    catcherCtx.rotate(item.rot);
    catcherCtx.font = '24px Arial';
    catcherCtx.textAlign = 'center';
    catcherCtx.textBaseline = 'middle';
    catcherCtx.fillText(item.icon, 0, 0);
    catcherCtx.restore();

    // Collision
    if (item.y + 12 >= catcherPillow.y && item.y - 12 <= catcherPillow.y + catcherPillow.height) {
      if (item.x + 12 >= catcherPillow.x && item.x - 12 <= catcherPillow.x + catcherPillow.width) {
        if (item.type === 'good') {
          catcherStreak++;
          catcherMultiplier = Math.floor(catcherStreak / 5) + 1;
          catcherScore += item.points * catcherMultiplier;
          spawnParticles(item.x, item.y, '#ffd700');
          if (window.playChime) playChime([600 + catcherStreak*20], 'sine', 0.1);
        } else {
          catcherStreak = 0;
          catcherMultiplier = 1;
          catcherScore = Math.max(0, catcherScore + item.points);
          spawnParticles(item.x, item.y, '#ff4444');
          if (window.playChime) playChime([200], 'sawtooth', 0.2);
          
          // Screen shake effect
          catcherCanvas.style.transform = `translate(${(Math.random()-0.5)*10}px, ${(Math.random()-0.5)*10}px)`;
          setTimeout(() => catcherCanvas.style.transform = 'none', 100);
        }
        
        if (catcherScoreEl) catcherScoreEl.textContent = catcherScore;
        if (catcherStreakEl) {
          catcherStreakEl.textContent = `Combo: x${catcherMultiplier} ${catcherMultiplier > 2 ? '🔥' : '✨'}`;
          catcherStreakEl.style.color = catcherMultiplier > 2 ? '#ff7b00' : 'inherit';
        }
        catcherItems.splice(i, 1);
        continue;
      }
    }

    if (item.y > catcherCanvas.height + 30) {
      if (item.type === 'good') {
        catcherStreak = 0;
        catcherMultiplier = 1;
        if (catcherStreakEl) catcherStreakEl.textContent = `Combo: x1 ✨`;
      }
      catcherItems.splice(i, 1);
    }
  }

  // Update Particles
  for (let i = catcherParticles.length - 1; i >= 0; i--) {
    let p = catcherParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.05;
    if (p.life <= 0) {
      catcherParticles.splice(i, 1);
    } else {
      catcherCtx.globalAlpha = p.life;
      catcherCtx.fillStyle = p.color;
      catcherCtx.beginPath();
      catcherCtx.arc(p.x, p.y, 3, 0, Math.PI*2);
      catcherCtx.fill();
      catcherCtx.globalAlpha = 1;
    }
  }

  catcherAnimId = requestAnimationFrame(updateCatcherLoop);
}

function drawCatcher() {
  if (!catcherCtx) return;
  catcherCtx.fillStyle = '#1a0b2e';
  catcherCtx.fillRect(0, 0, catcherCanvas.width, catcherCanvas.height);
}

function startCatcherGame() {
  if (catcherOverlay) catcherOverlay.classList.add('hidden');
  catcherScore = 0;
  catcherStreak = 0;
  catcherMultiplier = 1;
  catcherItems = [];
  catcherParticles = [];
  catcherRunning = true;
  if (catcherScoreEl) catcherScoreEl.textContent = '0';
  if (catcherStreakEl) catcherStreakEl.textContent = 'Combo: x1 ✨';
  
  if (catcherAnimId) cancelAnimationFrame(catcherAnimId);
  catcherAnimId = requestAnimationFrame(updateCatcherLoop);
}

function movePillowEvent(clientX) {
  if (!catcherCanvas) return;
  const rect = catcherCanvas.getBoundingClientRect();
  const canvasX = (clientX - rect.left) * (catcherCanvas.width / rect.width);
  catcherPillow.targetX = Math.max(0, Math.min(catcherCanvas.width - catcherPillow.width, canvasX - catcherPillow.width / 2));
}

if (startCatcherBtn) startCatcherBtn.addEventListener('click', startCatcherGame);
if (restartCatcherBtn) restartCatcherBtn.addEventListener('click', startCatcherGame);

if (catcherCanvas) {
  catcherCanvas.addEventListener('mousemove', (e) => movePillowEvent(e.clientX));
  catcherCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    movePillowEvent(e.touches[0].clientX);
  }, { passive: false });
}

if (catcherLeftBtn) catcherLeftBtn.addEventListener('click', () => catcherPillow.targetX = Math.max(0, catcherPillow.targetX - 50));
if (catcherRightBtn) catcherRightBtn.addEventListener('click', () => catcherPillow.targetX = Math.min(catcherCanvas.width - catcherPillow.width, catcherPillow.targetX + 50));


// ========================================================
// GAME 2: ENCHANTED MEMORY (ULTRA)
// ========================================================
const memoryGrid = document.getElementById('memoryGrid');
const memoryMovesEl = document.getElementById('memoryMoves');
const memoryPairsCountEl = document.getElementById('memoryPairsCount');
const memoryWinBanner = document.getElementById('memoryWinBanner');
const memoryPlayAgainBtn = document.getElementById('memoryPlayAgainBtn');
const restartMemoryBtn = document.getElementById('restartMemoryBtn');

const MEMORY_ICONS_ULTRA = ['👑', '💎', '🌹', '🪄', '💌', '🌸', '✨', '🦢'];
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let memoryMoves = 0;
let memoryLock = false;
let memoryChimeBase = 400;

function initMemoryGame() {
  if (!memoryGrid) return;
  memoryMoves = 0;
  matchedPairs = 0;
  flippedCards = [];
  memoryLock = false;
  memoryChimeBase = 400;

  if (memoryMovesEl) memoryMovesEl.textContent = '0';
  if (memoryPairsCountEl) memoryPairsCountEl.textContent = '0 / 8';
  if (memoryWinBanner) memoryWinBanner.classList.add('hidden');

  const deck = [...MEMORY_ICONS_ULTRA, ...MEMORY_ICONS_ULTRA].sort(() => Math.random() - 0.5);

  memoryGrid.innerHTML = deck.map((icon, idx) => `
    <div class="memory-card ultra" data-index="${idx}" data-icon="${icon}">
      <div class="memory-card-face memory-card-back">✨</div>
      <div class="memory-card-face memory-card-front">${icon}</div>
    </div>
  `).join('');

  memoryCards = document.querySelectorAll('.memory-card');
  memoryCards.forEach(card => {
    card.addEventListener('click', () => handleMemoryCardClick(card));
  });
}

function handleMemoryCardClick(card) {
  if (memoryLock) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');
  if (window.playChime) playChime([500, 600], 'sine', 0.1);
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    memoryMoves++;
    if (memoryMovesEl) memoryMovesEl.textContent = memoryMoves;

    const [c1, c2] = flippedCards;
    const icon1 = c1.getAttribute('data-icon');
    const icon2 = c2.getAttribute('data-icon');

    if (icon1 === icon2) {
      matchedPairs++;
      c1.classList.add('matched');
      c2.classList.add('matched');
      
      // Add glowing effect
      c1.style.boxShadow = "0 0 20px #d4af37";
      c2.style.boxShadow = "0 0 20px #d4af37";

      flippedCards = [];
      if (memoryPairsCountEl) memoryPairsCountEl.textContent = `${matchedPairs} / 8`;
      
      memoryChimeBase += 50; // Pitch goes up with each match
      if (window.playChime) playChime([memoryChimeBase, memoryChimeBase*1.2, memoryChimeBase*1.5], 'sine', 0.3);

      if (matchedPairs === 8) {
        setTimeout(() => {
          if (window.burstConfetti) burstConfetti();
          if (window.playChime) playChime([523, 659, 783, 1046], 'sine', 1);
          if (memoryWinBanner) memoryWinBanner.classList.remove('hidden');
        }, 500);
      }
    } else {
      memoryLock = true;
      setTimeout(() => {
        c1.classList.remove('flipped');
        c2.classList.remove('flipped');
        flippedCards = [];
        memoryLock = false;
        memoryChimeBase = Math.max(400, memoryChimeBase - 25);
      }, 800);
    }
  }
}

if (restartMemoryBtn) restartMemoryBtn.addEventListener('click', initMemoryGame);
if (memoryPlayAgainBtn) memoryPlayAgainBtn.addEventListener('click', initMemoryGame);


// ========================================================
// GAME 3: DESTINY WHEEL (ULTRA)
// ========================================================
const wheelCanvas = document.getElementById('wheelCanvas');
const wheelCtx = wheelCanvas ? wheelCanvas.getContext('2d') : null;
const spinWheelBtn = document.getElementById('spinWheelBtn');
const wheelPrizeCard = document.getElementById('wheelPrizeCard');
const wheelPrizeTitle = document.getElementById('wheelPrizeTitle');
const wheelPrizeDesc = document.getElementById('wheelPrizeDesc');

const WHEEL_PRIZES = [
  { text: "Absolute Peace 🌸", desc: "A royal decree granting complete peace of mind, zero stress, and sweet snacks all week!" },
  { text: "Silk Chocolate 🍫", desc: "A special silk chocolate delivered straight to Her Highness at recess!" },
  { text: "Royal Radiance 👑", desc: "Official recognition that Her Highness brings the warmest vibes anywhere she goes!" },
  { text: "Golden Wishes 💫", desc: "Make any secret wish right now—the universe is listening to Her Highness!" },
  { text: "VIP Stroll 🌸", desc: "Exclusive peaceful recess stroll with your favorite drinks and zero stress." },
  { text: "Infinite Smiles ✨", desc: "A charm that guarantees endless reasons to smile today." }
];

const WHEEL_COLORS = ['#ff9a9e', '#fecfef', '#a18cd1', '#fbc2eb', '#ffecd2', '#fcb69f'];
let wheelAngle = 0;
let isSpinningWheel = false;

function drawWheel() {
  if (!wheelCanvas || !wheelCtx) return;
  const numSlices = WHEEL_PRIZES.length;
  const arc = (2 * Math.PI) / numSlices;
  const radius = wheelCanvas.width / 2;
  const cx = radius;
  const cy = radius;

  wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

  wheelCtx.save();
  wheelCtx.translate(cx, cy);
  wheelCtx.rotate(wheelAngle);

  // Outer glow ring
  wheelCtx.beginPath();
  wheelCtx.arc(0, 0, radius, 0, 2*Math.PI);
  const grad = wheelCtx.createRadialGradient(0,0, radius-20, 0,0, radius);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(1, '#d4af37');
  wheelCtx.fillStyle = grad;
  wheelCtx.fill();

  for (let i = 0; i < numSlices; i++) {
    const startAngle = i * arc;
    const endAngle = startAngle + arc;

    wheelCtx.beginPath();
    wheelCtx.moveTo(0, 0);
    wheelCtx.arc(0, 0, radius - 8, startAngle, endAngle);
    wheelCtx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
    wheelCtx.fill();
    wheelCtx.lineWidth = 3;
    wheelCtx.strokeStyle = '#fff';
    wheelCtx.stroke();

    wheelCtx.save();
    wheelCtx.rotate(startAngle + arc / 2);
    wheelCtx.textAlign = 'right';
    wheelCtx.fillStyle = '#3b1d3d';
    wheelCtx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
    wheelCtx.fillText(WHEEL_PRIZES[i].text, radius - 30, 5);
    wheelCtx.restore();
  }

  // Center golden pin
  wheelCtx.beginPath();
  wheelCtx.arc(0, 0, 30, 0, 2 * Math.PI);
  wheelCtx.fillStyle = '#d4af37';
  wheelCtx.fill();
  wheelCtx.strokeStyle = '#ffffff';
  wheelCtx.lineWidth = 4;
  wheelCtx.stroke();
  
  wheelCtx.fillStyle = '#ffffff';
  wheelCtx.font = '20px sans-serif';
  wheelCtx.textAlign = 'center';
  wheelCtx.textBaseline = 'middle';
  wheelCtx.fillText('👑', 0, 2);

  wheelCtx.restore();
}

function spinWheel() {
  if (isSpinningWheel) return;
  isSpinningWheel = true;
  if (wheelPrizeCard) wheelPrizeCard.classList.add('hidden');
  if (spinWheelBtn) spinWheelBtn.disabled = true;

  const totalRotations = 6 + Math.random() * 5;
  const targetAngle = wheelAngle + totalRotations * 2 * Math.PI + Math.random() * 2 * Math.PI;
  const startAngle = wheelAngle;
  const duration = 5000;
  const startTime = performance.now();
  let lastTick = 0;

  function animateSpin(now) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    // easeOutQuart
    const ease = 1 - Math.pow(1 - t, 4);
    wheelAngle = startAngle + (targetAngle - startAngle) * ease;
    
    // Play tick sound on passing a slice
    const numSlices = WHEEL_PRIZES.length;
    const arc = (2 * Math.PI) / numSlices;
    const currentTick = Math.floor(wheelAngle / arc);
    if (currentTick > lastTick) {
      if (window.playChime) playChime([800 + (Math.random()*200)], 'sine', 0.05);
      lastTick = currentTick;
    }

    drawWheel();

    if (t < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      isSpinningWheel = false;
      if (spinWheelBtn) spinWheelBtn.disabled = false;

      const normalizedAngle = (wheelAngle + Math.PI / 2) % (2 * Math.PI);
      const winningIndex = (numSlices - Math.floor(normalizedAngle / arc) - 1 + numSlices) % numSlices;
      const prize = WHEEL_PRIZES[winningIndex];

      if (window.burstConfetti) burstConfetti();
      if (window.playChime) playChime([523, 659, 783, 1046], 'triangle', 0.5);

      if (wheelPrizeTitle) wheelPrizeTitle.textContent = prize.text;
      if (wheelPrizeDesc) wheelPrizeDesc.textContent = prize.desc;
      if (wheelPrizeCard) wheelPrizeCard.classList.remove('hidden');
    }
  }

  requestAnimationFrame(animateSpin);
}

if (spinWheelBtn) spinWheelBtn.addEventListener('click', spinWheel);


// ========================================================
// GAME 4: ROYAL TACTICS (AI TIC-TAC-TOE)
// ========================================================
const tttBoard = document.getElementById('tttBoard');
const tttCells = document.querySelectorAll('.ttt-cell');
const restartTttBtn = document.getElementById('restartTttBtn');
const tttPlayerScoreEl = document.getElementById('tttPlayerScore');
const tttPartnerScoreEl = document.getElementById('tttPartnerScore');
const tttReaction = document.getElementById('tttReaction');
const tttSpeech = document.getElementById('tttSpeech');
const tttStrike = document.getElementById('tttStrike');

let tttState = ['', '', '', '', '', '', '', '', ''];
let tttGameActive = false;
let tttScores = { player: 0, bot: 0 };
let tttInitialized = false;

const TTT_WIN_LINES = [
  [0,1,2], [3,4,5], [6,7,8], // Rows
  [0,3,6], [1,4,7], [2,5,8], // Cols
  [0,4,8], [2,4,6]           // Diags
];

function initTicTacToe() {
  tttInitialized = true;
  tttState = ['', '', '', '', '', '', '', '', ''];
  tttGameActive = true;
  if(tttStrike) tttStrike.className = 'ttt-strike hidden';
  
  tttCells.forEach(cell => {
    cell.innerHTML = '';
    cell.classList.remove('winner-cell');
    // We attach listener only once, let's use a flag or just attach it once at script load
  });
  
  updateTttSpeech("Your move, Princess! 👑");
}

function updateTttSpeech(text) {
  if (tttSpeech) tttSpeech.textContent = `"${text}"`;
  if (tttReaction) {
    tttReaction.classList.remove('pulse-animation');
    void tttReaction.offsetWidth;
    tttReaction.classList.add('pulse-animation');
  }
}

function handleTttClick(e) {
  if (!tttGameActive) return;
  const index = e.target.getAttribute('data-index');
  if (tttState[index] !== '') return;

  // Player move
  tttState[index] = 'X';
  e.target.innerHTML = '<span class="ttt-mark-x">👑</span>';
  if(window.playChime) playChime([600], 'sine', 0.1);
  
  if (checkTttWin('X')) {
    endTttGame('player');
    return;
  }
  if (!tttState.includes('')) {
    endTttGame('tie');
    return;
  }

  updateTttSpeech("Hmm, clever move... my turn! 🤔");
  tttGameActive = false;
  
  // Bot move (delay for realism)
  setTimeout(makeBotMove, 600);
}

function makeBotMove() {
  // Simple AI: 1. Win if possible, 2. Block if needed, 3. Random
  let move = findBestMove('O'); // Try to win
  if (move === -1) move = findBestMove('X'); // Try to block
  if (move === -1) {
    const empty = tttState.map((val, i) => val === '' ? i : -1).filter(i => i !== -1);
    move = empty[Math.floor(Math.random() * empty.length)];
  }

  if (move !== -1) {
    tttState[move] = 'O';
    tttCells[move].innerHTML = '<span class="ttt-mark-o">💖</span>';
    if(window.playChime) playChime([400], 'sine', 0.1);

    if (checkTttWin('O')) {
      endTttGame('bot');
      return;
    }
    if (!tttState.includes('')) {
      endTttGame('tie');
      return;
    }
    updateTttSpeech("Your turn, Her Highness! ✨");
    tttGameActive = true;
  }
}

function findBestMove(player) {
  for (let i = 0; i < TTT_WIN_LINES.length; i++) {
    const [a, b, c] = TTT_WIN_LINES[i];
    if (tttState[a] === player && tttState[b] === player && tttState[c] === '') return c;
    if (tttState[a] === player && tttState[c] === player && tttState[b] === '') return b;
    if (tttState[b] === player && tttState[c] === player && tttState[a] === '') return a;
  }
  return -1;
}

function checkTttWin(player) {
  for (let i = 0; i < TTT_WIN_LINES.length; i++) {
    const [a, b, c] = TTT_WIN_LINES[i];
    if (tttState[a] === player && tttState[b] === player && tttState[c] === player) {
      drawTttStrike(i);
      tttCells[a].classList.add('winner-cell');
      tttCells[b].classList.add('winner-cell');
      tttCells[c].classList.add('winner-cell');
      return true;
    }
  }
  return false;
}

function drawTttStrike(lineIndex) {
  if(!tttStrike) return;
  tttStrike.className = 'ttt-strike';
  tttStrike.classList.add(`strike-line-${lineIndex}`);
}

function endTttGame(result) {
  tttGameActive = false;
  if (result === 'player') {
    tttScores.player++;
    if(tttPlayerScoreEl) tttPlayerScoreEl.textContent = tttScores.player;
    updateTttSpeech("I bow to your supreme intellect, Princess! 🎉");
    if(window.burstConfetti) burstConfetti();
    if(window.playChime) playChime([523, 659, 783, 1046], 'triangle', 0.5);
  } else if (result === 'bot') {
    tttScores.bot++;
    if(tttPartnerScoreEl) tttPartnerScoreEl.textContent = tttScores.bot;
    updateTttSpeech("Ah! Palace AI claims victory this time! 🤖");
    if(window.playChime) playChime([300, 250, 200], 'sawtooth', 0.4);
  } else {
    updateTttSpeech("A perfect royal tie! Truly a match of equals. 🤝");
  }
}

tttCells.forEach(cell => cell.addEventListener('click', handleTttClick));
if (restartTttBtn) restartTttBtn.addEventListener('click', initTicTacToe);


// ========================================================
// GAME 5: MAGIC PIANO (SIMON SAYS)
// ========================================================
const pianoKeys = document.querySelectorAll('.piano-key');
const startPianoBtn = document.getElementById('startPianoBtn');
const pianoLevelEl = document.getElementById('pianoLevel');
const pianoStatusEl = document.getElementById('pianoStatus');

let pianoSequence = [];
let playerSequence = [];
let pianoLevel = 0;
let pianoPlaying = false;
let pianoInitialized = false;

const PIANO_NOTES = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5

function initPianoGame() {
  pianoInitialized = true;
  pianoKeys.forEach(key => {
    key.addEventListener('click', (e) => {
      if(pianoPlaying) return; // Ignore input while playing sequence
      const noteIdx = parseInt(e.target.getAttribute('data-note'));
      playPianoKey(noteIdx);
      checkPianoInput(noteIdx);
    });
  });
}

function playPianoKey(idx) {
  const key = document.querySelector(`.piano-key[data-note="${idx}"]`);
  if(key) {
    key.classList.add('active');
    setTimeout(() => key.classList.remove('active'), 200);
  }
  if(window.playChime) playChime([PIANO_NOTES[idx]], 'sine', 0.3);
}

function startPianoRound() {
  pianoPlaying = true;
  playerSequence = [];
  pianoLevel++;
  if(pianoLevelEl) pianoLevelEl.textContent = pianoLevel;
  if(pianoStatusEl) pianoStatusEl.textContent = "Listen to the melody... 🎵";
  
  pianoSequence.push(Math.floor(Math.random() * 4));
  
  let delay = 500;
  pianoSequence.forEach((note, index) => {
    setTimeout(() => {
      playPianoKey(note);
    }, delay);
    delay += 600;
  });
  
  setTimeout(() => {
    pianoPlaying = false;
    if(pianoStatusEl) pianoStatusEl.textContent = "Your turn, Princess! ✨";
  }, delay);
}

function checkPianoInput(idx) {
  if(pianoSequence.length === 0) return; // Game hasn't started
  playerSequence.push(idx);
  
  const currentMove = playerSequence.length - 1;
  if(playerSequence[currentMove] !== pianoSequence[currentMove]) {
    // Wrong
    if(pianoStatusEl) pianoStatusEl.textContent = "Oops! Melody broken. 💔";
    if(window.playChime) playChime([150], 'sawtooth', 0.5);
    pianoSequence = [];
    pianoLevel = 0;
    setTimeout(() => {
      if(pianoStatusEl) pianoStatusEl.textContent = "Click Start to try again!";
    }, 2000);
    return;
  }
  
  if(playerSequence.length === pianoSequence.length) {
    // Round complete
    pianoPlaying = true;
    if(pianoStatusEl) pianoStatusEl.textContent = "Perfect! Get ready... 🌟";
    if(window.playChime) setTimeout(() => playChime([800, 1000], 'sine', 0.2), 300);
    setTimeout(startPianoRound, 1500);
  }
}

if(startPianoBtn) {
  startPianoBtn.addEventListener('click', () => {
    pianoSequence = [];
    pianoLevel = 0;
    startPianoRound();
  });
}

// Ensure the first active tab initializes correctly if active on load
document.addEventListener('DOMContentLoaded', () => {
  const activeTab = document.querySelector('.arcade-tab-btn.active');
  if(activeTab) activeTab.click();
});
