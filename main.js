(() => {
  const localHosts = new Set(["", "localhost", "127.0.0.1", "::1"]);
  const isGithubPages = window.location.hostname.endsWith(".github.io");
  const isLocalStatic = window.location.protocol === "file:" || localHosts.has(window.location.hostname) || isGithubPages;
  if (!isLocalStatic) return;

  const githubBasePath = isGithubPages
    ? `/${window.location.pathname.split("/").filter(Boolean)[0] || "SMARTPORT"}`
    : "";
  const futureBlogArticles = new Set([
    "blog/zabezpeceni-s-loxone",
  ]);

  const prettyPathToFile = (rawHref) => {
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("?") || rawHref.startsWith("//")) return null;
    if (/^[a-z][a-z\d+.-]*:/i.test(rawHref)) return null;

    const [pathPart, hashPart = ""] = rawHref.split("#");
    const [pathOnly, queryPart = ""] = pathPart.split("?");
    if (isGithubPages && pathOnly.startsWith(`${githubBasePath}/`) && /\.html$/i.test(pathOnly)) return null;

    const cleanPath = pathOnly
      .replace(/\\/g, "/")
      .replace(/^(\.\.\/|\.\/|\/)+/, "")
      .replace(/\/+$/g, "");
    if (cleanPath && /(?:^|\/)[^/]+\.[^/]+$/.test(cleanPath)) return null;

    const routePath = isGithubPages && futureBlogArticles.has(cleanPath) ? "blog" : cleanPath;
    const targetFile = routePath ? `${routePath}.html` : "index.html";
    const query = queryPart ? `?${queryPart}` : "";
    const hash = hashPart ? `#${hashPart}` : "";

    if (window.location.protocol === "file:") {
      const filePrefix = document.body.classList.contains("blog-article-page") ? "../" : "";
      return new URL(`${filePrefix}${targetFile}${query}${hash}`, document.baseURI).href;
    }

    const basePath = isGithubPages ? githubBasePath : "";
    return new URL(`${basePath}/${targetFile}${query}${hash}`, window.location.origin).href;
  };

  window.smartportResolveLocalUrl = (rawHref) => prettyPathToFile(rawHref) || rawHref;

  document.addEventListener(
    "click",
    (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!target || typeof target.closest !== "function") return;

      const link = target.closest("a[href]");
      if (!link || link.target) return;

      const rawHref = link.getAttribute("href") || "";
      const localHref = prettyPathToFile(rawHref);
      if (!localHref) return;

      event.preventDefault();
      window.location.href = localHref;
    },
    true
  );
})();

(() => {
  const tableOfContents = document.querySelector(".blog-article-aside");
  if (!tableOfContents) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const links = Array.from(tableOfContents.querySelectorAll('a[href^="#"]'));
  const sections = links
    .map((link) => {
      const targetId = link.getAttribute("href").slice(1);
      const section = document.getElementById(targetId);
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  let activeLink = null;
  let scrollFrame = null;

  const setActiveLink = (link) => {
    if (link === activeLink) return;

    sections.forEach((item) => {
      const isActive = item.link === link;
      item.link.classList.toggle("is-active", isActive);

      if (isActive) {
        item.link.setAttribute("aria-current", "location");
      } else {
        item.link.removeAttribute("aria-current");
      }
    });

    activeLink = link;
  };

  const updateActiveLink = () => {
    scrollFrame = null;
    const activationLine = Math.min(140, window.innerHeight * 0.28);
    let current = sections[0];

    sections.forEach((item) => {
      if (item.section.getBoundingClientRect().top <= activationLine) {
        current = item;
      }
    });

    setActiveLink(current.link);
  };

  const scheduleActiveLinkUpdate = () => {
    if (scrollFrame !== null) return;
    scrollFrame = window.requestAnimationFrame(updateActiveLink);
  };

  tableOfContents.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute("href").slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;

    event.preventDefault();
    setActiveLink(link);
    target.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });

    history.replaceState(null, "", `#${targetId}`);
  });

  window.addEventListener("scroll", scheduleActiveLinkUpdate, { passive: true });
  window.addEventListener("resize", scheduleActiveLinkUpdate);
  window.addEventListener("load", scheduleActiveLinkUpdate);
  updateActiveLink();
})();

(() => {
  if (window.__smartportPhoneConversionTrackingBound) return;
  window.__smartportPhoneConversionTrackingBound = true;

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!target || typeof target.closest !== "function") return;

    const phoneLink = target.closest('a[href^="tel:"]');
    if (!phoneLink) return;

    const href = phoneLink.getAttribute("href") || "";
    if (!href.includes("+420775563355")) return;

    if (typeof window.gtag !== "function") return;

    event.preventDefault();

    let opened = false;
    const openPhoneLink = () => {
      if (opened) return;
      opened = true;
      window.location.href = href;
    };

    window.gtag("event", "conversion", {
      send_to: "AW-18130609491/7R2bCOW0s6ccENPKrMVD",
      value: 1.0,
      currency: "CZK",
      event_callback: openPhoneLink,
      event_timeout: 1000,
    });

    setTimeout(openPhoneLink, 1200);
  });
})();

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
    const homeLinks = document.querySelectorAll('a[href="#hero"], a[href="/"]');
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
  const section = document.getElementById("solutions");
  if (!section) return;

  const cards = Array.from(section.querySelectorAll(".solution-card"));
  const modal = section.querySelector(".solutions-modal");
  const dialog = section.querySelector(".solutions-modal__card");
  const modalBody = section.querySelector(".solutions-modal__body");
  const closeButton = section.querySelector(".solutions-modal__close");
  if (!cards.length || !modal || !dialog || !modalBody || !closeButton) return;

  document.body.appendChild(modal);

  let activeCard = null;

  function appendTextElement(parent, tagName, className, text) {
    if (!text) return null;
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  function renderModal(card) {
    const title = card.querySelector(".wide-solution-title")?.textContent?.trim() || "";
    const lead = card.querySelector(".wide-solution-text")?.textContent?.trim() || "";
    const paragraphs = Array.from(card.querySelectorAll(".solution-expanded p"))
      .map((paragraph) => paragraph.textContent.trim())
      .filter(Boolean);

    modalBody.replaceChildren();
    appendTextElement(modalBody, "p", "solutions-modal__eyebrow", "Kdy má chytrý dům smysl");
    appendTextElement(modalBody, "h3", "solutions-modal__title", title);
    appendTextElement(modalBody, "p", "solutions-modal__lead", lead);

    const textWrap = document.createElement("div");
    textWrap.className = "solutions-modal__text";
    paragraphs.forEach((text) => appendTextElement(textWrap, "p", "", text));
    modalBody.appendChild(textWrap);
    dialog.setAttribute("aria-label", title || "Detail");
  }

  function openModal(card) {
    activeCard = card;
    renderModal(card);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("solutions-modal-open");
    dialog.focus({ preventScroll: true });
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("solutions-modal-open");
    if (activeCard) {
      activeCard.focus({ preventScroll: true });
      activeCard = null;
    }
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => openModal(card));
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openModal(card);
    });
  });

  closeButton.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
})();

(() => {
  const cta = document.querySelector(".hero-cta");
  if (!cta) return;
  const hero = cta.closest(".hero");
  if (!hero) return;
  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  let rect = cta.getBoundingClientRect();
  const pupils = Array.from(cta.querySelectorAll(".cta-eyes .pupil"));
  let ticking = false;
  let idleTimer = null;
  let blinkTimer = null;
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

  function engage() {
    cta.classList.add("is-engaged");
  }

  function disengage() {
    cta.classList.remove("is-engaged");
    reset();
  }

  window.addEventListener("resize", updateRect);
  hero.addEventListener("mouseenter", scheduleIdleBlink);
  if (supportsHover) {
    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", reset);
    cta.addEventListener("mouseenter", engage);
    cta.addEventListener("mouseleave", () => {
      cta.classList.remove("is-engaged");
    });
  }
  cta.addEventListener("focusin", engage);
  cta.addEventListener("focusout", disengage);
  cta.addEventListener("touchstart", engage, { passive: true });
  cta.addEventListener("touchmove", (e) => {
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    updateRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clamp((touch.clientX - cx) / 120, -1, 1);
    const dy = clamp((touch.clientY - cy) / 120, -1, 1);
    const eyeX = dx * 6;
    const eyeY = dy * 4;
    pupils.forEach((pupil) => {
      pupil.style.setProperty("--eye-x", `${eyeX}px`);
      pupil.style.setProperty("--eye-y", `${eyeY}px`);
    });
  }, { passive: true });
  cta.addEventListener("touchend", disengage, { passive: true });
  cta.addEventListener("touchcancel", disengage, { passive: true });
  updateRect();
  scheduleIdleBlink();
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
  let lastDirectToggle = 0;
  const closeMobileDropdowns = () => {
    nav.querySelectorAll(".nav-dropdown.is-open").forEach((dropdown) => {
      dropdown.classList.remove("is-open");
      dropdown.querySelector(".nav-link")?.setAttribute("aria-expanded", "false");
    });
  };

  const setMenuOpen = (isActive) => {
    burger.classList.toggle("is-active", isActive);
    nav.classList.toggle("is-active", isActive);
    burger.setAttribute("aria-expanded", isActive ? "true" : "false");
    document.body.style.overflow = isActive ? "hidden" : "";
    if (!isActive) closeMobileDropdowns();
  };

  const toggleMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    lastDirectToggle = Date.now();
    setMenuOpen(!burger.classList.contains("is-active"));
  };

  if (window.PointerEvent) {
    burger.addEventListener("pointerup", toggleMenu);
  } else {
    burger.addEventListener("touchend", toggleMenu);
  }

  burger.addEventListener("click", (event) => {
    if (Date.now() - lastDirectToggle < 700) {
      event.preventDefault();
      return;
    }
    toggleMenu(event);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        window.matchMedia("(max-width: 900px)").matches &&
        link.classList.contains("nav-link") &&
        link.closest(".nav-dropdown")
      ) {
        event.preventDefault();
        return;
      }

      setMenuOpen(false);
    });
  });
})();

(() => {
  const cards = Array.from(document.querySelectorAll('#services .service-card[data-href]'));
  if (cards.length === 0) return;

  cards.forEach((card) => {
    const href = card.getAttribute("data-href");
    if (!href) return;
    const targetHref = typeof window.smartportResolveLocalUrl === "function" ? window.smartportResolveLocalUrl(href) : href;
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", `Otevřít službu: ${card.querySelector("h3")?.textContent?.trim() || ""}`);

    card.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest(".service-action")) {
        event.preventDefault();
      }
      window.location.href = targetHref;
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.location.href = targetHref;
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
    dropdowns.forEach((d) => {
      d.classList.remove("is-open");
      d.querySelector(".nav-link")?.setAttribute("aria-expanded", "false");
    });
    body.classList.remove("menu-open");
  };

  const openDropdown = (dropdown) => {
    clearCloseTimer();
    dropdowns.forEach((d) => {
      const isCurrent = d === dropdown;
      d.classList.toggle("is-open", isCurrent);
      d.querySelector(".nav-link")?.setAttribute("aria-expanded", isCurrent ? "true" : "false");
    });
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
      navLink.setAttribute("aria-expanded", "false");

      navLink.addEventListener("click", (e) => {
        if (window.matchMedia("(max-width: 900px)").matches) {
          e.preventDefault();
          const isOpen = dropdown.classList.toggle("is-open");
          navLink.setAttribute("aria-expanded", isOpen ? "true" : "false");
          dropdowns.forEach((d) => {
            if (d !== dropdown) {
              d.classList.remove("is-open");
              d.querySelector(".nav-link")?.setAttribute("aria-expanded", "false");
            }
          });
          return;
        }

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

    dropdown.addEventListener("mouseenter", () => {
      if (window.matchMedia("(min-width: 901px)").matches) openDropdown(dropdown);
    });
    dropdown.addEventListener("mouseleave", () => {
      if (window.matchMedia("(min-width: 901px)").matches) scheduleClose();
    });
    dropdown.addEventListener("focusin", () => {
      if (window.matchMedia("(min-width: 901px)").matches) openDropdown(dropdown);
    });
    dropdown.addEventListener("focusout", () => {
      if (window.matchMedia("(min-width: 901px)").matches) scheduleClose();
    });

    links.forEach((link) => {
      const key = link.dataset.preview;
      link.addEventListener("mouseenter", () => setActivePreview(key));
      link.addEventListener("focus", () => setActivePreview(key));
    });

    panelLinks.forEach((link) => {
      link.addEventListener("click", () => closeAllDropdowns());
    });

    dropdown.addEventListener("mouseleave", () => {
      if (window.matchMedia("(min-width: 901px)").matches) setActivePreview(defaultKey);
    });
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
  const creepyBtns = Array.from(document.querySelectorAll(".creepy-btn"));
  if (creepyBtns.length === 0) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const rand = (min, max) => min + Math.random() * (max - min);
  const nextIdleDelay = () => Math.round(rand(12000, 26000));
  const followUpDelay = () => Math.round(rand(180, 420));
  const shouldDoublePeek = () => Math.random() < 0.28;
  const baseAutoPeekAllowed = () => !reducedMotion.matches && document.visibilityState === "visible";
  const visibilityListeners = new Set();
  const reducedMotionListeners = new Set();

  document.addEventListener("visibilitychange", () => {
    visibilityListeners.forEach((listener) => listener());
  });

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", () => {
      reducedMotionListeners.forEach((listener) => listener());
    });
  }

  creepyBtns.forEach((creepyBtn) => {
    const eyes = creepyBtn.querySelector(".creepy-btn__eyes");
    const pupils = Array.from(creepyBtn.querySelectorAll(".creepy-btn__pupil"));
    if (!eyes || pupils.length === 0) return;

    const allowIdlePeek = creepyBtn.matches(
      ".service-hero .creepy-btn, .electro-final-cta .creepy-btn, .about-final-cta .creepy-btn, .about-new-cta .creepy-btn, .blog-article-cta .creepy-btn, .lead-page-form .creepy-btn"
    );

    let pointerInside = false;
    let hasFocus = false;
    let touchActive = false;
    let isInViewport = true;
    let peekTimer = null;
    let peekCleanupTimer = null;
    let peekSequence = 0;
    let destroyed = false;

    const setEngaged = (engaged) => {
      creepyBtn.classList.toggle("is-engaged", engaged);
    };

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

    const resetEyes = () => {
      pupils.forEach((pupil) => {
        pupil.style.setProperty("--cb-eye-x", "0px");
        pupil.style.setProperty("--cb-eye-y", "0px");
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

    const isAutoPeekAllowed = () => allowIdlePeek && isInViewport && baseAutoPeekAllowed();

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
      setEngaged(true);
      resetPeekState();
    };

    const resumeAutoPeek = () => {
      pointerInside = false;
      if (!hasFocus && !touchActive) {
        setEngaged(false);
        resetEyes();
      }
      scheduleNextPeek();
    };

    creepyBtn.addEventListener("mousemove", (e) => {
      updateEyes(e.clientX, e.clientY);
    });

    creepyBtn.addEventListener("mouseenter", pauseAutoPeek);
    creepyBtn.addEventListener("mouseleave", resumeAutoPeek);
    creepyBtn.addEventListener("focusin", () => {
      hasFocus = true;
      setEngaged(true);
      resetPeekState();
    });
    creepyBtn.addEventListener("focusout", () => {
      hasFocus = false;
      if (!pointerInside && !touchActive) {
        setEngaged(false);
        resetEyes();
      }
      scheduleNextPeek();
    });
    creepyBtn.addEventListener(
      "touchstart",
      () => {
        touchActive = true;
        pointerInside = true;
        setEngaged(true);
        resetPeekState();
      },
      { passive: true }
    );
    creepyBtn.addEventListener(
      "touchend",
      () => {
        touchActive = false;
        pointerInside = false;
        if (!hasFocus) {
          setEngaged(false);
          resetEyes();
        }
        scheduleNextPeek(nextIdleDelay());
      },
      { passive: true }
    );
    creepyBtn.addEventListener(
      "touchcancel",
      () => {
        touchActive = false;
        pointerInside = false;
        if (!hasFocus) {
          setEngaged(false);
          resetEyes();
        }
        scheduleNextPeek(nextIdleDelay());
      },
      { passive: true }
    );

    creepyBtn.addEventListener(
      "touchmove",
      (e) => {
        const touch = e.touches && e.touches[0];
        if (!touch) return;
        updateEyes(touch.clientX, touch.clientY);
      },
      { passive: true }
    );

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        scheduleNextPeek(nextIdleDelay());
        return;
      }

      resetPeekState();
      if (!pointerInside && !hasFocus && !touchActive) {
        setEngaged(false);
        resetEyes();
      }
    };
    visibilityListeners.add(onVisibilityChange);

    if (typeof reducedMotion.addEventListener === "function") {
      const onReducedMotionChange = () => {
        if (reducedMotion.matches) {
          resetPeekState();
          return;
        }

        scheduleNextPeek(nextIdleDelay());
      };
      reducedMotionListeners.add(onReducedMotionChange);
    }

    if (allowIdlePeek && "IntersectionObserver" in window) {
      isInViewport = false;
      const viewportObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isInViewport = entry.isIntersecting;

          if (entry.isIntersecting) {
            scheduleNextPeek(Math.round(rand(700, 1600)));
            return;
          }

          resetPeekState();
          if (!pointerInside && !hasFocus && !touchActive) {
            setEngaged(false);
            resetEyes();
          }
        });
      }, { threshold: 0.35 });

      viewportObserver.observe(creepyBtn);
    } else {
      scheduleNextPeek(allowIdlePeek ? Math.round(rand(1200, 4200)) : nextIdleDelay());
    }
  });
})();
