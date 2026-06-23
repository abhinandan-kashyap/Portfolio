const canvas = document.querySelector("#scene");
const ctx = canvas.getContext("2d", { alpha: true });
const scrolly = document.querySelector(".scrolly");
const chapters = [...document.querySelectorAll(".chapter")];
const nav = document.querySelector(".nav");
const progressBar = document.querySelector(".progress b");
const progressValue = document.querySelector(".progress-value");
const progressLabel = document.querySelector(".progress-label");
const heroVideoWrap = document.querySelector(".hero-video-wrap");
const heroVideo = document.querySelector(".hero-video");
const soundToggle = document.querySelector(".sound-toggle");
const soundIcon = document.querySelector(".sound-icon");
const soundLabel = document.querySelector(".sound-label");
const heroLede = document.querySelector(".lede[data-type-text]");

let w = 0;
let h = 0;
let dpr = 1;
let target = 0;
let current = 0;
let raf;
let typeTimer;
let hasTypedHeroLede = false;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const labels = [
  "01 / IDENTITY",
  "02 / SKILLS",
  "03 / EXPERIENCE",
  "04 / COMPLETE",
];

const particles = Array.from({ length: 72 }, (_, index) => ({
  seed: index * 17.113,
  angle: (index / 72) * Math.PI * 2,
  radius: 80 + (index % 13) * 23,
  size: index % 8 === 0 ? 2 : 0.7,
  depth: 0.45 + (index % 9) / 10,
}));

const panels = [
  { title: "LANGUAGES", code: "JAVA / SQL / C++", side: -1, y: -0.24, phase: 0.05 },
  { title: "WEB", code: "HTML / CSS / JS", side: 1, y: -0.17, phase: 0.13 },
  { title: "TOOLS", code: "REACT / GIT", side: -1, y: 0.08, phase: 0.21 },
  { title: "DATA OPS", code: "VALIDATE / QUALITY", side: 1, y: 0.15, phase: 0.29 },
  { title: "WORKFLOW", code: "SDLC / DOCS", side: -1, y: 0.32, phase: 0.37 },
  { title: "EXECUTION", code: "STATUS / LIVE", side: 1, y: 0.37, phase: 0.45 },
];

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function map(value, inA, inB, outA, outB) {
  return outA + clamp((value - inA) / (inB - inA)) * (outB - outA);
}

function ease(value) {
  return 1 - Math.pow(1 - clamp(value), 3);
}

function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  w = innerWidth;
  h = innerHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

function roundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function drawParticles(progress, time) {
  const spread = Math.sin(clamp(map(progress, 0.1, 0.9, 0, 1)) * Math.PI);
  const centerX = w / 2;
  const centerY = h * 0.52;
  particles.forEach((p, i) => {
    const motion = reducedMotion ? 0 : time * 0.00007 * (i % 2 ? 1 : -1);
    const radius = p.radius * (0.4 + spread * 1.35) * Math.min(w / 1000, 1.15);
    const x = centerX + Math.cos(p.angle + motion) * radius * (1.2 + p.depth);
    const y = centerY + Math.sin(p.angle + motion) * radius * 0.58;
    const alpha = (0.04 + spread * 0.42) * p.depth;
    ctx.fillStyle = i % 11 === 0 ? `rgba(0,214,255,${alpha})` : `rgba(255,255,255,${alpha * 0.55})`;
    ctx.fillRect(x, y, p.size, p.size);
    if (i % 14 === 0 && spread > 0.2) {
      ctx.strokeStyle = `rgba(0,80,255,${alpha * 0.35})`;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  });
}

function drawPanel(panel, index, progress) {
  const reveal = ease(map(progress, 0.12 + panel.phase, 0.32 + panel.phase, 0, 1));
  const retract = ease(map(progress, 0.78, 0.96, 0, 1));
  const visibility = reveal * (1 - retract);
  if (visibility <= 0.01) return;

  const mobile = w < 760;
  const panelW = mobile ? 130 : 190;
  const panelH = mobile ? 52 : 66;
  const maxOffset = mobile ? w * 0.31 : Math.min(w * 0.34, 520);
  const x = w / 2 + panel.side * (65 + maxOffset * visibility) - (panel.side < 0 ? panelW : 0);
  const y = h / 2 + panel.y * h + Math.sin(index * 2.1) * 18 * visibility;
  const lineTargetX = w / 2 + panel.side * 65;
  const lineTargetY = h / 2 + panel.y * h * 0.42;

  ctx.save();
  ctx.globalAlpha = visibility;
  ctx.strokeStyle = "rgba(0,214,255,.2)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(lineTargetX, lineTargetY);
  ctx.lineTo(panel.side < 0 ? x + panelW : x, y + panelH / 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(0,214,255,.9)";
  ctx.fillRect(lineTargetX - 1.5, lineTargetY - 1.5, 3, 3);

  roundedRect(x, y, panelW, panelH, 5);
  ctx.fillStyle = "rgba(7,10,16,.66)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.13)";
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.88)";
  ctx.font = `600 ${mobile ? 8 : 10}px Inter, sans-serif`;
  ctx.letterSpacing = "2px";
  ctx.fillText(panel.title, x + 15, y + 22);
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.font = `500 ${mobile ? 6 : 7}px Inter, sans-serif`;
  ctx.fillText(panel.code, x + 15, y + 41);
  ctx.fillStyle = index % 2 ? "#0050ff" : "#00d6ff";
  ctx.fillRect(x + panelW - 25, y + 17, 9, 2);
  ctx.restore();
}

function drawRings(progress) {
  const amount = Math.sin(clamp(map(progress, 0.12, 0.9, 0, 1)) * Math.PI);
  if (amount < 0.01) return;
  ctx.save();
  ctx.translate(w / 2, h * 0.54);
  ctx.strokeStyle = `rgba(0,214,255,${amount * 0.12})`;
  ctx.lineWidth = 0.7;
  [0.17, 0.25, 0.35].forEach((size, index) => {
    ctx.beginPath();
    ctx.ellipse(0, 0, Math.min(w, h) * size * amount, Math.min(w, h) * size * 0.38 * amount, -0.08, index * 0.5, Math.PI * (1.25 + index * 0.35));
    ctx.stroke();
  });
  ctx.restore();
}

function draw(time = 0) {
  ctx.clearRect(0, 0, w, h);
  drawRings(current);
  drawParticles(current, time);
  panels.forEach((panel, index) => drawPanel(panel, index, current));
}

function updateUI(progress) {
  nav.classList.toggle("scrolled", scrollY > 30);
  progressBar.style.height = `${progress * 100}%`;
  progressValue.textContent = String(Math.round(progress * 100)).padStart(3, "0");
  const labelIndex = Math.min(labels.length - 1, Math.floor(progress * labels.length));
  progressLabel.textContent = labels[labelIndex];
  const videoVisibility = 1 - ease(map(progress, 0.12, 0.2, 0, 1));
  heroVideoWrap.style.opacity = videoVisibility;
  heroVideoWrap.style.pointerEvents = videoVisibility > 0.1 ? "auto" : "none";
  if (progress >= 0.2 && !heroVideo.paused) {
    heroVideo.pause();
  } else if (progress < 0.2 && heroVideo.paused && !heroVideo.ended) {
    heroVideo.play().catch(() => {
      soundToggle.classList.add("is-visible");
    });
  }

  chapters.forEach((chapter) => {
    const [start, end] = chapter.dataset.range.split(",").map(Number);
    const fadeIn = start === 0 ? 1 : (progress - start) / 0.035;
    const fadeOut = end === 1 ? 1 : (end - progress) / 0.035;
    const local = clamp(Math.min(fadeIn, fadeOut));
    chapter.classList.toggle("is-active", progress >= start && progress <= end);
    chapter.style.opacity = local;
    const y = (1 - local) * 18;
    if (chapter.classList.contains("chapter-hero")) {
      chapter.style.transform = `translateY(calc(-50% + ${y}px))`;
    } else if (chapter.classList.contains("chapter-final")) {
      chapter.style.transform = `translate(-50%, calc(-50% + ${y}px))`;
    } else {
      chapter.style.transform = `translateY(calc(-50% + ${y}px))`;
    }
  });
}

function frame(time) {
  current += (target - current) * (reducedMotion ? 1 : 0.075);
  if (Math.abs(current - target) < 0.0001) current = target;
  draw(time);
  updateUI(current);
  raf = requestAnimationFrame(frame);
}

function onScroll() {
  const rect = scrolly.getBoundingClientRect();
  const distance = scrolly.offsetHeight - innerHeight;
  target = clamp(-rect.top / distance);
}

function typeHeroLede(force = false) {
  if (!heroLede) return;
  if (hasTypedHeroLede && !force) return;
  clearTimeout(typeTimer);
  hasTypedHeroLede = true;
  const text = heroLede.dataset.typeText || heroLede.textContent;
  if (reducedMotion) {
    heroLede.textContent = text;
    heroLede.classList.remove("is-typing");
    return;
  }
  heroLede.textContent = "";
  heroLede.classList.add("is-typing");
  let index = 0;
  const tick = () => {
    heroLede.textContent = text.slice(0, index);
    index += 1;
    if (index <= text.length) {
      typeTimer = setTimeout(tick, 26);
    } else {
      typeTimer = setTimeout(() => heroLede.classList.remove("is-typing"), 650);
    }
  };
  tick();
}

document.querySelector(".menu-button").addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  document.querySelector(".menu-button").setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

const chapterStops = {
  overview: 0,
  skills: 0.2,
  experience: 0.5,
  journey: 0.76,
};

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const id = link.getAttribute("href").slice(1);
  if (!(id in chapterStops)) return;
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const scrollyTop = scrolly.getBoundingClientRect().top + scrollY;
    const distance = scrolly.offsetHeight - innerHeight;
    scrollTo({ top: scrollyTop + distance * chapterStops[id], behavior: reducedMotion ? "auto" : "smooth" });
  });
});

document.querySelector(".to-top").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
document.querySelector("#year").textContent = new Date().getFullYear();

const directEmailButton = document.querySelector(".direct-email");
if (directEmailButton) {
  directEmailButton.addEventListener("click", () => {
    const name = document.querySelector("#contactName")?.value.trim() || "Portfolio visitor";
    const email = document.querySelector("#contactEmail")?.value.trim() || "";
    const subject = document.querySelector("#contactSubject")?.value.trim() || "Portfolio contact request";
    const message = document.querySelector("#contactMessage")?.value.trim() || "";
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      message,
    ].join("\n");
    window.location.href = `mailto:abhinandan.kashyap18@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

function startIntroWithAudio(restart = true) {
  heroVideo.muted = false;
  if (restart) {
    heroVideo.currentTime = 0;
    typeHeroLede(true);
  }
  heroVideo.play()
    .then(() => soundToggle.classList.remove("is-visible"))
    .catch(() => soundToggle.classList.add("is-visible"));
}

heroVideo.muted = true;
heroVideo.addEventListener("play", () => typeHeroLede());
heroVideo.play().catch(() => {
  soundToggle.classList.add("is-visible");
  typeHeroLede();
});

heroVideo.addEventListener("ended", () => {
  soundIcon.textContent = "↻";
  soundLabel.textContent = "Play again";
  soundToggle.setAttribute("aria-label", "Play introduction video again");
  soundToggle.classList.add("is-visible");
});

soundToggle.addEventListener("click", () => {
  const replay = heroVideo.ended;
  if (!replay) {
    heroVideo.muted = false;
    typeHeroLede(true);
    heroVideo.play().catch(() => {});
    soundToggle.classList.remove("is-visible");
    return;
  }

  startIntroWithAudio(true);
});

addEventListener("resize", resize);
addEventListener("scroll", onScroll, { passive: true });
resize();
onScroll();
cancelAnimationFrame(raf);
raf = requestAnimationFrame(frame);
