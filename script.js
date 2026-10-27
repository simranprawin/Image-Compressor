const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const workspace = document.getElementById("workspace");
const resultSection = document.getElementById(
  "resultSection"
);

const imagePreview = document.getElementById(
  "imagePreview"
);

const fileNameElement = document.getElementById(
  "fileName"
);

const originalSizeElement = document.getElementById(
  "originalSize"
);

const qualityRange = document.getElementById(
  "qualityRange"
);

const qualityValue = document.getElementById(
  "qualityValue"
);

const formatSelect = document.getElementById(
  "formatSelect"
);

const compressButton = document.getElementById(
  "compressButton"
);

const resetButton = document.getElementById(
  "resetButton"
);

const errorMessage = document.getElementById(
  "errorMessage"
);

const resultOriginalSize = document.getElementById(
  "resultOriginalSize"
);

const compressedSize = document.getElementById(
  "compressedSize"
);

const savedSize = document.getElementById("savedSize");

const compressionPercentage = document.getElementById(
  "compressionPercentage"
);

const downloadButton = document.getElementById(
  "downloadButton"
);

const themeButton = document.getElementById(
  "themeButton"
);

const toast = document.getElementById("toast");

let selectedFile = null;
let imageObjectUrl = null;
let compressedObjectUrl = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = "";
}

function formatFileSize(bytes) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB"];
  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  const size = bytes / Math.pow(1024, index);

  return `${size.toFixed(index === 0 ? 0 : 2)} ${
    units[index]
  }`;
}

function isValidImage(file) {
  const validTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  return validTypes.includes(file.type);
}

function handleFile(file) {
  clearError();
  resultSection.classList.add("hidden");

  if (!file) {
    return;
  }

  if (!isValidImage(file)) {
    showError(
      "Please choose a JPG, PNG, or WebP image."
    );

    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showError("Image size must be smaller than 10 MB.");
    return;
  }

  selectedFile = file;

  if (imageObjectUrl) {
    URL.revokeObjectURL(imageObjectUrl);
  }

  imageObjectUrl = URL.createObjectURL(file);

  imagePreview.src = imageObjectUrl;
  fileNameElement.textContent = file.name;
  originalSizeElement.textContent = formatFileSize(
    file.size
  );

  workspace.classList.remove("hidden");

  showToast("Image loaded successfully");
}

function compressImage() {
  if (!selectedFile) {
    showError("Please choose an image first.");
    return;
  }

  const image = new Image();

  image.onload = () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    const maxWidth = 1600;
    const maxHeight = 1600;

    let width = image.width;
    let height = image.height;

    if (width > maxWidth || height > maxHeight) {
      const scale = Math.min(
        maxWidth / width,
        maxHeight / height
      );

      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    canvas.width = width;
    canvas.height = height;

    context.drawImage(image, 0, 0, width, height);

    const quality = Number(qualityRange.value) / 100;
    const outputFormat = formatSelect.value;

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          showError("Unable to compress this image.");
          return;
        }

        if (compressedObjectUrl) {
          URL.revokeObjectURL(compressedObjectUrl);
        }

        compressedObjectUrl = URL.createObjectURL(blob);

        const originalBytes = selectedFile.size;
        const compressedBytes = blob.size;
        const savedBytes = Math.max(
          originalBytes - compressedBytes,
          0
        );

        const percentage =
          originalBytes > 0
            ? Math.round(
                (savedBytes / originalBytes) * 100
              )
            : 0;

        resultOriginalSize.textContent =
          formatFileSize(originalBytes);

        compressedSize.textContent =
          formatFileSize(compressedBytes);

        savedSize.textContent =
          formatFileSize(savedBytes);

        compressionPercentage.textContent =
          `${percentage}% smaller`;

        downloadButton.href = compressedObjectUrl;
        downloadButton.download =
          `compressed-${getFileName(
            selectedFile.name,
            outputFormat
          )}`;

        resultSection.classList.remove("hidden");

        showToast("Image compressed successfully");
      },
      outputFormat,
      quality
    );
  };

  image.onerror = () => {
    showError("Unable to read this image.");
  };

  image.src = URL.createObjectURL(selectedFile);
}

function getFileName(originalName, outputFormat) {
  const originalBaseName = originalName
    .split(".")
    .slice(0, -1)
    .join(".") || "image";

  const extension =
    outputFormat === "image/png"
      ? "png"
      : outputFormat === "image/webp"
      ? "webp"
      : "jpg";

  return `${originalBaseName}.${extension}`;
}

function resetCompressor() {
  selectedFile = null;

  if (imageObjectUrl) {
    URL.revokeObjectURL(imageObjectUrl);
    imageObjectUrl = null;
  }

  if (compressedObjectUrl) {
    URL.revokeObjectURL(compressedObjectUrl);
    compressedObjectUrl = null;
  }

  fileInput.value = "";
  imagePreview.src = "";
  fileNameElement.textContent = "-";
  originalSizeElement.textContent = "-";

  workspace.classList.add("hidden");
  resultSection.classList.add("hidden");

  clearError();
  showToast("Compressor reset");
}

function loadTheme() {
  const savedTheme = localStorage.getItem(
    "imageCompressorTheme"
  );

  if (savedTheme === "dark") {
    document.body.setAttribute("data-theme", "dark");
    themeButton.textContent = "☀️";
  }
}

fileInput.addEventListener("change", () => {
  handleFile(fileInput.files[0]);
});

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("dragover");

  const file = event.dataTransfer.files[0];
  handleFile(file);
});

dropZone.addEventListener("click", (event) => {
  if (
    event.target.tagName !== "LABEL" &&
    event.target.tagName !== "INPUT"
  ) {
    fileInput.click();
  }
});

qualityRange.addEventListener("input", () => {
  qualityValue.textContent =
    `${qualityRange.value}%`;
});

compressButton.addEventListener(
  "click",
  compressImage
);

resetButton.addEventListener(
  "click",
  resetCompressor
);

themeButton.addEventListener("click", () => {
  const isDark =
    document.body.getAttribute("data-theme") === "dark";

  if (isDark) {
    document.body.removeAttribute("data-theme");
    themeButton.textContent = "🌙";

    localStorage.setItem(
      "imageCompressorTheme",
      "light"
    );
  } else {
    document.body.setAttribute("data-theme", "dark");
    themeButton.textContent = "☀️";

    localStorage.setItem(
      "imageCompressorTheme",
      "dark"
    );
  }
});

loadTheme();