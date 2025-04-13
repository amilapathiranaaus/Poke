const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const getPriceBtn = document.getElementById("getInfoBtn");
const retakeBtn = document.getElementById("retakeBtn");
const status = document.getElementById("status");
const result = document.getElementById("result");
const capturedPhoto = document.getElementById("capturedPhoto");

let capturedBlob = null;

// Get camera with ideal portrait aspect ratio
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: { ideal: "environment" },
    width: { ideal: 720 },
    height: { ideal: 960 }
  }
}).then(stream => {
  video.srcObject = stream;
}).catch(() => {
  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;
  });
});

// Capture photo that matches what’s visible on screen
captureBtn.addEventListener("click", () => {
  status.textContent = "Hold still...";

  setTimeout(() => {
    const videoRatio = video.videoWidth / video.videoHeight;
    const displayRatio = video.clientWidth / video.clientHeight;

    const ctx = canvas.getContext("2d");

    // Match visible area: crop if needed
    let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;

    if (videoRatio > displayRatio) {
      // Crop sides
      const newWidth = video.videoHeight * displayRatio;
      sx = (video.videoWidth - newWidth) / 2;
      sw = newWidth;
    } else {
      // Crop top/bottom
      const newHeight = video.videoWidth / displayRatio;
      sy = (video.videoHeight - newHeight) / 2;
      sh = newHeight;
    }

    canvas.width = 720;
    canvas.height = 960;

    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      capturedBlob = blob;
      getPriceBtn.disabled = false;
      captureBtn.disabled = true;
      retakeBtn.style.display = "inline-block";

      const imageUrl = URL.createObjectURL(blob);
      capturedPhoto.src = imageUrl;
      capturedPhoto.style.display = "block";
      status.textContent = "✅ Captured. Ready to get price.";
      result.innerHTML = "";
    }, "image/jpeg", 0.95);
  }, 500);
});

getPriceBtn.addEventListener("click", async () => {
  if (!capturedBlob) return;
  status.textContent = "Analyzing...";
  getPriceBtn.disabled = true;

  const reader = new FileReader();
  reader.onloadend = async () => {
    try {
      const res = await fetch('https://poke-backend-osfk.onrender.com/process-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: reader.result })
      });

      const data = await res.json();

      if (data.name) {
        status.textContent = "✅ Card identified!";
        result.innerHTML = `
          <strong>Card:</strong> ${data.name}<br/>
          <strong>Stage:</strong> ${data.evolution}<br/>
          <div class="price">$${data.price || 'N/A'}</div>
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
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  capturedPhoto.src = "";
  capturedPhoto.style.display = "none";
  result.innerHTML = "";
  status.textContent = "";
  captureBtn.disabled = false;
  getPriceBtn.disabled = true;
  retakeBtn.style.display = "none";
});
