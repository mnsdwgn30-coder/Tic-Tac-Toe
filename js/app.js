/**
 * TIC-TAC-TOE MASTER PORTAL - CORE APP SCRIPT (app.js)
 * Global interactions, confetti particle engine, sound toggles, UI accordions.
 */

// Confetti Particle Engine
class ConfettiEngine {
  constructor() {
    this.canvas = document.getElementById('confetti-canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'confetti-canvas';
      document.body.appendChild(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animating = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 90) {
    const colors = ['#00f2fe', '#ff2a85', '#fbbf24', '#10b981', '#ffffff', '#a855f7'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 5 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        alpha: 1,
        decay: 0.01 + Math.random() * 0.015
      });
    }
    if (!this.animating) {
      this.animating = true;
      this.animate();
    }
  }

  animate() {
    if (!this.animating) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // gravity
      p.rotation += p.rotSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// Global App Initialization
document.addEventListener('DOMContentLoaded', () => {
  window.confetti = new ConfettiEngine();

  // 1. Mobile Menu Toggle
  const mobileBtn = document.querySelector('.mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  // 2. Audio Mute Button
  const audioBtn = document.querySelector('.audio-toggle-btn');
  if (audioBtn) {
    const isMuted = localStorage.getItem('ttt_muted') === 'true';
    updateAudioBtnUI(audioBtn, isMuted);

    audioBtn.addEventListener('click', () => {
      if (window.soundManager) {
        const muted = window.soundManager.toggleMute();
        updateAudioBtnUI(audioBtn, muted);
      }
    });
  }

  function updateAudioBtnUI(btn, muted) {
    btn.innerHTML = muted ? '🔇' : '🔊';
    btn.classList.toggle('muted', muted);
    btn.title = muted ? 'Unmute Sound FX' : 'Mute Sound FX';
  }

  // 3. Tab System
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      const tabContainer = btn.closest('.tabs-wrapper') || document;
      
      tabContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      tabContainer.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = tabContainer.querySelector(`#${targetId}`);
      if (targetPane) targetPane.classList.add('active');

      if (window.soundManager) window.soundManager.playClick();
    });
  });

  // 4. FAQ Accordions
  const accordions = document.querySelectorAll('.accordion-header');
  accordions.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      item.classList.toggle('open');
      if (window.soundManager) window.soundManager.playClick();
    });
  });

  // 5. Glossary Search & Filter
  const glossarySearch = document.getElementById('glossary-search');
  if (glossarySearch) {
    glossarySearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      document.querySelectorAll('.glossary-card').forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const body = card.querySelector('p').textContent.toLowerCase();
        if (title.includes(query) || body.includes(query)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // 6. Sound effect on all standard buttons
  document.querySelectorAll('.btn').forEach(b => {
    b.addEventListener('click', () => {
      if (window.soundManager) window.soundManager.playClick();
    });
  });
});
