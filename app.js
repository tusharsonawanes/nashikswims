const $ = (id) => document.getElementById(id);

const themeToggle = $("themeToggle");
const themeIcon = $("themeIcon");
const themeText = $("themeText");
const root = document.documentElement;

const savedTheme = localStorage.getItem("swim-theme");
const preferredDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(savedTheme || (preferredDark ? "dark" : "light"));

function setTheme(theme) {
  root.dataset.theme = theme;
  const dark = theme === "dark";
  themeIcon.textContent = dark ? "☾" : "☀︎";
  themeText.textContent = dark ? "Dark" : "Light";
  document.querySelector('meta[name="theme-color"]').setAttribute("content", dark ? "#07111f" : "#f4f7fb");
}

themeToggle.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  setTheme(next);
  localStorage.setItem("swim-theme", next);
});

const stages = [1, 2, 3].map(n => $("stage" + n));
const steps = [...document.querySelectorAll(".step")];
const stepLines = [...document.querySelectorAll(".step-line")];

function goToStage(number) {
  stages.forEach((stage) => stage.classList.toggle("active", Number(stage.dataset.stage) === number));
  steps.forEach((step) => {
    const n = Number(step.dataset.step);
    step.classList.toggle("active", n === number);
    step.classList.toggle("complete", n < number);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearErrors() {
  document.querySelectorAll(".field-error").forEach(el => el.textContent = "");
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

  if (whatsapp.length !== 10 || !/^[6-9]\d{9}$/.test(whatsapp)) {
    setError("whatsappError", "Please enter a valid 10-digit WhatsApp number.");
    valid = false;
  }

  return valid;
}

const dobProof = $("dobProof");
const uploadButton = $("uploadButton");
const uploadCard = $("uploadCard");
const fileChip = $("fileChip");
const fileName = $("fileName");
const removeFile = $("removeFile");

uploadButton.addEventListener("click", () => dobProof.click());

uploadCard.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadCard.style.borderColor = "var(--primary)";
});

uploadCard.addEventListener("dragleave", () => {
  uploadCard.style.borderColor = "var(--border-strong)";
});

uploadCard.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadCard.style.borderColor = "var(--border-strong)";
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    dobProof.files = e.dataTransfer.files;
    handleFile();
  }
});

dobProof.addEventListener("change", handleFile);

function handleFile() {
  const file = dobProof.files[0];
  if (!file) return;

  clearErrors();

  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  const max = 5 * 1024 * 1024;

  if (!allowed.includes(file.type)) {
    dobProof.value = "";
    setError("dobProofError", "Use JPG, PNG or PDF.");
    fileChip.classList.add("hidden");
    return;
  }

  if (file.size > max) {
    dobProof.value = "";
    setError("dobProofError", "File must be 5 MB or smaller.");
    fileChip.classList.add("hidden");
    return;
  }

  fileName.textContent = file.name;
  fileChip.classList.remove("hidden");
}

removeFile.addEventListener("click", () => {
  dobProof.value = "";
  fileChip.classList.add("hidden");
  fileName.textContent = "";
});

$("whatsapp").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
});

$("toEvents").addEventListener("click", () => {
  if (validateStage1()) {
    goToStage(2);
  } else {
    const firstError = document.querySelector(".field-error:not(:empty)");
    if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

$("backToDetails").addEventListener("click", () => goToStage(1));

const eventCheckboxes = [...document.querySelectorAll(".event-checkbox")];
const FEE_PER_EVENT = 200;

function updateTotals() {
  const selected = eventCheckboxes.filter(cb => cb.checked);
  $("eventCount").textContent = selected.length;
  $("totalAmount").textContent = `₹${selected.length * FEE_PER_EVENT}`;
}

eventCheckboxes.forEach(cb => cb.addEventListener("change", updateTotals));

$("toPayment").addEventListener("click", () => {
  const selected = eventCheckboxes.filter(cb => cb.checked);

  if (!selected.length) {
    showToast("Select at least one event.");
    return;
  }

  $("summaryName").textContent = $("name").value.trim() || "Participant";
  $("summaryEvents").textContent = `${selected.length} event${selected.length === 1 ? "" : "s"}`;
  $("summaryAmount").textContent = `₹${selected.length * FEE_PER_EVENT}`;
  goToStage(3);
});

$("backToEvents").addEventListener("click", () => goToStage(2));

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

updateTotals();

// Payment-stage interactions
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

chooseScreenshot.addEventListener("click", () => paymentScreenshot.click());

paymentScreenshot.addEventListener("change", () => {
  const file = paymentScreenshot.files[0];
  if (!file) return;

  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  const max = 5 * 1024 * 1024;

  uploadStatus.textContent = "";

  if (!allowed.includes(file.type)) {
    paymentScreenshot.value = "";
    selectedPaymentFile = null;
    paymentFile.classList.add("hidden");
    uploadStatus.textContent = "Please choose a JPG, PNG or PDF.";
    return;
  }

  if (file.size > max) {
    paymentScreenshot.value = "";
    selectedPaymentFile = null;
    paymentFile.classList.add("hidden");
    uploadStatus.textContent = "The screenshot must be 5 MB or smaller.";
    return;
  }

  selectedPaymentFile = file;
  paymentFileName.textContent = file.name;
  paymentFileMeta.textContent = `${formatFileSize(file.size)} · Ready to send`;
  paymentFile.classList.remove("hidden");
  finishButton.disabled = false;
  uploadStatus.textContent = "Screenshot attached. It will be submitted with your registration.";
});

removePaymentFile.addEventListener("click", () => {
  paymentScreenshot.value = "";
  selectedPaymentFile = null;
  paymentFile.classList.add("hidden");
  sendScreenshot.disabled = true;
  finishButton.disabled = true;
  uploadStatus.textContent = "";
});

copyUpi.addEventListener("click", async () => {
  const upiId = $("upiId").textContent.trim();

  try {
    await navigator.clipboard.writeText(upiId);
    copyUpi.textContent = "Copied";
    setTimeout(() => copyUpi.textContent = "Copy", 1400);
  } catch {
    showToast(upiId);
  }
});

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
