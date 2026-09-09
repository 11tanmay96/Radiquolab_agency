function initFAQ() {
  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const header = item.querySelector(".faq-header");
    if (!header) return;

    header.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");
      faqItems.forEach((el) => el.classList.remove("active"));
      if (!isOpen) {
        item.classList.add("active");
      }
    });
  });
}

document.addEventListener("componentsLoaded", initFAQ);
document.addEventListener("DOMContentLoaded", initFAQ);