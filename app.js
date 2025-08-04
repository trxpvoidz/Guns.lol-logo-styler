const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const imgInput = document.getElementById("imgInput");
const targetColorPicker = document.getElementById("targetColor");
const replacementColorPicker = document.getElementById("replacementColor");
const enableReplace = document.getElementById("enableReplace");
const enableGlow = document.getElementById("enableGlow");
const downloadBtn = document.getElementById("downloadBtn");
const MAX_SIZE = 512;

let img = new Image();
let gifFrames = [];
let isGif = false;

canvas.width = canvas.height = MAX_SIZE;

imgInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  isGif = file.type === "image/gif";

  if (isGif) {
    const gif = await import("https://cdn.jsdelivr.net/npm/gifuct-js@1.0.2/dist/gifuct.min.js");
    const arrayBuffer = await file.arrayBuffer();
    const gifObj = gif.parseGIF(arrayBuffer);
    gifFrames = gif.decompressFrames(gifObj, true);
    animateGif();
  } else {
    gifFrames = [];
    img.onload = drawImage;
    img.src = url;
  }
});

function drawImage() {
  ctx.clearRect(0, 0, MAX_SIZE, MAX_SIZE);
  drawImageFittingWithGlow(img);
}

function drawImageFittingWithGlow(image) {
  const glowSize = 45;
  const glowMargin = glowSize * 2;
  const available = MAX_SIZE - glowMargin;

  const scale = Math.min(available / image.width, available / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  const x = (MAX_SIZE - w) / 2;
  const y = (MAX_SIZE - h) / 2;

  const temp = document.createElement("canvas");
  temp.width = w;
  temp.height = h;
  const tempCtx = temp.getContext("2d");
  tempCtx.drawImage(image, 0, 0, w, h);

  if (enableReplace.checked) {
    const imgData = tempCtx.getImageData(0, 0, w, h);
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

  ctx.clearRect(0, 0, MAX_SIZE, MAX_SIZE);
  if (enableGlow.checked) {
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = glowSize;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  } else {
    ctx.shadowBlur = 0;
  }

  ctx.drawImage(temp, x, y);
}

function animateGif(frameIndex = 0) {
  if (!gifFrames.length) return;

  const frame = gifFrames[frameIndex];
  const imageData = new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height);
  const temp = document.createElement("canvas");
  temp.width = frame.dims.width;
  temp.height = frame.dims.height;
  const tempCtx = temp.getContext("2d");
  tempCtx.putImageData(imageData, 0, 0);
  drawImageFittingWithGlow(temp);

  const delay = frame.delay || 100;
  setTimeout(() => animateGif((frameIndex + 1) % gifFrames.length), delay);
}

enableGlow.addEventListener("change", () => isGif ? animateGif() : drawImage());
enableReplace.addEventListener("change", () => isGif ? animateGif() : drawImage());
targetColorPicker.addEventListener("input", () => isGif ? animateGif() : drawImage());
replacementColorPicker.addEventListener("input", () => isGif ? animateGif() : drawImage());

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "logo.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function colorDist(c1, c2) {
  return Math.sqrt((c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2);
}
