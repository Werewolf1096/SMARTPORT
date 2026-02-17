(() => {
  const canvas = document.getElementById("smartCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });

  const cfg = {
    maxNodes: 140,
    maxLinksDist: 200,
    speed: 0.15,
    nodeRadius: 1.5,

    rgb: [0, 113, 227],
    nodeAlpha: 0.25,
    lineAlphaMin: 0.01,
    lineAlphaMax: 0.1,
    lineWidth: 1,

    badgeSlots: 3,
    minActiveBadges: 2,
    badgeOffset: 14,

    badgeTiming: { fadeIn: 5, hold: 4, fadeOut: 5, off: 7 },
    badgeAlphaMax: 0.35,

    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    fontWeight: 600,
    fontSizeMin: 16,
    fontSizeMax: 26
  };

  const BADGES = [
    { type: "text", value: "LOXONE" },
    { type: "text", value: "KNX" },
    { type: "text", value: "LogicHome" },
    { type: "text", value: "Shelly" },
    { type: "text", value: "DALI" },
    { type: "wifi" }
  ];

  let W = 0;
  let H = 0;
  let nodes = [];
  let slots = [];
  let last = performance.now();

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(a) {
    return a[(Math.random() * a.length) | 0];
  }

  function rgba(a) {
    return `rgba(${cfg.rgb[0]},${cfg.rgb[1]},${cfg.rgb[2]},${a})`;
  }

  function smooth(x) {
    return x * x * (3 - 2 * x);
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    nodes = [];
    for (let i = 0; i < cfg.maxNodes; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = cfg.speed * rand(0.4, 1);
      nodes.push({
        x: rand(0, W),
        y: rand(0, H),
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v
      });
    }

    slots = [];
    for (let i = 0; i < cfg.badgeSlots; i++) {
      slots.push(newSlot());
    }
  }

  function newSlot() {
    return {
      node: (Math.random() * nodes.length) | 0,
      badge: pick(BADGES),
      size: rand(cfg.fontSizeMin, cfg.fontSizeMax),
      angle: Math.random() * Math.PI * 2,
      state: "off",
      t: Math.random() * cfg.badgeTiming.off
    };
  }

  function rerollSlot(s) {
    s.node = (Math.random() * nodes.length) | 0;
    s.badge = pick(BADGES);
    s.size = rand(cfg.fontSizeMin, cfg.fontSizeMax);
    s.angle = Math.random() * Math.PI * 2;
  }

  function stepSlot(s, dt) {
    const T = cfg.badgeTiming;
    s.t += dt;

    if (s.state === "off") {
      if (s.t > T.off) {
        s.state = "fadeIn";
        s.t = 0;
        rerollSlot(s);
      }
      return 0;
    }
    if (s.state === "fadeIn") {
      if (s.t > T.fadeIn) {
        s.state = "hold";
        s.t = 0;
        return 1;
      }
      return smooth(s.t / T.fadeIn);
    }
    if (s.state === "hold") {
      if (s.t > T.hold) {
        s.state = "fadeOut";
        s.t = 0;
      }
      return 1;
    }
    if (s.t > T.fadeOut) {
      s.state = "off";
      s.t = 0;
      return 0;
    }
    return smooth(1 - s.t / T.fadeOut);
  }

  function countActive() {
    let c = 0;
    for (const s of slots) {
      if (s.state !== "off") c++;
    }
    return c;
  }

  function forceMinActive() {
    let active = countActive();
    if (active >= cfg.minActiveBadges) return;
    for (const s of slots) {
      if (active >= cfg.minActiveBadges) break;
      if (s.state === "off") {
        s.state = "fadeIn";
        s.t = 0;
        rerollSlot(s);
        active++;
      }
    }
  }

  function wrap(p) {
    if (p.x < 0) p.x += W;
    else if (p.x >= W) p.x -= W;
    if (p.y < 0) p.y += H;
    else if (p.y >= H) p.y -= H;
  }

  function drawWifi(x, y, size, a01) {
    const a = a01 * cfg.badgeAlphaMax;
    ctx.strokeStyle = rgba(a);
    ctx.fillStyle = rgba(a);
    ctx.lineWidth = 1;

    const s = size * 0.7;
    const r1 = s * 0.35;
    const r2 = s * 0.60;
    const r3 = s * 0.85;

    ctx.beginPath();
    ctx.arc(x, y, r1, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, r2, Math.PI * 1.20, Math.PI * 1.80);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, r3, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, s * 0.09, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSlot(s, a01) {
    if (a01 <= 0.0001) return;
    const n = nodes[s.node];
    if (!n) return;

    const ox = Math.cos(s.angle) * cfg.badgeOffset;
    const oy = Math.sin(s.angle) * cfg.badgeOffset;
    const x = n.x + ox;
    const y = n.y + oy;

    if (s.badge.type === "wifi") {
      drawWifi(x, y, s.size, a01);
      return;
    }

    ctx.font = `${cfg.fontWeight} ${Math.round(s.size)}px ${cfg.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = rgba(a01 * cfg.badgeAlphaMax);
    ctx.fillText(s.badge.value, x, y);
  }

  function frame(t) {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;

    ctx.clearRect(0, 0, W, H);

    for (const p of nodes) {
      p.x += p.vx;
      p.y += p.vy;
      wrap(p);
    }

    const maxD2 = cfg.maxLinksDist * cfg.maxLinksDist;
    ctx.lineWidth = cfg.lineWidth;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < maxD2) {
          const a = cfg.lineAlphaMin + (1 - Math.sqrt(d2) / cfg.maxLinksDist) * (cfg.lineAlphaMax - cfg.lineAlphaMin);
          ctx.strokeStyle = rgba(a);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = rgba(cfg.nodeAlpha);
    for (const p of nodes) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, cfg.nodeRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    forceMinActive();
    for (const s of slots) {
      drawSlot(s, stepSlot(s, dt));
    }

    requestAnimationFrame(frame);
  }

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas.parentElement);

  resize();
  requestAnimationFrame(frame);
})();

(() => {
  const carousels = Array.from(document.querySelectorAll(".services-carousel"));
  if (carousels.length === 0) return;

  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".services-track");
    const dots = Array.from(carousel.querySelectorAll(".services-dots button"));
    const prevArrow = carousel.querySelector(".services-arrow--prev");
    const nextArrow = carousel.querySelector(".services-arrow--next");
    if (!track) return;

    const cards = Array.from(track.querySelectorAll(".service-card"));
    let ticking = false;
    let isAnimating = false;
    let animFrame = null;

    function setActive(index) {
      if (dots.length === 0) return;
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    }

    function findClosestIndex() {
      const trackRect = track.getBoundingClientRect();
      const center = trackRect.left + trackRect.width / 2;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const d = Math.abs(cardCenter - center);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      return best;
    }

    function onScroll() {
      if (dots.length === 0) return;
      if (isAnimating) return;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setActive(findClosestIndex());
        ticking = false;
      });
    }

    function easeInOutSine(t) {
      return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    function animateScroll(targetLeft) {
      const start = track.scrollLeft;
      const delta = targetLeft - start;
      if (Math.abs(delta) < 1) return;

      if (animFrame) cancelAnimationFrame(animFrame);
      isAnimating = true;

      const duration = 800;
      const startTime = performance.now();
      const prevSnap = track.style.scrollSnapType;
      const prevBehavior = track.style.scrollBehavior;

      track.style.scrollSnapType = "none";
      track.style.scrollBehavior = "auto";

      function step(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = easeInOutSine(t);
        track.scrollLeft = start + delta * eased;
        if (t < 1) {
          animFrame = requestAnimationFrame(step);
          return;
        }
        track.style.scrollSnapType = prevSnap;
        track.style.scrollBehavior = prevBehavior;
        isAnimating = false;
        animFrame = null;
        setActive(findClosestIndex());
      }

      animFrame = requestAnimationFrame(step);
    }

    function getStepSize() {
      const first = cards[0];
      if (!first) return 0;
      const styles = window.getComputedStyle(track);
      const gapValue = parseFloat(styles.columnGap || styles.gap || "0");
      return first.getBoundingClientRect().width + gapValue;
    }

    function scrollByStep(dir) {
      const step = getStepSize();
      if (!step) return;
      animateScroll(track.scrollLeft + step * dir);
    }

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        const card = cards[i];
        if (!card) return;
        animateScroll(card.offsetLeft - track.offsetLeft);
      });
    });

    if (prevArrow) {
      prevArrow.addEventListener("click", () => scrollByStep(-1));
    }
    if (nextArrow) {
      nextArrow.addEventListener("click", () => scrollByStep(1));
    }

    track.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  });
})();

(() => {
  const cta = document.querySelector(".hero-cta");
  if (!cta) return;
  const hero = cta.closest(".hero");
  if (!hero) return;
  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!supportsHover) return;

  let rect = cta.getBoundingClientRect();
  const pupils = Array.from(cta.querySelectorAll(".cta-eyes .pupil"));
  let ticking = false;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function updateRect() {
    rect = cta.getBoundingClientRect();
  }

  function onMove(e) {
    if (ticking) return;
    const x = e.clientX;
    const y = e.clientY;
    ticking = true;
    requestAnimationFrame(() => {
      rect = cta.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clamp((x - cx) / 120, -1, 1);
      const dy = clamp((y - cy) / 120, -1, 1);
      cta.style.setProperty("--cta-x", `${dx * 8}px`);
      cta.style.setProperty("--cta-y", `${dy * 6}px`);
      cta.style.setProperty("--cta-r", `${dx * 2}deg`);
      const eyeX = dx * 6;
      const eyeY = dy * 4;
      pupils.forEach((pupil) => {
        pupil.style.setProperty("--eye-x", `${eyeX}px`);
        pupil.style.setProperty("--eye-y", `${eyeY}px`);
      });
      ticking = false;
    });
  }

  function reset() {
    cta.style.setProperty("--cta-x", "0px");
    cta.style.setProperty("--cta-y", "0px");
    cta.style.setProperty("--cta-r", "0deg");
    pupils.forEach((pupil) => {
      pupil.style.setProperty("--eye-x", "0px");
      pupil.style.setProperty("--eye-y", "0px");
    });
  }

  window.addEventListener("resize", updateRect);
  hero.addEventListener("mousemove", onMove);
  hero.addEventListener("mouseleave", reset);
  updateRect();
})();

(() => {
  const accordion = Array.from(document.querySelectorAll(".step-item"));
  if (accordion.length === 0) return;

  const bodyPad = 12;
  const openDelayMs = 120;
  const closeDelayMs = 700;
  const visualWrap = document.querySelector(".steps-visual");
  const panel = document.querySelector(".steps-panel");
  let currentImg = null;
  let nextImg = null;
  const fadeMs = 450;

  if (visualWrap) {
    const baseImg = visualWrap.querySelector("img");
    if (baseImg) {
      currentImg = baseImg;
      currentImg.classList.add("steps-visual-img", "is-current");
      nextImg = baseImg.cloneNode();
      nextImg.classList.add("steps-visual-img", "is-next");
      nextImg.removeAttribute("data-active");
      visualWrap.appendChild(nextImg);
    }
  }

  function updateVisual(item) {
    if (!currentImg || !nextImg || !item) return;
    const src = item.getAttribute("data-image");
    if (!src) return;
    if (currentImg.getAttribute("data-active") === src) return;
    const alt = item.getAttribute("data-alt") || "Ukazka kroku";
    const isCompact = window.matchMedia("(max-width: 900px)").matches;
    if (isCompact) {
      currentImg.src = src;
      currentImg.alt = alt;
      currentImg.setAttribute("data-active", src);
      return;
    }
    nextImg.onload = () => {
      if (!visualWrap) return;
      visualWrap.classList.add("is-crossfade");
      setTimeout(() => {
        currentImg.classList.remove("is-current");
        currentImg.classList.add("is-next");
        nextImg.classList.remove("is-next");
        nextImg.classList.add("is-current");
        currentImg = nextImg;
        nextImg = visualWrap.querySelector("img.is-next") || nextImg;
        currentImg.setAttribute("data-active", src);
        visualWrap.classList.remove("is-crossfade");
      }, fadeMs);
    };
    nextImg.src = src;
    nextImg.alt = alt;
  }

  function setBodyHeight(item) {
    const body = item.querySelector(".step-body");
    if (!body) return;
    if (item.open) {
      body.style.maxHeight = `${body.scrollHeight + bodyPad}px`;
      body.style.opacity = "1";
      body.style.paddingTop = `${bodyPad}px`;
    } else {
      body.style.maxHeight = "0px";
      body.style.opacity = "0";
      body.style.paddingTop = "0px";
    }
  }

  function animateBody(item, opening) {
    const body = item.querySelector(".step-body");
    if (!body) return;
    body.style.maxHeight = opening ? "0px" : `${body.scrollHeight + bodyPad}px`;
    body.style.opacity = opening ? "0" : "1";
    body.style.paddingTop = opening ? "0px" : `${bodyPad}px`;
    requestAnimationFrame(() => {
      body.style.maxHeight = opening ? `${body.scrollHeight + bodyPad}px` : "0px";
      body.style.opacity = opening ? "1" : "0";
      body.style.paddingTop = opening ? `${bodyPad}px` : "0px";
    });
  }

  accordion.forEach((item) => setBodyHeight(item));
  updateVisual(accordion.find((item) => item.open) || accordion[0]);

  function updatePanelMinHeight() {
    if (!panel) return;
    const clone = panel.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.visibility = "hidden";
    clone.style.pointerEvents = "none";
    clone.style.height = "auto";
    clone.style.width = `${panel.clientWidth}px`;
    clone.style.top = "-9999px";
    clone.style.left = "0";
    document.body.appendChild(clone);

    const cloneItems = Array.from(clone.querySelectorAll(".step-item"));
    let maxHeight = 0;

    cloneItems.forEach((item) => {
      cloneItems.forEach((other) => {
        if (other !== item) {
          other.removeAttribute("open");
        } else {
          other.setAttribute("open", "");
        }
        const body = other.querySelector(".step-body");
        if (body) {
          body.style.maxHeight = "none";
          body.style.opacity = "1";
          body.style.paddingTop = `${bodyPad}px`;
        }
      });
      const h = clone.getBoundingClientRect().height;
      if (h > maxHeight) maxHeight = h;
    });

    document.body.removeChild(clone);
    if (maxHeight > 0) panel.style.minHeight = `${Math.ceil(maxHeight)}px`;
  }

  updatePanelMinHeight();
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updatePanelMinHeight, 120);
  });

  function closeItem(item) {
    item.classList.add("is-collapsing");
    item.classList.remove("is-active");
    animateBody(item, false);
    if (item._closeTimer) clearTimeout(item._closeTimer);
    item._closeTimer = setTimeout(() => {
      item.removeAttribute("open");
      item.classList.remove("is-collapsing");
    }, closeDelayMs);
  }

  function openItem(item) {
    item.setAttribute("open", "");
    item.classList.add("is-active");
    animateBody(item, true);
    updateVisual(item);
  }

  function toggleItem(item) {
    const isOpen = item.hasAttribute("open");
    if (isOpen) {
      closeItem(item);
      return;
    }
    accordion.forEach((other) => {
      if (other !== item && other.hasAttribute("open")) closeItem(other);
    });
    if (item._delayTimer) clearTimeout(item._delayTimer);
    item._delayTimer = setTimeout(() => openItem(item), openDelayMs);
  }

  accordion.forEach((item) => {
    const summary = item.querySelector("summary");
    if (!summary) return;
    summary.addEventListener("click", (e) => {
      e.preventDefault();
      toggleItem(item);
    });
    summary.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleItem(item);
      }
    });
  });

  window.addEventListener("resize", () => {
    accordion.forEach((item) => setBodyHeight(item));
  });
})();

(() => {
  const burger = document.querySelector(".burger-btn");
  const nav = document.querySelector(".main-nav");
  if (!burger || !nav) return;

  burger.addEventListener("click", () => {
    const isActive = burger.classList.toggle("is-active");
    nav.classList.toggle("is-active", isActive);
    burger.setAttribute("aria-expanded", isActive);
    document.body.style.overflow = isActive ? "hidden" : "";
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      burger.classList.remove("is-active");
      nav.classList.remove("is-active");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });
})();
