// List of local audio file paths relative to your HTML page
const audioFiles = [
  "audio/audio1.mp3",
  "audio/audio2.mp3",
  "audio/audio3.mp3",
  "audio/audio4.mp3",
];

const audioPlayer = document.getElementById("audioPlayer");

const randomIndex = Math.floor(Math.random() * audioFiles.length);

audioPlayer.src = audioFiles[randomIndex];

// Optional autoplay, might be blocked by browsers without interaction
audioPlayer.autoplay = true;
audioPlayer.load();
