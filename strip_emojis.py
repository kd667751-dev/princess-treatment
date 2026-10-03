import re

with open('index.html', 'r') as f:
    html = f.read()

# Replace tab icons
html = html.replace('<span class="arcade-tab-icon">✨</span>', '<span class="arcade-tab-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>')
html = html.replace('<span class="arcade-tab-icon">🎴</span>', '<span class="arcade-tab-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18M9 21V9"/></svg></span>')
html = html.replace('<span class="arcade-tab-icon">🎡</span>', '<span class="arcade-tab-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93"/></svg></span>')
html = html.replace('<span class="arcade-tab-icon">⚔️</span>', '<span class="arcade-tab-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 9.5L21 3m-6.5 6.5L21 16M3 21l7.5-7.5M3 3l18 18"/></svg></span>')
html = html.replace('<span class="arcade-tab-icon">🎹</span>', '<span class="arcade-tab-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></span>')

# Remove other emojis
html = html.replace('Combo: x1 🔥', 'Combo: x1')
html = html.replace('Combo: x1 ✨', 'Combo: x1')
html = html.replace('Restart 🔄', 'Restart')
html = html.replace('Reshuffle 🔄', 'Reshuffle')
html = html.replace('New Duel ⚔️', 'New Duel')
html = html.replace('Start Melody 🎵', 'Start Melody')
html = html.replace('🌩️', '')
html = html.replace('✨👑✨', '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="gold" stroke-width="1.5"><path d="M2 20h20M4 16l-2-9 5 3 5-7 5 7 5-3-2 9H4z"/></svg>')
html = html.replace('👑', '')
html = html.replace('🤖', '')
html = html.replace('🏰', '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4"/></svg>')

# Rewrite some text to be more professional
html = html.replace('Catch the falling stars and gems! Avoid the dark clouds!', 'Collect the falling crystals and celestial objects. Avoid the anomalies.')
html = html.replace('Start Magic ✨', 'Initiate Sequence')

with open('index.html', 'w') as f:
    f.write(html)
