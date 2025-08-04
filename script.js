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

  const url = URL.createObjectURL(file);

  if (file.type === "image/gif") {
    const buffer = await file.arrayBuffer();
    const gif = new window.GIFuctJS.Gif(new Uint8Array(buffer));
    const frames = gif.decompressFrames(true);
    const frame = frames[0];
    const tmp = new ImageData(
      new Uint8ClampedArray(frame.patch),
      frame.dims.width,
      frame.dims.height
    );
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = frame.dims.width;
    tmpCanvas.height = frame.dims.height;
    tmpCanvas.getContext("2d").putImageData(tmp, 0, 0);
    img.src = tmpCanvas.toDataURL();
  } else {
    img.src = url;
  }
});

img.onload = () => {
  drawImageWithGlow();
};

function drawImageWithGlow() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const glowEnabled = enableGlow.checked;
  const replaceEnabled = enableReplace.checked;

  const glowBuffer = glowEnabled ? 90 : 0;
  const availableSize = MAX_SIZE - glowBuffer;
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

  if (replaceEnabled) {
    const imgData = tempCtx.getImageData(0, 0, drawW, drawH);
    const data = imgData.data;
    const target = hexToRgb(targetColor.value);
    const replacement = hexToRgb(replacementColor.value);
    const threshold = 150;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a > 0 && colorDistance({ r, g, b }, target) < threshold) {
        data[i] = replacement.r;
        data[i + 1] = replacement.g;
        data[i + 2] = replacement.b;
      }
    }

    tempCtx.putImageData(imgData, 0, 0);
  }

  if (glowEnabled) {
    ctx.shadowColor = glowColor.value;
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  } else {
    ctx.shadowBlur = 0;
  }

  ctx.drawImage(temp, offsetX, offsetY);
}

downloadBtn.addEventListener("click", () => {
  drawImageWithGlow();
  const link = document.createElement("a");
  link.download = "logo.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

function hexToRgb(hex) {
  const int = parseInt(hex.slice(1), 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255
  };
}

function colorDistance(c1, c2) {
  return Math.sqrt(
    (c1.r - c2.r) ** 2 +
    (c1.g - c2.g) ** 2 +
    (c1.b - c2.b) ** 2
  );
}
