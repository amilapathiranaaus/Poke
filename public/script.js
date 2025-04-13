const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const getPriceBtn = document.getElementById("getInfoBtn");
const status = document.getElementById("status");
const result = document.getElementById("result");

let capturedBlob = null;

navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: { ideal: "environment" },
    width: { ideal: 720 },
    height: { ideal: 1280 },
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

    // Ensure portrait by rotating if necessary
    const isLandscape = video.videoWidth > video.videoHeight;
    if (isLandscape) {
      canvas.width = video.videoHeight;
      canvas.height = video.videoWidth;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-90 * Math.PI / 180);
      ctx.drawImage(video, -video.videoWidth / 2, -video.videoHeight / 2);
      ctx.restore();
    } else {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    canvas.toBlob(blob => {
      capturedBlob = blob;
      getPriceBtn.disabled = false;
      status.textContent = "✅ Image captured. Ready to get price.";
      result.innerHTML = '';
    }, "image/jpeg", 0.95);
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
        const imageUrl = URL.createObjectURL(capturedBlob);
        result.innerHTML = `
          <strong>Card:</strong> ${data.name}<br/>
          <strong>Stage:</strong> ${data.evolution}<br/>
          <div id="price">Price: $${data.price || 'N/A'}</div>
          <img src="${imageUrl}" alt="Captured Card" class="captured-photo" />
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
