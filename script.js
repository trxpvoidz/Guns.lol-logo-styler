const fileInput = document.getElementById("logoUpload");
const colorPicker = document.getElementById("colorPicker");
const toggleGlow = document.getElementById("toggleGlow");
const solidColorToggle = document.getElementById("solidColorToggle");
const solidColorPicker = document.getElementById("solidColorPicker");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const saveBtn = document.getElementById("saveBtn");

let img = new Image();
let glowColor = "#ffffff";
let pulse = 0;
let direction = 1;
let glowEnabled = true;

img.crossOrigin = "anonymous";
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

  ctx.drawImage(img, 50, 50);

  if (solidColorToggle.checked) {
    const color = solidColorPicker.value;
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
  }

  if (glowEnabled) {
    pulse += direction;
    if (pulse > 20 || pulse < 0) direction *= -1;
  }
}

saveBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "styled-logo.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
