import os
import re

def update_files():
    print("Reading files...")
    with open('script.js', 'r') as f:
        script_content = f.read()
    
    with open('index.html', 'r') as f:
        html_content = f.read()

    with open('style.css', 'r') as f:
        css_content = f.read()

    print("Extracting old game code from script.js...")
    # Find the start of the arcade section
    arcade_start = script_content.find('// ========================================================')
    if arcade_start == -1 or script_content.find('10. ROYAL ARCADE') == -1:
        print("Could not find arcade start in script.js")
        return

    # Keep everything before the arcade section
    new_script_content = script_content[:arcade_start]

    print("Writing modified script.js...")
    with open('script.js', 'w') as f:
        f.write(new_script_content)

    print("Updating index.html...")
    # Add arcade.js script tag
    html_content = html_content.replace('<script src="script.js?v=3.3"></script>', '<script src="script.js?v=3.4"></script>\n  <script src="arcade.js?v=1.0"></script>')
    
    # We also need to update the HTML for the games, making it look much better.
    # The arcade section is between <!-- SECTION: THE ROYAL ARCADE ... and <!-- SECTION 5: SECRET WHISPER MAILBOX -->
    
    arcade_html_start = html_content.find('<!-- SECTION: THE ROYAL ARCADE (GAMES FOR HER HIGHNESS) -->')
    arcade_html_end = html_content.find('<!-- SECTION 5: SECRET WHISPER MAILBOX -->')
    
    new_arcade_html = """    <!-- SECTION: THE ROYAL ARCADE (GAMES FOR HER HIGHNESS) -->
    <section class="section-container" id="royalArcadeSection">
      <div class="section-header">
        <span class="section-tag">
          <svg viewBox="0 0 24 24"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
          Royal Arcade (Ultra Edition)
        </span>
        <h2>Games Fit For A Princess</h2>
        <p>A magical playground designed exclusively to make you smile with ultimate royal polish:</p>
      </div>

      <div class="arcade-card glass-panel">
        <!-- Arcade Game Selector Tabs -->
        <div class="arcade-tabs">
          <button type="button" class="arcade-tab-btn active" data-game="catcherGame">
            <span class="arcade-tab-icon">✨</span>
            <span class="arcade-tab-name">Crystal Catcher</span>
          </button>
          <button type="button" class="arcade-tab-btn" data-game="memoryGame">
            <span class="arcade-tab-icon">🎴</span>
            <span class="arcade-tab-name">Enchanted Memory</span>
          </button>
          <button type="button" class="arcade-tab-btn" data-game="wheelGame">
            <span class="arcade-tab-icon">🎡</span>
            <span class="arcade-tab-name">Destiny Wheel</span>
          </button>
          <button type="button" class="arcade-tab-btn" data-game="tictactoeGame">
            <span class="arcade-tab-icon">⚔️</span>
            <span class="arcade-tab-name">Royal Tactics</span>
          </button>
          <button type="button" class="arcade-tab-btn" data-game="pianoGame">
            <span class="arcade-tab-icon">🎹</span>
            <span class="arcade-tab-name">Magic Piano</span>
          </button>
        </div>

        <!-- GAME 1: CRYSTAL CATCHER -->
        <div id="catcherGame" class="arcade-game-view active">
          <div class="game-meta-bar">
            <div class="meta-pill">Score: <b id="catcherScore">0</b></div>
            <div class="meta-pill streak-pill" id="catcherStreak">Combo: x1 🔥</div>
            <button type="button" id="restartCatcherBtn" class="btn-game-control">Restart 🔄</button>
          </div>
          
          <div class="catcher-canvas-wrapper" style="position: relative; overflow: hidden; border-radius: 12px; box-shadow: 0 0 20px rgba(212,175,55,0.2);">
            <canvas id="catcherCanvas" width="400" height="400" style="background: linear-gradient(to bottom, #1a0b2e, #4b2354); display: block;"></canvas>
            <div id="catcherOverlay" class="game-start-overlay">
              <div class="overlay-content" style="background: rgba(30,10,40,0.8); backdrop-filter: blur(8px);">
                <span class="overlay-crown" style="font-size: 3rem; text-shadow: 0 0 20px gold;">✨</span>
                <h3 style="color: #ffd700;">Crystal Catcher</h3>
                <p style="color: #eee;">Catch the falling stars and gems! Avoid the dark clouds! 🌩️</p>
                <button type="button" id="startCatcherBtn" class="btn-royal btn-small">Start Magic ✨</button>
              </div>
            </div>
          </div>

          <div class="mobile-catcher-controls">
            <button type="button" id="catcherLeftBtn" class="catcher-arrow-btn">◀ Left</button>
            <span class="control-tip">Swipe or touch the cosmos</span>
            <button type="button" id="catcherRightBtn" class="catcher-arrow-btn">Right ▶</button>
          </div>
        </div>

        <!-- GAME 2: ENCHANTED MEMORY -->
        <div id="memoryGame" class="arcade-game-view" style="display: none;">
          <div class="game-meta-bar">
            <div class="meta-pill">Moves: <b id="memoryMoves">0</b></div>
            <div class="meta-pill">Matched: <b id="memoryPairsCount">0 / 8</b></div>
            <button type="button" id="restartMemoryBtn" class="btn-game-control">Reshuffle 🔄</button>
          </div>

          <div class="memory-grid ultra-memory-grid" id="memoryGrid">
            <!-- 16 cards generated by JS -->
          </div>

          <div id="memoryWinBanner" class="game-win-banner hidden" style="background: linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,105,180,0.2));">
            <span class="win-crown" style="font-size: 3rem; animation: pulse 1s infinite;">✨👑✨</span>
            <h4 style="color: #d4af37;">Memory Mastered!</h4>
            <p>Your mind is as brilliant as a diamond!</p>
            <button type="button" id="memoryPlayAgainBtn" class="btn-royal btn-small">Play Again</button>
          </div>
        </div>

        <!-- GAME 3: DESTINY WHEEL -->
        <div id="wheelGame" class="arcade-game-view" style="display: none;">
          <div class="wheel-container ultra-wheel-container">
            <div class="wheel-pointer" style="text-shadow: 0 0 10px gold;">▼</div>
            <canvas id="wheelCanvas" width="360" height="360" style="filter: drop-shadow(0 0 15px rgba(255,215,0,0.4));"></canvas>
            <div id="wheelParticles" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;"></div>
          </div>

          <div class="wheel-controls">
            <button type="button" id="spinWheelBtn" class="btn-royal btn-large pulse-animation">
              <svg viewBox="0 0 24 24"><path d="M12 2l2.4 7.2 7.6.3-5.8 4.8 2 7.7-6.2-4.5-6.2 4.5 2-7.7-5.8-4.8 7.6-.3z"/></svg>
              <span>Reveal Destiny</span>
            </button>
          </div>

          <div id="wheelPrizeCard" class="wheel-prize-card hidden" style="transform: scale(1.05); border: 2px solid #d4af37; box-shadow: 0 0 30px rgba(212,175,55,0.3);">
            <span class="prize-tag" style="background: #d4af37; color: white;">👑 Destiny Granted 👑</span>
            <h3 id="wheelPrizeTitle" style="color: #8b5a2b;">...</h3>
            <p id="wheelPrizeDesc">...</p>
          </div>
        </div>

        <!-- GAME 4: ROYAL TACTICS (TIC TAC TOE) -->
        <div id="tictactoeGame" class="arcade-game-view" style="display: none;">
          <div class="game-meta-bar">
            <div class="meta-pill">Princess 👑: <b id="tttPlayerScore">0</b></div>
            <div class="meta-pill">Palace AI 🤖: <b id="tttPartnerScore">0</b></div>
            <button type="button" id="restartTttBtn" class="btn-game-control">New Duel ⚔️</button>
          </div>

          <div class="partner-reaction-bubble ultra-reaction" id="tttReaction">
            <span class="partner-avatar">🏰</span>
            <span class="partner-speech" id="tttSpeech">"A strategic duel! I won't go easy on you, Princess!"</span>
          </div>

          <div class="ttt-board ultra-ttt" id="tttBoard">
            <div class="ttt-cell" data-index="0"></div>
            <div class="ttt-cell" data-index="1"></div>
            <div class="ttt-cell" data-index="2"></div>
            <div class="ttt-cell" data-index="3"></div>
            <div class="ttt-cell" data-index="4"></div>
            <div class="ttt-cell" data-index="5"></div>
            <div class="ttt-cell" data-index="6"></div>
            <div class="ttt-cell" data-index="7"></div>
            <div class="ttt-cell" data-index="8"></div>
            <div id="tttStrike" class="ttt-strike hidden"></div>
          </div>
        </div>

        <!-- GAME 5: MAGIC PIANO -->
        <div id="pianoGame" class="arcade-game-view" style="display: none;">
          <div class="game-meta-bar">
            <div class="meta-pill">Level: <b id="pianoLevel">1</b></div>
            <div class="meta-pill">Status: <b id="pianoStatus">Waiting to Start</b></div>
            <button type="button" id="startPianoBtn" class="btn-game-control">Start Melody 🎵</button>
          </div>
          
          <div class="piano-container">
            <div class="piano-key" data-note="0" style="--key-color: #ff9a9e;"></div>
            <div class="piano-key" data-note="1" style="--key-color: #fecfef;"></div>
            <div class="piano-key" data-note="2" style="--key-color: #a18cd1;"></div>
            <div class="piano-key" data-note="3" style="--key-color: #fbc2eb;"></div>
          </div>
          <p style="text-align:center; margin-top:1rem; font-size:0.9rem; color:var(--text-light);">Repeat the magical sequence to unlock the royal harmony!</p>
        </div>

      </div>
    </section>

"""
    
    final_html = html_content[:arcade_html_start] + new_arcade_html + html_content[arcade_html_end:]
    with open('index.html', 'w') as f:
        f.write(final_html)
    print("index.html updated successfully!")

if __name__ == "__main__":
    update_files()
