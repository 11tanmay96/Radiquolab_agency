// js/global/include.js

async function loadComponents() {
  const elements = document.querySelectorAll("[data-include]");

  const loadPromises = Array.from(elements).map(async (el) => {
    const file = el.getAttribute("data-include");
    try {
      const response = await fetch(file, { cache: "no-store" });
      if (response.ok) {
        const html = await response.text();
        el.outerHTML = html;
      } else {
        console.error(`Error loading component ${file}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Failed to load component: ${file}`, error);
    }
  });

  await Promise.all(loadPromises);

  // Allow DOM reflow before invoking scripts
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent("componentsLoaded"));

    if (typeof window.initTestimonials === "function") {
      window.initTestimonials();
    }
    if (typeof window.initFaq === "function") {
      window.initFaq();
    }
    if (typeof window.initForm === "function") {
      window.initForm();
    }
    if (typeof window.initServices === "function") {
      window.initServices();
    }
    if (typeof window.initIndustries === "function") {
      window.initIndustries();
    }
  }, 30);
}

// Global delegated click listener (handles dynamically loaded navbar & mobile menu)
document.addEventListener("click", (e) => {
  const toggleBtn = e.target.closest("#mobileMenuToggle, #hamburgerBtn, .hamburger-btn");
  const mobileMenu = document.getElementById("mobileMenu") || document.querySelector(".mobile-menu-overlay");
  const mobileLink = e.target.closest("#mobileMenu a, .mobile-menu-overlay a, .mobile-nav-link");

  // Toggle button clicked
  if (toggleBtn && mobileMenu) {
    e.preventDefault();
    toggleBtn.classList.toggle("active");
    mobileMenu.classList.toggle("active");
    document.body.style.overflow = mobileMenu.classList.contains("active") ? "hidden" : "";
    return;
  }

  // Close drawer when any nav link is tapped
  if (mobileLink && mobileMenu) {
    const btn = document.querySelector("#mobileMenuToggle, #hamburgerBtn, .hamburger-btn");
    if (btn) btn.classList.remove("active");
    mobileMenu.classList.remove("active");
    document.body.style.overflow = "";
  }
});

document.addEventListener("DOMContentLoaded", loadComponents);