const form = document.querySelector("#preorder-form");

if (form) {
  const fields = [...form.querySelectorAll("[required]")];
  const feedback = document.querySelector("#form-feedback");
  let hasSubmitted = false;

  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  form.elements.namedItem("pickup-date").min = today.toISOString().slice(0, 10);

  function getError(field) {
    if (!field.value.trim()) {
      return {
        message: {
          name: "Enter your name.",
          email: "Enter your email address.",
          item: "Choose a bake.",
          "pickup-date": "Choose a pickup date."
        }[field.name],
        label: field.labels[0].textContent.replace("*", "").trim()
      };
    }

    if (field.type === "email" && field.validity.typeMismatch) {
      return {
        message: "Enter a valid email address, such as name@example.com.",
        label: field.labels[0].textContent.replace("*", "").trim()
      };
    }

    if (field.type === "date" && field.validity.rangeUnderflow) {
      return {
        message: "Choose a pickup date that is today or later.",
        label: field.labels[0].textContent.replace("*", "").trim()
      };
    }

    return null;
  }

  function validateForm() {
    const errors = [];

    for (const field of fields) {
      const error = getError(field);
      const errorElement = document.querySelector(`#${field.id}-error`);

      field.setAttribute("aria-invalid", String(Boolean(error)));
      errorElement.textContent = error ? error.message : "";
      errorElement.hidden = !error;

      if (error) {
        field.setAttribute("aria-describedby", errorElement.id);
        errors.push({ field, ...error });
      } else {
        field.removeAttribute("aria-describedby");
      }
    }

    feedback.textContent = errors.length
      ? `Please correct the highlighted fields: ${errors.map(error => error.label).join(", ")}.`
      : "";
    feedback.hidden = errors.length === 0;
    return errors;
  }

  form.addEventListener("submit", event => {
    hasSubmitted = true;
    const errors = validateForm();

    if (errors.length) {
      event.preventDefault();
      errors[0].field.focus();
    }
  });

  for (const field of fields) {
    field.addEventListener("input", () => {
      if (hasSubmitted) validateForm();
    });
    field.addEventListener("change", () => {
      if (hasSubmitted) validateForm();
    });
  }
}
