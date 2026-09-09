// js/global/design-process.js

function initDesignProcess() {
  const processTabs = document.querySelectorAll(".process-tab");
  const processNavWrapper = document.querySelector(".process-nav-wrapper");
  const processInformation = document.getElementById("processInformation");
  const processIconImg = document.querySelector(".process-icon img");

  if (!processTabs.length || !processInformation) return;

  const processData = [
    {
      title: "1. Discovery & Research",
      icon: "../assets/icons/search.svg",
      items: [
        "Understand client goals and user needs",
        "Conduct market and user research",
        "Analyse competitors and trends"
      ]
    },
    {
      title: "2. Ideation & Conceptualisation",
      icon: "../assets/icons/search.svg",
      items: [
        "Brainstorm design ideas",
        "Develop personas and journey maps",
        "Create wireframes and sketches"
      ]
    },
    {
      title: "3. Design & Prototype",
      icon: "../assets/icons/search.svg",
      items: [
        "Develop high-fidelity wireframes",
        "Create interactive prototypes",
        "Design visual elements and interfaces"
      ]
    },
    {
      title: "4. User Testing & Feedback",
      icon: "../assets/icons/search.svg",
      items: [
        "Conduct usability testing",
        "Gather and analyse feedback",
        "Iterate and refine designs"
      ]
    },
    {
      title: "5. Implementation & Development",
      icon: "../assets/icons/search.svg",
      items: [
        "Collaborate with development teams",
        "Ensure design consistency",
        "Conduct quality assurance"
      ]
    },
    {
      title: "6. Launch & Support",
      icon: "../assets/icons/search.svg",
      items: [
        "Assist with product launch",
        "Provide ongoing support",
        "Monitor feedback and improve"
      ]
    }
  ];

  /* =========================================
     RENDER CONTENT & ICON
  ========================================= */
  const showProcess = (index) => {
    const data = processData[index];
    if (!data) return;

    processTabs.forEach((t) => t.classList.remove("active"));
    if (processTabs[index]) {
      processTabs[index].classList.add("active");
    }

    processInformation.classList.remove("change");
    void processInformation.offsetWidth; // Trigger DOM reflow for animation

    processInformation.innerHTML = `
      <h3>${data.title}</h3>
      <ul>
        ${data.items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    `;
    processInformation.classList.add("change");

    if (processIconImg && data.icon) {
      processIconImg.src = data.icon;
      processIconImg.alt = data.title;
    }
  };

  /* =========================================
     AUTO-SCROLL TAB INTO VIEW
  ========================================= */
  const moveNavigation = (tab) => {
    if (!processNavWrapper) return;
    const wrapperRect = processNavWrapper.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();

    if (tabRect.right > wrapperRect.right) {
      const moveAmount = tabRect.right - wrapperRect.right + 40;
      processNavWrapper.scrollBy({ left: moveAmount, behavior: "smooth" });
    } else if (tabRect.left < wrapperRect.left) {
      const moveAmount = tabRect.left - wrapperRect.left - 40;
      processNavWrapper.scrollBy({ left: moveAmount, behavior: "smooth" });
    }
  };

  /* =========================================
     TAB CLICKS
  ========================================= */
  processTabs.forEach((tab, index) => {
    tab.onclick = (e) => {
      e.preventDefault();
      showProcess(index);
      moveNavigation(tab);
    };
  });

  /* =========================================
     DRAG / TOUCH HORIZONTAL SCROLL
  ========================================= */
  if (processNavWrapper) {
    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;

    // Mouse Drag
    processNavWrapper.onmousedown = (e) => {
      isDragging = true;
      startX = e.pageX;
      startScrollLeft = processNavWrapper.scrollLeft;
      processNavWrapper.style.cursor = "grabbing";
      processNavWrapper.style.userSelect = "none";
    };

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const deltaX = e.pageX - startX;
      processNavWrapper.scrollLeft = startScrollLeft - deltaX;
    });

    window.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      processNavWrapper.style.cursor = "";
      processNavWrapper.style.userSelect = "";
    });

    // Touch Swipe
    let touchStartX = 0;
    let touchStartScroll = 0;

    processNavWrapper.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartScroll = processNavWrapper.scrollLeft;
      },
      { passive: true }
    );

    processNavWrapper.addEventListener(
      "touchmove",
      (e) => {
        const deltaX = e.touches[0].clientX - touchStartX;
        processNavWrapper.scrollLeft = touchStartScroll - deltaX;
      },
      { passive: true }
    );
  }

  // Initial Content Load
  showProcess(0);
}

// Global exposure for include.js + standard execution
window.initDesignProcess = initDesignProcess;
document.addEventListener("DOMContentLoaded", initDesignProcess);
document.addEventListener("componentsLoaded", initDesignProcess);