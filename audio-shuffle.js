const audioFiles = [
  { src: "audio/audio1.mp3", name: "Track 1" },
  { src: "audio/audio2.mp3", name: "Track 2" },
  { src: "audio/audio3.mp3", name: "Track 3" },
  { src: "audio/audio4.mp3", name: "Track 4" },
];

const audioPlayer = document.getElementById("audioPlayer");
const playPauseBtn = document.getElementById("playPauseBtn");
const playIcon = document.getElementById("playIcon");
const pauseIcon = document.getElementById("pauseIcon");
const shuffleBtn = document.getElementById("shuffleBtn");

function getRandomIndex(excludeIndex) {
  let index;
  do {
    index = Math.floor(Math.random() * audioFiles.length);
  } while (index === excludeIndex);
  return index;
}

function loadTrack(index) {
  audioPlayer.src = audioFiles[index].src;
  localStorage.setItem("lastTrackIndex", index);
  audioPlayer.load();
  audioPlayer.play();
  playIcon.style.display = "none";
  pauseIcon.style.display = "block";
}

function togglePlayPause() {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playIcon.style.display = "none";
    pauseIcon.style.display = "block";
  } else {
    audioPlayer.pause();
    playIcon.style.display = "block";
    pauseIcon.style.display = "none";
  }
}

function shuffleTrack() {
  const lastIndex = parseInt(localStorage.getItem("lastTrackIndex"));
  const newIndex = getRandomIndex(isNaN(lastIndex) ? -1 : lastIndex);
  loadTrack(newIndex);
}

audioPlayer.addEventListener("ended", shuffleTrack);

playPauseBtn.addEventListener("click", togglePlayPause);
shuffleBtn.addEventListener("click", shuffleTrack);

window.addEventListener("load", () => {
  const lastIndex = parseInt(localStorage.getItem("lastTrackIndex"));
  const startIndex = getRandomIndex(isNaN(lastIndex) ? -1 : lastIndex);
  loadTrack(startIndex);
});
