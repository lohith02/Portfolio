/* ===================================================
   PROJECTS PAGE JAVASCRIPT
   — Folder keyboard/touch accessibility, image reveal
=================================================== */

(function () {

  const folders = document.querySelectorAll('.folder');

  if (!folders.length) return;

  // ── Keyboard accessibility: Enter/Space to expand ──
  folders.forEach((folder) => {

    // Update aria-expanded on hover/focus
    folder.addEventListener('mouseenter', () => {
      folder.setAttribute('aria-expanded', 'true');
    });

    folder.addEventListener('mouseleave', () => {
      folder.setAttribute('aria-expanded', 'false');
    });

    folder.addEventListener('focus', () => {
      folder.setAttribute('aria-expanded', 'true');
    });

    folder.addEventListener('blur', () => {
      folder.setAttribute('aria-expanded', 'false');
    });

    // Enter / Space key toggles expansion on mobile / keyboard nav
    folder.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isOpen = folder.getAttribute('aria-expanded') === 'true';
        folder.setAttribute('aria-expanded', String(!isOpen));
        folder.classList.toggle('is-open', !isOpen);
      }
      if (e.key === 'Escape') {
        folder.setAttribute('aria-expanded', 'false');
        folder.classList.remove('is-open');
        folder.blur();
      }
    });

  });

  // ── Touch / mobile: tap to toggle ─────────────────
  if (window.matchMedia('(pointer: coarse)').matches) {
    folders.forEach((folder) => {
      folder.addEventListener('click', () => {
        const isOpen = folder.classList.contains('is-open');
        // close all others
        folders.forEach(f => {
          f.classList.remove('is-open');
          f.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          folder.classList.add('is-open');
          folder.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // ── Immediately load folder images ────────────────
  // (bypass IntersectionObserver fade-in for grid images so they
  //  appear instantly when the folder opens)
  document.querySelectorAll('.folder-item img').forEach((img) => {
    img.classList.add('loaded');
    img.style.opacity = '1';
  });

})();
