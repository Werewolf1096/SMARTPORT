(() => {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

  items.forEach((el) => io.observe(el));
})();

(() => {
  const steps = document.querySelectorAll(".reveal-step");
  if (!steps.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });

  steps.forEach((step, index) => {
    step.style.transitionDelay = `${index * 100}ms`;
    io.observe(step);
  });
})();

(() => {
  const items = document.querySelectorAll(".reveal-standard");
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -10% 0px" });

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index, 6) * 70}ms`;
    io.observe(item);
  });
})();

(() => {
  const items = document.querySelectorAll(".reveal-benefit");
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -10% 0px" });

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index, 5) * 75}ms`;
    io.observe(item);
  });
})();

(() => {
  const items = document.querySelectorAll(".reveal-scope");
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

  items.forEach((item, index) => {
    item.classList.add("reveal");
    item.style.transitionDelay = `${index * 110}ms`;
    io.observe(item);
  });
})();

(() => {
  const items = document.querySelectorAll(".reveal-final-cta");
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -10% 0px" });

  items.forEach((item) => {
    item.classList.add("reveal");
    item.style.transitionDelay = "40ms";
    io.observe(item);
  });
})();

(() => {
  const items = document.querySelectorAll(".reveal-pill");
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index, 7) * 65}ms`;
    io.observe(item);
  });
})();

(() => {
  const showcase = document.querySelector(".electro-showcase");
  const items = Array.from(document.querySelectorAll(".electro-item"));
  if (!showcase || !items.length) return;

  const prevBtn = document.querySelector(".electro-nav-btn-up");
  const nextBtn = document.querySelector(".electro-nav-btn-down");
  const mediaWrap = document.querySelector(".electro-showcase-media");
  const mediaImage = document.querySelector(".electro-showcase-media .electro-media-frame");
  const defaultMediaSrc = showcase.dataset.defaultMediaSrc || "";
  const defaultMediaAlt = showcase.dataset.defaultMediaAlt || "";
  let mediaSlideToken = 0;
  const mediaSlideDurationMs = (() => {
    if (!mediaWrap) return 1800;
    const raw = getComputedStyle(mediaWrap).getPropertyValue("--electro-pill-motion-ms").trim();
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1800;
  })();
  const openDelayMs = 90;
  let openDelayTimer = null;
  const preloadedMedia = new Set();

  const preloadMedia = () => {
    const srcs = new Set(defaultMediaSrc ? [defaultMediaSrc] : []);
    items.forEach((item) => {
      if (item.dataset.mediaSrc) srcs.add(item.dataset.mediaSrc);
    });

    srcs.forEach((src) => {
      if (!src || preloadedMedia.has(src)) return;
      preloadedMedia.add(src);
      const img = new Image();
      img.decoding = "async";
      img.loading = "eager";
      img.src = src;
      if (typeof img.decode === "function") {
        img.decode().catch(() => {});
      }
    });
  };

  const applyDetailMetrics = () => {
    const list = document.querySelector(".electro-showcase-list");
    const listWidth = list ? Math.floor(list.getBoundingClientRect().width) : 520;
    const openWidth = Math.min(520, Math.max(260, listWidth));

    items.forEach((item) => {
      const pill = item.querySelector(".electro-pill");
      const title = item.querySelector(".electro-pill-title");
      const icon = item.querySelector(".electro-pill-icon");
      const detail = item.querySelector(".electro-pill-detail");
      if (!pill || !title || !icon) return;

      const style = getComputedStyle(pill);
      const padLeft = parseFloat(style.paddingLeft) || 0;
      const padRight = parseFloat(style.paddingRight) || 0;
      const gap = parseFloat(style.columnGap) || 0;
      const closedWidth = Math.ceil(icon.getBoundingClientRect().width + gap + title.scrollWidth + padLeft + padRight);
      item.style.setProperty("--pill-closed-width", `${closedWidth}px`);
      item.style.setProperty("--pill-open-width", `${openWidth}px`);
      const itemStyle = getComputedStyle(item);
      const openPaddingX = parseFloat(itemStyle.getPropertyValue("--pill-open-padding-x")) || 46;
      const openInnerWidth = Math.max(220, Math.floor(openWidth - openPaddingX));
      item.style.setProperty("--pill-open-inner-width", `${openInnerWidth}px`);

      if (detail) {
        const measure = detail.cloneNode(true);
        measure.style.position = "absolute";
        measure.style.visibility = "hidden";
        measure.style.pointerEvents = "none";
        measure.style.inlineSize = "auto";
        measure.style.blockSize = "auto";
        measure.style.maxHeight = "none";
        measure.style.overflow = "visible";
        measure.style.clipPath = "none";
        measure.style.padding = "0 2px";
        measure.style.whiteSpace = "normal";
        measure.style.width = `${openInnerWidth}px`;
        item.appendChild(measure);
        const h = Math.ceil(measure.getBoundingClientRect().height);
        measure.remove();

        item.style.setProperty("--detail-height", `${h}px`);
        const openPaddingY = parseFloat(itemStyle.getPropertyValue("--pill-open-padding-y")) || 46;
        const openHeight = Math.min(460, Math.max(120, Math.ceil(h + openPaddingY)));
        item.style.setProperty("--pill-open-height", `${openHeight}px`);
      }
    });
  };

  const applyExpandDirections = () => {
    const splitIndex = Math.floor((items.length - 1) / 2);
    items.forEach((item, index) => {
      item.classList.toggle("expand-up", index > splitIndex);
    });
  };

  const updateMedia = (item) => {
    if (!mediaImage) return;

    const src = item?.dataset.mediaSrc || defaultMediaSrc;
    const alt = item?.dataset.mediaAlt || defaultMediaAlt;
    const currentFrame = mediaWrap?.querySelector(".electro-media-frame.is-current") || mediaImage;
    const currentSrc = currentFrame.getAttribute("src");
    const currentAlt = currentFrame.getAttribute("alt");
    if (currentSrc === src && currentAlt === alt) return;

    if (!mediaWrap) {
      if (currentSrc !== src) currentFrame.setAttribute("src", src);
      if (currentAlt !== alt) currentFrame.setAttribute("alt", alt);
      return;
    }

    if (currentSrc === src) {
      currentFrame.setAttribute("alt", alt);
      return;
    }

    const token = ++mediaSlideToken;
    mediaWrap.querySelectorAll(".electro-media-frame:not(.is-current)").forEach((frame) => frame.remove());
    const active = mediaWrap.querySelector(".electro-media-frame.is-current") || currentFrame;
    if (!active) return;

    const next = document.createElement("img");
    next.className = "electro-media-frame is-next";
    next.src = src;
    next.alt = alt;
    mediaWrap.appendChild(next);

    void next.offsetHeight;

    requestAnimationFrame(() => {
      if (token !== mediaSlideToken) return;
      active.classList.remove("is-current");
      active.classList.add("is-exiting-up");
      next.classList.add("is-current");
      next.classList.remove("is-next");
    });

    window.setTimeout(() => {
      if (token !== mediaSlideToken) return;
      const staleFrames = mediaWrap.querySelectorAll(".electro-media-frame.is-exiting-up");
      staleFrames.forEach((frame) => frame.remove());
    }, mediaSlideDurationMs + 80);
  };

  const openItem = (target) => {
    if (openDelayTimer) {
      clearTimeout(openDelayTimer);
      openDelayTimer = null;
    }

    items.forEach((item) => {
      const btn = item.querySelector(".electro-pill");
      item.classList.remove("is-active");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });

    openDelayTimer = window.setTimeout(() => {
      const btn = target.querySelector(".electro-pill");
      target.classList.add("is-active");
      if (btn) btn.setAttribute("aria-expanded", "true");
      updateMedia(target);
      openDelayTimer = null;
    }, openDelayMs);
  };

  const getActiveIndex = () => items.findIndex((item) => item.classList.contains("is-active"));

  const shiftItem = (direction) => {
    if (!items.length) return;
    const current = getActiveIndex();
    const fallback = direction > 0 ? 0 : items.length - 1;
    if (current === -1) {
      openItem(items[fallback]);
      return;
    }

    const nextIndex = (current + direction + items.length) % items.length;
    openItem(items[nextIndex]);
  };

  items.forEach((item) => {
    const btn = item.querySelector(".electro-pill");
    if (!btn) return;
    btn.addEventListener("click", () => openItem(item));
  });

  if (prevBtn) prevBtn.addEventListener("click", () => shiftItem(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => shiftItem(1));

  applyDetailMetrics();
  applyExpandDirections();
  preloadMedia();
  window.addEventListener("resize", applyDetailMetrics, { passive: true });
})();
