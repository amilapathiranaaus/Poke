const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const getPriceBtn = document.getElementById("getInfoBtn"); // renamed functionally
const status = document.getElementById("status");
const result = document.getElementById("result");

let capturedBlob = null;

// Request high resolution and better camera config
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: { ideal: "environment" },
    width: { ideal: 1280 },
    height: { ideal: 720 },
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

captureBtn.addEventListener("click", () => {
  status.textContent = "Focusing... hold still";

  setTimeout(() => {
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      capturedBlob = blob;
      getPriceBtn.disabled = false;
      status.textContent = "✅ Image captured. Ready to get price.";
      result.innerHTML = '';
    }, "image/jpeg", 0.95); // high quality
  }, 1000); // 1 second delay
});

getPriceBtn.addEventListener("click", async () => {
  if (!capturedBlob) return;

  status.textContent = "Uploading and analyzing...";
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
          <strong>Card:</strong> ${data.name}<br/>
          <strong>Stage:</strong> ${data.evolution}<br/>
          <strong>Price:</strong> $${data.price || 'N/A'}
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
