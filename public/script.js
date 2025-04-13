const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const overlay = document.getElementById("overlay");
const captureBtn = document.getElementById("captureBtn");
const getPriceBtn = document.getElementById("getInfoBtn");
const status = document.getElementById("status");
const result = document.getElementById("result");


let capturedBlob = null;

// Setup camera in portrait ratio
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: { ideal: "environment" },
    width: { ideal: 720 },
    height: { ideal: 960 },
  }
}).then(stream => {
  video.srcObject = stream;
}).catch(console.error);

// Draw overlay rectangle (guide)
video.addEventListener("loadedmetadata", () => {
  overlay.width = video.videoWidth;
  overlay.height = video.videoHeight;
  const ctx = overlay.getContext("2d");

  const drawOverlay = () => {
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    const padding = 30;
    const rectWidth = overlay.width - padding * 2;
    const rectHeight = rectWidth * 1.4;
    const x = padding;
    const y = (overlay.height - rectHeight) / 2;

    ctx.strokeStyle = "lime";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, rectWidth, rectHeight);
    requestAnimationFrame(drawOverlay);
  };
  drawOverlay();
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
    }, "image/jpeg", 0.95);
  }, 1000);
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
      const capturedImageUrl = URL.createObjectURL(capturedBlob);
      const finalImageUrl = data.imageUrl || capturedImageUrl;

      if (data.name) {
        status.textContent = "✅ Card identified!";
        result.innerHTML = `
        <strong>Card:</strong> ${data.name}<br/>
        <strong>Stage:</strong> ${data.evolution}<br/>
        <div class="price">💰 $${data.price || 'N/A'}</div>
        <img src="${finalImageUrl}" alt="Captured Pokémon Card"/>
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
