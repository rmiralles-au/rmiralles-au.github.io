// ══════════════════════════════════════════════
//  FLOW FIELD — particles follow force lines
//  Mouse repels · Click = shockwave explosion
// ══════════════════════════════════════════════

const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');

let W, H, particles = [], shockwaves = [];
let mx = -9999, my = -9999;
let time = 0;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); init(); });
window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
window.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });
window.addEventListener('click', e => {
  shockwaves.push({ x: e.clientX, y: e.clientY, r: 0, alpha: 0.7 });
});

// ── FLOW ANGLE at (x,y,t) ──
function flow(x, y, t) {
  const s = 0.0022;
  return (
    Math.sin(x * s + t * 0.55) * Math.cos(y * s * 0.9 + t * 0.35) +
    Math.cos(x * s * 0.7 - t * 0.45) * Math.sin(y * s * 1.1 + t * 0.6)
  ) * Math.PI;
}

// ── PARTICLE CLASS ──
class Particle {
  constructor(rand) {
    this.trail = [];
    this.reset(rand);
  }

  reset(rand) {
    this.x     = rand ? Math.random() * W : (Math.random() > 0.5 ? 0 : W);
    this.y     = rand ? Math.random() * H : Math.random() * H;
    this.vx    = 0;
    this.vy    = 0;
    this.speed = Math.random() * 0.7 + 0.25;
    this.size  = Math.random() * 1.3 + 0.4;
    this.alpha = Math.random() * 0.55 + 0.25;
    this.life  = Math.random() * 400 + 200;
    this.maxL  = this.life;
    this.trail = [];
  }

  update(t) {
    const angle = flow(this.x, this.y, t);
    const tx = Math.cos(angle) * this.speed;
    const ty = Math.sin(angle) * this.speed;
    this.vx += (tx - this.vx) * 0.06;
    this.vy += (ty - this.vy) * 0.06;

    // Mouse repulsion
    const dx = this.x - mx, dy = this.y - my;
    const d  = Math.sqrt(dx * dx + dy * dy);
    if (d < 130 && d > 0.1) {
      const f = (1 - d / 130) * 2.2;
      this.vx += (dx / d) * f;
      this.vy += (dy / d) * f;
    }

    // Shockwave push
    for (const sw of shockwaves) {
      const sx = this.x - sw.x, sy = this.y - sw.y;
      const sd = Math.sqrt(sx * sx + sy * sy);
      const ring = Math.abs(sd - sw.r);
      if (ring < 35 && sd > 0.1) {
        const push = (1 - ring / 35) * 6 * sw.alpha;
        this.vx += (sx / sd) * push;
        this.vy += (sy / sd) * push;
      }
    }

    // Store trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 14) this.trail.shift();

    this.x += this.vx;
    this.y += this.vy;
    this.life--;

    if (this.life <= 0 || this.x < -40 || this.x > W + 40 || this.y < -40 || this.y > H + 40) {
      this.reset(false);
    }
  }

  draw() {
    const ageFade = this.life < 80 ? this.life / 80 : 1;
    const n = this.trail.length;

    // Draw trail
    for (let i = 1; i < n; i++) {
      const p = i / n;
      ctx.beginPath();
      ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
      ctx.lineTo(this.trail[i].x, this.trail[i].y);
      ctx.strokeStyle = `rgba(201,168,76,${p * this.alpha * 0.5 * ageFade})`;
      ctx.lineWidth   = this.size * p;
      ctx.stroke();
    }

    // Draw head
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220,185,90,${this.alpha * ageFade})`;
    ctx.fill();
  }
}

// ── CONNECTIONS ──
function drawConnections() {
  const MAX = 85;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d2 = dx * dx + dy * dy;
      if (d2 < MAX * MAX) {
        const d = Math.sqrt(d2);
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(201,168,76,${(1 - d / MAX) * 0.14})`;
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      }
    }
  }
}

// ── INIT ──
function init() {
  const n = Math.min(Math.floor(W * H / 7500), 200);
  particles = Array.from({ length: n }, () => new Particle(true));
}

// ── LOOP ──
(function tick() {
  ctx.clearRect(0, 0, W, H);
  time += 0.007;

  particles.forEach(p => { p.update(time); p.draw(); });
  drawConnections();

  // Shockwave rings
  shockwaves = shockwaves.filter(sw => sw.alpha > 0.015);
  shockwaves.forEach(sw => {
    sw.r     += 7;
    sw.alpha *= 0.93;
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(201,168,76,${sw.alpha * 0.5})`;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
    // Inner ring
    if (sw.r > 20) {
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.r * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(240,200,100,${sw.alpha * 0.25})`;
      ctx.lineWidth   = 0.8;
      ctx.stroke();
    }
  });

  requestAnimationFrame(tick);
})();

init();


// ══════════════════════════════════════════════
//  CURSOR GLOW (smooth follow)
// ══════════════════════════════════════════════
const glow = document.getElementById('cursor-glow');
let gx = W / 2, gy = H / 2, gtx = gx, gty = gy;
document.addEventListener('mousemove', e => { gtx = e.clientX; gty = e.clientY; });
(function moveGlow() {
  gx += (gtx - gx) * 0.09;
  gy += (gty - gy) * 0.09;
  glow.style.left = gx + 'px';
  glow.style.top  = gy + 'px';
  requestAnimationFrame(moveGlow);
})();


// ══════════════════════════════════════════════
//  SCROLL REVEAL
// ══════════════════════════════════════════════
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal, .reveal-card').forEach(el => revObs.observe(el));


// ══════════════════════════════════════════════
//  STAT COUNTER
// ══════════════════════════════════════════════
const STATS = [
  { selector: '.stat-num', targets: [3, 35, 8, 5], prefixes: ['','','','$'], suffixes: ['','+','','M+'] }
];

const statEls = [...document.querySelectorAll('.stat-num')];
const statData = [
  { target: 7,  pre: '',  suf: ''   },
  { target: 50, pre: '',  suf: '+'  },
  { target: 8,  pre: '',  suf: ''   },
  { target: 5,  pre: '$', suf: 'M+' },
];
let counted = false;

function countUp(el, target, pre, suf) {
  const start = performance.now();
  const dur   = 1100;
  (function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = pre + Math.floor(e * target) + suf;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = pre + target + suf;
  })(start);
}

new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !counted) {
    counted = true;
    statEls.forEach((el, i) => setTimeout(() => countUp(el, statData[i].target, statData[i].pre, statData[i].suf), i * 100));
  }
}, { threshold: 0.5 }).observe(document.querySelector('.hero-stats'));


// ══════════════════════════════════════════════
//  NAV ACTIVE + CARD MOUSE GLOW
// ══════════════════════════════════════════════
const secs  = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let cur = '';
  secs.forEach(s => { if (window.scrollY >= s.offsetTop - 140) cur = s.id; });
  links.forEach(a => { a.style.color = a.getAttribute('href') === '#' + cur ? 'var(--gold)' : ''; });
}, { passive: true });

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width)  * 100;
    const y = ((e.clientY - r.top)  / r.height) * 100;
    card.querySelector('.card-glow').style.background =
      `radial-gradient(circle at ${x}% ${y}%, rgba(201,168,76,0.11) 0%, transparent 60%)`;
  });
});
