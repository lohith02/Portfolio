/* ================= EVENT GALLERY MOTION ================= */

(function () {
  const photos = document.querySelectorAll('.reveal-photo');

  if (!photos.length) return;

  const revealPhoto = (photo) => {
    photo.classList.add('is-visible');
  };

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      revealPhoto(entry.target);
      currentObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.22,
    rootMargin: '0px 0px -8% 0px'
  });

  photos.forEach((photo) => observer.observe(photo));

  if (window.matchMedia('(pointer: fine)').matches) {
    photos.forEach((photo) => {
      photo.addEventListener('mousemove', (event) => {
        const bounds = photo.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;

        photo.style.transform = `translateY(0) rotateX(${y * -3}deg) rotateY(${x * 3}deg) scale(1.01)`;
      });

      photo.addEventListener('mouseleave', () => {
        photo.style.transform = '';
      });
    });
  }
})();
