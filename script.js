const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const downloadLink = document.getElementById("downloadLink");

// Use back camera if available
navigator.mediaDevices.getUserMedia({
  video: { facingMode: { exact: "environment" } }
})
.then(stream => {
  video.srcObject = stream;
})
.catch(err => {
  console.warn("Back camera not available. Using default.");
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

  // Convert to image and set as download link
  const imageData = canvas.toDataURL("image/jpeg");
  downloadLink.href = imageData;
  downloadLink.style.display = "inline";
});
