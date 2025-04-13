const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureAndGetBtn = document.getElementById("captureAndGetBtn");
const retakeBtn = document.getElementById("retakeBtn");
const status = document.getElementById("status");
const result = document.getElementById("result");

let capturedBlob = null;
let stream = null;

async function startVideo() {
  stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  });
  video.srcObject = stream;
}

startVideo();

captureAndGetBtn.addEventListener("click", async () => {
  status.textContent = "Capturing...";

  // Freeze frame
  video.pause();

  setTimeout(() => {
    const ctx = canvas.getContext("2d");

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    const targetRatio = 3 / 4; // portrait
    const cropHeight = vh;
    const cropWidth = cropHeight * targetRatio;
    const startX = (vw - cropWidth) / 2;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.drawImage(video, startX, 0, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    canvas.toBlob(async blob => {
      capturedBlob = blob;
      retakeBtn.style.display = "inline-block";
      captureAndGetBtn.disabled = true;

      // Show captured image
      result.innerHTML = `<img src="${URL.createObjectURL(blob)}" alt="Captured Photo"/>`;

      status.textContent = "Uploading and analyzing...";

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await fetch('https://poke-backend-osfk.onrender.com/process-card', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: reader.result }),
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

      reader.readAsDataURL(blob);
    }, "image/jpeg", 0.95);
  }, 500);
});

retakeBtn.addEventListener
