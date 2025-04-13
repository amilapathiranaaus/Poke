const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const getPriceBtn = document.getElementById("getInfoBtn");
const retakeBtn = document.getElementById("retakeBtn");
const status = document.getElementById("status");
const result = document.getElementById("result");
const photoPreview = document.getElementById("photoPreview");

let capturedBlob = null;

// Start camera with high quality
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: { ideal: "environment" },
    width: { ideal: 1080 },
    height: { ideal: 1920 },
    advanced: [
      { focusMode: "continuous" },
      { exposureMode: "continuous" }
    ]
  }
}).then(stream => {
  video.srcObject = stream;
}).catch(() => {
  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;
  });
});

// Capture image
captureBtn.addEventListener("click", () => {
  status.textContent = "📷 Capturing...";
  setTimeout(() => {
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoHeight;
    canvas.height = video.videoWidth;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-90 * Math.PI / 180);
    ctx.drawImage(video, -canvas.height / 2, -canvas.width / 2, canvas.height, canvas.width);
    ctx.restore();

    canvas.toBlob(blob => {
      capturedBlob = blob;
      getPriceBtn.disabled = false;
      retakeBtn.style.display = "inline-block";
      captureBtn.style.display = "none";

      const imgURL = URL.createObjectURL(blob);
      photoPreview.innerHTML = `<img src="${imgURL}" class="captured-photo"/>`;

      status.textContent = "✅ Image captured. Ready to get price.";
      result.innerHTML = '';
    }, "image/jpeg", 0.95);
  }, 1000);
});

// Retake
retakeBtn.addEventListener("click", () => {
  capturedBlob = null;
  photoPreview.innerHTML = '';
  result.innerHTML = '';
  status.textContent = '';
  captureBtn.style.display = "inline-block";
  retakeBtn.style.display = "none";
  getPriceBtn.disabled = true;
});

// Get price
getPriceBtn.addEventListener("click", async () => {
  if (!capturedBlob) return;

  status.textContent = "🔍 Uploading and analyzing...";
  getPriceBtn.disabled = true;

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
        result.innerHTML = `
          <div style="font-size: 1.5em; font-weight: bold; color: #2c3e50;">
            💰 Price: $${data.price || 'N/A'}
          </div>
          <div><strong>Card:</strong> ${data.name}</div>
          <div><strong>Stage:</strong> ${data.evolution}</div>
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
