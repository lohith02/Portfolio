const galleryGrid = document.querySelector('#gallery-grid');
const galleryLabel = document.querySelector('#gallery-label');
const galleryTitle = document.querySelector('#gallery-title');
const galleryIntro = document.querySelector('#gallery-intro');
const galleryButtons = document.querySelectorAll('[data-collection]');
const collectionKey = new URLSearchParams(window.location.search).get('collection') || 'events';

function renderGallery(key) {
  const collection = window.galleryCollections[key] || window.galleryCollections.events;
  if (!collection) return;

  if (galleryLabel) galleryLabel.textContent = collection.label;
  if (galleryTitle) galleryTitle.textContent = collection.title;
  if (galleryIntro) galleryIntro.textContent = collection.intro;

  galleryButtons.forEach((button) => {
    const active = button.dataset.collection === key;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', active);
  });

  if (galleryGrid) {
    galleryGrid.replaceChildren(...collection.photos.map(([source, title, caption], index) => {
      const figure = document.createElement('figure');
      figure.className = `gallery-photo ${index % 3 === 0 ? 'gallery-photo-wide' : ''}`;
      figure.innerHTML = `
        <div class="gallery-photo-frame">
          <img loading="lazy" src="${source}" alt="${collection.label}: ${title}" />
        </div>
        <figcaption>
          <strong>${String(index + 1).padStart(2, '0')}</strong>
          <span>${title} / ${caption}</span>
        </figcaption>
      `;
      return figure;
    }));

    // Trigger one-by-one popup animation
    const newItems = galleryGrid.querySelectorAll('.gallery-photo');
    const photoObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    newItems.forEach((item, idx) => {
      item.style.transitionDelay = `${(idx % 4) * 0.1}s`;
      photoObserver.observe(item);
    });

    // Re-initialize lightbox for newly inserted images
    if (typeof initLightbox === 'function') {
      initLightbox();
    }
  }

  window.history.replaceState({}, '', `gallery.html?collection=${key}`);
}

galleryButtons.forEach((button) => {
  button.addEventListener('click', () => renderGallery(button.dataset.collection));
});

renderGallery(collectionKey);
