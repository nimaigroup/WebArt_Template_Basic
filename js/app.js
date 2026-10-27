/**
 * WebArt Canvas Engine v1.0 - Decoupled Architecture
 */

const WebArtApp = {
    config: null,
    content: null,

    async init() {
        console.log('🚀 [WebArt Engine]: Initializing...');

        try {
            const [configRes, contentRes] = await Promise.all([
                fetch('./data/config.json'),
                fetch('./data/content.json')
            ]);

            if (!configRes.ok || !contentRes.ok) {
                throw new Error(`HTTP Error! Config: ${configRes.status}, Content: ${contentRes.status}`);
            }

            this.config = await configRes.json();
            this.content = await contentRes.json();

            console.log('✅ [WebArt Engine]: Configuration loaded successfully.', this.config);

            this.applyThemeAndFonts();
            this.setupHeaderBranding();
            this.setupNavDrawer();

            this.setupPreloader();
            this.setupBgVisuals();
            this.setupJumbotron();
            this.setupCarousels();
            this.setupFooter();
            this.setupNimaiSM();

        } catch (err) {
            console.error('❌ [WebArt Engine Failure]:', err);
            document.body.innerHTML += `<div style="color:red; position:fixed; top:10px; left:10px; z-index:9999; background:black; padding:10px;">Engine Error: ${err.message}</div>`;
        }
    },

    applyThemeAndFonts() {
        const { flags, themeSchemes, fonts } = this.config;
        const root = document.documentElement;

        const activeSchemeName = flags?.theme || 'dark';
        const scheme = themeSchemes[activeSchemeName] || themeSchemes['dark'];

        if (scheme) {
            root.style.setProperty('--primary-bg', scheme.primaryBg);
            root.style.setProperty('--secondary-bg', scheme.secondaryBg);
            root.style.setProperty('--text-color', scheme.textColor);
            root.style.setProperty('--accent-color', scheme.accentColor);
            root.style.setProperty('--card-bg', scheme.cardBg);
        }

        if (fonts?.importUrl) {
            const fontLink = document.getElementById('dynamicFontLink');
            if (fontLink) fontLink.href = fonts.importUrl;
        }
    },

    setupHeaderBranding() {
        const { flags } = this.config;
        const { meta, logo, headSocials } = this.content;

        const siteTitle = document.getElementById('siteTitle');
        const siteTagline = document.getElementById('siteTagline');
        if (meta?.title && siteTitle) siteTitle.textContent = meta.title;
        if (meta?.tagline && siteTagline) siteTagline.textContent = meta.tagline;

        if (flags?.logo && logo?.url) {
            const logoLink = document.getElementById('logoLink');
            const logoImg = document.getElementById('logoImg');
            if (logoImg && logoLink) {
                logoImg.src = logo.url;
                logoImg.alt = logo.alt || 'Logo';
                logoLink.style.display = 'block';
            }
        }

        if (flags?.headSocials && Array.isArray(headSocials)) {
            const headSocialsContainer = document.getElementById('headSocials');
            if (headSocialsContainer) {
                headSocialsContainer.innerHTML = headSocials
                    .map(s => `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name}</a>`)
                    .join('');
                headSocialsContainer.style.display = 'flex';
            }
        }
    },

    setupNavDrawer() {
        const navToggle = document.getElementById('navToggle');
        const navDrawer = document.getElementById('navDrawer');

        if (!navToggle || !navDrawer) return;

        navToggle.addEventListener('click', () => {
            const isOpen = navDrawer.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', isOpen);
            navDrawer.setAttribute('aria-hidden', !isOpen);
        });
    },

    setupPreloader() {
        if (!this.config.flags?.preloader) return;

        const preloaderEl = document.getElementById('preloader');
        const titleEl = document.getElementById('loaderTitle');
        const subEl = document.getElementById('loaderSub');
        const btnEl = document.getElementById('loaderBtn');
        const data = this.content.preloader;

        if (!preloaderEl || !data) return;

        preloaderEl.style.display = 'flex';
        if (titleEl && data.title) titleEl.textContent = data.title;
        if (subEl && data.subtitle) subEl.textContent = data.subtitle;

        const dismiss = () => {
            preloaderEl.classList.add('fade-out');
            setTimeout(() => { preloaderEl.style.display = 'none'; }, 800);
        };

        if (this.config.preloader?.requireClick && btnEl) {
            btnEl.textContent = data.btnText || 'Enter';
            btnEl.style.display = 'inline-block';
            btnEl.addEventListener('click', dismiss);
        } else {
            setTimeout(dismiss, 1500);
        }
    },

    setupBgVisuals() {
        if (!this.config.flags?.bgVisuals) return;

        const bgContainer = document.getElementById('bgVisuals');
        const images = this.content.bgVisuals?.images || [];

        if (!bgContainer || images.length === 0) return;

        bgContainer.style.display = 'block';
        const layerA = document.getElementById('bgLayerA');
        if (layerA) {
            layerA.style.backgroundImage = `url('${images[0].url}')`;
            layerA.classList.add('active');
        }
    },

    setupJumbotron() {
        if (!this.config.flags?.jumbotron) return;

        const jumbotronEl = document.getElementById('jumbotron');
        const textEl = document.getElementById('jumbotronText');
        const ctaEl = document.getElementById('jumbotronCta');
        const data = this.content.jumbotron;

        if (!jumbotronEl || !data) return;

        if (textEl && data.text) textEl.textContent = data.text;
        if (ctaEl && data.ctaText) {
            ctaEl.textContent = data.ctaText;
            ctaEl.href = data.ctaUrl || '#';
        }

        jumbotronEl.style.display = 'block';
    },

    setupCarousels() {
        this.renderCarousel('carousel1');
        this.renderCarousel('carousel2');
    },

    renderCarousel(key) {
        if (!this.config.flags?.[key]) return;

        const sectionEl = document.getElementById(`${key}Section`);
        const titleEl = document.getElementById(`${key}Title`);
        const trackEl = document.getElementById(`${key}Track`);
        const data = this.content[key];

        if (!sectionEl || !trackEl || !data?.slides) return;

        if (titleEl && data.title) titleEl.textContent = data.title;

        trackEl.innerHTML = data.slides
            .map(
                slide => `
        <article class="slide-card" id="${slide.id}">
          <a href="${slide.url || '#'}" class="slide-link">
            <div class="slide-img-wrapper">
              <img src="${slide.img}" alt="${slide.title}" class="slide-img" loading="lazy">
            </div>
            <div class="slide-body">
              <h3 class="slide-title">${slide.title}</h3>
              <p class="slide-sub">${slide.sub}</p>
            </div>
          </a>
        </article>
      `
            )
            .join('');

        sectionEl.style.display = 'block';
    },

    setupFooter() {
        if (!this.config.flags?.footer) return;

        const footerEl = document.getElementById('footer');
        const { footer: footerConfig } = this.config;
        const { footer: footerContent } = this.content;

        if (!footerEl || !footerContent) return;

        if (footerConfig?.showCopyright && footerContent.copyright) {
            const copyEl = document.getElementById('copyright');
            if (copyEl) copyEl.textContent = `© ${new Date().getFullYear()} ${footerContent.copyright}`;
        }

        if (footerConfig?.showQuickLinks && Array.isArray(footerContent.quickLinks)) {
            const quickLinksEl = document.getElementById('quickLinks');
            if (quickLinksEl) {
                quickLinksEl.innerHTML = footerContent.quickLinks
                    .map(l => `<a href="${l.url}">${l.label}</a>`)
                    .join('');
            }
        }

        footerEl.style.display = 'block';
    },

    setupNimaiSM() {
        const nimaiTextEl = document.getElementById('nimaiSMText');
        const nimaiLinkEl = document.getElementById('nimaiSMLink');
        const data = this.content.nimaiSM;

        if (!nimaiTextEl || !data) return;

        nimaiTextEl.textContent = data.text || 'Another NIMAI GROUP WebArt Masterpiece℠';
        if (nimaiLinkEl && data.url) nimaiLinkEl.href = data.url;
    }
};

// EXECUTION TRIGGER (Must be at the absolute bottom)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WebArtApp.init());
} else {
    WebArtApp.init();
}