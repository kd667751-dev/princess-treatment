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
  "Your quiet, spontaneous smile has the power to instantly brighten anyone's entire day.",
  "The world can be noisy and chaotic, but your presence brings a sudden, peaceful warmth.",
  "You don't need an actual crown—your natural grace, kindness, and beauty make you true royalty.",
  "Even the dullest mornings become something to look forward to, just seeing your radiant smile.",
  "The focused, cute expression on your face when you're seriously reading or working is truly adorable.",
  "Your gentle laughter feels like a soothing melody in the middle of any crowded room.",
  "If grace, warmth, and charm were graded, you would easily outshine the entire world.",
  "There is a rare, breathtaking elegance in the simplest things you do—you are truly in a league of your own.",
  "Your positive energy and quiet confidence effortlessly bring out the best in people around you.",
  "The room naturally feels brighter, lighter, and happier whenever you are around.",
  "You possess this rare, quiet magic that makes every moment feel meaningful and special."
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
    text: 'Rest your eyes for 5 minutes, Your Highness! Royal decrees state beauty sleep takes priority over exhausting lectures anytime. Take a gentle rest! 💤✨'
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

