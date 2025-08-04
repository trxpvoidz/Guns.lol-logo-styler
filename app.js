const fileInput = document.getElementById("logoUpload");
const colorPicker = document.getElementById("colorPicker");
const glowSlider = document.getElementById("glowSize");
const toggleGlow = document.getElementById("toggleGlow");
const enableColorReplace = document.getElementById("enableColorReplace");
const targetColorPicker = document.getElementById("targetColor");
const replacementColorPicker = document.getElementById("replacementColor");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const saveBtn = document.getElementById("saveBtn");

const MAX_SIZE = 512;
canvas.width = MAX_SIZE;
canvas.height = MAX_SIZE;

let img = new Image();
let glowColor = "#ffffff";
let glowSize = 20;
let glowEnabled = true;
let colorReplaceEnabled = true;
let isGif = false;
let gifInstance = null;
let gifFrameCanvas = null;

img.crossOrigin = "anonymous";
img.src = "https://raw.githubusercontent.com/trxpvoidz/assets-for-my-website/refs/heads/main/IMG_1867.jpeg";

img.onload = () => {
  isGif = false;
  animateStatic();
};

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  isGif = file.type === "image/gif";
  const reader = new FileReader();
  reader.onload = () => {
    if (isGif) {
      gifler(reader.result).get(anim => {
        gifInstance = anim;
        gifFrameCanvas = document.createElement("canvas");
        gifFrameCanvas.width = anim.width;
        gifFrameCanvas.height = anim.height;
        anim.animate(gifFrameCanvas.getContext("2d"));
        animateGIF();
      });
    } else {
      const image = new Image();
      image.onload = () => {
        img = image;
        isGif = false;
        animateStatic();
      };
      image.src = reader.result;
    }
  };
  reader.readAsDataURL(file);
});

colorPicker.addEventListener("input", e => glowColor = e.target.value);
glowSlider.addEventListener("input", e => glowSize = parseInt(e.target.value));
toggleGlow.addEventListener("change", () => glowEnabled = toggleGlow.checked);
enableColorReplace.addEventListener("change", () => {
  colorReplaceEnabled = enableColorReplace.checked;
});

targetColorPicker.addEventListener("input", () => {});
replacementColorPicker.addEventListener("input", () => {});

function animateStatic() {
  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.shadowColor = glowEnabled ? glowColor : "transparent";
    ctx.shadowBlur = glowEnabled ? glowSize : 0;

    drawImageFittingWithGlow();
  }
  loop();
}

function animateGIF() {
  function loop() {
    requestAnimationFrame(loop);
    if (!gifFrameCanvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.shadowColor = glowEnabled ? glowColor : "transparent";
    ctx.shadowBlur = glowEnabled ? glowSize : 0;

    drawGifFrameFittingWithGlow(gifFrameCanvas);
  }
  loop();
}

function drawImageFittingWithGlow() {
  if (!img.complete) return;

  const buffer = glowEnabled ? glowSize * 2 : 0;
  const availableSize = MAX_SIZE - buffer;

  const scale = Math.min(availableSize / img.width, availableSize / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const offsetX = (MAX_SIZE - drawW) / 2;
  const offsetY = (MAX_SIZE - drawH) / 2;

  const temp = document.createElement("canvas");
  temp.width = drawW;
  temp.height = drawH;
  const tempCtx = temp.getContext("2d");
  tempCtx.drawImage(img, 0, 0, drawW, drawH);

  if (colorReplaceEnabled) {
    const imgData = tempCtx.getImageData(0, 0, drawW, drawH);
    const data = imgData.data;
    const target = hexToRgb(targetColorPicker.value);
    const replacement = hexToRgb(replacementColorPicker.value);
    const threshold = 100;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (colorDist({ r, g, b }, target) < threshold) {
        data[i] = replacement.r;
        data[i + 1] = replacement.g;
        data[i + 2] = replacement.b;
      }
    }
    tempCtx.putImageData(imgData, 0, 0);
  }

  ctx.drawImage(temp, offsetX, offsetY);
}

function drawGifFrameFittingWithGlow(frameCanvas) {
  const frame = frameCanvas;
  const buffer = glowEnabled ? glowSize * 2 : 0;
  const availableSize = MAX_SIZE - buffer;

  const scale = Math.min(availableSize / frame.width, availableSize / frame.height);
  const drawW = frame.width * scale;
  const drawH = frame.height * scale;
  const offsetX = (MAX_SIZE - drawW) / 2;
  const offsetY = (MAX_SIZE - drawH) / 2;

  ctx.drawImage(frame, offsetX, offsetY, drawW, drawH);
}

function hexToRgb(hex) {
  const val = parseInt(hex.slice(1), 16);
  return { r: (val >> 16) & 255, g: (val >> 8) & 255, b: val & 255 };
}

function colorDist(c1, c2) {
  return Math.sqrt(
    (c1.r - c2.r) ** 2 +
    (c1.g - c2.g) ** 2 +
    (c1.b - c2.b) ** 2
  );
}

saveBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "gunslol-logo.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
