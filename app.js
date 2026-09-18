const $ = (id) => document.getElementById(id);

// ============================================================
// Swimming Challenge configuration
// ============================================================

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx_HaD_abVL6RQTHOb0qmTfOSluHUv6OCov_mcs1rtwmJ2ClMR_ZKyHKgqqZHT-o1mC/exec";

const FEE_PER_EVENT = 200;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const VALID_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf"
];

// ============================================================
// Theme
// ============================================================

const themeToggle = $("themeToggle");
const themeIcon = $("themeIcon");
const themeText = $("themeText");
const root = document.documentElement;

const savedTheme = localStorage.getItem("swim-theme");
const preferredDark =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

setTheme(savedTheme || (preferredDark ? "dark" : "light"));

function setTheme(theme) {
  root.dataset.theme = theme;

  const dark = theme === "dark";

  themeIcon.textContent = dark ? "☾" : "☀︎";
  themeText.textContent = dark ? "Dark" : "Light";

  document
    .querySelector('meta[name="theme-color"]')
    .setAttribute(
      "content",
      dark ? "#07111f" : "#f4f7fb"
    );
}

themeToggle.addEventListener("click", () => {
  const next =
    root.dataset.theme === "dark"
      ? "light"
      : "dark";

  setTheme(next);
  localStorage.setItem("swim-theme", next);
});

// ============================================================
// Stage navigation
// ============================================================

const stages = [1, 2, 3].map(n => $("stage" + n));
const steps = [...document.querySelectorAll(".step")];

function goToStage(number) {
  stages.forEach(stage => {
    stage.classList.toggle(
      "active",
      Number(stage.dataset.stage) === number
    );
  });

  steps.forEach(step => {
    const n = Number(step.dataset.step);

    step.classList.toggle("active", n === number);
    step.classList.toggle("complete", n < number);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================================================
// Validation
// ============================================================

function clearErrors() {
  document.querySelectorAll(".field-error").forEach(el => {
    el.textContent = "";
  });
}

function setError(id, message) {
  $(id).textContent = message;
}

function validateStage1() {
  clearErrors();

  let valid = true;

  const name = $("name").value.trim();
  const dob = $("dob").value;
  const gender = $("gender").value;
  const whatsapp = $("whatsapp").value.replace(/\D/g, "");
  const file = $("dobProof").files[0];

  if (name.length < 2) {
    setError("nameError", "Please enter the participant name.");
    valid = false;
  }

  if (!dob) {
    setError("dobError", "Please select the date of birth.");
    valid = false;
  } else {
    const selectedDate = new Date(`${dob}T00:00:00`);
    const today = new Date();
    if (selectedDate > today) {
      setError("dobError", "Date of birth cannot be in the future.");
      valid = false;
    }
  }

  if (!gender) {
    setError("genderError", "Please select a gender.");
    valid = false;
  }

  if (!file) {
    setError("dobProofError", "Please upload DOB proof.");
    valid = false;
  }

  if (
    whatsapp.length !== 10 ||
    !/^[6-9]\d{9}$/.test(whatsapp)
  ) {
    setError(
      "whatsappError",
      "Please enter a valid 10-digit WhatsApp number."
    );
    valid = false;
  }

  return valid;
}

// ============================================================
// DOB proof
// ============================================================

const dobProof = $("dobProof");
const uploadButton = $("uploadButton");
const uploadCard = $("uploadCard");
const fileChip = $("fileChip");
const fileName = $("fileName");
const removeFile = $("removeFile");

uploadButton.addEventListener("click", () => dobProof.click());

uploadCard.addEventListener("dragover", e => {
  e.preventDefault();
  uploadCard.style.borderColor = "var(--primary)";
});

uploadCard.addEventListener("dragleave", () => {
  uploadCard.style.borderColor = "var(--border-strong)";
});

uploadCard.addEventListener("drop", e => {
  e.preventDefault();
  uploadCard.style.borderColor = "var(--border-strong)";

  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    dobProof.files = e.dataTransfer.files;
    handleDobProof();
  }
});

dobProof.addEventListener("change", handleDobProof);

function handleDobProof() {
  const file = dobProof.files[0];
  if (!file) return;

  clearErrors();

  if (!VALID_FILE_TYPES.includes(file.type)) {
    dobProof.value = "";
    fileChip.classList.add("hidden");
    setError("dobProofError", "Use JPG, PNG or PDF.");
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    dobProof.value = "";
    fileChip.classList.add("hidden");
    setError("dobProofError", "File must be 5 MB or smaller.");
    return;
  }

  fileName.textContent = file.name;
  fileChip.classList.remove("hidden");
}

removeFile.addEventListener("click", () => {
  dobProof.value = "";
  fileChip.classList.add("hidden");
  fileName.textContent = "";
  $("dobProofError").textContent = "";
});

$("whatsapp").addEventListener("input", e => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
});

$("toEvents").addEventListener("click", () => {
  if (validateStage1()) {
    goToStage(2);
    return;
  }

  const firstError = document.querySelector(
    ".field-error:not(:empty)"
  );

  if (firstError) {
    firstError.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
});

$("backToDetails").addEventListener("click", () => goToStage(1));

// ============================================================
// Events + fee
// ============================================================

const eventCheckboxes = [
  ...document.querySelectorAll(".event-checkbox")
];

function getSelectedEvents() {
  return eventCheckboxes
    .filter(cb => cb.checked)
    .map(cb => cb.value);
}

function calculateTotal() {
  return getSelectedEvents().length * FEE_PER_EVENT;
}

function updateTotals() {
  const selected = getSelectedEvents();

  $("eventCount").textContent = selected.length;
  $("totalAmount").textContent = `₹${calculateTotal()}`;
}

eventCheckboxes.forEach(cb =>
  cb.addEventListener("change", updateTotals)
);

$("toPayment").addEventListener("click", () => {
  const selected = getSelectedEvents();

  if (!selected.length) {
    showToast("Select at least one event.");
    return;
  }

  $("summaryName").textContent =
    $("name").value.trim() || "Participant";

  $("summaryEvents").textContent =
    `${selected.length} event${selected.length === 1 ? "" : "s"}`;

  $("summaryAmount").textContent =
    `₹${calculateTotal()}`;

  goToStage(3);
});

$("backToEvents").addEventListener("click", () => goToStage(2));

// ============================================================
// Payment screenshot
// ============================================================

const paymentScreenshot = $("paymentScreenshot");
const chooseScreenshot = $("chooseScreenshot");
const paymentFile = $("paymentFile");
const paymentFileName = $("paymentFileName");
const paymentFileMeta = $("paymentFileMeta");
const removePaymentFile = $("removePaymentFile");
const uploadStatus = $("uploadStatus");
const finishButton = $("finishButton");
const copyUpi = $("copyUpi");

let selectedPaymentFile = null;

chooseScreenshot.addEventListener(
  "click",
  () => paymentScreenshot.click()
);

paymentScreenshot.addEventListener("change", () => {
  const file = paymentScreenshot.files[0];
  if (!file) return;

  uploadStatus.textContent = "";

  if (!VALID_FILE_TYPES.includes(file.type)) {
    paymentScreenshot.value = "";
    selectedPaymentFile = null;
    paymentFile.classList.add("hidden");
    finishButton.disabled = true;
    uploadStatus.textContent = "Please choose a JPG, PNG or PDF.";
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    paymentScreenshot.value = "";
    selectedPaymentFile = null;
    paymentFile.classList.add("hidden");
    finishButton.disabled = true;
    uploadStatus.textContent =
      "The screenshot must be 5 MB or smaller.";
    return;
  }

  selectedPaymentFile = file;

  paymentFileName.textContent = file.name;
  paymentFileMeta.textContent =
    `${formatFileSize(file.size)} · Attached`;

  paymentFile.classList.remove("hidden");
  finishButton.disabled = false;

  uploadStatus.textContent =
    "Screenshot attached. It will be submitted with your registration.";
});

removePaymentFile.addEventListener("click", () => {
  paymentScreenshot.value = "";
  selectedPaymentFile = null;
  paymentFile.classList.add("hidden");
  finishButton.disabled = true;
  uploadStatus.textContent = "";
});

copyUpi.addEventListener("click", async () => {
  const upiId = $("upiId").textContent.trim();

  try {
    await navigator.clipboard.writeText(upiId);
    copyUpi.textContent = "Copied";

    setTimeout(
      () => copyUpi.textContent = "Copy",
      1400
    );
  } catch {
    showToast(upiId);
  }
});

// ============================================================
// File -> data URL
// ============================================================

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);

    reader.onerror = () =>
      reject(
        new Error(`Could not read ${file.name}.`)
      );

    reader.readAsDataURL(file);
  });
}

// ============================================================
// Submit to Apps Script
//
// Cross-origin fetch is deliberately avoided. A hidden HTML
// form posts to an invisible iframe, and the Apps Script response
// uses postMessage() to report success/error back to this page.
// ============================================================

let submissionIframe = null;

function createSubmissionIframe() {
  const iframe = document.createElement("iframe");
  const name = `swimResponse_${Date.now()}`;

  iframe.name = name;
  iframe.id = name;
  iframe.title = "Registration submission";
  iframe.setAttribute("aria-hidden", "true");

  Object.assign(iframe.style, {
    position: "fixed",
    width: "1px",
    height: "1px",
    border: "0",
    opacity: "0",
    pointerEvents: "none"
  });

  document.body.appendChild(iframe);
  submissionIframe = iframe;

  return iframe;
}

function removeSubmissionIframe() {
  if (submissionIframe?.parentNode) {
    submissionIframe.parentNode.removeChild(submissionIframe);
  }

  submissionIframe = null;
}

function appendHiddenInput(form, name, value) {
  const input = document.createElement("input");

  input.type = "hidden";
  input.name = name;
  input.value = value == null ? "" : String(value);

  form.appendChild(input);
}

async function submitRegistration() {
  if (!validateStage1()) {
    goToStage(1);
    return;
  }

  const events = getSelectedEvents();

  if (!events.length) {
    goToStage(2);
    showToast("Select at least one event.");
    return;
  }

  if (!selectedPaymentFile) {
    showToast("Please attach your payment screenshot.");
    return;
  }

  const dobProofFile = dobProof.files[0];
  const paymentFile = selectedPaymentFile;

  setSubmitting(true);

  try {
    const [
      dobProofData,
      paymentScreenshotData
    ] = await Promise.all([
      fileToDataUrl(dobProofFile),
      fileToDataUrl(paymentFile)
    ]);

    const iframe = createSubmissionIframe();

    const form = document.createElement("form");

    form.method = "POST";
    form.action = APPS_SCRIPT_URL;
    form.target = iframe.name;
    form.style.display = "none";
    form.enctype = "application/x-www-form-urlencoded";

    appendHiddenInput(
      form,
      "name",
      $("name").value.trim()
    );

    appendHiddenInput(
      form,
      "dob",
      $("dob").value
    );

    appendHiddenInput(
      form,
      "gender",
      $("gender").value
    );

    appendHiddenInput(
      form,
      "whatsapp",
      $("whatsapp").value.replace(/\D/g, "")
    );

    appendHiddenInput(
      form,
      "events",
      JSON.stringify(events)
    );

    appendHiddenInput(
      form,
      "paymentReference",
      $("paymentReference").value.trim()
    );

    appendHiddenInput(
      form,
      "dobProofBase64",
      dobProofData
    );

    appendHiddenInput(
      form,
      "dobProofMimeType",
      dobProofFile.type
    );

    appendHiddenInput(
      form,
      "paymentScreenshotBase64",
      paymentScreenshotData
    );

    appendHiddenInput(
      form,
      "paymentScreenshotMimeType",
      paymentFile.type
    );

    appendHiddenInput(
      form,
      "clientSource",
      "gitlab-pages"
    );

    document.body.appendChild(form);

    await waitForAppsScriptResponse(form, events);

  } catch (error) {
    console.error(error);

    showSubmissionError(
      error.message ||
      "Something went wrong. Please try again."
    );

    setSubmitting(false);
  }
}

function waitForAppsScriptResponse(form, events) {
  return new Promise((resolve, reject) => {
    let finished = false;

    const timeout = setTimeout(() => {
      if (finished) return;

      finished = true;
      cleanup();

      reject(
        new Error(
          "The submission is taking too long. Please check your connection and try again."
        )
      );
    }, 60000);

    function cleanup() {
      clearTimeout(timeout);

      window.removeEventListener(
        "message",
        handleMessage
      );

      if (form?.parentNode) {
        form.parentNode.removeChild(form);
      }

      setTimeout(removeSubmissionIframe, 1000);
    }

    function handleMessage(event) {
      if (
        !submissionIframe ||
        event.source !== submissionIframe.contentWindow
      ) {
        return;
      }

      const data = event.data;

      if (
        !data ||
        typeof data.success !== "boolean"
      ) {
        return;
      }

      if (finished) return;

      finished = true;
      cleanup();

      if (data.success) {
        showSuccess(
          data.registrationId,
          events,
          calculateTotal()
        );

        resolve(data);
      } else {
        reject(
          new Error(
            data.message ||
            "Registration failed."
          )
        );
      }
    }

    window.addEventListener(
      "message",
      handleMessage
    );

    form.submit();
  });
}

function setSubmitting(submitting) {
  finishButton.disabled =
    submitting ||
    !selectedPaymentFile;

  finishButton.classList.toggle(
    "submitting",
    submitting
  );

  if (submitting) {
    finishButton.innerHTML =
      `<span class="button-spinner"></span> Submitting…`;

    uploadStatus.textContent =
      "Uploading your documents and saving your registration…";
  } else {
    finishButton.innerHTML =
      `Submit registration <span>→</span>`;
  }

  chooseScreenshot.disabled = submitting;
  removePaymentFile.disabled = submitting;
  $("backToEvents").disabled = submitting;
}

function showSubmissionError(message) {
  uploadStatus.textContent = message;
  showToast(message);
}

function showSuccess(registrationId, events, total) {
  setSubmitting(false);

  $("successRegistrationId").textContent =
    registrationId;

  $("successName").textContent =
    $("name").value.trim();

  $("successEvents").textContent =
    `${events.length} event${events.length === 1 ? "" : "s"}`;

  $("successAmount").textContent =
    `₹${total}`;

  $("registrationForm").classList.add("hidden");
  $("successState").classList.remove("hidden");

  steps.forEach(step => {
    step.classList.add("complete");
    step.classList.remove("active");
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// ============================================================
// UI helpers
// ============================================================

function showToast(message) {
  const toast = $("toast");

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(
    () => toast.classList.remove("show"),
    2200
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

finishButton.addEventListener(
  "click",
  submitRegistration
);

updateTotals();
