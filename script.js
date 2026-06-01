// ── CURSOR GLOW ──
const cursorGlow = document.getElementById('cursor-glow');
let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
let tx = cx, ty = cy;

document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });

(function moveCursor() {
  cx += (tx - cx) * 0.1;
  cy += (ty - cy) * 0.1;
  cursorGlow.style.left = cx + 'px';
  cursorGlow.style.top  = cy + 'px';
  requestAnimationFrame(moveCursor);
})();


// ── PARTICLE NETWORK ──
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');
let particles = [];
let mx = null, my = null;

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); buildParticles(); });
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
document.addEventListener('mouseleave', () => { mx = null; my = null; });

class Dot {
  constructor(rand) {
    if (rand) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
    } else {
      this.x = Math.random() > 0.5 ? 0 : canvas.width;
      this.y = Math.random() * canvas.height;
    }
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.r  = Math.random() * 1.4 + 0.5;
    this.a  = Math.random() * 0.5 + 0.2;
  }

  update() {
    if (mx !== null) {
      const dx = mx - this.x, dy = my - this.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 110) { this.x -= (dx / d) * 0.7; this.y -= (dy / d) * 0.7; }
    }
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -20 || this.x > canvas.width + 20 ||
        this.y < -20 || this.y > canvas.height + 20) {
      Object.assign(this, new Dot(false));
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
  const n = Math.min(Math.floor((canvas.width * canvas.height) / 9000), 140);
  particles = Array.from({ length: n }, () => new Dot(true));
}

function connect() {
  const MAX = 145;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < MAX) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(201,168,76,${(1 - d / MAX) * 0.22})`;
        ctx.lineWidth   = 0.6;
        ctx.stroke();
      }
    }
  }
}

buildParticles();

(function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  connect();
  requestAnimationFrame(tick);
})();


// ── SCROLL REVEAL ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal, .reveal-card').forEach(el => observer.observe(el));


// ── STAT COUNTER ──
const statsEl   = document.querySelector('.hero-stats');
let   counted   = false;

const STATS = [
  { el: null, target: 3,  prefix: '',  suffix: ''   },
  { el: null, target: 35, prefix: '',  suffix: '+'  },
  { el: null, target: 8,  prefix: '',  suffix: ''   },
  { el: null, target: 5,  prefix: '$', suffix: 'M+' },
];

document.querySelectorAll('.stat-num').forEach((el, i) => { STATS[i].el = el; });

function countUp(s) {
  const dur  = 1000;
  const start = performance.now();
  (function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    s.el.textContent = s.prefix + Math.floor(e * s.target) + s.suffix;
    if (p < 1) requestAnimationFrame(step);
    else s.el.textContent = s.prefix + s.target + s.suffix;
  })(start);
}

new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !counted) {
    counted = true;
    STATS.forEach((s, i) => setTimeout(() => countUp(s), i * 80));
  }
}, { threshold: 0.5 }).observe(statsEl);


// ── NAV ACTIVE STATE ──
const secs = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let cur = '';
  secs.forEach(s => { if (window.scrollY >= s.offsetTop - 140) cur = s.id; });
  links.forEach(a => { a.style.color = a.getAttribute('href') === '#' + cur ? 'var(--gold)' : ''; });
}, { passive: true });


// ── CARD MOUSE GLOW TRACKING ──
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x    = ((e.clientX - rect.left) / rect.width)  * 100;
    const y    = ((e.clientY - rect.top)  / rect.height) * 100;
    card.querySelector('.card-glow').style.background =
      `radial-gradient(circle at ${x}% ${y}%, rgba(201,168,76,0.1) 0%, transparent 60%)`;
  });
});
