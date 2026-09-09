// js/global/hero.js

let heroInterval = null;

function initHeroSlider() {
  const statContent = document.getElementById('statContent');
  const statCategory = document.getElementById('statCategory');
  const statMetric = document.getElementById('statMetric');
  const statText = document.getElementById('statText');
  const indicators = document.querySelectorAll('.slider-indicators .indicator');

  if (!statContent || !statCategory || !statMetric || !statText) return;

  if (heroInterval) {
    clearInterval(heroInterval);
    heroInterval = null;
  }

  const slides = [
    {
      category: 'Growth-driven UX',
      metric: '2.5X',
      text: 'Average increase in user engagement for our B2B clients.'
    },
    {
      category: 'Market Leader',
      metric: '#1',
      text: 'Rated design partner for high-growth startups.'
    },
    {
      category: 'Human-Centered',
      metric: '1500+',
      text: 'Hours of user research and usability testing conducted annually.'
    }
  ];

  let currentIndex = 0;

  function changeSlide() {
    statContent.classList.add('fade-out');

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      const currentSlide = slides[currentIndex];

      statCategory.textContent = currentSlide.category;
      statMetric.textContent = currentSlide.metric;
      statText.textContent = currentSlide.text;

      indicators.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });

      statContent.classList.remove('fade-out');
    }, 350);
  }

  heroInterval = setInterval(changeSlide, 1500);

  const statCard = document.querySelector('.stat-card');
  if (statCard) {
    statCard.onmouseenter = () => clearInterval(heroInterval);
    statCard.onmouseleave = () => {
      clearInterval(heroInterval);
      heroInterval = setInterval(changeSlide, 3500);
    };
  }
}

window.initHeroSlider = initHeroSlider;
document.addEventListener('DOMContentLoaded', initHeroSlider);
document.addEventListener('componentsLoaded', initHeroSlider);