// js/global/services.js

function initServices() {
  const accordion = document.getElementById("servicesAccordion");
  const previewIcon = document.getElementById("previewIcon");
  const previewTitle = document.getElementById("previewTitle");

  if (!accordion || !previewIcon || !previewTitle) return;

  const servicesData = [
    {
      title: "UI/UX Design",
      iconSrc: "/assets/icons/penicon.svg"
    },
    {
      title: "Service Design",
      iconSrc: "/assets/icons/handgear.svg"
    },
    {
      title: "Market Research",
      iconSrc: "/assets/icons/marketresearch.svg"
    },
    {
      title: "MVP Design",
      iconSrc: "/assets/icons/mvpicon.svg"
    },
    {
      title: "Branding",
      iconSrc: "/assets/icons/branding.svg"
    },
    {
      title: "No-Code Development",
      iconSrc: "/assets/icons/nocodeicon.svg"
    },
    {
      title: "Mobile & Web Development",
      iconSrc: "/assets/icons/mobwebdevicon.svg"
    }
  ];

  const items = accordion.querySelectorAll(".accordion-item");

  function updatePreview(index) {
    const data = servicesData[index];
    if (!data) return;

    previewIcon.style.transition = "transform 0.15s ease, opacity 0.15s ease";
    previewTitle.style.transition = "opacity 0.15s ease";

    previewIcon.style.transform = "scale(0.85)";
    previewIcon.style.opacity = "0";
    previewTitle.style.opacity = "0";

    setTimeout(() => {
      previewIcon.innerHTML = `<img src="${data.iconSrc}" alt="${data.title}" />`;
      previewTitle.textContent = data.title;
      previewIcon.style.transform = "scale(1)";
      previewIcon.style.opacity = "1";
      previewTitle.style.opacity = "1";
    }, 150);
  }

  items.forEach((item, index) => {
    const header = item.querySelector(".accordion-header");
    if (!header) return;

    const serviceIndex = item.hasAttribute("data-service")
      ? parseInt(item.getAttribute("data-service"), 10)
      : index;

    header.onclick = () => {
      const isAlreadyActive = item.classList.contains("active");

      // Keep active item open if clicked, or collapse others and switch
      if (isAlreadyActive) return;

      items.forEach((el) => el.classList.remove("active"));
      item.classList.add("active");
      updatePreview(serviceIndex);
    };
  });
}

// Bind to direct render and dynamic include loader
window.initServices = initServices;
document.addEventListener("DOMContentLoaded", initServices);
document.addEventListener("componentsLoaded", initServices);