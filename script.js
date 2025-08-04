const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const imgInput = document.getElementById("imgInput");
const downloadBtn = document.getElementById("downloadBtn");
const enableGlow = document.getElementById("enableGlow");
const glowColor = document.getElementById("glowColor");
const enableReplace = document.getElementById("enableReplace");
const targetColor = document.getElementById("targetColor");
const replacementColor = document.getElementById("replacementColor");

const MAX_SIZE = 512;
let img = new Image();

imgInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.type === "image/gif") {
    const buffer = await file.arrayBuffer();
    const gif = new window.GIFuctJS.Gif(new Uint8Array(buffer));
    const frames = gif.decompressFrames(true);
    const frame = frames[0];
    const imgData = new ImageData(
      new Uint8ClampedArray(frame.patch),
      frame.dims.width,
      frame.dims.height
    );
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = frame.dims.width;
    tmpCanvas.height = frame.dims.height;
    tmpCanvas.getContext("2d").putImageData(imgData, 0, 0);
    img.src = tmpCanvas.toDataURL();
  } else {
    img.src = URL.createObjectURL(file);
  }
});

img.onload = () => {
  draw();
};

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calculate scale and position
  const glowEnabled = enableGlow.checked;
  const replaceEnabled = enableReplace.checked;
  const glowPadding = glowEnabled ? 80 : 0;
  const availableSize = MAX_SIZE - glowPadding;

  const scale = Math.min(availableSize / img.width, availableSize / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = (MAX_SIZE - w) / 2;
  const y = (MAX_SIZE - h) / 2;

  // Draw to temp canvas for color replacement
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.drawImage(img, 0, 0, w, h);

  if (replaceEnabled) {
    const imageData = tempCtx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const target = hexToRgb(targetColor.value);
    const replacement = hexToRgb(replacementColor.value);
    const threshold = 200;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a > 0 && colorDist({ r, g, b }, target) < threshold) {
        data[i] = replacement.r;
        data[i + 1] = replacement.g;
        data[i + 2] = replacement.b;
      }
    }
    tempCtx.putImageData(imageData, 0, 0);
  }

  // Set glow if enabled
  if (glowEnabled) {
    ctx.shadowColor = glowColor.value;
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  } else {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }

  // Now draw the image WITH glow applied on canvas context
  ctx.drawImage(tempCanvas, x, y);
}

downloadBtn.onclick = () => {
  draw();
  const link = document.createElement("a");
  link.download = "styled-logo.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
};

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function colorDist(c1, c2) {
  return Math.sqrt(
    (c1.r - c2.r) ** 2 +
    (c1.g - c2.g) ** 2 +
    (c1.b - c2.b) ** 2
  );
}

// Redraw on inputs change
[enableGlow, glowColor, enableReplace, targetColor, replacementColor].forEach(el => {
  el.addEventListener("input", draw);
});
