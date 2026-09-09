// js/global/about-hero.js

function initAboutHero() {
  const card = document.getElementById("aboutFeatureCard");
  const contentArea = document.getElementById("aboutFeatureContent");
  const dashes = document.querySelectorAll(".feature-dash-indicators .dash-bar");

  if (!card || !contentArea || !dashes.length) return;

  const slides = [
    {
      title: "Strategy-First",
      text: "Design for outcomes, not aesthetics. Every decision backed by data."
    },
    {
      title: "Full-Cycle Studio",
      text: "Research to launch - one team, complete ownership, zero handoff gaps."
    },
    {
      title: "10+ Domains",
      text: "Healthcare, fintech, e-commerce, education. We know your market."
    }
  ];

  let currentIndex = 0;
  let slideInterval = null;

  const changeSlide = () => {
    const nextIndex = (currentIndex + 1) % slides.length;
    const slide = slides[nextIndex];
    if (!slide) return;

    // Slide out to the left
    contentArea.style.opacity = "0";
    contentArea.style.transform = "translateX(-10px)";
    contentArea.style.transition = "opacity 0.25s ease, transform 0.25s ease";

    setTimeout(() => {
      contentArea.innerHTML = `
        <h3 class="feature-card-title">${slide.title}</h3>
        <p class="feature-card-text">${slide.text}</p>
      `;

      // Slide in from the right to the center
      contentArea.style.transform = "translateX(10px)";
      void contentArea.offsetWidth; // Force DOM reflow

      contentArea.style.opacity = "1";
      contentArea.style.transform = "translateX(0)";

      dashes.forEach((d, i) => {
        d.classList.toggle("active", i === nextIndex);
      });

      currentIndex = nextIndex;
    }, 250);
  };

  // Clear any existing intervals on re-init
  if (slideInterval) clearInterval(slideInterval);
  
  // Set initial content and start continuous auto loop
  dashes.forEach((d, i) => d.classList.toggle("active", i === 0));
  slideInterval = setInterval(changeSlide, 1500);
}

window.initAboutHero = initAboutHero;
document.addEventListener("DOMContentLoaded", initAboutHero);
document.addEventListener("componentsLoaded", initAboutHero);