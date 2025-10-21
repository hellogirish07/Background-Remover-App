let imageURL;
let originalImageURL;

// --- Enhanced Background Remove Function ---
function submitHandler() {
  const fileinput = document.getElementById("fileinput");
  const err = document.getElementById("err");
  const resultImg = document.getElementById("resultImg");
  const originalImg = document.getElementById("originalImg");
  const downloadBtn = document.getElementById("downloadBtn");
  const processBtn = document.getElementById("processBtn");
  const btnText = processBtn.querySelector(".btn-text");
  const btnLoading = processBtn.querySelector(".btn-loading");

  // Clear previous errors
  err.textContent = "";
  err.classList.add("hidden");

  if (fileinput.files.length === 0) {
    showError("⚠️ Please select an image first!");
    return;
  }

  const image = fileinput.files[0];
  
  // Show progress section and start progress
  showProgressSection();
  startProgress();
  
  // Set loading state
  setButtonLoading(processBtn, true);
  
  // Store original image for comparison
  const originalFileURL = URL.createObjectURL(image);
  originalImageURL = originalFileURL;
  originalImg.src = originalFileURL;

  const formData = new FormData();
  formData.append("image_file", image);
  formData.append("size", "auto");

  const apikey = "LqUoYWpWtj4xzC6E5r5pee2i";

  // Update progress to processing stage
  setTimeout(() => {
    updateProgress(50, "process");
  }, 1000);

  fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": apikey },
    body: formData,
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.blob();
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      imageURL = url;
      
      // Update progress to complete
      updateProgress(100, "complete");
      
      // Show results after a short delay
      setTimeout(() => {
        showResults();
        setButtonLoading(processBtn, false);
      }, 500);
    })
    .catch((error) => {
      console.error("Error:", error);
      showError("❌ Error processing image! Please check your internet connection and try again.");
      setButtonLoading(processBtn, false);
      hideProgressSection();
    });
}

// --- Download Function ---
function downloadfile() {
  const a = document.createElement("a");
  a.href = imageURL;
  a.download = "removed-bg.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// --- File Selection and Display ---
function setupFileHandling() {
  const fileInput = document.getElementById("fileinput");
  const uploadZone = document.getElementById("uploadZone");
  const selectedFile = document.getElementById("selectedFile");
  const processBtn = document.getElementById("processBtn");
  const uploadArea = document.querySelector(".upload-area");

  // File input change handler
  fileInput.addEventListener("change", handleFileSelect);

  // Upload zone click handler
  uploadZone.addEventListener("click", () => {
    fileInput.click();
  });

  // Drag and drop handlers
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });

  uploadArea.addEventListener("dragleave", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      fileInput.files = files;
      handleFileSelect();
    }
  });
}

function handleFileSelect() {
  const fileInput = document.getElementById("fileinput");
  const selectedFile = document.getElementById("selectedFile");
  const processBtn = document.getElementById("processBtn");
  const uploadZone = document.getElementById("uploadZone");

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    
    // Show selected file info
    const fileName = selectedFile.querySelector(".file-name");
    const fileSize = selectedFile.querySelector(".file-size");
    
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    // Show selected file section and process button
    uploadZone.classList.add("hidden");
    selectedFile.classList.remove("hidden");
    processBtn.classList.remove("hidden");
  }
}

function clearSelection() {
  const fileInput = document.getElementById("fileinput");
  const selectedFile = document.getElementById("selectedFile");
  const processBtn = document.getElementById("processBtn");
  const uploadZone = document.getElementById("uploadZone");
  const err = document.getElementById("err");

  // Reset file input
  fileInput.value = "";
  
  // Hide selected file and process button
  selectedFile.classList.add("hidden");
  processBtn.classList.add("hidden");
  uploadZone.classList.remove("hidden");
  
  // Hide any error messages
  err.classList.add("hidden");
  
  // Hide results and progress sections
  hideProgressSection();
  hideResultsSection();
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// --- Progress Management ---
function showProgressSection() {
  const progressSection = document.getElementById("progressSection");
  progressSection.classList.remove("hidden");
}

function hideProgressSection() {
  const progressSection = document.getElementById("progressSection");
  progressSection.classList.add("hidden");
}

function startProgress() {
  const progressFill = document.getElementById("progressFill");
  const steps = document.querySelectorAll(".step");
  
  // Reset progress
  progressFill.style.width = "0%";
  
  // Reset all steps
  steps.forEach(step => {
    step.classList.remove("active", "completed");
  });
  
  // Activate first step
  const uploadStep = document.querySelector('[data-step="upload"]');
  uploadStep.classList.add("active");
  
  // Start progress animation
  setTimeout(() => {
    updateProgress(25, "upload");
  }, 500);
}

function updateProgress(percentage, currentStep) {
  const progressFill = document.getElementById("progressFill");
  const steps = document.querySelectorAll(".step");
  
  // Update progress bar
  progressFill.style.width = percentage + "%";
  
  // Update step states
  steps.forEach(step => {
    const stepName = step.getAttribute("data-step");
    step.classList.remove("active");
    
    if (stepName === currentStep) {
      step.classList.add("active");
    } else if (isStepCompleted(stepName, currentStep)) {
      step.classList.add("completed");
    }
  });
}

function isStepCompleted(stepName, currentStep) {
  const stepOrder = ["upload", "process", "complete"];
  const currentIndex = stepOrder.indexOf(currentStep);
  const stepIndex = stepOrder.indexOf(stepName);
  return stepIndex < currentIndex;
}

// --- Results Management ---
function showResults() {
  const resultsSection = document.getElementById("resultsSection");
  const resultImg = document.getElementById("resultImg");
  
  // Set the processed image
  resultImg.src = imageURL;
  
  // Show results section
  resultsSection.classList.remove("hidden");
  
  // Hide progress section
  hideProgressSection();
}

function hideResultsSection() {
  const resultsSection = document.getElementById("resultsSection");
  resultsSection.classList.add("hidden");
}

// --- Utility Functions ---
function setButtonLoading(button, loading) {
  const btnText = button.querySelector(".btn-text");
  const btnLoading = button.querySelector(".btn-loading");
  
  if (loading) {
    button.disabled = true;
    btnText.classList.add("hidden");
    btnLoading.classList.remove("hidden");
  } else {
    button.disabled = false;
    btnText.classList.remove("hidden");
    btnLoading.classList.add("hidden");
  }
}

function showError(message) {
  const err = document.getElementById("err");
  err.textContent = message;
  err.classList.remove("hidden");
}

function resetRemover() {
  clearSelection();
  
  // Reset all sections
  hideProgressSection();
  hideResultsSection();
  
  // Clear image URLs
  if (originalImageURL) {
    URL.revokeObjectURL(originalImageURL);
    originalImageURL = null;
  }
  
  if (imageURL) {
    URL.revokeObjectURL(imageURL);
    imageURL = null;
  }
}

// --- Show BG Remover Section ---
function showApp() {
  const app = document.getElementById("removerApp");
  app.classList.remove("hidden");
  setTimeout(() => app.classList.add("show"), 50); // fade in
  app.scrollIntoView({ behavior: "smooth" });
}

// --- Dark/Light Mode Toggle ---
function toggleMode() {
  const body = document.body;
  const toggleBtn = document.getElementById("modeToggle");

  body.classList.toggle("light-mode");
  body.classList.toggle("dark-mode");

  toggleBtn.textContent = body.classList.contains("light-mode") ? "☀️" : "🌙";
}

// --- Mobile menu behavior ---
(function setupMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (!menuToggle || !navLinks) return;

  // Create mobile menu container and move a clone of nav links into it
  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'mobile-menu';
  mobileMenu.setAttribute('id', 'mobileMenu');

  // clone child nodes (links and buttons) into mobile menu
  Array.from(navLinks.children).forEach(node => {
    mobileMenu.appendChild(node.cloneNode(true));
  });

  document.body.appendChild(mobileMenu);

  function closeMenu() {
    mobileMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  function openMenu() {
    mobileMenu.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
  }

  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (mobileMenu.classList.contains('open')) closeMenu(); else openMenu();
  });

  // close when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && e.target !== menuToggle) closeMenu();
  });

  // close when selecting a link inside menu
  mobileMenu.addEventListener('click', (e) => {
    const target = e.target;
    if (target.tagName.toLowerCase() === 'a' || target.classList.contains('btn')) {
      closeMenu();
    }
  });
})();

// --- Contact Form Handling ---
(function setupContactForm() {
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const btnText = document.querySelector('.btn-text');
  const btnLoading = document.querySelector('.btn-loading');
  const submitBtn = contactForm?.querySelector('button[type="submit"]');

  if (!contactForm) return;

  // Form validation
  function validateForm() {
    const name = contactForm.querySelector('#name');
    const email = contactForm.querySelector('#client_email');
    const subject = contactForm.querySelector('#subject');
    const message = contactForm.querySelector('#message');

    let isValid = true;
    const errors = [];

    // Clear previous errors
    clearFieldErrors();

    // Name validation
    if (!name.value.trim()) {
      showFieldError(name, 'Name is required');
      isValid = false;
    }

    // Email validation
    if (!email.value.trim()) {
      showFieldError(email, 'Email is required');
      isValid = false;
    } else if (!isValidEmail(email.value)) {
      showFieldError(email, 'Please enter a valid email address');
      isValid = false;
    }

    // Subject validation
    if (!subject.value.trim()) {
      showFieldError(subject, 'Subject is required');
      isValid = false;
    }

    // Message validation
    if (!message.value.trim()) {
      showFieldError(message, 'Message is required');
      isValid = false;
    } else if (message.value.trim().length < 10) {
      showFieldError(message, 'Message must be at least 10 characters long');
      isValid = false;
    }

    return isValid;
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function showFieldError(field, message) {
    field.style.borderColor = '#ef4444';
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ef4444';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '5px';
    
    field.parentNode.appendChild(errorDiv);
  }

  function clearFieldErrors() {
    const errorElements = contactForm.querySelectorAll('.field-error');
    errorElements.forEach(error => error.remove());
    
    const fields = contactForm.querySelectorAll('input, textarea');
    fields.forEach(field => {
      field.style.borderColor = '';
    });
  }

  function showFormStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
    formStatus.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      formStatus.classList.add('hidden');
    }, 5000);
  }

  function setLoadingState(loading) {
    if (loading) {
      submitBtn.disabled = true;
      btnText.classList.add('hidden');
      btnLoading.classList.remove('hidden');
    } else {
      submitBtn.disabled = false;
      btnText.classList.remove('hidden');
      btnLoading.classList.add('hidden');
    }
  }

  // Form submission
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showFormStatus('Please fix the errors above and try again.', 'error');
      return;
    }

    setLoadingState(true);
    clearFieldErrors();

    try {
      const formData = new FormData(contactForm);
      
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showFormStatus('✅ Message sent successfully! We\'ll get back to you soon.', 'success');
          contactForm.reset();
        } else {
          showFormStatus('❌ Failed to send message. Please try again.', 'error');
        }
      } else {
        showFormStatus('❌ Network error. Please check your connection and try again.', 'error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showFormStatus('❌ Something went wrong. Please try again later.', 'error');
    } finally {
      setLoadingState(false);
    }
  });

  // Real-time validation on input
  const formFields = contactForm.querySelectorAll('input, textarea');
  formFields.forEach(field => {
    field.addEventListener('blur', () => {
      if (field.value.trim()) {
        field.style.borderColor = '#22c55e'; // Green for valid
      }
    });

    field.addEventListener('input', () => {
      if (field.style.borderColor === 'rgb(239, 68, 68)') { // Red for error
        field.style.borderColor = '';
      }
    });
  });
})();

// --- FAQ Accordion ---
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', function() {
      const item = btn.closest('.faq-item');
      if (item.classList.contains('open')) {
        item.classList.remove('open');
      } else {
        // Close others
        document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
        item.classList.add('open');
      }
    });
  });
});

// --- Initialize File Handling ---
(function initializeApp() {
  // Initialize file handling when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFileHandling);
  } else {
    setupFileHandling();
  }
})();

