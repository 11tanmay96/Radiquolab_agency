function initForm() {
  const form =
    document.getElementById("contactForm") ||
    document.querySelector("form.brief-form") ||
    document.querySelector("form");
  if (!form) return;

  const contactCard =
    document.getElementById("contactCard") || form.closest(".contact-card");
  const successCard =
    document.getElementById("contactSuccessCard") ||
    document.querySelector(".contact-success-card");

  // 1. MULTI-SELECT (Services) & SINGLE-SELECT (Timeline) PILLS
  const allPills = form.querySelectorAll(
    ".option-pill, .service-pill, .timeline-pill"
  );
  allPills.forEach((pill) => {
    if (pill.dataset.bound) return;
    pill.dataset.bound = "true";

    pill.addEventListener("click", (e) => {
      e.preventDefault();
      const parentGroup = pill.closest(".pill-options");

      if (parentGroup && parentGroup.classList.contains("single-select")) {
        parentGroup
          .querySelectorAll(".option-pill, .timeline-pill")
          .forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
      } else {
        pill.classList.toggle("active");
      }
    });
  });

  // 2. DYNAMIC BUDGET SLIDER (Docked Right Value)
  const budgetSlider =
    form.querySelector(".budget-range") ||
    form.querySelector("input[type='range']");
  const budgetBubble =
    form.querySelector(".current-value-bubble") ||
    document.getElementById("budgetDisplay");

  const updateBudgetDisplay = () => {
    if (!budgetSlider || !budgetBubble) return;
    const val = Number(budgetSlider.value);

    if (val >= 25000) {
      budgetBubble.textContent = "$ 25,000+";
    } else {
      budgetBubble.textContent = `$ ${val.toLocaleString()}`;
    }
  };

  if (budgetSlider && budgetBubble && !budgetSlider.dataset.bound) {
    budgetSlider.dataset.bound = "true";
    budgetSlider.addEventListener("input", updateBudgetDisplay);
    updateBudgetDisplay();
  }

  // 3. FORM SUBMISSION HANDLER
  if (form.dataset.initialized) return;
  form.dataset.initialized = "true";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn =
      form.querySelector("button[type='submit']") ||
      form.querySelector(".btn-submit") ||
      form.querySelector(".btn-solid");

    const originalText = submitBtn
      ? submitBtn.dataset.originalText || submitBtn.textContent
      : "Send this brief";

    if (submitBtn && !submitBtn.dataset.originalText) {
      submitBtn.dataset.originalText = originalText;
    }

    // Extract active service pills
    const selectedServices = Array.from(
      form.querySelectorAll(
        ".pill-options:not(.single-select) .option-pill.active, .service-pill.active"
      )
    ).map((el) => el.getAttribute("data-value") || el.textContent.trim());

    // Extract active timeline pill
    const selectedTimelineEl = form.querySelector(
      ".pill-options.single-select .option-pill.active, .timeline-pill.active"
    );
    const selectedTimeline = selectedTimelineEl
      ? selectedTimelineEl.getAttribute("data-value") ||
        selectedTimelineEl.textContent.trim()
      : null;

    // Extract budget value
    const budgetVal = budgetBubble
      ? budgetBubble.textContent.trim()
      : budgetSlider
      ? budgetSlider.value
      : null;

    // Extract text inputs
    const emailInput = form.querySelector("input[type='email']");
    const messageInput = form.querySelector("textarea");

    const payload = {
      services: selectedServices,
      timeline: selectedTimeline,
      budget: budgetVal,
      email: emailInput ? emailInput.value.trim() : "",
      message: messageInput ? messageInput.value.trim() : ""
    };

    if (!payload.email) {
      alert("Please enter a valid email address.");
      if (emailInput) emailInput.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        throw new Error(`Server returned status ${response.status}`);
      }

      if (response.ok && data.success) {
        if (contactCard && successCard) {
          contactCard.style.display = "none";
          successCard.classList.add("active");
          successCard.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (submitBtn) {
          submitBtn.textContent = "Brief Sent!";
        }

        form.reset();
        updateBudgetDisplay();
        form
          .querySelectorAll(
            ".option-pill.active, .service-pill.active, .timeline-pill.active"
          )
          .forEach((pill) => pill.classList.remove("active"));
      } else {
        alert(data.message || "Failed to submit. Please try again.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText || originalText;
        }
      }
    } catch (err) {
      console.error("Submission request error:", err);
      alert(
        "An error occurred while connecting to the server. Please verify your connection or try again later."
      );
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.originalText || originalText;
      }
    }
  });
}

window.initForm = initForm;
document.addEventListener("DOMContentLoaded", initForm);
document.addEventListener("componentsLoaded", initForm);