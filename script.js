const fileInput = document.getElementById("logoUpload");
const colorPicker = document.getElementById("colorPicker");
const toggleGlow = document.getElementById("toggleGlow");
const enableColorReplace = document.getElementById("enableColorReplace");
const targetColorPicker = document.getElementById("targetColor");
const replacementColorPicker = document.getElementById("replacementColor");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const saveBtn = document.getElementById("saveBtn");

let img = new Image();
let glowColor = "#ffffff";
let pulse = 0;
let direction = 1;
let glowEnabled = true;
let colorReplaceEnabled = true;

img.crossOrigin = "anonymous";
// Default image (your link)
img.src = "https://raw.githubusercontent.com/trxpvoidz/assets-for-my-website/refs/heads/main/IMG_1867.jpeg?token=GHSAT0AAAAAADGWR4O3NYL5PKUPQ7DGXWEY2EQJAWQ";

img.onload = () => {
  canvas.width = img.width + 100;
  canvas.height = img.height + 100;
  animateGlow();
};

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

colorPicker.addEventListener("input", (e) => {
  glowColor = e.target.value;
});
toggleGlow.addEventListener("change", () => {
  glowEnabled = toggleGlow.checked;
});
enableColorReplace.addEventListener("change", () => {
  colorReplaceEnabled = enableColorReplace.checked;
  drawImageWithColorReplace();
});

targetColorPicker.addEventListener("input", () => {
  if (colorReplaceEnabled) drawImageWithColorReplace();
});
replacementColorPicker.addEventListener("input", () => {
  if (colorReplaceEnabled) drawImageWithColorReplace();
});

function hexToRgb(hex) {
  let bigint = parseInt(hex.slice(1), 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;
  return { r, g, b };
}

function colorDistance(c1, c2) {
  return Math.sqrt(
    (c1.r - c2.r) ** 2 +
      (c1.g - c2.g) ** 2 +
      (c1.b - c2.b) ** 2
  );
}

function animateGlow() {
  requestAnimationFrame(animateGlow);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (glowEnabled) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 30 + pulse;
  } else {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }

  drawImageWithColorReplace();

  if (glowEnabled) {
    pulse += direction;
    if (pulse > 20 || pulse < 0) direction *= -1;
  }
}

function drawImageWithColorReplace() {
  if (!colorReplaceEnabled) {
    // Just draw original image if disabled
    ctx.drawImage(img, 50, 50);
    return;
  }

  const offCanvas = document.createElement("canvas");
  const offCtx = offCanvas.getContext("2d");
  offCanvas.width = img.width;
  offCanvas.height = img.height;
  offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
  offCtx.drawImage(img, 0, 0);

  let imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
  let data = imageData.data;

  let targetRgb = hexToRgb(targetColorPicker.value);
  let replacementRgb = hexToRgb(replacementColorPicker.value);

  const threshold = 100;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    let a = data[i + 3];
    if (a === 0) continue;

    let dist = colorDistance({ r, g, b }, targetRgb);
    if (dist < threshold) {
      data[i] = replacementRgb.r;
      data[i + 1] = replacementRgb.g;
      data[i + 2] = replacementRgb.b;
    }
  }

  offCtx.putImageData(imageData, 0, 0);

  ctx.drawImage(offCanvas, 50, 50);
}

saveBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "styled-logo.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
