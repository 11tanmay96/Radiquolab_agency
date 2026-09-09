// js/global/core-values.js

function initCoreValues() {
  const orbitContainer = document.getElementById("valueOrbit") || document.querySelector(".value-orbit");
  const dial = document.getElementById("valueDial") || document.querySelector(".value-dial");
  const words = document.querySelectorAll(".value-word");
  const panels = document.querySelectorAll(".value-panel");
  const connectorLine = document.getElementById("connector-line");
  const connectorDot = document.getElementById("connector-dot");

  if (!orbitContainer || !dial || !words.length) return;

  const valueKeys = ["creativity", "integrity", "passion", "customer", "diversity"];
  let currentIndex = 0;

  // Dynamically update SVG connector stick and target endpoint ball
  const updateConnector = (activeWord) => {
    if (!connectorLine || !connectorDot) return;

    const orbitRect = orbitContainer.getBoundingClientRect();
    const dialRect = dial.getBoundingClientRect();
    const wordRect = activeWord.getBoundingClientRect();

    // Center coordinates relative to the SVG/Orbit container
    const centerX = (dialRect.left + dialRect.width / 2) - orbitRect.left;
    const centerY = (dialRect.top + dialRect.height / 2) - orbitRect.top;

    const targetX = (wordRect.left + wordRect.width / 2) - orbitRect.left;
    const targetY = (wordRect.top + wordRect.height / 2) - orbitRect.top;

    // Vector math for line pointing from dial perimeter to word boundary
    const dx = targetX - centerX;
    const dy = targetY - centerY;
    const angle = Math.atan2(dy, dx);

    const dialRadius = dialRect.width / 2;
    const startX = centerX + Math.cos(angle) * dialRadius;
    const startY = centerY + Math.sin(angle) * dialRadius;

    // Position the dot just outside the word button
    const dotOffset = 18;
    const endX = targetX - Math.cos(angle) * dotOffset;
    const endY = targetY - Math.sin(angle) * dotOffset;

    connectorLine.setAttribute("x1", startX);
    connectorLine.setAttribute("y1", startY);
    connectorLine.setAttribute("x2", endX);
    connectorLine.setAttribute("y2", endY);

    connectorDot.setAttribute("cx", endX);
    connectorDot.setAttribute("cy", endY);
  };

  const activateValue = (key) => {
    const targetWord = document.querySelector(`.value-word[data-value="${key}"]`);
    const targetPanel = document.querySelector(`.value-panel[data-panel="${key}"]`);

    if (!targetWord) return;

    words.forEach((w) => w.classList.remove("active"));
    panels.forEach((p) => p.classList.remove("active"));

    targetWord.classList.add("active");
    if (targetPanel) {
      targetPanel.classList.add("active");
    }

    currentIndex = valueKeys.indexOf(key);
    updateConnector(targetWord);
  };

  // Click on word buttons
  words.forEach((btn) => {
    btn.onclick = (e) => {
      e.preventDefault();
      const val = btn.getAttribute("data-value");
      activateValue(val);
    };
  });

  // Click dial to cycle to next value
  dial.onclick = (e) => {
    e.preventDefault();
    currentIndex = (currentIndex + 1) % valueKeys.length;
    activateValue(valueKeys[currentIndex]);
  };

  // Handle window resize dynamically
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const currentActive = document.querySelector(".value-word.active") || words[0];
      updateConnector(currentActive);
    }, 50);
  });

  // Initial setup
  const initialKey = document.querySelector(".value-word.active")?.getAttribute("data-value") || valueKeys[0];
  activateValue(initialKey);
}

// Global exposure for include.js + standard execution
window.initCoreValues = initCoreValues;
document.addEventListener("DOMContentLoaded", initCoreValues);
document.addEventListener("componentsLoaded", initCoreValues);