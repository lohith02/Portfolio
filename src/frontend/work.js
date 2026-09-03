/* ===================================================
   WORK PAGE JAVASCRIPT
   — Scroll-snap tracking, dot nav, keyboard, progress
=================================================== */

(function () {

  const workScroll  = document.getElementById('work-scroll');
  const slides      = document.querySelectorAll('.work-slide');
  const dots        = document.querySelectorAll('.work-dot');
  const currentNum  = document.querySelector('.current-num');
  const totalSlides = slides.length;

  if (!workScroll || !slides.length) return;

  let currentIndex = 0;
  let isScrolling  = false;

  // ── Progress bar ─────────────────────────────────
  const progressBar = document.createElement('div');
  progressBar.className = 'work-progress';
  document.body.appendChild(progressBar);

  // ── Activate a slide ─────────────────────────────
  function activateSlide(index) {
    if (index === currentIndex && slides[index].classList.contains('is-active')) return;

    currentIndex = index;

    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    if (currentNum) {
      currentNum.textContent = String(index + 1).padStart(2, '0');
    }

    // Progress bar
    const pct = totalSlides <= 1 ? 100 : (index / (totalSlides - 1)) * 100;
    progressBar.style.width = pct + '%';
  }

  // ── IntersectionObserver to watch which slide is visible ──
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          const idx = parseInt(entry.target.dataset.index, 10);
          activateSlide(idx);
        }
      });
    },
    {
      root: workScroll,
      threshold: 0.55,
    }
  );

  slides.forEach((slide) => observer.observe(slide));

  // ── Dot click: scroll to that slide ──────────────
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index, 10);
      slides[idx].scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ── Keyboard: arrow keys ─────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentIndex < totalSlides - 1) {
        slides[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
      }
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentIndex > 0) {
        slides[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  // ── Touch swipe ──────────────────────────────────
  let touchStartY = 0;

  workScroll.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  workScroll.addEventListener('touchend', (e) => {
    const delta = touchStartY - e.changedTouches[0].clientY;

    if (Math.abs(delta) < 40) return; // ignore tiny swipes

    if (delta > 0 && currentIndex < totalSlides - 1) {
      slides[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
    } else if (delta < 0 && currentIndex > 0) {
      slides[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
    }
  }, { passive: true });

  // ── Image reveal (override shared observer for slide-bg) ──
  // slide-bg images start visible; ensure they appear after load
  document.querySelectorAll('.slide-bg').forEach((img) => {
    img.style.opacity = '1';
    img.classList.add('loaded');
  });

  // ── Initial state ─────────────────────────────────
  activateSlide(0);

})();
