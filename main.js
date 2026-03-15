(() => {
  const homeHero = document.getElementById("hero");
  if (!homeHero) return;

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  const resetHomeScroll = () => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    requestAnimationFrame(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
    setTimeout(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, 40);
  };

  const bindHomeLinks = () => {
    const homeLinks = document.querySelectorAll('a[href="#hero"], a[href="index.html#hero"]');
    homeLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        history.replaceState(null, "", location.pathname + location.search);
        resetHomeScroll();
      });
    });
  };

  window.addEventListener("pageshow", resetHomeScroll);
  window.addEventListener("load", resetHomeScroll);
  if (location.hash === "#hero") {
    history.replaceState(null, "", location.pathname + location.search);
    resetHomeScroll();
  }
  window.addEventListener("hashchange", () => {
    if (location.hash === "#hero") resetHomeScroll();
  });
  bindHomeLinks();
})();

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
    nodeAlpha: 0.3025,
    lineAlphaMin: 0.0121,
    lineAlphaMax: 0.121,
    lineWidth: 1,

    badgeSlots: 0,
    minActiveBadges: 0,
    badgeOffset: 14,

    badgeTiming: { fadeIn: 5, hold: 4, fadeOut: 5, off: 7 },
    badgeAlphaMax: 0.35,

    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    fontWeight: 600,
    fontSizeMin: 16,
    fontSizeMax: 26
  };

  const BADGES = [];

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
  let idleTimer = null;
  let blinkTimer = null;
  let pointerInside = false;
  const idleDelayMs = 320;
  const blinkBaseMs = 6600;

  function nextBlinkDelay() {
    return Math.round(blinkBaseMs * (0.75 + Math.random() * 0.5));
  }

  function stopBlinking() {
    if (blinkTimer) {
      clearTimeout(blinkTimer);
      blinkTimer = null;
    }
    cta.classList.remove("is-blinking");
  }

  function blinkOnce() {
    cta.classList.add("is-blinking");
    setTimeout(() => cta.classList.remove("is-blinking"), 220);
  }

  function scheduleIdleBlink() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (blinkTimer) return;
      blinkOnce();
      const loop = () => {
        blinkOnce();
        blinkTimer = setTimeout(loop, nextBlinkDelay());
      };
      blinkTimer = setTimeout(loop, nextBlinkDelay());
    }, idleDelayMs);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function updateRect() {
    rect = cta.getBoundingClientRect();
  }

  function onMove(e) {
    pointerInside = true;
    stopBlinking();
    scheduleIdleBlink();
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
    pointerInside = false;
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    stopBlinking();
    cta.style.setProperty("--cta-x", "0px");
    cta.style.setProperty("--cta-y", "0px");
    cta.style.setProperty("--cta-r", "0deg");
    pupils.forEach((pupil) => {
      pupil.style.setProperty("--eye-x", "0px");
      pupil.style.setProperty("--eye-y", "0px");
    });
    scheduleIdleBlink();
  }

  window.addEventListener("resize", updateRect);
  hero.addEventListener("mouseenter", () => {
    pointerInside = true;
    scheduleIdleBlink();
  });
  hero.addEventListener("mousemove", onMove);
  hero.addEventListener("mouseleave", reset);
  updateRect();
  scheduleIdleBlink();
})();

(() => {
  const creepyBtn = document.querySelector(".contact-cta .creepy-btn");
  if (!creepyBtn) return;

  const eyes = creepyBtn.querySelector(".creepy-btn__eyes");
  const pupils = Array.from(creepyBtn.querySelectorAll(".creepy-btn__pupil"));
  if (!eyes || pupils.length === 0) return;

  const updateEyes = (clientX, clientY) => {
    const eyesRect = eyes.getBoundingClientRect();
    const eyesCenter = {
      x: eyesRect.left + eyesRect.width / 2,
      y: eyesRect.top + eyesRect.height / 2
    };

    const dx = clientX - eyesCenter.x;
    const dy = clientY - eyesCenter.y;
    const angle = Math.atan2(-dy, dx) + Math.PI / 2;
    const distance = Math.hypot(dx, dy);
    const visionRangeX = 180;
    const visionRangeY = 75;

    const x = (Math.sin(angle) * distance) / visionRangeX;
    const y = (Math.cos(angle) * distance) / visionRangeY;
    const tx = Math.max(-3, Math.min(3, x * 3));
    const ty = Math.max(-3, Math.min(3, y * 3));

    pupils.forEach((pupil) => {
      pupil.style.setProperty("--cb-eye-x", `${tx}px`);
      pupil.style.setProperty("--cb-eye-y", `${ty}px`);
    });
  };

  creepyBtn.addEventListener("mousemove", (e) => {
    updateEyes(e.clientX, e.clientY);
  });

  creepyBtn.addEventListener(
    "touchmove",
    (e) => {
      const touch = e.touches && e.touches[0];
      if (!touch) return;
      updateEyes(touch.clientX, touch.clientY);
    },
    { passive: true }
  );
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

(() => {
  const cards = Array.from(document.querySelectorAll('#services .service-card[data-href]'));
  if (cards.length === 0) return;

  cards.forEach((card) => {
    const href = card.getAttribute("data-href");
    if (!href) return;

    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", `Otevřít službu: ${card.querySelector("h3")?.textContent?.trim() || ""}`);

    card.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest(".service-action")) {
        event.preventDefault();
      }
      window.location.href = href;
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.location.href = href;
      }
    });
  });
})();

(() => {
  const dropdowns = document.querySelectorAll(".nav-dropdown");
  if (!dropdowns.length) return;
  const body = document.body;
  let closeTimer = null;

  const clearCloseTimer = () => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  };

  const closeAllDropdowns = () => {
    dropdowns.forEach((d) => d.classList.remove("is-open"));
    body.classList.remove("menu-open");
  };

  const openDropdown = (dropdown) => {
    clearCloseTimer();
    dropdowns.forEach((d) => d.classList.toggle("is-open", d === dropdown));
    body.classList.add("menu-open");
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer = setTimeout(() => {
      const hovering = document.querySelector(".nav-dropdown:hover");
      const focused = document.querySelector(".nav-dropdown:focus-within");
      if (!hovering && !focused) closeAllDropdowns();
    }, 220);
  };

  dropdowns.forEach((dropdown) => {
    const navLink = dropdown.querySelector(".nav-link");
    const links = dropdown.querySelectorAll(".nav-dropdown-list a[data-preview]");
    const panelLinks = dropdown.querySelectorAll(".nav-dropdown-panel a");
    const previewTrack = dropdown.querySelector(".nav-preview-track");
    const images = dropdown.querySelectorAll(".nav-preview-image[data-preview-key]");
    if (!links.length || !images.length || !previewTrack) return;

    const imageByKey = new Map(Array.from(images).map((img) => [img.dataset.previewKey, img]));
    const indexByKey = new Map(Array.from(images).map((img, index) => [img.dataset.previewKey, index]));
    const loadedKeys = new Set();
    images.forEach((img) => {
      const key = img.dataset.previewKey;
      const markLoaded = () => loadedKeys.add(key);
      if (img.complete && img.naturalWidth > 0) {
        markLoaded();
      } else {
        img.addEventListener("load", markLoaded, { once: true });
      }
      const preload = new Image();
      preload.src = img.src;
    });

    let activeKey = null;
    const setActivePreview = (key) => {
      if (!key || key === activeKey) return;
      const target = imageByKey.get(key);
      const targetIndex = indexByKey.get(key);
      if (!target) return;
      if (!loadedKeys.has(key)) {
        target.addEventListener("load", () => setActivePreview(key), { once: true });
        return;
      }
      activeKey = key;
      previewTrack.style.transform = `translate3d(0, ${-targetIndex * 100}%, 0)`;
      images.forEach((img) => {
        img.classList.toggle("is-active", img.dataset.previewKey === key);
      });
    };

    const defaultKey = links[0].dataset.preview;
    setActivePreview(defaultKey);

    if (navLink) {
      navLink.addEventListener("click", (e) => {
        if (window.matchMedia("(min-width: 901px)").matches) {
          e.preventDefault();
          if (dropdown.classList.contains("is-open")) {
            closeAllDropdowns();
          } else {
            openDropdown(dropdown);
          }
        }
      });
    }

    dropdown.addEventListener("mouseenter", () => openDropdown(dropdown));
    dropdown.addEventListener("mouseleave", scheduleClose);
    dropdown.addEventListener("focusin", () => openDropdown(dropdown));
    dropdown.addEventListener("focusout", scheduleClose);

    links.forEach((link) => {
      const key = link.dataset.preview;
      link.addEventListener("mouseenter", () => setActivePreview(key));
      link.addEventListener("focus", () => setActivePreview(key));
    });

    panelLinks.forEach((link) => {
      link.addEventListener("click", () => closeAllDropdowns());
    });

    dropdown.addEventListener("mouseleave", () => setActivePreview(defaultKey));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllDropdowns();
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-dropdown")) {
      closeAllDropdowns();
    }
  });
})();

(() => {
  const creepyBtns = Array.from(document.querySelectorAll(".service-hero .creepy-btn, .electro-final-cta .creepy-btn"));
  if (creepyBtns.length === 0) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const rand = (min, max) => min + Math.random() * (max - min);
  const nextIdleDelay = () => Math.round(rand(12000, 26000));
  const followUpDelay = () => Math.round(rand(180, 420));
  const shouldDoublePeek = () => Math.random() < 0.28;
  const isAutoPeekAllowed = () =>
    !reducedMotion.matches &&
    document.visibilityState === "visible";

  creepyBtns.forEach((creepyBtn) => {
    const eyes = creepyBtn.querySelector(".creepy-btn__eyes");
    const pupils = Array.from(creepyBtn.querySelectorAll(".creepy-btn__pupil"));
    if (!eyes || pupils.length === 0) return;
    let pointerInside = false;
    let hasFocus = false;
    let peekTimer = null;
    let peekCleanupTimer = null;
    let peekSequence = 0;
    let destroyed = false;

    const updateEyes = (clientX, clientY) => {
      const eyesRect = eyes.getBoundingClientRect();
      const eyesCenter = {
        x: eyesRect.left + eyesRect.width / 2,
        y: eyesRect.top + eyesRect.height / 2
      };

      const dx = clientX - eyesCenter.x;
      const dy = clientY - eyesCenter.y;
      const angle = Math.atan2(-dy, dx) + Math.PI / 2;
      const distance = Math.hypot(dx, dy);
      const visionRangeX = 180;
      const visionRangeY = 75;

      const x = (Math.sin(angle) * distance) / visionRangeX;
      const y = (Math.cos(angle) * distance) / visionRangeY;
      const tx = Math.max(-3, Math.min(3, x * 3));
      const ty = Math.max(-3, Math.min(3, y * 3));

      pupils.forEach((pupil) => {
        pupil.style.setProperty("--cb-eye-x", `${tx}px`);
        pupil.style.setProperty("--cb-eye-y", `${ty}px`);
      });
    };

    const clearPeekTimers = () => {
      if (peekTimer) {
        window.clearTimeout(peekTimer);
        peekTimer = null;
      }
      if (peekCleanupTimer) {
        window.clearTimeout(peekCleanupTimer);
        peekCleanupTimer = null;
      }
    };

    const resetPeekState = () => {
      creepyBtn.classList.remove("is-peeking");
      clearPeekTimers();
    };

    const scheduleNextPeek = (delay = nextIdleDelay()) => {
      clearPeekTimers();
      if (destroyed || !isAutoPeekAllowed() || pointerInside || hasFocus) return;

      peekTimer = window.setTimeout(() => {
        peekTimer = null;
        runPeekSequence();
      }, delay);
    };

    const runPeekOnce = (onDone) => {
      if (destroyed || !isAutoPeekAllowed() || pointerInside || hasFocus) {
        onDone();
        return;
      }

      creepyBtn.classList.add("is-peeking");
      peekCleanupTimer = window.setTimeout(() => {
        creepyBtn.classList.remove("is-peeking");
        peekCleanupTimer = null;
        onDone();
      }, 4000);
    };

    const runPeekSequence = () => {
      if (destroyed || !isAutoPeekAllowed() || pointerInside || hasFocus) {
        scheduleNextPeek();
        return;
      }

      const totalPeeks = shouldDoublePeek() ? 2 : 1;
      peekSequence = 0;

      const step = () => {
        if (destroyed || !isAutoPeekAllowed() || pointerInside || hasFocus) {
          resetPeekState();
          scheduleNextPeek();
          return;
        }

        peekSequence += 1;
        runPeekOnce(() => {
          if (peekSequence < totalPeeks) {
            peekTimer = window.setTimeout(() => {
              peekTimer = null;
              step();
            }, followUpDelay());
            return;
          }

          scheduleNextPeek();
        });
      };

      step();
    };

    const pauseAutoPeek = () => {
      pointerInside = true;
      resetPeekState();
    };

    const resumeAutoPeek = () => {
      pointerInside = false;
      scheduleNextPeek();
    };

    creepyBtn.addEventListener("mousemove", (e) => {
      updateEyes(e.clientX, e.clientY);
    });

    creepyBtn.addEventListener("mouseenter", pauseAutoPeek);
    creepyBtn.addEventListener("mouseleave", resumeAutoPeek);
    creepyBtn.addEventListener("focusin", () => {
      hasFocus = true;
      resetPeekState();
    });
    creepyBtn.addEventListener("focusout", () => {
      hasFocus = false;
      scheduleNextPeek();
    });
    creepyBtn.addEventListener("touchstart", () => {
      pointerInside = true;
      resetPeekState();
    }, { passive: true });
    creepyBtn.addEventListener("touchend", () => {
      pointerInside = false;
      scheduleNextPeek(nextIdleDelay());
    }, { passive: true });
    creepyBtn.addEventListener("touchcancel", () => {
      pointerInside = false;
      scheduleNextPeek(nextIdleDelay());
    }, { passive: true });

    creepyBtn.addEventListener(
      "touchmove",
      (e) => {
        const touch = e.touches && e.touches[0];
        if (!touch) return;
        updateEyes(touch.clientX, touch.clientY);
      },
      { passive: true }
    );

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        scheduleNextPeek(nextIdleDelay());
        return;
      }

      resetPeekState();
    });

    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", () => {
        if (reducedMotion.matches) {
          resetPeekState();
          return;
        }

        scheduleNextPeek(nextIdleDelay());
      });
    }

    scheduleNextPeek(Math.round(rand(1200, 4200)));
  });
})();
