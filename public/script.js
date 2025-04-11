const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const saveBtn = document.getElementById("saveBtn");
const downloadBtn = document.getElementById("downloadBtn");
const status = document.getElementById("status");

let capturedBlob = null;

navigator.mediaDevices.getUserMedia({
  video: { facingMode: { exact: "environment" } }
}).then(stream => {
  video.srcObject = stream;
}).catch(() => {
  // fallback to any camera if no back camera
  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;
  });
});

captureBtn.addEventListener("click", () => {
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(blob => {
    capturedBlob = blob;
    saveBtn.disabled = false;
    downloadBtn.disabled = false;
    status.textContent = "Image captured. Ready to save.";
  }, "image/jpeg");
});

saveBtn.addEventListener("click", async () => {
  if (!capturedBlob) return;

  const filename = `pokemon-${Date.now()}.jpg`;

  try {
    status.textContent = "Uploading...";
    const res = await fetch(`http://localhost:3000/get-signed-url?filename=${filename}`);
    const { url } = await res.json();

    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "image/jpeg" },
      body: capturedBlob
    });

    status.textContent = "✅ Uploaded to S3!";
    saveBtn.disabled = true;
  } catch (err) {
    console.error(err);
    status.textContent = "❌ Upload failed.";
  }
});

downloadBtn.addEventListener("click", () => {
  if (!capturedBlob) return;

  const a = document.createElement("a");
  a.href = URL.createObjectURL(capturedBlob);
  a.download = `pokemon-${Date.now()}.jpg`;
  a.click();
});
