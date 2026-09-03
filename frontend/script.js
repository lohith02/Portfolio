/* ================= HEADER SCROLL ================= */
const header = document.querySelector(".site-header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 40) {
    header?.classList.add("scrolled");
  } else {
    header?.classList.remove("scrolled");
  }
});

/* ================= MOBILE MENU ================= */
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

menuToggle?.addEventListener("click", () => {
  mobileMenu?.classList.toggle("active");
});

document.querySelectorAll(".mobile-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu?.classList.remove("active");
  });
});

/* ================= 3D HERO INTERACTIVITY ================= */
const heroSection = document.querySelector(".hero");
const heroTitle = document.querySelector(".portfolio-title-3d");
const heroScene = document.querySelector(".hero-3d-scene");

if (heroSection && window.matchMedia("(pointer: fine)").matches) {
  heroSection.addEventListener("mousemove", (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = (y / rect.height) * -22;
    const rotY = (x / rect.width) * 22;

    if (heroTitle) {
      heroTitle.style.transform = `perspective(1000px) rotateX(${rotX * 0.6}deg) rotateY(${rotY * 0.6}deg) translateZ(30px)`;
    }
    if (heroScene) {
      heroScene.style.transform = `rotateX(${rotX + 15}deg) rotateY(${rotY - 20}deg) translateY(-10px)`;
    }
  });

  heroSection.addEventListener("mouseleave", () => {
    if (heroTitle) {
      heroTitle.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    }
    if (heroScene) {
      heroScene.style.transform = "rotateX(15deg) rotateY(-20deg) translateY(-10px)";
    }
  });
}

/* ================= SCROLL POPUP OBSERVER (ONE BY ONE) ================= */
const popupElements = document.querySelectorAll(".scroll-popup, .gallery-photo, .folder-card-16-9");

if (popupElements.length) {
  const popupObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  popupElements.forEach((el, index) => {
    // Add subtle staggered transition delay if multiple appear at once
    el.style.transitionDelay = `${(index % 3) * 0.1}s`;
    popupObserver.observe(el);
  });
}

/* ================= 3D CURSOR PROXIMITY & POPUP ON HOVER ================= */
const tiltCards = document.querySelectorAll(".tilt-card, .photo-card-popup");

if (tiltCards.length && window.matchMedia("(pointer: fine)").matches) {
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within element
      const y = e.clientY - rect.top;  // y position within element
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((centerY - y) / centerY) * 14; // max 14deg tilt
      const rotateY = ((x - centerX) / centerX) * 14;

      card.style.transform = `perspective(800px) translateY(-20px) scale(1.08) translateZ(40px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(800px) translateY(0px) scale(1) translateZ(0px) rotateX(0deg) rotateY(0deg)";
    });
  });
}

/* ================= FULLSCREEN LIGHTBOX VIEWER ================= */
function initLightbox() {
  const triggerImages = document.querySelectorAll(".gallery-photo img, .folder-card-media img, .photo-card-popup img");
  if (!triggerImages.length) return;

  let lightbox = document.querySelector(".lightbox");
  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Photo viewer");
    lightbox.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Close viewer">&times;</button>
      <button class="lightbox-prev" type="button" aria-label="Previous">&larr;</button>
      <figure class="lightbox-figure">
        <img class="lightbox-image" alt="" />
        <figcaption class="lightbox-caption"></figcaption>
      </figure>
      <button class="lightbox-next" type="button" aria-label="Next">&rarr;</button>
    `;
    document.body.appendChild(lightbox);
  }

  const lightboxImg = lightbox.querySelector(".lightbox-image");
  const lightboxCaption = lightbox.querySelector(".lightbox-caption");
  let activeIndex = 0;
  const imageList = Array.from(triggerImages);

  function openPhoto(idx) {
    activeIndex = (idx + imageList.length) % imageList.length;
    const target = imageList[activeIndex];
    lightboxImg.src = target.currentSrc || target.src;
    lightboxImg.alt = target.alt || "Photography";
    lightboxCaption.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${target.alt || "Selected Frame"}`;
    lightbox.classList.add("is-open");
    document.body.classList.add("lightbox-open");
  }

  function closePhoto() {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
  }

  triggerImages.forEach((img, idx) => {
    // If it's a link to another page (like the 16:9 folder), let the link work normally
    if (img.closest("a.folder-card-16-9")) return;

    img.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openPhoto(idx);
    });
  });

  lightbox.querySelector(".lightbox-close")?.addEventListener("click", closePhoto);
  lightbox.querySelector(".lightbox-prev")?.addEventListener("click", () => openPhoto(activeIndex - 1));
  lightbox.querySelector(".lightbox-next")?.addEventListener("click", () => openPhoto(activeIndex + 1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closePhoto();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closePhoto();
    if (e.key === "ArrowLeft") openPhoto(activeIndex - 1);
    if (e.key === "ArrowRight") openPhoto(activeIndex + 1);
  });
}

document.addEventListener("DOMContentLoaded", initLightbox);
initLightbox();
