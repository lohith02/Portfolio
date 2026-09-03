/* ================= EVENT FOLDER POINTER STATES ================= */

(function () {
  document.querySelectorAll('.event-folder').forEach((folder) => {
    folder.addEventListener('pointermove', (event) => {
      const bounds = folder.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      folder.style.transform = `translateY(-10px) rotateX(${y * -2}deg) rotateY(${x * 2}deg)`;
    });

    folder.addEventListener('pointerleave', () => {
      folder.style.transform = '';
    });
  });
})();
