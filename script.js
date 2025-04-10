const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const downloadLink = document.getElementById("downloadLink");

// Request rear camera if available
navigator.mediaDevices.getUserMedia({
  video: { facingMode: { exact: "environment" } }
})
.then(stream => {
  video.srcObject = stream;
})
.catch(err => {
  console.warn("Back camera not available. Using default camera.");
  return navigator.mediaDevices.getUserMedia({ video: true });
})
.then(stream => {
  if (stream) video.srcObject = stream;
});

// Capture photo
captureBtn.addEventListener("click", () => {
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = canvas.toDataURL("image/jpeg");
  downloadLink.href = imageData;
  downloadLink.style.display = "inline-block";
});
