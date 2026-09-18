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

const stages = [1, 2, 3].map(
  n => $("stage" + n)
);

const steps = [
  ...document.querySelectorAll(".step")
];

function goToStage(number) {

  stages.forEach(stage => {
    stage.classList.toggle(
      "active",
      Number(stage.dataset.stage) === number
    );
  });

  steps.forEach(step => {

    const n =
      Number(step.dataset.step);

    step.classList.toggle(
      "active",
      n === number
    );

    step.classList.toggle(
      "complete",
      n < number
    );
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// ============================================================
// Validation
// ============================================================

function clearErrors() {

  document
    .querySelectorAll(".field-error")
    .forEach(el => {
      el.textContent = "";
    });
}

function setError(
  id,
  message
) {
  $(id).textContent =
    message;
}

function validateStage1() {

  clearErrors();

  let valid = true;

  const name =
    $("name").value.trim();

  const dob =
    $("dob").value;

  const gender =
    $("gender").value;

  const whatsapp =
    $("whatsapp")
      .value
      .replace(/\D/g, "");

  const file =
    $("dobProof").files[0];

  if (name.length < 2) {

    setError(
      "nameError",
      "Please enter the participant name."
    );

    valid = false;
  }

  if (!dob) {

    setError(
      "dobError",
      "Please select the date of birth."
    );

    valid = false;

  } else {

    const selectedDate =
      new Date(
        `${dob}T00:00:00`
      );

    const today =
      new Date();

    if (selectedDate > today) {

      setError(
        "dobError",
        "Date of birth cannot be in the future."
      );

      valid = false;
    }
  }

  if (!gender) {

    setError(
      "genderError",
      "Please select a gender."
    );

    valid = false;
  }

  if (!file) {

    setError(
      "dobProofError",
      "Please upload DOB proof."
    );

    valid = false;
  }

  if (
    whatsapp.length !== 10 ||
    !/^[6-9]\d{9}$/.test(
      whatsapp
    )
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
// DOB proof upload
// ============================================================

const dobProof =
  $("dobProof");

const uploadButton =
  $("uploadButton");

const uploadCard =
  $("uploadCard");

const fileChip =
  $("fileChip");

const fileName =
  $("fileName");

const removeFile =
  $("removeFile");

uploadButton.addEventListener(
  "click",
  () => dobProof.click()
);

uploadCard.addEventListener(
  "dragover",
  e => {

    e.preventDefault();

    uploadCard.style.borderColor =
      "var(--primary)";
  }
);

uploadCard.addEventListener(
  "dragleave",
  () => {

    uploadCard.style.borderColor =
      "var(--border-strong)";
  }
);

uploadCard.addEventListener(
  "drop",
  e => {

    e.preventDefault();

    uploadCard.style.borderColor =
      "var(--border-strong)";

    if (
      e.dataTransfer.files &&
      e.dataTransfer.files[0]
    ) {

      dobProof.files =
        e.dataTransfer.files;

      handleDobProof();
    }
  }
);

dobProof.addEventListener(
  "change",
  handleDobProof
);

function handleDobProof() {

  const file =
    dobProof.files[0];

  if (!file) return;

  clearErrors();

  if (
    !VALID_FILE_TYPES.includes(
      file.type
    )
  ) {

    dobProof.value = "";

    fileChip.classList.add(
      "hidden"
    );

    setError(
      "dobProofError",
      "Use JPG, PNG or PDF."
    );

    return;
  }

  if (
    file.size >
    MAX_FILE_SIZE
  ) {

    dobProof.value = "";

    fileChip.classList.add(
      "hidden"
    );

    setError(
      "dobProofError",
      "File must be 5 MB or smaller."
    );

    return;
  }

  fileName.textContent =
    file.name;

  fileChip.classList.remove(
    "hidden"
  );
}

removeFile.addEventListener(
  "click",
  () => {

    dobProof.value = "";

    fileChip.classList.add(
      "hidden"
    );

    fileName.textContent = "";

    $("dobProofError")
      .textContent = "";
  }
);

$("whatsapp").addEventListener(
  "input",
  e => {

    e.target.value =
      e.target.value
        .replace(/\D/g, "")
        .slice(0, 10);
  }
);

$("toEvents").addEventListener(
  "click",
  () => {

    if (
      validateStage1()
    ) {

      goToStage(2);

      return;
    }

    const firstError =
      document.querySelector(
        ".field-error:not(:empty)"
      );

    if (firstError) {

      firstError.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }
);

$("backToDetails").addEventListener(
  "click",
  () => goToStage(1)
);

// ============================================================
// Event selection + fee
// ============================================================

const eventCheckboxes = [
  ...document.querySelectorAll(
    ".event-checkbox"
  )
];

function getSelectedEvents() {

  return eventCheckboxes
    .filter(
      cb => cb.checked
    )
    .map(
      cb => cb.value
    );
}

function calculateTotal() {

  return (
    getSelectedEvents()
      .length *
    FEE_PER_EVENT
  );
}

function updateTotals() {

  const selected =
    getSelectedEvents();

  $("eventCount")
    .textContent =
      selected.length;

  $("totalAmount")
    .textContent =
      `₹${calculateTotal()}`;
}

eventCheckboxes.forEach(
  cb =>
    cb.addEventListener(
      "change",
      updateTotals
    )
);

$("toPayment").addEventListener(
  "click",
  () => {

    const selected =
      getSelectedEvents();

    if (!selected.length) {

      showToast(
        "Select at least one event."
      );

      return;
    }

    $("summaryName")
      .textContent =
        $("name")
          .value
          .trim() ||
        "Participant";

    $("summaryEvents")
      .textContent =
        `${selected.length} event${
          selected.length === 1
            ? ""
            : "s"
        }`;

    $("summaryAmount")
      .textContent =
        `₹${calculateTotal()}`;

    goToStage(3);
  }
);

$("backToEvents").addEventListener(
  "click",
  () => goToStage(2)
);

// ============================================================
// Payment screenshot
// ============================================================

const paymentScreenshot =
  $("paymentScreenshot");

const chooseScreenshot =
  $("chooseScreenshot");

const paymentFile =
  $("paymentFile");

const paymentFileName =
  $("paymentFileName");

const paymentFileMeta =
  $("paymentFileMeta");

const removePaymentFile =
  $("removePaymentFile");

const uploadStatus =
  $("uploadStatus");

const finishButton =
  $("finishButton");

const copyUpi =
  $("copyUpi");

let selectedPaymentFile =
  null;

chooseScreenshot.addEventListener(
  "click",
  () =>
    paymentScreenshot.click()
);

paymentScreenshot.addEventListener(
  "change",
  () => {

    const file =
      paymentScreenshot.files[0];

    if (!file) return;

    uploadStatus.textContent = "";

    if (
      !VALID_FILE_TYPES.includes(
        file.type
      )
    ) {

      paymentScreenshot.value =
        "";

      selectedPaymentFile =
        null;

      paymentFile.classList.add(
        "hidden"
      );

      finishButton.disabled =
        true;

      uploadStatus.textContent =
        "Please choose a JPG, PNG or PDF.";

      return;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {

      paymentScreenshot.value =
        "";

      selectedPaymentFile =
        null;

      paymentFile.classList.add(
        "hidden"
      );

      finishButton.disabled =
        true;

      uploadStatus.textContent =
        "The screenshot must be 5 MB or smaller.";

      return;
    }

    selectedPaymentFile =
      file;

    paymentFileName.textContent =
      file.name;

    paymentFileMeta.textContent =
      `${formatFileSize(file.size)} · Attached`;

    paymentFile.classList.remove(
      "hidden"
    );

    finishButton.disabled =
      false;

    uploadStatus.textContent =
      "Screenshot attached. It will be submitted with your registration.";
  }
);

removePaymentFile.addEventListener(
  "click",
  () => {

    paymentScreenshot.value =
      "";

    selectedPaymentFile =
      null;

    paymentFile.classList.add(
      "hidden"
    );

    finishButton.disabled =
      true;

    uploadStatus.textContent =
      "";
  }
);

copyUpi.addEventListener(
  "click",
  async () => {

    const upiId =
      $("upiId")
        .textContent
        .trim();

    try {

      await navigator.clipboard
        .writeText(upiId);

      copyUpi.textContent =
        "Copied";

      setTimeout(
        () =>
          copyUpi.textContent =
            "Copy",
        1400
      );

    } catch {

      showToast(
        upiId
      );
    }
  }
);

// ============================================================
// Files
// ============================================================

function fileToDataUrl(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();

      reader.onload = () =>
        resolve(
          reader.result
        );

      reader.onerror = () =>
        reject(
          new Error(
            `Could not read ${file.name}.`
          )
        );

      reader.readAsDataURL(file);
    }
  );
}

// ============================================================
// Cross-origin submission
//
// IMPORTANT:
// We do NOT try to read the POST response.
//
// Firefox/Apps Script can follow Google's ContentService
// redirects through googleusercontent.com, and an invisible
// iframe + postMessage response can surface a network error.
//
// Instead:
// 1. POST the registration with fetch(mode:"no-cors")
// 2. Give the request a random submission token
// 3. Poll Apps Script using a JSONP GET for that token
//
// The JSONP response contains only the status/registration ID
// for the unguessable token.
// ============================================================

function generateSubmissionToken() {

  const bytes =
    new Uint8Array(24);

  crypto.getRandomValues(
    bytes
  );

  return Array
    .from(bytes)
    .map(
      byte =>
        byte.toString(16)
          .padStart(2, "0")
    )
    .join("");
}

async function submitRegistration() {

  if (
    !validateStage1()
  ) {

    goToStage(1);

    return;
  }

  const events =
    getSelectedEvents();

  if (!events.length) {

    goToStage(2);

    showToast(
      "Select at least one event."
    );

    return;
  }

  if (!selectedPaymentFile) {

    showToast(
      "Please attach your payment screenshot."
    );

    return;
  }

  const dobProofFile =
    dobProof.files[0];

  const paymentFile =
    selectedPaymentFile;

  const submissionToken =
    generateSubmissionToken();

  setSubmitting(true);

  try {

    uploadStatus.textContent =
      "Preparing your documents…";

    const [
      dobProofData,
      paymentScreenshotData
    ] = await Promise.all([

      fileToDataUrl(
        dobProofFile
      ),

      fileToDataUrl(
        paymentFile
      )
    ]);

    uploadStatus.textContent =
      "Submitting registration…";

    const body =
      new URLSearchParams();

    body.set(
      "name",
      $("name")
        .value
        .trim()
    );

    body.set(
      "dob",
      $("dob").value
    );

    body.set(
      "gender",
      $("gender").value
    );

    body.set(
      "whatsapp",
      $("whatsapp")
        .value
        .replace(/\D/g, "")
    );

    body.set(
      "events",
      JSON.stringify(events)
    );

    body.set(
      "paymentReference",
      $("paymentReference")
        .value
        .trim()
    );

    body.set(
      "dobProofBase64",
      dobProofData
    );

    body.set(
      "dobProofMimeType",
      dobProofFile.type
    );

    body.set(
      "paymentScreenshotBase64",
      paymentScreenshotData
    );

    body.set(
      "paymentScreenshotMimeType",
      paymentFile.type
    );

    body.set(
      "clientSource",
      "gitlab-pages"
    );

    body.set(
      "submissionToken",
      submissionToken
    );

    // We use no-cors deliberately.
    // The POST is allowed to leave the page, but its response
    // is intentionally opaque. We use JSONP polling below.
    await fetch(
      APPS_SCRIPT_URL,
      {
        method: "POST",
        mode: "no-cors",
        body
      }
    );

    uploadStatus.textContent =
      "Registration sent. Waiting for confirmation…";

    const result =
      await pollSubmissionStatus(
        submissionToken
      );

    if (!result.success) {

      throw new Error(
        result.message ||
        "Registration could not be completed."
      );
    }

    showSuccess(
      result.registrationId,
      events,
      result.totalFee ??
        calculateTotal()
    );

  } catch (error) {

    console.error(
      "Swimming registration:",
      error
    );

    showSubmissionError(
      error.message ||
      "Something went wrong. Please try again."
    );

  } finally {

    setSubmitting(false);
  }
}

// ============================================================
// JSONP status polling
// ============================================================

function pollSubmissionStatus(
  token
) {

  return new Promise(
    (resolve, reject) => {

      const callbackName =
        `__swimStatus_${Date.now()}_${Math.floor(
          Math.random() * 100000
        )}`;

      let attempts = 0;

      const maxAttempts =
        90;

      let script = null;

      const timeout =
        setInterval(
          () => {

            attempts += 1;

            if (
              attempts >
              maxAttempts
            ) {

              cleanup();

              reject(
                new Error(
                  "The registration server did not confirm the submission within 90 seconds. Please check the Nashik Swims sheet before trying again."
                )
              );

              return;
            }

            requestStatus();

          },
          1000
        );

      window[callbackName] =
        result => {

          if (
            !result ||
            !result.status
          ) {
            return;
          }

          if (
            result.status ===
            "pending"
          ) {
            return;
          }

          cleanup();

          if (
            result.status ===
            "success"
          ) {

            resolve({
              success: true,
              registrationId:
                result.registrationId,
              totalFee:
                result.totalFee
            });

          } else {

            resolve({
              success: false,
              message:
                result.message ||
                "Registration failed."
            });
          }
        };

      function requestStatus() {

        script =
          document.createElement(
            "script"
          );

        script.src =
          APPS_SCRIPT_URL +
          "?callback=" +
          encodeURIComponent(
            callbackName
          ) +
          "&token=" +
          encodeURIComponent(
            token
          ) +
          "&_=" +
          Date.now();

        script.async = true;

        script.onerror =
          () => {
            // A transient JSONP load error is ignored.
            // The next poll will try again.
          };

        document.body.appendChild(
          script
        );
      }

      function cleanup() {

        clearInterval(
          timeout
        );

        try {
          delete window[
            callbackName
          ];
        } catch {}

        if (
          script &&
          script.parentNode
        ) {
          script.parentNode
            .removeChild(script);
        }
      }

      // First request immediately.
      requestStatus();
    }
  );
}

// ============================================================
// UI states
// ============================================================

function setSubmitting(
  submitting
) {

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

  } else {

    finishButton.innerHTML =
      `Submit registration <span>→</span>`;
  }

  chooseScreenshot.disabled =
    submitting;

  removePaymentFile.disabled =
    submitting;

  $("backToEvents").disabled =
    submitting;
}

function showSubmissionError(
  message
) {

  uploadStatus.textContent =
    message;

  showToast(
    message
  );
}

function showSuccess(
  registrationId,
  events,
  total
) {

  $("successRegistrationId")
    .textContent =
      registrationId;

  $("successName")
    .textContent =
      $("name")
        .value
        .trim();

  $("successEvents")
    .textContent =
      `${events.length} event${
        events.length === 1
          ? ""
          : "s"
      }`;

  $("successAmount")
    .textContent =
      `₹${total}`;

  $("registrationForm")
    .classList.add(
      "hidden"
    );

  $("successState")
    .classList.remove(
      "hidden"
    );

  steps.forEach(
    step => {

      step.classList.add(
        "complete"
      );

      step.classList.remove(
        "active"
      );
    }
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function showToast(
  message
) {

  const toast =
    $("toast");

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  setTimeout(
    () =>
      toast.classList.remove(
        "show"
      ),
    2500
  );
}

function formatFileSize(
  bytes
) {

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${Math.round(
      bytes / 1024
    )} KB`;
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
