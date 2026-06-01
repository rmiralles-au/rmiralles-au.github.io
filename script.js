// ── PARTICLE NETWORK ──
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { x: null, y: null };
let animFrame;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resize();
window.addEventListener('resize', () => { resize(); buildParticles(); });

window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

class Particle {
  constructor() { this.reset(true); }

  reset(random) {
    this.x  = random ? Math.random() * canvas.width  : (Math.random() > 0.5 ? 0 : canvas.width);
    this.y  = random ? Math.random() * canvas.height : Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = (Math.random() - 0.5) * 0.35;
    this.r  = Math.random() * 1.2 + 0.4;
    this.a  = Math.random() * 0.45 + 0.15;
  }

  update() {
    if (mouse.x !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 100) {
        this.x -= (dx / d) * 0.6;
        this.y -= (dy / d) * 0.6;
      }
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < -20 || this.x > canvas.width + 20 ||
        this.y < -20 || this.y > canvas.height + 20) {
      this.reset(false);
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(201,168,76,${this.a})`;
    ctx.fill();
  }
}

function buildParticles() {
  const density = (canvas.width * canvas.height) / 10000;
  const count   = Math.min(Math.floor(density), 130);
  particles = Array.from({ length: count }, () => new Particle());
}

function connect() {
  const MAX = 140;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < MAX) {
        const opacity = (1 - d / MAX) * 0.18;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(201,168,76,${opacity})`;
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      }
    }
  }
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  connect();
  animFrame = requestAnimationFrame(tick);
}

buildParticles();
tick();


// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll('.reveal, .reveal-card');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));


// ── STAT COUNTER ANIMATION ──
function animateCounter(el, target, suffix, duration) {
  const isDecimal = target % 1 !== 0;
  let start = null;

  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    const current  = Math.floor(ease * target);
    el.textContent = (suffix === '$' ? '$' : '') + current + (suffix !== '$' ? suffix : '') + (target > current ? '+' : '');
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = (suffix === '$' ? '$' + target : target + suffix);
  }

  requestAnimationFrame(step);
}

const statsSection = document.querySelector('.hero-stats');
let counted = false;

const statsObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !counted) {
    counted = true;
    const nums = document.querySelectorAll('.stat-num');
    animateCounter(nums[0], 3,   '',   800);
    animateCounter(nums[1], 35,  '+',  900);
    animateCounter(nums[2], 8,   '',   800);
    animateCounter(nums[3], 5,   'M+', 1000);
  }
}, { threshold: 0.5 });

if (statsSection) statsObserver.observe(statsSection);


// ── NAV ACTIVE HIGHLIGHT ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current ? 'var(--gold)' : '';
  });
}, { passive: true });
