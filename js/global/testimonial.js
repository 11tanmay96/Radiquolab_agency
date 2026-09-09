// js/global/testimonial.js

const testimonialData = [
  {
    quote: "Working with Tanmay and Radiquolab was fantastic. They delivered a website that perfectly blends modern design with functionality, exceeding my expectations.",
    name: "Pankaj Kathane",
    role: "Director, Idealizeer"
  },
  {
    quote: "Working with Tanmay was a game-changer for our web and mobile app design. His modern approach brought our vision to life and exceeded our expectations.",
    name: "Sagar Naidu",
    role: "Business Manager, Deva Consultancy"
  },
  {
    quote: "Tanmay's expertise in design and social media has been invaluable. We've seen a significant boost in online visibility and sales thanks to his efforts.",
    name: "Mahendra Sonar",
    role: "Director, Shivam Jewellers"
  },
  {
    quote: "Working with them has been a game-changer for our business. Their approach to design and marketing helped us improve our visibility and drive better results consistently.",
    name: "Mr. Tejas Sakla",
    role: "Managing Director, TS Ventures"
  }
];

function initTestimonials() {
  const section = document.getElementById('testimonials') || document.querySelector('.testimonials-section');
  if (!section) return false;

  let container = document.getElementById('testimonialContainer');
  let track = document.getElementById('testimonialTrack');

  if (!container || !track) {
    const parentContainer = section.querySelector('.testimonials-container') || section;
    const existingSlider = parentContainer.querySelector('.testimonial-slider-container');
    if (existingSlider) existingSlider.remove();

    const sliderWrapper = document.createElement('div');
    sliderWrapper.className = 'testimonial-slider-container';
    sliderWrapper.id = 'testimonialContainer';

    const trackWrapper = document.createElement('div');
    trackWrapper.className = 'testimonial-track';
    trackWrapper.id = 'testimonialTrack';

    sliderWrapper.appendChild(trackWrapper);
    parentContainer.appendChild(sliderWrapper);

    container = sliderWrapper;
    track = trackWrapper;
  }

  const prevBtn = document.getElementById('prevTestimonial');
  const nextBtn = document.getElementById('nextTestimonial');

  track.innerHTML = testimonialData.map(item => `
    <div class="testimonial-card">
      <div class="card-quote-icon">
        <svg viewBox="0 0 24 24" fill="#1434cb" width="28" height="28">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
        </svg>
      </div>
      <p class="card-quote-text">${item.quote}</p>
      <div class="card-divider"></div>
      <div class="card-author-info">
        <h4 class="author-name">${item.name}</h4>
        <p class="author-role">${item.role}</p>
      </div>
    </div>
  `).join('');

  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;

  const isMobile = () => window.innerWidth <= 768;

  const getCardStep = () => {
    const card = track.querySelector('.testimonial-card');
    return card ? card.offsetWidth + 28 : 448;
  };

  const getMaxScroll = () => {
    return Math.max(0, track.scrollWidth - container.clientWidth);
  };

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const setPosition = (x) => {
    if (isMobile()) {
      track.style.transform = 'none';
      return;
    }
    track.style.transform = `translateX(${x}px)`;
  };

  const updateNavButtons = () => {
    if (isMobile()) return;
    const maxScroll = getMaxScroll();
    if (prevBtn) {
      const isAtStart = currentTranslate >= 0;
      prevBtn.style.opacity = isAtStart ? '0.35' : '1';
      prevBtn.style.pointerEvents = isAtStart ? 'none' : 'auto';
    }
    if (nextBtn) {
      const isAtEnd = maxScroll === 0 || Math.abs(currentTranslate) >= maxScroll - 5;
      nextBtn.style.opacity = isAtEnd ? '0.35' : '1';
      nextBtn.style.pointerEvents = isAtEnd ? 'none' : 'auto';
    }
  };

  const updatePosition = (newPos, animate = true) => {
    if (isMobile()) {
      track.style.transform = 'none';
      return;
    }
    const maxScroll = getMaxScroll();
    track.style.transition = animate ? 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
    currentTranslate = clamp(newPos, -maxScroll, 0);
    prevTranslate = currentTranslate;
    setPosition(currentTranslate);
    updateNavButtons();
  };

  // Drag & Mouse
  container.onmousedown = (e) => {
    if (isMobile()) return;
    isDragging = true;
    startX = e.pageX;
    track.classList.add('dragging');
    container.classList.add('active');
  };

  window.onmousemove = (e) => {
    if (!isDragging || isMobile()) return;
    const maxScroll = getMaxScroll();
    const deltaX = e.pageX - startX;
    currentTranslate = clamp(prevTranslate + deltaX, -maxScroll - 40, 40);
    setPosition(currentTranslate);
  };

  window.onmouseup = () => {
    if (!isDragging || isMobile()) return;
    isDragging = false;
    track.classList.remove('dragging');
    container.classList.remove('active');
    updatePosition(currentTranslate, true);
  };

  // Navigation Arrows
  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.preventDefault();
      updatePosition(currentTranslate + getCardStep(), true);
    };
  }

  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.preventDefault();
      updatePosition(currentTranslate - getCardStep(), true);
    };
  }

  window.onresize = () => updatePosition(currentTranslate, false);
  setTimeout(() => updatePosition(0, false), 50);
  return true;
}

window.initTestimonials = initTestimonials;
document.addEventListener("DOMContentLoaded", initTestimonials);
document.addEventListener("componentsLoaded", initTestimonials);