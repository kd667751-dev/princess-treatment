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

// --- 3.5. MYSTERY NAME UNVEILING ---
const unveilNameBtn = document.getElementById('unveilNameBtn');
const mysteryCipherBox = document.getElementById('mysteryCipherBox');
const revealedNameContainer = document.getElementById('revealedNameContainer');

if (unveilNameBtn) {
  unveilNameBtn.addEventListener('click', () => {
    playChime([523.25, 659.25, 783.99, 1046.50]);
    burstConfetti();
    mysteryCipherBox.classList.add('hidden');
    revealedNameContainer.classList.remove('hidden');
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
const envelopeCard = document.getElementById('envelopeCard');
const letterModal = document.getElementById('letterModal');
const closeLetterBtn = document.getElementById('closeLetterBtn');

function openLetter() {
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
    text: 'Rest your eyes for 5 minutes, Raj Nandani! If the teacher looks our way, your desk partner stands guard and will make a strategic pencil-drop distraction!'
  },
  bored: {
    iconSvg: `<svg class="mood-large-icon-svg" viewBox="0 0 24 24"><path fill="#ec4899" d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29c-.39-.39-1.02-.39-1.41 0L1.29 18.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05c.39-.39.39-1.02 0-1.41l-2.33-2.35z"/></svg>`,
    title: 'Royal Entertainment Deployed!',
    text: 'Fun Fact: While everyone else is lost in boring lecture slides, Raj Nandani is literally giving main-character energy to this entire room. Never forget you are the coolest person here!'
  },
  stressed: {
    iconSvg: `<svg class="mood-large-icon-svg" viewBox="0 0 24 24"><path fill="#ec4899" d="M12 2c-1.5 3-4 6-4 9a4 4 0 0 0 8 0c0-3-2.5-6-4-9zm-6.2 9.5c-.8 2.2-.3 4.8 1.4 6.5A5.5 5.5 0 0 0 11 19.4c-1.2-2.1-2.9-4.2-5.2-7.9zm12.4 0c-2.3 3.7-4 5.8-5.2 7.9a5.5 5.5 0 0 0 3.8-1.4c1.7-1.7 2.2-4.3 1.4-6.5zM12 21a9 9 0 0 1-7-3.4c2.2.4 4.5.3 6.5-.7.4 1.3.5 2.7.5 4.1zm0 0c0-1.4.1-2.8.5-4.1 2 1 4.3 1.1 6.5.7A9 9 0 0 1 12 21z"/></svg>`,
    title: 'Gentle Royal Decree: Breathe!',
    text: 'Raj Nandani, you are intelligent, capable, and ten times stronger than any test or syllabus. Take a deep, gentle breath—you are going to do amazing!'
  },
  hungry: {
    iconSvg: `<svg class="mood-large-icon-svg" viewBox="0 0 24 24"><path fill="#f59e0b" d="M12 2a2 2 0 0 1 2 2c0 .3-.1.6-.2.9A6 6 0 0 1 20 12v1H4v-1a6 6 0 0 1 6.2-7.1c-.1-.3-.2-.6-.2-.9a2 2 0 0 1 2-2zm-6.8 13h13.6l-1.4 6.1a2 2 0 0 1-2 1.9H8.6a2 2 0 0 1-2-1.9L5.2 15z"/></svg>`,
    title: 'Sweet Treats Dispatched!',
    text: 'Chocolates, warm pastries, and ice-creams are en route to Desk #1! Just hang tight until recess bell rings!'
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
          princess_name: 'Raj Nandani',
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
      confirmedOrderText.textContent = `Order for ${selectedSnack} has been sealed in the royal vault! Prepared with highest priority for Raj Nandani.`;
    }
    celebrationBox.classList.remove('hidden');
  });
}

// --- 9. SECRET MAILBOX & NOTES STREAM ---
const notesStream = document.getElementById('notesStream');
const noteSenderInput = document.getElementById('noteSenderInput');
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
        content: 'Welcome to your private royal domain, Raj Nandani! The world is infinitely brighter with you in it.',
        created_at: new Date().toISOString()
      }
    ]);
  }
}
fetchNotes();

if (sendNoteBtn) {
  sendNoteBtn.addEventListener('click', async () => {
    const content = noteContentInput.value.trim();
    const sender = noteSenderInput.value.trim() || 'Raj Nandani';

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
