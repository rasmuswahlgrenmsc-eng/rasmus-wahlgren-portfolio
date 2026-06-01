/* ==========================================================================
   Rasmus Wahlgren - Portfolio Client Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLanguageToggle();
  initStatsCounter();
  initVideoCards();
  initCopyToClipboard();
  initScrollEffects();
});

/**
 * 1. Language Toggle Logic
 */
function initLanguageToggle() {
  const langToggle = document.getElementById('langToggle');
  const btnEn = document.getElementById('btn-en');
  const btnSv = document.getElementById('btn-sv');
  
  // Get saved language or default to english
  const savedLang = localStorage.getItem('portfolio-lang') || 'en';
  setLanguage(savedLang);

  langToggle.addEventListener('click', () => {
    const currentLang = document.body.getAttribute('data-lang');
    const newLang = currentLang === 'en' ? 'sv' : 'en';
    setLanguage(newLang);
  });

  function setLanguage(lang) {
    document.body.setAttribute('data-lang', lang);
    localStorage.setItem('portfolio-lang', lang);
    
    if (lang === 'en') {
      btnEn.classList.add('active');
      btnSv.classList.remove('active');
    } else {
      btnSv.classList.add('active');
      btnEn.classList.remove('active');
    }
  }
}

/**
 * 2. Scroll-Triggered Stats Counter Animation
 */
function initStatsCounter() {
  const statsElements = document.querySelectorAll('[data-target]');
  
  const observerOptions = {
    root: null,
    threshold: 0.1, // trigger when 10% of the element is visible
    rootMargin: '0px'
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        animateCounter(target);
        observer.unobserve(target); // animate only once
      }
    });
  }, observerOptions);

  statsElements.forEach(el => observer.observe(el));

  function animateCounter(element) {
    const targetVal = parseInt(element.getAttribute('data-target'), 10);
    const duration = 1500; // 1.5 seconds animation
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quadratic
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.floor(easeProgress * targetVal);
      
      // Format number with localized thousands separator
      const currentLang = document.body.getAttribute('data-lang');
      const formattedVal = formatNumber(currentVal, currentLang);
      
      element.textContent = formattedVal;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = formatNumber(targetVal, currentLang);
      }
    }

    requestAnimationFrame(updateCounter);
  }

  function formatNumber(num, lang) {
    // SV uses space as thousand separator: 1 345 311
    // EN uses comma: 1,345,311
    if (lang === 'sv') {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    } else {
      return num.toLocaleString('en-US');
    }
  }
}

/**
 * 3. TikTok Lazy Load Embeds (Hybrid Player)
 */
function initVideoCards() {
  const videoCards = document.querySelectorAll('.video-card');

  videoCards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('loaded')) return;

      const videoId = card.getAttribute('data-video-id');
      const container = card.querySelector('.video-iframe-container');
      
      // Create TikTok iframe embed
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.tiktok.com/embed/v2/${videoId}`;
      iframe.setAttribute('allow', 'autoplay; encrypted-media');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';

      // Clear any existing and append
      container.innerHTML = '';
      container.appendChild(iframe);
      
      // Add loaded class to trigger CSS visual toggle
      card.classList.add('loaded');
    });
  });
}

/**
 * 4. Copy-to-Clipboard logic
 */
function initCopyToClipboard() {
  const copyButtons = document.querySelectorAll('.btn-copy');

  copyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent triggering parent clicks
      const textToCopy = button.getAttribute('data-copy');
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        button.classList.add('copied');
        
        // Remove tooltip after 2 seconds
        setTimeout(() => {
          button.classList.remove('copied');
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    });
  });
}

/**
 * 5. Scroll Effects (Header Shrinking & Section Tracker)
 */
function initScrollEffects() {
  const header = document.querySelector('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section, footer');

  // Shrink Header on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Active Menu Link Tracker via IntersectionObserver
  const sectionObserverOptions = {
    root: null,
    rootMargin: '-40% 0px -40% 0px', // Trigger when section occupies center 20% of viewport
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        
        navLinks.forEach(link => {
          const linkHref = link.getAttribute('href');
          if (linkHref === `#${activeId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, sectionObserverOptions);

  sections.forEach(section => {
    if (section.getAttribute('id')) {
      sectionObserver.observe(section);
    }
  });
}
