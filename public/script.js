const video = document.getElementById("video");
const captureBtn = document.getElementById("captureBtn");
const retakeBtn = document.getElementById("retakeBtn");
const status = document.getElementById("status");
const result = document.getElementById("result");
const flash = document.getElementById("flash");
const shutterSound = document.getElementById("shutterSound");
const spinner = document.getElementById("spinner");

let capturedBlob = null;
let imageCapture = null;
let stream = null;

// Start camera
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: { ideal: "environment" },
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
}).then(s => {
  stream = s;
  video.srcObject = stream;
  const track = stream.getVideoTracks()[0];
  imageCapture = new ImageCapture(track);
}).catch(err => {
  console.error("Camera error", err);
});

// Capture and analyze
captureBtn.addEventListener("click", async () => {
  if (!imageCapture) return;

  status.textContent = "Capturing...";
  shutterSound.play();
  flash.classList.add("active");
  setTimeout(() => flash.classList.remove("active"), 300);

  try {
    const bitmap = await imageCapture.grabFrame();

    const offCanvas = document.createElement("canvas");
    const offCtx = offCanvas.getContext("2d");

    const vw = bitmap.width;
    const vh = bitmap.height;
    const targetRatio = 3 / 4;
    const cropHeight = vh;
    const cropWidth = cropHeight * targetRatio;
    const startX = (vw - cropWidth) / 2;

    offCanvas.width = cropWidth;
    offCanvas.height = cropHeight;

    offCtx.drawImage(bitmap, startX, 0, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    offCanvas.toBlob(async blob => {
      capturedBlob = blob;
      const imageUrl = URL.createObjectURL(blob);
      result.innerHTML = `<img src="${imageUrl}" alt="Captured" />`;

      video.pause();
      retakeBtn.style.display = "inline-block";
      captureBtn.disabled = true;

      status.textContent = "Analyzing card...";
      spinner.style.display = "block";

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await fetch('https://poke-backend-osfk.onrender.com/process-card', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: reader.result }),
          });

          const data = await res.json();
          spinner.style.display = "none";

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
          spinner.style.display = "none";
          status.textContent = "❌ Error during analysis.";
        }
      };

      reader.readAsDataURL(blob);
    }, "image/jpeg", 0.95);
  } catch (err) {
    console.error("Capture error:", err);
    status.textContent = "❌ Failed to capture image.";
  }
});

// Retake
retakeBtn.addEventListener("click", () => {
  capturedBlob = null;
  result.innerHTML = '';
  status.textContent = "📷 Ready to capture again.";
  captureBtn.disabled = false;
  retakeBtn.style.display = "none";
  video.play();
});
