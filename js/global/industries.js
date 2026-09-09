// js/global/industries.js
let orbitAnimFrame = null;
let activeCleanups = [];

function initIndustries() {
  const orbitWrap = document.getElementById("orbitWrap");
  const orbitFallback = document.getElementById("orbitFallback");
  if (!orbitWrap) return;

  // 1. Cancel previous loops & listeners
  if (orbitAnimFrame) {
    cancelAnimationFrame(orbitAnimFrame);
    orbitAnimFrame = null;
  }
  activeCleanups.forEach((cleanup) => cleanup());
  activeCleanups = [];

  // 2. Clear previous tags & guides
  orbitWrap.querySelectorAll(".orbit-tag").forEach((el) => el.remove());
  orbitWrap.querySelectorAll(".orbit-guide").forEach((el) => el.remove());
  if (orbitFallback) orbitFallback.innerHTML = "";

  const domains = [
    "IT Service",
    "Healthcare",
    "Environment",
    "Social",
    "Food",
    "Fintech",
    "Logistics",
    "E-Commerce",
    "Education",
    "Hospitality"
  ];

  // 3. Fallback items (Sorted alphabetically for mobile grid)
  if (orbitFallback) {
    const sortedDomains = [...domains].sort((a, b) => a.localeCompare(b));
    sortedDomains.forEach((domain) => {
      const span = document.createElement("span");
      span.textContent = domain;
      orbitFallback.appendChild(span);
    });
  }

  // 4. Configure Two Orbit Rings
  const orbitRings = [
    { items: domains.slice(0, 5), rxFactor: 0.52, rxMax: 540, ry: 185, dur: 45, dir: 1, angle: 0 },
    { items: domains.slice(5), rxFactor: 0.38, rxMax: 380, ry: 125, dur: 32, dir: -1, angle: 0 }
  ];

  // 5. Create DOM Elements
  orbitRings.forEach((cfg) => {
    const guide = document.createElement("div");
    guide.className = "orbit-guide";
    cfg.guide = guide;
    orbitWrap.appendChild(guide);

    cfg.tagEls = cfg.items.map((name) => {
      const tag = document.createElement("a");
      tag.href = "#contact";
      tag.className = "orbit-tag";
      tag.textContent = name;
      tag.style.left = "0px";
      tag.style.top = "0px";
      orbitWrap.appendChild(tag);
      return tag;
    });
  });

  const orbitCenter = orbitWrap.querySelector(".orbit-center");
  if (orbitCenter) {
    orbitWrap.appendChild(orbitCenter);
  }

  // 6. Interaction State
  let orbitPaused = false;
  let orbitDragging = false;
  let lastPointerAngle = 0;
  orbitWrap.style.cursor = "grab";

  const onMouseEnter = () => { if (!orbitDragging) orbitPaused = true; };
  const onMouseLeave = () => { if (!orbitDragging) orbitPaused = false; };

  orbitWrap.addEventListener("mouseenter", onMouseEnter);
  orbitWrap.addEventListener("mouseleave", onMouseLeave);

  function pointerAngle(e) {
    const rect = orbitWrap.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    return Math.atan2(y, x);
  }

  const onPointerDown = (e) => {
    orbitDragging = true;
    orbitPaused = true;
    orbitWrap.style.cursor = "grabbing";
    lastPointerAngle = pointerAngle(e);
    try {
      orbitWrap.setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const onPointerMove = (e) => {
    if (!orbitDragging) return;
    const currentAngle = pointerAngle(e);
    let delta = currentAngle - lastPointerAngle;

    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;

    orbitRings.forEach((cfg) => {
      cfg.angle += delta * cfg.dir;
    });

    positionTags();
    lastPointerAngle = currentAngle;
  };

  const endOrbitDrag = () => {
    if (!orbitDragging) return;
    orbitDragging = false;
    orbitPaused = false;
    orbitWrap.style.cursor = "grab";
  };

  orbitWrap.addEventListener("pointerdown", onPointerDown);
  orbitWrap.addEventListener("pointermove", onPointerMove);
  orbitWrap.addEventListener("pointerup", endOrbitDrag);
  orbitWrap.addEventListener("pointercancel", endOrbitDrag);
  window.addEventListener("blur", endOrbitDrag);

  // 7. Sizing & Positioning
  function layoutOrbit() {
    const w = orbitWrap.clientWidth;
    const h = orbitWrap.clientHeight;
    const cx = w / 2;
    const cy = h / 2;

    orbitRings.forEach((cfg) => {
      cfg.rx = Math.min(w * cfg.rxFactor, cfg.rxMax, Math.max(100, w / 2 - 90));
      cfg.guide.style.width = `${cfg.rx * 2}px`;
      cfg.guide.style.height = `${cfg.ry * 2}px`;
    });

    return { cx, cy };
  }

  let center = layoutOrbit();

  const onResize = () => {
    center = layoutOrbit();
    positionTags();
  };
  window.addEventListener("resize", onResize);

  function positionTags() {
    orbitRings.forEach((cfg) => {
      cfg.tagEls.forEach((tag, i) => {
        const angle = cfg.angle + (i / cfg.tagEls.length) * 2 * Math.PI;
        const x = center.cx + cfg.rx * Math.cos(angle);
        const y = center.cy + cfg.ry * Math.sin(angle);

        tag.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      });
    });
  }

  positionTags();

  // 8. Track Cleanup Functions
  activeCleanups.push(() => {
    orbitWrap.removeEventListener("mouseenter", onMouseEnter);
    orbitWrap.removeEventListener("mouseleave", onMouseLeave);
    orbitWrap.removeEventListener("pointerdown", onPointerDown);
    orbitWrap.removeEventListener("pointermove", onPointerMove);
    orbitWrap.removeEventListener("pointerup", endOrbitDrag);
    orbitWrap.removeEventListener("pointercancel", endOrbitDrag);
    window.removeEventListener("blur", endOrbitDrag);
    window.removeEventListener("resize", onResize);
  });

  // 9. Animation Loop
  let lastT = null;
  function orbitTick(t) {
    if (lastT === null) lastT = t;
    const dt = orbitPaused ? 0 : (t - lastT) / 1000;
    lastT = t;

    orbitRings.forEach((cfg) => {
      cfg.angle += dt * ((2 * Math.PI) / cfg.dur) * cfg.dir;
    });

    positionTags();
    orbitAnimFrame = requestAnimationFrame(orbitTick);
  }

  orbitAnimFrame = requestAnimationFrame(orbitTick);
}

window.initIndustries = initIndustries;
document.addEventListener("componentsLoaded", initIndustries);
document.addEventListener("DOMContentLoaded", initIndustries);