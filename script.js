/* ========================================================
   PRINCESS TREATMENT - INTERACTIVE SCRIPTS & PALACE VAULT
   Dedicated to Princess Raj Nandani
   ======================================================== */

// --- 1. WEB AUDIO API CHIMES (WORKS ANYWHERE, ZERO ASSETS NEEDED) ---
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playChime(freqs = [523.25, 659.25, 783.99, 1046.50], type = 'sine', duration = 0.8) {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;

    freqs.forEach((freq, index) => {
      setTimeout(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      }, index * 90);
    });
  } catch (e) {
    console.warn("Audio chime prevented:", e);
  }
}

function playBoop() {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, audioCtx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (e) {}
}

// --- 2. SPARKLE & FAIRY DUST CANVAS ---
const canvas = document.getElementById('sparkle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let mouseParticles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Sparkle {
  constructor(x, y, isMouse = false) {
    this.x = x ?? Math.random() * canvas.width;
    this.y = y ?? Math.random() * canvas.height;
    this.size = isMouse ? Math.random() * 5 + 3 : Math.random() * 3 + 1.5;
    this.speedX = isMouse ? (Math.random() - 0.5) * 3 : (Math.random() - 0.5) * 0.8;
    this.speedY = isMouse ? (Math.random() - 0.5) * 3 : Math.random() * -1 - 0.3;
    this.alpha = 1;
    this.decay = isMouse ? 0.025 : 0.005;
    this.isHeart = Math.random() > 0.65;
    this.color = ['#f472b6', '#fbbf24', '#c084fc', '#fde047', '#ff8fab'][Math.floor(Math.random() * 5)];
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.alpha -= this.decay;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(this.alpha, 0);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;

    if (this.isHeart) {
      const hSize = this.size * 1.4;
      ctx.beginPath();
      ctx.translate(this.x, this.y);
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-hSize / 2, -hSize / 2, -hSize, hSize / 3, 0, hSize);
      ctx.bezierCurveTo(hSize, hSize / 3, hSize / 2, -hSize / 2, 0, 0);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

for (let i = 0; i < 40; i++) {
  particles.push(new Sparkle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, index) => {
    p.update();
    p.draw();
    if (p.alpha <= 0 || p.y < -10) {
      particles[index] = new Sparkle(Math.random() * canvas.width, canvas.height + 10);
    }
  });

  for (let i = mouseParticles.length - 1; i >= 0; i--) {
    const mp = mouseParticles[i];
    mp.update();
    mp.draw();
    if (mp.alpha <= 0) {
      mouseParticles.splice(i, 1);
    }
  }

  requestAnimationFrame(animateParticles);
}
animateParticles();

function spawnFairyDust(x, y) {
  for (let i = 0; i < 2; i++) {
    mouseParticles.push(new Sparkle(x, y, true));
  }
}

window.addEventListener('mousemove', (e) => spawnFairyDust(e.clientX, e.clientY));
window.addEventListener('touchmove', (e) => {
  if (e.touches[0]) spawnFairyDust(e.touches[0].clientX, e.touches[0].clientY);
});

function burstConfetti(originX = window.innerWidth / 2, originY = window.innerHeight / 2) {
  for (let i = 0; i < 60; i++) {
    const p = new Sparkle(originX, originY, true);
    p.speedX = (Math.random() - 0.5) * 12;
    p.speedY = (Math.random() - 0.7) * 14;
    p.decay = 0.012;
    p.size = Math.random() * 6 + 4;
    mouseParticles.push(p);
  }
}

// --- 3. LIVE PALACE HEARTS & TAPS ---
const heartCountNumber = document.getElementById('heartCountNumber');
const heartCounterContainer = document.getElementById('heartCounterContainer');

async function fetchHearts() {
  try {
    const res = await fetch('/api/hearts');
    if (res.ok) {
      const data = await res.json();
      if (data.hearts && heartCountNumber) {
        heartCountNumber.textContent = data.hearts;
      }
    }
  } catch (err) {
    console.log('Using local state for stats');
  }
}
fetchHearts();

async function incrementHearts() {
  playChime([659.25, 830.61, 987.77]);
  burstConfetti();
  try {
    const res = await fetch('/api/hearts', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (data.hearts && heartCountNumber) {
        heartCountNumber.textContent = data.hearts;
      }
    }
  } catch (e) {
    if (heartCountNumber) {
      heartCountNumber.textContent = Number(heartCountNumber.textContent || 0) + 1;
    }
  }
}

if (heartCounterContainer) {
  heartCounterContainer.addEventListener('click', incrementHearts);
}

// --- 3.0. ROYAL GATEKEEPER PASSCODE PROTECTION & 5-MIN SESSION TIMER ---
const royalGatekeeper = document.getElementById('royalGatekeeper');
const gatekeeperCard = document.getElementById('gatekeeperCard');
const gatekeeperForm = document.getElementById('gatekeeperForm');
const gatekeeperInput = document.getElementById('gatekeeperInput');
const gatekeeperSubmitBtn = document.getElementById('gatekeeperSubmitBtn');
const gatekeeperAlert = document.getElementById('gatekeeperAlert');
const togglePasscodeVisibility = document.getElementById('togglePasscodeVisibility');
const mainPageContent = document.getElementById('mainPageContent');
const sessionTimerBadge = document.getElementById('sessionTimerBadge');
const sessionTimerText = document.getElementById('sessionTimerText');

const SESSION_DURATION_MS = 5 * 60 * 1000; // 5 minutes
let sessionInterval = null;

function trackVisitor(status = 'visit', codeAttempted = '') {
  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: window.location.pathname || '/',
        code_attempted: codeAttempted,
        status: status
      })
    }).catch(() => {});
  } catch (e) {}
}

// Track initial page load
trackVisitor('visit', '');

function lockGatekeeper(reason = 'expired') {
  if (sessionInterval) clearInterval(sessionInterval);
  sessionStorage.removeItem('royal_access_key');
  sessionStorage.removeItem('royal_session_expiry');

  document.body.classList.add('gate-locked');
  if (mainPageContent) mainPageContent.style.display = 'none';
  if (sessionTimerBadge) sessionTimerBadge.classList.add('hidden');

  if (royalGatekeeper) {
    royalGatekeeper.style.display = 'flex';
    royalGatekeeper.classList.remove('unlocked');
  }

  if (reason === 'expired' && gatekeeperAlert) {
    gatekeeperAlert.className = 'gatekeeper-alert alert-error';
    gatekeeperAlert.innerHTML = `<span>⏳ Your 5-minute royal session has expired. Please enter the passcode to re-enter.</span>`;
    gatekeeperAlert.classList.remove('hidden');
    playBoop();
  }
}

function startSessionTimer(expiryTime) {
  if (sessionInterval) clearInterval(sessionInterval);

  function update() {
    const remaining = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
    const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
    const secs = String(remaining % 60).padStart(2, '0');

    if (sessionTimerText) sessionTimerText.textContent = `${mins}:${secs}`;
    if (sessionTimerBadge) sessionTimerBadge.classList.remove('hidden');

    if (remaining <= 0) {
      clearInterval(sessionInterval);
      lockGatekeeper('expired');
    }
  }

  update();
  sessionInterval = setInterval(update, 1000);
}

function unlockGatekeeper(animate = true) {
  document.body.classList.remove('gate-locked');
  if (mainPageContent) {
    mainPageContent.style.display = 'block';
    if (animate) mainPageContent.classList.add('fade-in-content');
  }

  let expiry = Number(sessionStorage.getItem('royal_session_expiry') || 0);
  if (!expiry || Date.now() >= expiry) {
    expiry = Date.now() + SESSION_DURATION_MS;
    sessionStorage.setItem('royal_session_expiry', expiry);
  }

  startSessionTimer(expiry);

  if (royalGatekeeper) {
    if (animate) {
      royalGatekeeper.classList.add('unlocked');
      setTimeout(() => {
        royalGatekeeper.style.display = 'none';
      }, 600);
    } else {
      royalGatekeeper.style.display = 'none';
    }
  }
}

// Check session on load
const storedKey = sessionStorage.getItem('royal_access_key');
const storedExpiry = Number(sessionStorage.getItem('royal_session_expiry') || 0);

if (storedKey === '180110' && storedExpiry && Date.now() < storedExpiry) {
  unlockGatekeeper(false);
} else {
  sessionStorage.removeItem('royal_access_key');
  sessionStorage.removeItem('royal_session_expiry');
}

if (togglePasscodeVisibility && gatekeeperInput) {
  togglePasscodeVisibility.addEventListener('click', () => {
    if (gatekeeperInput.type === 'password') {
      gatekeeperInput.type = 'text';
    } else {
      gatekeeperInput.type = 'password';
    }
  });
}

function handleGatekeeperSubmit(e) {
  if (e) e.preventDefault();
  const code = (gatekeeperInput ? gatekeeperInput.value : '').trim().replace(/\s+/g, '');

  if (!code) {
    if (gatekeeperInput) gatekeeperInput.focus();
    return;
  }

  // Code 1: 180110 -> Correct Royal Passcode
  if (code === '180110') {
    sessionStorage.setItem('royal_access_key', '180110');
    sessionStorage.setItem('royal_session_expiry', Date.now() + SESSION_DURATION_MS);
    trackVisitor('granted', '180110');

    if (gatekeeperAlert) {
      gatekeeperAlert.className = 'gatekeeper-alert alert-success';
      gatekeeperAlert.innerHTML = `<span>👑 Access Granted • Welcome Her Highness!</span>`;
      gatekeeperAlert.classList.remove('hidden');
    }
    playChime([523.25, 659.25, 783.99, 1046.50]);
    burstConfetti();
    setTimeout(burstConfetti, 400);

    setTimeout(() => {
      unlockGatekeeper(true);
    }, 700);
    return;
  }

  // Code 2: 1415145 -> Decoy / Trap Code
  if (code === '1415145') {
    trackVisitor('trap', '1415145');
    playBoop();
    if (gatekeeperCard) {
      gatekeeperCard.classList.remove('shake');
      void gatekeeperCard.offsetWidth;
      gatekeeperCard.classList.add('shake');
    }
    if (gatekeeperAlert) {
      gatekeeperAlert.className = 'gatekeeper-alert alert-denied';
      gatekeeperAlert.innerHTML = `
        <div class="denied-icon">⛔</div>
        <div class="denied-heading">This is not for you...</div>
        <div class="denied-text">This sanctuary is strictly reserved for Her Highness. You do not have permission to view this royal domain.</div>
      `;
      gatekeeperAlert.classList.remove('hidden');
    }
    if (gatekeeperInput) {
      gatekeeperInput.value = '';
      gatekeeperInput.style.borderColor = '#ef4444';
      setTimeout(() => {
        if (gatekeeperInput) gatekeeperInput.style.borderColor = '';
      }, 1500);
    }
    return;
  }

  // Code 3: Any other invalid passcode
  trackVisitor('denied', code);
  playBoop();
  if (gatekeeperCard) {
    gatekeeperCard.classList.remove('shake');
    void gatekeeperCard.offsetWidth;
    gatekeeperCard.classList.add('shake');
  }
  if (gatekeeperAlert) {
    gatekeeperAlert.className = 'gatekeeper-alert alert-error';
    gatekeeperAlert.innerHTML = `<span>🔒 Invalid Royal Key. Please enter the correct code.</span>`;
    gatekeeperAlert.classList.remove('hidden');
  }
  if (gatekeeperInput) {
    gatekeeperInput.style.borderColor = '#ef4444';
    setTimeout(() => {
      if (gatekeeperInput) gatekeeperInput.style.borderColor = '';
    }, 1500);
  }
}

if (gatekeeperForm) {
  gatekeeperForm.addEventListener('submit', handleGatekeeperSubmit);
}
if (gatekeeperSubmitBtn) {
  gatekeeperSubmitBtn.addEventListener('click', handleGatekeeperSubmit);
}

// --- 3.5. CRYPTIC COORDINATES CIPHER ---
const cipherGlyphs = document.querySelectorAll('.cipher-glyph');
const cipherGuessInput = document.getElementById('cipherGuessInput');
const verifyGuessBtn = document.getElementById('verifyGuessBtn');
const toggleAlphabetKeyBtn = document.getElementById('toggleAlphabetKeyBtn');
const alphabetKeyModal = document.getElementById('alphabetKeyModal');
const decodedNotice = document.getElementById('decodedNotice');
const letterNameFill = document.querySelector('.letter-name-fill');
const sealPromptText = document.getElementById('sealPromptText');
const previewText = document.getElementById('previewText');
const letterStatusPrompt = document.getElementById('letterStatusPrompt');
const envelopeCard = document.getElementById('envelopeCard');

let isDecoded = false;

function triggerFullDecode() {
  if (isDecoded) return;
  isDecoded = true;

  cipherGlyphs.forEach((glyph, idx) => {
    setTimeout(() => {
      glyph.textContent = glyph.getAttribute('data-char');
      glyph.classList.add('decoded');
      const baseFreq = 440 + idx * 40;
      playChime([baseFreq, baseFreq * 1.25], 'sine', 0.25);
    }, idx * 60);
  });

  setTimeout(() => {
    playChime([523.25, 659.25, 783.99, 1046.50, 1318.51]);
    burstConfetti();
    setTimeout(burstConfetti, 400);

    if (decodedNotice) decodedNotice.classList.remove('hidden');
    if (letterNameFill) letterNameFill.textContent = 'Raj Nandani';

    // Unlock the private letter
    if (envelopeCard) envelopeCard.classList.remove('locked-envelope');
    if (sealPromptText) sealPromptText.textContent = 'Tap to Open';
    if (previewText) previewText.textContent = 'Confidential Royal Letter • For Your Eyes Only';
    if (letterStatusPrompt) letterStatusPrompt.textContent = '✨ The royal seal is now unlocked! Tap to read:';
  }, cipherGlyphs.length * 60 + 100);
}


// Direct guess input
function checkGuess() {
  const guess = cipherGuessInput ? cipherGuessInput.value.trim().toLowerCase() : '';
  if (guess.includes('raj') || guess.includes('nandani')) {
    triggerFullDecode();
  } else {
    playBoop();
    if (cipherGuessInput) {
      cipherGuessInput.style.borderColor = '#ef4444';
      setTimeout(() => cipherGuessInput.style.borderColor = '', 1000);
    }
  }
}

if (verifyGuessBtn) verifyGuessBtn.addEventListener('click', checkGuess);
if (cipherGuessInput) {
  cipherGuessInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkGuess();
  });
}

// Toggle Alphabet Key
if (toggleAlphabetKeyBtn && alphabetKeyModal) {
  toggleAlphabetKeyBtn.addEventListener('click', () => {
    alphabetKeyModal.classList.toggle('hidden');
    playChime([659.25]);
  });
}

// --- 4. THE MIRROR OF TRUTH (POETIC & SUBTLE ADMIRATION) ---
const compliments = [
  "You carry a calm, effortless aura that turns the most ordinary place into something extraordinary.",
  "Someone in the room considers your quiet, spontaneous smile the absolute highlight of their day.",
  "The world can be noisy and chaotic, but your presence brings a sudden, peaceful quiet.",
  "You don't need a tiara to be seen as royalty by the person watching you with quiet admiration.",
  "Even the dullest mornings become something to look forward to, just knowing you'll be sitting nearby.",
  "The focused, cute expression on your face when you're seriously reading or writing is impossible not to notice.",
  "Your gentle laughter feels like a soothing melody in the middle of a crowded room.",
  "If grace, warmth, and quiet charm were graded, you would outshine the entire world.",
  "Out of all the people in the universe, having you right nearby is someone's luckiest secret.",
  "There is an unspoken elegance in the simplest things you do—you are truly in a league of your own.",
  "The hours pass by effortlessly when you are in the room.",
  "You have this quiet magic that makes someone secretly want every hour to last forever."
];

let currentComplimentIdx = 0;
const complimentText = document.getElementById('complimentText');
const complimentCounter = document.getElementById('complimentCounter');
const nextComplimentBtn = document.getElementById('nextComplimentBtn');
const complimentOrb = document.getElementById('complimentOrb');

function showNextCompliment() {
  playChime([659.25, 830.61, 987.77, 1318.51]);
  currentComplimentIdx = (currentComplimentIdx + 1) % compliments.length;

  complimentText.style.opacity = 0;
  setTimeout(() => {
    complimentText.textContent = `"${compliments[currentComplimentIdx]}"`;
    complimentCounter.textContent = `Whisper #${currentComplimentIdx + 1}`;
    complimentText.style.opacity = 1;
  }, 200);

  burstConfetti(window.innerWidth / 2, window.innerHeight / 2);
}

if (nextComplimentBtn) nextComplimentBtn.addEventListener('click', showNextCompliment);
if (complimentOrb) complimentOrb.addEventListener('click', showNextCompliment);

// --- 5. CROWN CEREMONY ---
const crownMeBtn = document.getElementById('crownMeBtn');
const crownedMessage = document.getElementById('crownedMessage');

if (crownMeBtn) {
  crownMeBtn.addEventListener('click', (e) => {
    playChime([523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]);
    const rect = crownMeBtn.getBoundingClientRect();
    burstConfetti(rect.left + rect.width / 2, rect.top);
    crownedMessage.classList.remove('hidden');
    crownMeBtn.innerHTML = `<span>Crowned & Glorious Queen</span>`;
    incrementHearts();
  });
}

// --- 6. WAX SEAL & PRIVATE LETTER ---
const waxSeal = document.getElementById('waxSeal');
const letterModal = document.getElementById('letterModal');
const closeLetterBtn = document.getElementById('closeLetterBtn');

function openLetter() {
  if (!isDecoded) {
    playBoop();
    if (envelopeCard) {
      envelopeCard.style.transform = 'translateX(-8px)';
      setTimeout(() => envelopeCard.style.transform = 'translateX(8px)', 100);
      setTimeout(() => envelopeCard.style.transform = 'translateX(-5px)', 200);
      setTimeout(() => envelopeCard.style.transform = '', 300);
    }
    const cipherStation = document.querySelector('.cipher-station');
    if (cipherStation) {
      cipherStation.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cipherStation.style.borderColor = '#db2777';
      setTimeout(() => cipherStation.style.borderColor = '', 1500);
    }
    return;
  }

  playChime([440, 554.37, 659.25, 880]);
  letterModal.classList.remove('hidden');
  burstConfetti(window.innerWidth / 2, window.innerHeight * 0.4);
}

function closeLetter() {
  letterModal.classList.add('hidden');
}

if (waxSeal) waxSeal.addEventListener('click', openLetter);
if (envelopeCard) envelopeCard.addEventListener('click', openLetter);
if (closeLetterBtn) {
  closeLetterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLetter();
  });
}
if (letterModal) {
  letterModal.addEventListener('click', (e) => {
    if (e.target === letterModal) closeLetter();
  });
}

// --- 7. EMERGENCY MOOD BOOSTER ---
const emergencyItems = document.querySelectorAll('.emergency-item');
const moodResponse = document.getElementById('moodResponse');
const moodIconWrapper = document.getElementById('moodIconWrapper');
const moodTitle = document.getElementById('moodTitle');
const moodText = document.getElementById('moodText');
const dismissMoodBtn = document.getElementById('dismissMoodBtn');

const moodData = {
  sleepy: {
    iconSvg: `<svg class="mood-large-icon-svg" viewBox="0 0 24 24"><path fill="#6366f1" d="M12.3 2a10 10 0 0 0-1.9 20 10 10 0 0 0 9.8-7.7 1 1 0 0 0-1.2-1.2 8 8 0 0 1-6.7-11.1 1 1 0 0 0-1-1z"/></svg>`,
    title: 'Royal Nap Permission Granted!',
    text: 'Rest your eyes for 5 minutes, Your Highness! If anyone disturbs you, your Knight stands guard and will make a strategic distraction!'
  },
  bored: {
    iconSvg: `<svg class="mood-large-icon-svg" viewBox="0 0 24 24"><path fill="#ec4899" d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29c-.39-.39-1.02-.39-1.41 0L1.29 18.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05c.39-.39.39-1.02 0-1.41l-2.33-2.35z"/></svg>`,
    title: 'Royal Entertainment Deployed!',
    text: 'Fun Fact: While everyone else is lost in boring lecture slides, you are literally giving main-character energy to this entire room. Never forget you are the coolest person here!'
  },
  stressed: {
    iconSvg: `<svg class="mood-large-icon-svg" viewBox="0 0 24 24"><path fill="#ec4899" d="M12 2c-1.5 3-4 6-4 9a4 4 0 0 0 8 0c0-3-2.5-6-4-9zm-6.2 9.5c-.8 2.2-.3 4.8 1.4 6.5A5.5 5.5 0 0 0 11 19.4c-1.2-2.1-2.9-4.2-5.2-7.9zm12.4 0c-2.3 3.7-4 5.8-5.2 7.9a5.5 5.5 0 0 0 3.8-1.4c1.7-1.7 2.2-4.3 1.4-6.5zM12 21a9 9 0 0 1-7-3.4c2.2.4 4.5.3 6.5-.7.4 1.3.5 2.7.5 4.1zm0 0c0-1.4.1-2.8.5-4.1 2 1 4.3 1.1 6.5.7A9 9 0 0 1 12 21z"/></svg>`,
    title: 'Gentle Royal Decree: Breathe!',
    text: 'You are intelligent, capable, and ten times stronger than any test or syllabus. Take a deep, gentle breath—you are going to do amazing!'
  },
  hungry: {
    iconSvg: `<svg class="mood-large-icon-svg" viewBox="0 0 24 24"><path fill="#f59e0b" d="M12 2a2 2 0 0 1 2 2c0 .3-.1.6-.2.9A6 6 0 0 1 20 12v1H4v-1a6 6 0 0 1 6.2-7.1c-.1-.3-.2-.6-.2-.9a2 2 0 0 1 2-2zm-6.8 13h13.6l-1.4 6.1a2 2 0 0 1-2 1.9H8.6a2 2 0 0 1-2-1.9L5.2 15z"/></svg>`,
    title: 'Sweet Treats Dispatched!',
    text: 'Chocolates, warm pastries, and ice-creams are en route to Her Highness! Just hang tight until recess bell rings!'
  }
};

emergencyItems.forEach(item => {
  item.addEventListener('click', () => {
    const mood = item.getAttribute('data-mood');
    const data = moodData[mood];
    if (data) {
      playChime([587.33, 739.99, 880, 1174.66]);
      if (moodIconWrapper) moodIconWrapper.innerHTML = data.iconSvg;
      moodTitle.textContent = data.title;
      moodText.textContent = data.text;
      moodResponse.classList.remove('hidden');
    }
  });
});

if (dismissMoodBtn) {
  dismissMoodBtn.addEventListener('click', () => {
    moodResponse.classList.add('hidden');
  });
}
if (moodResponse) {
  moodResponse.addEventListener('click', (e) => {
    if (e.target === moodResponse) moodResponse.classList.add('hidden');
  });
}

// --- 8. RUNAWAY 'NO' BUTTON & TREAT ORDER ---
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const invitationArea = document.getElementById('invitationArea');
const treatOrderForm = document.getElementById('treatOrderForm');
const snackChips = document.querySelectorAll('.snack-chip');
const treatCustomNote = document.getElementById('treatCustomNote');
const submitTreatBtn = document.getElementById('submitTreatBtn');
const celebrationBox = document.getElementById('celebrationBox');
const confirmedOrderText = document.getElementById('confirmedOrderText');

let selectedSnack = 'Dairy Milk Silk';

function dodgeButton() {
  playBoop();
  const maxX = 120;
  const maxY = 60;
  const randomX = (Math.random() - 0.5) * maxX * 2;
  const randomY = (Math.random() - 0.5) * maxY * 2;
  noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
}

if (noBtn) {
  noBtn.addEventListener('mouseenter', dodgeButton);
  noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dodgeButton();
  });
}

if (yesBtn) {
  yesBtn.addEventListener('click', () => {
    playChime([523.25, 659.25, 783.99, 1046.50]);
    burstConfetti();
    invitationArea.style.display = 'none';
    treatOrderForm.classList.remove('hidden');
  });
}

snackChips.forEach(chip => {
  chip.addEventListener('click', () => {
    playChime([783.99]);
    snackChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    selectedSnack = chip.getAttribute('data-snack');
  });
});

if (submitTreatBtn) {
  submitTreatBtn.addEventListener('click', async () => {
    const customNote = treatCustomNote ? treatCustomNote.value.trim() : '';
    submitTreatBtn.disabled = true;
    submitTreatBtn.innerHTML = `<span>Sealing Royal Order...</span>`;

    try {
      await fetch('/api/treat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          princess_name: isDecoded ? 'Raj Nandani' : 'Princess',
          snack_choice: selectedSnack,
          custom_note: customNote
        })
      });
    } catch (e) {
      console.log('Treat order fallback:', e);
    }

    playChime([523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]);
    burstConfetti();
    setTimeout(burstConfetti, 300);

    treatOrderForm.classList.add('hidden');
    if (confirmedOrderText) {
      confirmedOrderText.textContent = `Order for ${selectedSnack} has been sealed in the royal vault! Prepared with highest priority for Her Highness.`;
    }
    celebrationBox.classList.remove('hidden');
  });
}

// --- 9. SECRET MAILBOX & NOTES STREAM ---
const notesStream = document.getElementById('notesStream');
const noteContentInput = document.getElementById('noteContentInput');
const sendNoteBtn = document.getElementById('sendNoteBtn');

function renderMessages(messages) {
  if (!notesStream) return;
  if (!messages || messages.length === 0) {
    notesStream.innerHTML = `<div class="loading-notes">No notes yet. Be the first to leave one!</div>`;
    return;
  }

  notesStream.innerHTML = messages.map(msg => `
    <div class="note-bubble">
      <div class="note-header">
        <span class="note-sender">${escapeHtml(msg.sender)}</span>
        <span class="note-time">${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <p class="note-text">${escapeHtml(msg.content)}</p>
    </div>
  `).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function fetchNotes() {
  try {
    const res = await fetch('/api/messages');
    if (res.ok) {
      const data = await res.json();
      renderMessages(data.messages);
    }
  } catch (err) {
    console.log('Using local fallback notes:', err);
    renderMessages([
      {
        sender: 'Someone Nearby',
        content: 'Welcome to your private royal domain! The world is infinitely brighter with you in it.',
        created_at: new Date().toISOString()
      }
    ]);
  }
}
fetchNotes();

if (sendNoteBtn) {
  sendNoteBtn.addEventListener('click', async () => {
    const content = noteContentInput.value.trim();
    const sender = isDecoded ? 'Princess Raj Nandani 🌸' : 'Secret Princess 🌸';

    if (!content) {
      noteContentInput.focus();
      return;
    }

    sendNoteBtn.disabled = true;
    sendNoteBtn.innerHTML = `<span>Sending...</span>`;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender, content })
      });
      if (res.ok) {
        const data = await res.json();
        renderMessages(data.messages);
      }
    } catch (e) {
      console.log('Fallback note insert:', e);
    }

    playChime([523.25, 659.25, 783.99, 1046.50]);
    burstConfetti();
    noteContentInput.value = '';
    sendNoteBtn.disabled = false;
    sendNoteBtn.innerHTML = `<span>Send to Royal Vault</span>`;
  });
}

// Sound toggle button
const soundToggleBtn = document.getElementById('soundToggleBtn');
if (soundToggleBtn) {
  soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    const textSpan = soundToggleBtn.querySelector('.sound-text');
    if (textSpan) {
      textSpan.textContent = soundEnabled ? 'Royal Chimes: On' : 'Royal Chimes: Off';
    }
    if (soundEnabled) {
      playChime([523.25, 659.25]);
    }
  });
}

// ========================================================
// --- 10. ROYAL ARCADE MINI-GAMES FOR HER HIGHNESS ---
// ========================================================

// 1. ARCADE TAB SWITCHER
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
      if (targetId === 'quizGame' && currentQuizIndex === 0) loadQuizQuestion();
    }
  });
});

// --------------------------------------------------------
// GAME 1: CROWN & HEARTS CATCHER
// --------------------------------------------------------
const catcherCanvas = document.getElementById('catcherCanvas');
const catcherCtx = catcherCanvas ? catcherCanvas.getContext('2d') : null;
const catcherScoreEl = document.getElementById('catcherScore');
const catcherHighScoreEl = document.getElementById('catcherHighScore');
const catcherStreakEl = document.getElementById('catcherStreak');
const catcherOverlay = document.getElementById('catcherOverlay');
const startCatcherBtn = document.getElementById('startCatcherBtn');
const restartCatcherBtn = document.getElementById('restartCatcherBtn');
const catcherLeftBtn = document.getElementById('catcherLeftBtn');
const catcherRightBtn = document.getElementById('catcherRightBtn');

let catcherScore = 0;
let catcherHighScore = Number(localStorage.getItem('catcher_high_score') || 0);
let catcherStreak = 0;
let catcherRunning = false;
let catcherAnimId = null;
let catcherItems = [];
let catcherLastSpawn = 0;

const catcherPillow = {
  x: 160,
  y: 300,
  width: 80,
  height: 22,
  speed: 16
};

if (catcherHighScoreEl) catcherHighScoreEl.textContent = catcherHighScore;

const CATCHER_GOOD_TYPES = [
  { emoji: '👑', pts: 10, size: 28 },
  { emoji: '💎', pts: 15, size: 26 },
  { emoji: '🍫', pts: 20, size: 28 },
  { emoji: '🌹', pts: 5, size: 26 },
  { emoji: '✨', pts: 10, size: 24 }
];

const CATCHER_BAD_TYPES = [
  { emoji: '📄', pts: -10, size: 26 },
  { emoji: '⏰', pts: -10, size: 26 }
];

function initCatcher() {
  if (!catcherCanvas || !catcherCtx) return;
  catcherPillow.y = catcherCanvas.height - 35;
  drawCatcher();
}

function spawnCatcherItem() {
  if (!catcherCanvas) return;
  const isBad = Math.random() < 0.25;
  const type = isBad
    ? CATCHER_BAD_TYPES[Math.floor(Math.random() * CATCHER_BAD_TYPES.length)]
    : CATCHER_GOOD_TYPES[Math.floor(Math.random() * CATCHER_GOOD_TYPES.length)];

  catcherItems.push({
    x: 20 + Math.random() * (catcherCanvas.width - 50),
    y: -20,
    speed: 2 + Math.random() * 2.2,
    emoji: type.emoji,
    pts: type.pts,
    size: type.size,
    isBad: isBad
  });
}

function drawCatcher() {
  if (!catcherCtx || !catcherCanvas) return;
  catcherCtx.clearRect(0, 0, catcherCanvas.width, catcherCanvas.height);

  // Background subtle gradient
  const bgGrad = catcherCtx.createLinearGradient(0, 0, 0, catcherCanvas.height);
  bgGrad.addColorStop(0, '#fdf2f8');
  bgGrad.addColorStop(0.5, '#fae8ff');
  bgGrad.addColorStop(1, '#fef3c7');
  catcherCtx.fillStyle = bgGrad;
  catcherCtx.fillRect(0, 0, catcherCanvas.width, catcherCanvas.height);

  // Draw Pillow (Player)
  catcherCtx.save();
  catcherCtx.shadowColor = 'rgba(219, 39, 119, 0.35)';
  catcherCtx.shadowBlur = 10;
  catcherCtx.shadowOffsetY = 3;

  // Velvet pillow body
  const pGrad = catcherCtx.createLinearGradient(catcherPillow.x, catcherPillow.y, catcherPillow.x, catcherPillow.y + catcherPillow.height);
  pGrad.addColorStop(0, '#f43f5e');
  pGrad.addColorStop(1, '#db2777');
  catcherCtx.fillStyle = pGrad;
  roundRect(catcherCtx, catcherPillow.x, catcherPillow.y, catcherPillow.width, catcherPillow.height, 10, true, false);

  // Gold trim border
  catcherCtx.lineWidth = 2;
  catcherCtx.strokeStyle = '#fef08a';
  roundRect(catcherCtx, catcherPillow.x, catcherPillow.y, catcherPillow.width, catcherPillow.height, 10, false, true);

  // Gold tassels on corners
  catcherCtx.fillStyle = '#d4af37';
  catcherCtx.font = '10px sans-serif';
  catcherCtx.fillText('👑', catcherPillow.x + catcherPillow.width / 2 - 5, catcherPillow.y + 15);
  catcherCtx.restore();

  // Draw Falling Items
  catcherItems.forEach(item => {
    catcherCtx.font = `${item.size}px sans-serif`;
    catcherCtx.textAlign = 'center';
    catcherCtx.fillText(item.emoji, item.x, item.y);
  });
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function updateCatcherLoop(time) {
  if (!catcherRunning) return;

  if (time - catcherLastSpawn > 750) {
    spawnCatcherItem();
    catcherLastSpawn = time;
  }

  // Update Items
  for (let i = catcherItems.length - 1; i >= 0; i--) {
    const item = catcherItems[i];
    item.y += item.speed;

    // Check collision with pillow
    const caught = (
      item.y >= catcherPillow.y - 10 &&
      item.y <= catcherPillow.y + catcherPillow.height + 5 &&
      item.x >= catcherPillow.x - 10 &&
      item.x <= catcherPillow.x + catcherPillow.width + 10
    );

    if (caught) {
      catcherScore = Math.max(0, catcherScore + item.pts);
      if (catcherScoreEl) catcherScoreEl.textContent = catcherScore;

      if (!item.isBad) {
        catcherStreak++;
        playChime([520 + catcherStreak * 30, 680 + catcherStreak * 30], 'sine', 0.15);
      } else {
        catcherStreak = 0;
        playBoop();
      }

      if (catcherStreakEl) catcherStreakEl.textContent = `Streak: ${catcherStreak}x ✨`;

      if (catcherScore > catcherHighScore) {
        catcherHighScore = catcherScore;
        localStorage.setItem('catcher_high_score', catcherHighScore);
        if (catcherHighScoreEl) catcherHighScoreEl.textContent = catcherHighScore;
      }

      if (catcherScore >= 100 && catcherScore - item.pts < 100) {
        burstConfetti();
        playChime([523, 659, 783, 1046]);
      }

      catcherItems.splice(i, 1);
      continue;
    }

    // Missed item
    if (item.y > catcherCanvas.height + 30) {
      if (!item.isBad) {
        catcherStreak = 0;
        if (catcherStreakEl) catcherStreakEl.textContent = `Streak: 0x ✨`;
      }
      catcherItems.splice(i, 1);
    }
  }

  drawCatcher();
  catcherAnimId = requestAnimationFrame(updateCatcherLoop);
}

function startCatcherGame() {
  if (catcherOverlay) catcherOverlay.classList.add('hidden');
  catcherScore = 0;
  catcherStreak = 0;
  catcherItems = [];
  catcherRunning = true;
  if (catcherScoreEl) catcherScoreEl.textContent = '0';
  if (catcherStreakEl) catcherStreakEl.textContent = 'Streak: 0x ✨';
  catcherLastSpawn = performance.now();
  if (catcherAnimId) cancelAnimationFrame(catcherAnimId);
  catcherAnimId = requestAnimationFrame(updateCatcherLoop);
}

function movePillow(dir) {
  if (!catcherCanvas) return;
  if (dir === 'left') {
    catcherPillow.x = Math.max(0, catcherPillow.x - catcherPillow.speed * 2);
  } else if (dir === 'right') {
    catcherPillow.x = Math.min(catcherCanvas.width - catcherPillow.width, catcherPillow.x + catcherPillow.speed * 2);
  }
}

if (startCatcherBtn) startCatcherBtn.addEventListener('click', startCatcherGame);
if (restartCatcherBtn) restartCatcherBtn.addEventListener('click', startCatcherGame);

if (catcherLeftBtn) {
  catcherLeftBtn.addEventListener('click', () => movePillow('left'));
}
if (catcherRightBtn) {
  catcherRightBtn.addEventListener('click', () => movePillow('right'));
}

// Touch & Mouse Movement on Canvas
if (catcherCanvas) {
  function handleCatcherPointer(e) {
    const rect = catcherCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const canvasX = (clientX - rect.left) * (catcherCanvas.width / rect.width);
    catcherPillow.x = Math.max(0, Math.min(catcherCanvas.width - catcherPillow.width, canvasX - catcherPillow.width / 2));
  }

  catcherCanvas.addEventListener('mousemove', handleCatcherPointer);
  catcherCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    handleCatcherPointer(e);
  }, { passive: false });
}

// Keyboard controls
window.addEventListener('keydown', (e) => {
  if (!catcherRunning) return;
  if (e.key === 'ArrowLeft' || e.key === 'a') movePillow('left');
  if (e.key === 'ArrowRight' || e.key === 'd') movePillow('right');
});


// --------------------------------------------------------
// GAME 2: PALACE MEMORY PAIRS
// --------------------------------------------------------
const memoryGrid = document.getElementById('memoryGrid');
const memoryMovesEl = document.getElementById('memoryMoves');
const memoryPairsCountEl = document.getElementById('memoryPairsCount');
const memoryTimerEl = document.getElementById('memoryTimer');
const memoryWinBanner = document.getElementById('memoryWinBanner');
const memoryPlayAgainBtn = document.getElementById('memoryPlayAgainBtn');
const restartMemoryBtn = document.getElementById('restartMemoryBtn');

const MEMORY_ICONS = ['👑', '💎', '🌹', '🍫', '🪄', '💌'];
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let memoryMoves = 0;
let memoryTimer = 0;
let memoryTimerInterval = null;
let memoryLock = false;

function initMemoryGame() {
  if (!memoryGrid) return;
  if (memoryTimerInterval) clearInterval(memoryTimerInterval);
  memoryTimer = 0;
  memoryMoves = 0;
  matchedPairs = 0;
  flippedCards = [];
  memoryLock = false;

  if (memoryMovesEl) memoryMovesEl.textContent = '0';
  if (memoryPairsCountEl) memoryPairsCountEl.textContent = '0 / 6';
  if (memoryTimerEl) memoryTimerEl.textContent = '00:00';
  if (memoryWinBanner) memoryWinBanner.classList.add('hidden');

  // Start timer
  memoryTimerInterval = setInterval(() => {
    memoryTimer++;
    const mins = String(Math.floor(memoryTimer / 60)).padStart(2, '0');
    const secs = String(memoryTimer % 60).padStart(2, '0');
    if (memoryTimerEl) memoryTimerEl.textContent = `${mins}:${secs}`;
  }, 1000);

  // Duplicate and shuffle
  const deck = [...MEMORY_ICONS, ...MEMORY_ICONS].sort(() => Math.random() - 0.5);

  memoryGrid.innerHTML = deck.map((icon, idx) => `
    <div class="memory-card" data-index="${idx}" data-icon="${icon}">
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
  playChime([520, 650], 'sine', 0.1);
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    memoryMoves++;
    if (memoryMovesEl) memoryMovesEl.textContent = memoryMoves;

    const [c1, c2] = flippedCards;
    const icon1 = c1.getAttribute('data-icon');
    const icon2 = c2.getAttribute('data-icon');

    if (icon1 === icon2) {
      // Match found!
      matchedPairs++;
      c1.classList.add('matched');
      c2.classList.add('matched');
      flippedCards = [];
      if (memoryPairsCountEl) memoryPairsCountEl.textContent = `${matchedPairs} / 6`;
      playChime([660, 880, 1100], 'sine', 0.25);

      if (matchedPairs === 6) {
        clearInterval(memoryTimerInterval);
        setTimeout(() => {
          burstConfetti();
          playChime([523, 659, 783, 1046]);
          if (memoryWinBanner) memoryWinBanner.classList.remove('hidden');
        }, 500);
      }
    } else {
      // Not match
      memoryLock = true;
      setTimeout(() => {
        c1.classList.remove('flipped');
        c2.classList.remove('flipped');
        flippedCards = [];
        memoryLock = false;
      }, 700);
    }
  }
}

if (restartMemoryBtn) restartMemoryBtn.addEventListener('click', initMemoryGame);
if (memoryPlayAgainBtn) memoryPlayAgainBtn.addEventListener('click', initMemoryGame);


// --------------------------------------------------------
// GAME 3: PRINCESS FORTUNE WHEEL
// --------------------------------------------------------
const wheelCanvas = document.getElementById('wheelCanvas');
const wheelCtx = wheelCanvas ? wheelCanvas.getContext('2d') : null;
const spinWheelBtn = document.getElementById('spinWheelBtn');
const wheelPrizeCard = document.getElementById('wheelPrizeCard');
const wheelPrizeTitle = document.getElementById('wheelPrizeTitle');
const wheelPrizeDesc = document.getElementById('wheelPrizeDesc');

const WHEEL_PRIZES = [
  { text: "Homework Help 📚", desc: "Full classroom homework assistance by your Knight for a whole week!" },
  { text: "Dairy Milk Silk 🍫", desc: "A special silk chocolate delivered straight to Her Highness at recess!" },
  { text: "Compliment 👑", desc: "One genuine heartfelt compliment whenever you summon your Knight." },
  { text: "Pen Forever 🖊️", desc: "Any pen or stationery borrowed from your Knight is officially yours for life." },
  { text: "VIP Recess Walk 🌸", desc: "Exclusive peaceful recess stroll with your favorite drinks and zero stress." },
  { text: "Secret Wish 💫", desc: "One custom classroom wish granted with highest royal priority!" }
];

const WHEEL_COLORS = ['#fbcfe8', '#fef08a', '#e9d5ff', '#fed7aa', '#fecdd3', '#ddd6fe'];
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

  for (let i = 0; i < numSlices; i++) {
    const startAngle = i * arc;
    const endAngle = startAngle + arc;

    // Slice background
    wheelCtx.beginPath();
    wheelCtx.moveTo(0, 0);
    wheelCtx.arc(0, 0, radius - 4, startAngle, endAngle);
    wheelCtx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
    wheelCtx.fill();
    wheelCtx.lineWidth = 2;
    wheelCtx.strokeStyle = '#ffffff';
    wheelCtx.stroke();

    // Slice text
    wheelCtx.save();
    wheelCtx.rotate(startAngle + arc / 2);
    wheelCtx.textAlign = 'right';
    wheelCtx.fillStyle = '#3b1d3d';
    wheelCtx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    wheelCtx.fillText(WHEEL_PRIZES[i].text, radius - 20, 4);
    wheelCtx.restore();
  }

  // Center golden pin
  wheelCtx.beginPath();
  wheelCtx.arc(0, 0, 24, 0, 2 * Math.PI);
  wheelCtx.fillStyle = '#d4af37';
  wheelCtx.fill();
  wheelCtx.strokeStyle = '#ffffff';
  wheelCtx.lineWidth = 3;
  wheelCtx.stroke();

  wheelCtx.fillStyle = '#ffffff';
  wheelCtx.font = '14px sans-serif';
  wheelCtx.textAlign = 'center';
  wheelCtx.textBaseline = 'middle';
  wheelCtx.fillText('👑', 0, 0);

  wheelCtx.restore();
}

function spinWheel() {
  if (isSpinningWheel) return;
  isSpinningWheel = true;
  if (wheelPrizeCard) wheelPrizeCard.classList.add('hidden');
  if (spinWheelBtn) spinWheelBtn.disabled = true;

  const totalRotations = 5 + Math.random() * 4;
  const targetAngle = wheelAngle + totalRotations * 2 * Math.PI + Math.random() * 2 * Math.PI;
  const startAngle = wheelAngle;
  const duration = 4500;
  const startTime = performance.now();

  function animateSpin(now) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    // Easing: easeOutCubic
    const ease = 1 - Math.pow(1 - t, 3);
    wheelAngle = startAngle + (targetAngle - startAngle) * ease;
    drawWheel();

    if (t < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      isSpinningWheel = false;
      if (spinWheelBtn) spinWheelBtn.disabled = false;

      // Determine winning slice at top (-PI/2)
      const numSlices = WHEEL_PRIZES.length;
      const arc = (2 * Math.PI) / numSlices;
      const normalizedAngle = (wheelAngle + Math.PI / 2) % (2 * Math.PI);
      const winningIndex = (numSlices - Math.floor(normalizedAngle / arc) - 1 + numSlices) % numSlices;

      const prize = WHEEL_PRIZES[winningIndex];

      burstConfetti();
      playChime([523, 659, 783, 1046]);

      if (wheelPrizeTitle) wheelPrizeTitle.textContent = prize.text;
      if (wheelPrizeDesc) wheelPrizeDesc.textContent = prize.desc;
      if (wheelPrizeCard) wheelPrizeCard.classList.remove('hidden');
    }
  }

  requestAnimationFrame(animateSpin);
}

if (spinWheelBtn) spinWheelBtn.addEventListener('click', spinWheel);


// --------------------------------------------------------
// GAME 4: TIC-TAC-TOE VS DESK PARTNER
// --------------------------------------------------------
const tttBoardEl = document.getElementById('tttBoard');
const tttPlayerScoreEl = document.getElementById('tttPlayerScore');
const tttPartnerScoreEl = document.getElementById('tttPartnerScore');
const tttTiesScoreEl = document.getElementById('tttTiesScore');
const restartTttBtn = document.getElementById('restartTttBtn');
const tttSpeechEl = document.getElementById('tttSpeech');

let tttBoard = ['', '', '', '', '', '', '', '', ''];
let tttPlayerScore = 0;
let tttPartnerScore = 0;
let tttTiesScore = 0;
let tttActive = true;

const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function initTicTacToe() {
  tttBoard = ['', '', '', '', '', '', '', '', ''];
  tttActive = true;
  const cells = document.querySelectorAll('.ttt-cell');
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('winning');
  });
  if (tttSpeechEl) tttSpeechEl.textContent = `"Let's see if Her Highness can defeat her Knight! Your move 👑"`;
}

function handleCellClick(index) {
  if (!tttActive || tttBoard[index] !== '') return;

  // Princess move: 👑
  tttBoard[index] = '👑';
  const cell = document.querySelector(`.ttt-cell[data-index="${index}"]`);
  if (cell) cell.textContent = '👑';
  playChime([600], 'sine', 0.1);

  if (checkWinner('👑')) {
    handleGameOver('player');
    return;
  }

  if (tttBoard.every(c => c !== '')) {
    handleGameOver('tie');
    return;
  }

  // Knight's turn
  tttActive = false;
  if (tttSpeechEl) tttSpeechEl.textContent = `"Hmm... your Knight is calculating a counter move..."`;

  setTimeout(() => {
    makePartnerMove();
  }, 500);
}

function makePartnerMove() {
  const emptyIndices = tttBoard.map((c, i) => c === '' ? i : null).filter(i => i !== null);
  if (emptyIndices.length === 0) return;

  // 1. Try to win
  for (let combo of WIN_COMBOS) {
    const [a, b, c] = combo;
    if (tttBoard[a] === '💖' && tttBoard[b] === '💖' && tttBoard[c] === '') { commitMove(c); return; }
    if (tttBoard[a] === '💖' && tttBoard[c] === '💖' && tttBoard[b] === '') { commitMove(b); return; }
    if (tttBoard[b] === '💖' && tttBoard[c] === '💖' && tttBoard[a] === '') { commitMove(a); return; }
  }

  // 2. Block player with 65% probability
  if (Math.random() < 0.65) {
    for (let combo of WIN_COMBOS) {
      const [a, b, c] = combo;
      if (tttBoard[a] === '👑' && tttBoard[b] === '👑' && tttBoard[c] === '') { commitMove(c); return; }
      if (tttBoard[a] === '👑' && tttBoard[c] === '👑' && tttBoard[b] === '') { commitMove(b); return; }
      if (tttBoard[b] === '👑' && tttBoard[c] === '👑' && tttBoard[a] === '') { commitMove(a); return; }
    }
  }

  // 3. Take center if available
  if (tttBoard[4] === '') { commitMove(4); return; }

  // 4. Random move
  const pick = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  commitMove(pick);
}

function commitMove(idx) {
  tttBoard[idx] = '💖';
  const cell = document.querySelector(`.ttt-cell[data-index="${idx}"]`);
  if (cell) cell.textContent = '💖';
  playBoop();

  if (checkWinner('💖')) {
    handleGameOver('partner');
    return;
  }

  if (tttBoard.every(c => c !== '')) {
    handleGameOver('tie');
    return;
  }

  tttActive = true;
  const replies = [
    `"Your turn, Princess! Try to defeat your Knight 😉"`,
    `"A clever tactic! But your Knight stands ready ⚔️"`,
    `"Your Knight is watching your strategy closely 👑"`
  ];
  if (tttSpeechEl) tttSpeechEl.textContent = replies[Math.floor(Math.random() * replies.length)];
}

function checkWinner(symbol) {
  return WIN_COMBOS.some(combo => {
    const won = combo.every(idx => tttBoard[idx] === symbol);
    if (won) {
      combo.forEach(idx => {
        const cell = document.querySelector(`.ttt-cell[data-index="${idx}"]`);
        if (cell) cell.classList.add('winning');
      });
    }
    return won;
  });
}

function handleGameOver(winner) {
  tttActive = false;
  if (winner === 'player') {
    tttPlayerScore++;
    if (tttPlayerScoreEl) tttPlayerScoreEl.textContent = tttPlayerScore;
    if (tttSpeechEl) tttSpeechEl.textContent = `"You won! As expected, Her Highness always rules! Your Knight happily surrenders 👑✨"`;
    burstConfetti();
    playChime([523, 659, 783, 1046]);
  } else if (winner === 'partner') {
    tttPartnerScore++;
    if (tttPartnerScoreEl) tttPartnerScoreEl.textContent = tttPartnerScore;
    if (tttSpeechEl) tttSpeechEl.textContent = `"Your Knight defended the realm this round! Rematch, Princess? ⚔️😊"`;
    playBoop();
  } else {
    tttTiesScore++;
    if (tttTiesScoreEl) tttTiesScoreEl.textContent = tttTiesScore;
    if (tttSpeechEl) tttSpeechEl.textContent = `"A royal tie! The Knight and Princess make an invincible team ✨"`;
    playChime([523, 659]);
  }
}

if (tttBoardEl) {
  tttBoardEl.querySelectorAll('.ttt-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const idx = Number(cell.getAttribute('data-index'));
      handleCellClick(idx);
    });
  });
}

if (restartTttBtn) restartTttBtn.addEventListener('click', initTicTacToe);


// --------------------------------------------------------
// GAME 5: ROYAL KNIGHT'S QUIZ
// --------------------------------------------------------
const QUIZ_QUESTIONS = [
  {
    q: "Who constantly zones out looking at your smile instead of the blackboard?",
    options: ["The blackboard fan", "Your faithful Knight sitting beside you ✨", "The class monitor", "Nobody"],
    correct: 1,
    note: "Obviously! The blackboard has nothing on you."
  },
  {
    q: "What is your official royal privilege in class?",
    options: ["Doing everyone's homework", "Unlimited snacks & zero stress 👑", "Giving exams twice", "Sitting in the corner"],
    correct: 1,
    note: "Decreed by royal law: zero stress, all snacks."
  },
  {
    q: "If you borrow a pen from your Knight, do you need to return it?",
    options: ["Yes with interest", "Never, it's permanently yours now 🖊️", "Within 5 seconds", "Ask the teacher"],
    correct: 1,
    note: "Consider it a royal gift for your pencil box forever."
  },
  {
    q: "What's the best seat in the entire classroom?",
    options: ["First bench under teacher's radar", "The seat right beside your Knight ✨", "Outside the classroom", "Principal's office"],
    correct: 1,
    note: "100% agreed. Best seat in the whole school."
  }
];

let currentQuizIndex = 0;
let quizScore = 0;
let quizLocked = false;

const quizContainer = document.getElementById('quizContainer');
const quizProgressFill = document.getElementById('quizProgressFill');
const quizStepText = document.getElementById('quizStepText');
const quizQuestionText = document.getElementById('quizQuestionText');
const quizOptions = document.getElementById('quizOptions');
const quizFeedback = document.getElementById('quizFeedback');
const quizResultCard = document.getElementById('quizResultCard');
const restartQuizBtn = document.getElementById('restartQuizBtn');

function loadQuizQuestion() {
  if (!quizQuestionText || !quizOptions) return;
  quizLocked = false;
  if (quizFeedback) quizFeedback.classList.add('hidden');

  if (currentQuizIndex >= QUIZ_QUESTIONS.length) {
    showQuizResults();
    return;
  }

  const cur = QUIZ_QUESTIONS[currentQuizIndex];
  if (quizStepText) quizStepText.textContent = `Question ${currentQuizIndex + 1} of ${QUIZ_QUESTIONS.length}`;
  if (quizQuestionText) quizQuestionText.textContent = cur.q;
  if (quizProgressFill) {
    const pct = ((currentQuizIndex + 1) / QUIZ_QUESTIONS.length) * 100;
    quizProgressFill.style.width = `${pct}%`;
  }

  quizOptions.innerHTML = cur.options.map((opt, idx) => `
    <button type="button" class="quiz-option-btn" data-index="${idx}">
      <span>${opt}</span>
    </button>
  `).join('');

  quizOptions.querySelectorAll('.quiz-option-btn').forEach(btn => {
    btn.addEventListener('click', () => handleQuizOptionClick(btn));
  });
}

function handleQuizOptionClick(btn) {
  if (quizLocked) return;
  quizLocked = true;
  const chosenIdx = Number(btn.getAttribute('data-index'));
  const cur = QUIZ_QUESTIONS[currentQuizIndex];

  if (chosenIdx === cur.correct) {
    quizScore++;
    btn.classList.add('correct');
    playChime([600, 800], 'sine', 0.15);
    if (quizFeedback) {
      quizFeedback.className = 'quiz-feedback correct-feedback';
      quizFeedback.textContent = `✨ Correct! ${cur.note}`;
      quizFeedback.classList.remove('hidden');
    }
  } else {
    btn.classList.add('wrong');
    playBoop();
    const correctBtn = quizOptions.querySelector(`.quiz-option-btn[data-index="${cur.correct}"]`);
    if (correctBtn) correctBtn.classList.add('correct');
    if (quizFeedback) {
      quizFeedback.className = 'quiz-feedback';
      quizFeedback.textContent = `Oops! ${cur.note}`;
      quizFeedback.classList.remove('hidden');
    }
  }

  setTimeout(() => {
    currentQuizIndex++;
    loadQuizQuestion();
  }, 1400);
}

function showQuizResults() {
  if (quizContainer) quizContainer.classList.add('hidden');
  if (quizResultCard) quizResultCard.classList.remove('hidden');
  burstConfetti();
  playChime([523, 659, 783, 1046]);
}

function restartQuiz() {
  currentQuizIndex = 0;
  quizScore = 0;
  if (quizContainer) quizContainer.classList.remove('hidden');
  if (quizResultCard) quizResultCard.classList.add('hidden');
  loadQuizQuestion();
}

if (restartQuizBtn) restartQuizBtn.addEventListener('click', restartQuiz);

// Initialize First Game on Page Load
initCatcher();
initMemoryGame();
drawWheel();
initTicTacToe();
loadQuizQuestion();

