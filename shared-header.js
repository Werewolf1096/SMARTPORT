(() => {
  const mount = document.querySelector("[data-shared-header]");
  if (!mount) return;

  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const isHome = currentPath === "index.html" || currentPath === "";
  const isAbout = currentPath === "about.html";
  const isContact = currentPath === "contacts.html" || currentPath === "poptavka.html";
  const isServicePage = /^sluzby-/.test(currentPath);

  const homeHref = isHome ? "#hero" : "index.html#hero";
  const servicesHref = isHome ? "#services" : "index.html#services";
  const contactHref = "poptavka.html";

  const isCurrentService = (fileName) => (currentPath === fileName ? ' aria-current="page"' : "");
  const homeState = isHome ? ' class="is-active" aria-current="page"' : "";
  const aboutState = isAbout ? ' class="is-active" aria-current="page"' : "";
  const contactState = isContact ? ' class="is-active" aria-current="page"' : "";
  const servicesState = isServicePage ? " is-active" : "";
  const isLightingPage = currentPath === "sluzby-osvetleni.html";
  const brandLogoSrc = isLightingPage ? "LOGO-Black.gif" : "LOGO.gif";
  const brandLogoAlt = isLightingPage ? "SMARTPORT logo v černé variantě pro stránku chytrého osvětlení" : "Smartport logo";

  mount.outerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" href="${homeHref}" aria-label="Smartport">
          <img src="${brandLogoSrc}" alt="${brandLogoAlt}" class="brand-logo" />
        </a>
        <button class="burger-btn" aria-controls="main-nav" aria-expanded="false" aria-label="Menu">
          <span class="burger-icon"></span>
        </button>
        <nav id="main-nav" class="main-nav" aria-label="Hlavn\u00ed navigace">
          <a${homeState} href="${homeHref}">Dom\u016f</a>
          <div class="nav-dropdown">
            <a class="nav-link${servicesState}" href="${servicesHref}">Slu\u017eby</a>
            <div class="nav-dropdown-panel" aria-label="Nab\u00eddka slu\u017eeb">
              <div class="nav-dropdown-panel-inner">
                <div class="nav-dropdown-col">
                  <ul class="nav-dropdown-list">
                    <li><a href="sluzby-elektroinstalace.html" data-preview="electro"${isCurrentService("sluzby-elektroinstalace.html")}>Klasick\u00e1 elektroinstalace</a></li>
                    <li><a href="sluzby-osvetleni.html" data-preview="lighting"${isCurrentService("sluzby-osvetleni.html")}>Chytr\u00e9 osv\u011btlen\u00ed</a></li>
                    <li><a href="sluzby-zabezpeceni.html" data-preview="security"${isCurrentService("sluzby-zabezpeceni.html")}>Zabezpe\u010den\u00ed a kamerov\u00e9 syst\u00e9my</a></li>
                    <li><a href="sluzby-klima.html" data-preview="climate"${isCurrentService("sluzby-klima.html")}>\u0158\u00edzen\u00ed klimatu</a></li>
                    <li><a href="sluzby-interkom.html" data-preview="intercom"${isCurrentService("sluzby-interkom.html")}>Interkom a p\u0159\u00edstupov\u00fd syst\u00e9m</a></li>
                    <li><a href="sluzby-stineni.html" data-preview="shading"${isCurrentService("sluzby-stineni.html")}>Ovl\u00e1d\u00e1n\u00ed \u017ealuzi\u00ed a st\u00edn\u011bn\u00ed</a></li>
                    <li><a href="sluzby-audio.html" data-preview="audio"${isCurrentService("sluzby-audio.html")}>Multiz\u00f3nov\u00fd audio syst\u00e9m</a></li>
                    <li><a href="sluzby-energie.html" data-preview="energy"${isCurrentService("sluzby-energie.html")}>Inteligentn\u00ed spr\u00e1va energie</a></li>
                  </ul>
                </div>
                <div class="nav-dropdown-preview" aria-hidden="true">
                  <div class="nav-preview-track">
                    <img class="nav-preview-image is-active" data-preview-key="electro" src="klasicka-elektroinstalace.png" alt="" />
                    <img class="nav-preview-image" data-preview-key="lighting" src="chytra-zarovka-chytre-osvetleni.png" alt="" />
                    <img class="nav-preview-image" data-preview-key="security" src="chytry-kamerovy-system-zabezpeceni.gif" alt="" />
                    <img class="nav-preview-image" data-preview-key="climate" src="chytry-termostat-automatizace-klimatu.png" alt="" />
                    <img class="nav-preview-image" data-preview-key="intercom" src="interkom-a-pristupove-systemy.png" alt="" />
                    <img class="nav-preview-image" data-preview-key="shading" src="ovladani-zaluzii-a-stineni-design.png" alt="" />
                    <img class="nav-preview-image" data-preview-key="audio" src="multiroom-audio.png" alt="" />
                    <img class="nav-preview-image" data-preview-key="energy" src="energeticky-management.png" alt="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <a${contactState} href="${contactHref}">Kontakt</a>
          <a${aboutState} href="about.html">O n\u00e1s</a>
        </nav>
      </div>
    </header>
    <div class="menu-backdrop" aria-hidden="true"></div>
  `;
})();
