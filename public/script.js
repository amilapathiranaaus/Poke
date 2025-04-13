const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const getInfoBtn = document.getElementById("getInfoBtn");
const retakeBtn = document.getElementById("retakeBtn");
const status = document.getElementById("status");
const result = document.getElementById("result");

let capturedBlob = null;

// Request high-res camera
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: { ideal: "environment" },
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
}).then(stream => {
  video.srcObject = stream;
}).catch(err => {
  console.error("Camera error", err);
});

captureBtn.addEventListener("click", () => {
  status.textContent = "Capturing...";

  setTimeout(() => {
    const ctx = canvas.getContext("2d");

    // Get actual display size of video on screen
    const displayWidth = video.clientWidth;
    const displayHeight = video.clientHeight;

    // Use same aspect ratio as green rectangle (3:4)
    const cropHeight = video.videoHeight;
    const cropWidth = cropHeight * (3 / 4);
    const startX = (video.videoWidth - cropWidth) / 2;

    // Set canvas to cropped portrait size
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Flip horizontally if video is mirrored
    ctx.translate(cropWidth, 0);
    ctx.scale(-1, 1);

    // Crop and draw from center
    ctx.drawImage(video, startX, 0, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    canvas.toBlob(blob => {
      capturedBlob = blob;
      getInfoBtn.disabled = false;
      retakeBtn.style.display = "inline-block";
      status.textContent = "✅ Image captured.";
      result.innerHTML = `<img src="${URL.createObjectURL(blob)}" alt="Captured Photo"/>`;
    }, "image/jpeg", 0.95);
  }, 1000);
});

getInfoBtn.addEventListener("click", async () => {
  if (!capturedBlob) return;

  status.textContent = "Uploading and analyzing...";
  getInfoBtn.disabled = true;

  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64data = reader.result;

    try {
      const res = await fetch('https://poke-backend-osfk.onrender.com/process-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64data }),
      });

      const data = await res.json();

      if (data.name) {
        status.textContent = "✅ Card identified!";
        result.innerHTML += `
          <div><strong>Card:</strong> ${data.name}</div>
          <div><strong>Stage:</strong> ${data.evolution}</div>
          <div class="price"><strong>Price:</strong> $${data.price || 'N/A'}</div>
        `;
      } else {
        status.textContent = "⚠️ Could not identify the card.";
      }
    } catch (err) {
      console.error(err);
      status.textContent = "❌ Error during analysis.";
    }
  };

  reader.readAsDataURL(capturedBlob);
});

retakeBtn.addEventListener("click", () => {
  capturedBlob = null;
  getInfoBtn.disabled = true;
  retakeBtn.style.display = "none";
  result.innerHTML = '';
  status.textContent = "📷 Ready to capture again.";
});
