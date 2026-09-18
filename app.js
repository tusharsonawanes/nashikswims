const $ = (id) => document.getElementById(id);

// ============================================================
// Swimming Challenge configuration
// ============================================================

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzk2k9SDkVzxMKXSM6_OrwF_jWiCHO7Ka5JO_az-qibQ7tTNYUCYCLHG5lhm3Y3wZOV/exec";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const VALID_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf"
];

const COMPETITIONS = {
  "swimming-challenge-2026": {
    name: "Swimming Challenge 2026",
    feePerEvent: 200,
    events: [
      {
        id: "50m-freestyle",
        name: "50m Freestyle",
        stroke: "Freestyle",
        order: 1
      },
      {
        id: "50m-backstroke",
        name: "50m Backstroke",
        stroke: "Backstroke",
        order: 2
      },
      {
        id: "50m-breaststroke",
        name: "50m Breaststroke",
        stroke: "Breaststroke",
        order: 3
      },
      {
        id: "50m-butterfly",
        name: "50m Butterfly",
        stroke: "Butterfly",
        order: 4
      }
    ]
  }

  // Future competition example:
  //
  // "winter-swim-2027": {
  //   name: "Winter Swim 2027",
  //   feePerEvent: 250,
  //   events: [...]
  // }
};

const ACTIVE_COMPETITION_ID =
  "swimming-challenge-2026";

const ACTIVE_COMPETITION =
  COMPETITIONS[
    ACTIVE_COMPETITION_ID
  ];

// ============================================================
// Theme
// ============================================================

const themeToggle = $("themeToggle");
const themeIcon = $("themeIcon");
const themeText = $("themeText");
const root = document.documentElement;

const savedTheme =
  localStorage.getItem(
    "swim-theme"
  );

const preferredDark =
  window.matchMedia &&
  window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

setTheme(
  savedTheme ||
  (preferredDark
    ? "dark"
    : "light")
);

function setTheme(theme) {

  root.dataset.theme =
    theme;

  const dark =
    theme === "dark";

  themeIcon.textContent =
    dark ? "☾" : "☀︎";

  themeText.textContent =
    dark ? "Dark" : "Light";

  document
    .querySelector(
      'meta[name="theme-color"]'
    )
    .setAttribute(
      "content",
      dark
        ? "#07111f"
        : "#f4f7fb"
    );
}

themeToggle.addEventListener(
  "click",
  () => {

    const next =
      root.dataset.theme ===
      "dark"
        ? "light"
        : "dark";

    setTheme(next);

    localStorage.setItem(
      "swim-theme",
      next
    );
  }
);

// ============================================================
// Stage navigation
// ============================================================

const stages =
  [1, 2, 3].map(
    n =>
      $("stage" + n)
  );

const steps = [
  ...document.querySelectorAll(
    ".step"
  )
];

function goToStage(number) {

  stages.forEach(stage => {

    stage.classList.toggle(
      "active",
      Number(
        stage.dataset.stage
      ) === number
    );
  });

  steps.forEach(step => {

    const n =
      Number(
        step.dataset.step
      );

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
    .querySelectorAll(
      ".field-error"
    )
    .forEach(
      el =>
        el.textContent = ""
    );
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
    $("name")
      .value
      .trim();

  const dob =
    $("dob").value;

  const gender =
    $("gender").value;

  const whatsapp =
    $("whatsapp")
      .value
      .replace(
        /\D/g,
        ""
      );

  const file =
    $("dobProof")
      .files[0];

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

    if (
      selectedDate >
      today
    ) {

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
// DOB proof
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

    dobProof.value =
      "";

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

    dobProof.value =
      "";

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

    dobProof.value =
      "";

    fileChip.classList.add(
      "hidden"
    );

    fileName.textContent =
      "";

    $("dobProofError")
      .textContent =
      "";
  }
);

$("whatsapp").addEventListener(
  "input",
  e => {

    e.target.value =
      e.target.value
        .replace(/\D/g, "")
        .slice(
          0,
          10
        );
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

      firstError.scrollIntoView(
        {
          behavior: "smooth",
          block: "center"
        }
      );
    }
  }
);

$("backToDetails").addEventListener(
  "click",
  () =>
    goToStage(1)
);

// ============================================================
// Events + fee
// ============================================================

const eventList =
  $("eventList");

function renderEvents() {

  eventList.innerHTML =
    "";

  ACTIVE_COMPETITION
    .events
    .forEach(
      event => {

        const label =
          document.createElement(
            "label"
          );

        label.className =
          "event-row";

        label.innerHTML = `
          <input
            class="event-checkbox"
            type="checkbox"
            name="events"
            value="${escapeHtml(event.id)}"
          />
          <span class="custom-checkbox"></span>
          <span class="event-copy">
            <strong>${escapeHtml(event.name)}</strong>
            <small>${escapeHtml(event.stroke)}</small>
          </span>
          <span class="event-fee">₹${ACTIVE_COMPETITION.feePerEvent}</span>
        `;

        eventList.appendChild(
          label
        );
      }
    );

  document
    .querySelectorAll(
      ".event-checkbox"
    )
    .forEach(
      checkbox =>
        checkbox.addEventListener(
          "change",
          updateTotals
        )
    );
}

function escapeHtml(value) {

  return String(
    value
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}

function getSelectedEventIds() {

  return [
    ...document.querySelectorAll(
      ".event-checkbox:checked"
    )
  ].map(
    checkbox =>
      checkbox.value
  );
}

function calculateTotal() {

  return (
    getSelectedEventIds()
      .length *
    ACTIVE_COMPETITION
      .feePerEvent
  );
}

function updateTotals() {

  const selected =
    getSelectedEventIds();

  $("eventCount")
    .textContent =
      selected.length;

  $("totalAmount")
    .textContent =
      `₹${calculateTotal()}`;
}

$("competitionDescription")
  .textContent =
    `Every selected event costs ₹${ACTIVE_COMPETITION.feePerEvent}.`;

$("toPayment").addEventListener(
  "click",
  () => {

    const selected =
      getSelectedEventIds();

    if (
      !selected.length
    ) {

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
  () =>
    goToStage(2)
);

renderEvents();
updateTotals();

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
      paymentScreenshot
        .files[0];

    if (!file) return;

    uploadStatus.textContent =
      "";

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
        .writeText(
          upiId
        );

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

function fileToDataUrl(
  file
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const reader =
        new FileReader();

      reader.onload =
        () =>
          resolve(
            reader.result
          );

      reader.onerror =
        () =>
          reject(
            new Error(
              `Could not read ${file.name}.`
            )
          );

      reader.readAsDataURL(
        file
      );
    }
  );
}

// ============================================================
// Submit
//
// Registration number is now generated by Apps Script.
// The browser submits with no-cors and then polls a tiny,
// read-only JSONP status endpoint using an unguessable token.
//
// This works because the Apps Script deployment has been
// confirmed accessible anonymously in a private window.
// ============================================================

function generateSubmissionToken() {

  const bytes =
    new Uint8Array(
      24
    );

  crypto.getRandomValues(
    bytes
  );

  return Array
    .from(bytes)
    .map(
      byte =>
        byte
          .toString(16)
          .padStart(
            2,
            "0"
          )
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

  const eventIds =
    getSelectedEventIds();

  if (!eventIds.length) {

    goToStage(2);

    showToast(
      "Select at least one event."
    );

    return;
  }

  if (
    !selectedPaymentFile
  ) {

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
        .replace(
          /\D/g,
          ""
        )
    );

    body.set(
      "competitionId",
      ACTIVE_COMPETITION_ID
    );

    body.set(
      "events",
      JSON.stringify(
        eventIds
      )
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

    // Deliberately opaque. We don't attempt to read the POST response.
    await fetch(
      APPS_SCRIPT_URL,
      {
        method: "POST",
        mode: "no-cors",
        body
      }
    );

    uploadStatus.textContent =
      "Registration sent. Confirming your registration number…";

    const result =
      await pollSubmissionStatus(
        submissionToken
      );

    if (
      result.status !==
      "success"
    ) {

      throw new Error(
        result.message ||
        "Registration could not be completed."
      );
    }

    showSuccess(
      result.registrationNo,
      eventIds,
      result.totalFee
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

    setSubmitting(
      false
    );
  }
}

// ============================================================
// JSONP status polling
// ============================================================

function pollSubmissionStatus(
  token
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const callbackName =
        `__swimStatus_${Date.now()}_${Math.floor(
          Math.random() *
          100000
        )}`;

      let attempts =
        0;

      const maxAttempts =
        90;

      let pollTimer =
        null;

      let script =
        null;

      function cleanup() {

        if (
          pollTimer
        ) {

          clearInterval(
            pollTimer
          );

          pollTimer =
            null;
        }

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
            .removeChild(
              script
            );
        }
      }

      function requestStatus() {

        script =
          document.createElement(
            "script"
          );

        script.async =
          true;

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

        script.onerror =
          () => {
            // The next poll retries.
          };

        document.body.appendChild(
          script
        );
      }

      window[
        callbackName
      ] =
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

          resolve(
            result
          );
        };

      pollTimer =
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

  if (
    submitting
  ) {

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

  $("backToEvents")
    .disabled =
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
  registrationNo,
  eventIds,
  total
) {

  $("successRegistrationId")
    .textContent =
      registrationNo;

  $("successName")
    .textContent =
      $("name")
        .value
        .trim();

  $("successEvents")
    .textContent =
      `${eventIds.length} event${
        eventIds.length === 1
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

  if (
    bytes <
    1024
  ) {

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
  ).toFixed(
    1
  )} MB`;
}

finishButton.addEventListener(
  "click",
  submitRegistration
);
