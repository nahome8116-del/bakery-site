const form = document.querySelector("#preorder-form");

if (form) {
  form.noValidate = true;
  const fields = [...form.querySelectorAll("[required]")];
  const feedback = document.querySelector("#form-feedback");
  const nameField = form.elements.namedItem("name");
  const saveName = document.querySelector("#save-name");
  const storageFeedback = document.querySelector("#storage-feedback");
  const removeSavedName = document.querySelector("#remove-saved-name");
  const nameKey = "north-star-bakery-name-v1";
  const consentKey = "north-star-bakery-name-consent-v1";
  let hasSubmitted = false;

  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  form.elements.namedItem("pickup-date").min = today.toISOString().slice(0, 10);

  function saveNameToStorage() {
    if (!saveName.checked) return;

    try {
      if (nameField.value.trim()) {
        localStorage.setItem(nameKey, nameField.value);
        removeSavedName.hidden = false;
        storageFeedback.textContent = "Your name is saved on this device.";
      } else {
        localStorage.removeItem(nameKey);
        removeSavedName.hidden = true;
        storageFeedback.textContent = "Name saving is on. Enter your name to save it.";
      }
    } catch {
      storageFeedback.textContent = "This browser couldn't save your name. It will not persist.";
    }
  }

  function loadSavedName() {
    try {
      if (localStorage.getItem(consentKey) === "true") {
        saveName.checked = true;
        const savedName = localStorage.getItem(nameKey);
        if (savedName) {
          nameField.value = savedName;
          removeSavedName.hidden = false;
          storageFeedback.textContent = "Your saved name was restored from this device.";
        } else {
          storageFeedback.textContent = "Name saving is on. Enter your name to save it.";
        }
      }
    } catch {
      saveName.checked = false;
      storageFeedback.textContent = "Your saved name couldn't be read from this browser.";
    }
  }

  function removeNameFromStorage() {
    try {
      localStorage.removeItem(nameKey);
      localStorage.removeItem(consentKey);
      saveName.checked = false;
      removeSavedName.hidden = true;
      storageFeedback.textContent = "Your saved name was removed from this device.";
    } catch {
      storageFeedback.textContent = "Your saved name couldn't be removed from this browser.";
    }
  }

  loadSavedName();
  saveName.addEventListener("change", () => {
    if (saveName.checked) {
      try {
        localStorage.setItem(consentKey, "true");
        storageFeedback.textContent = "Name saving is on for this device.";
        saveNameToStorage();
      } catch {
        saveName.checked = false;
        storageFeedback.textContent = "This browser couldn't enable name saving.";
      }
    } else {
      removeNameFromStorage();
    }
  });
  nameField.addEventListener("input", saveNameToStorage);
  nameField.addEventListener("change", saveNameToStorage);
  removeSavedName.addEventListener("click", removeNameFromStorage);

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
