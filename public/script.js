const video = document.getElementById("video");
const captureBtn = document.getElementById("captureBtn");
const retakeBtn = document.getElementById("retakeBtn");
const status = document.getElementById("status");
const result = document.getElementById("result");
const spinner = document.getElementById("spinner");
const shutterSound = document.getElementById("shutterSound");

let mediaStream = null;
let imageCapture = null;
let currentBlob = null;

async function startCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    video.srcObject = mediaStream;

    const track = mediaStream.getVideoTracks()[0];
    imageCapture = new ImageCapture(track);
  } catch (err) {
    console.error("Camera error:", err);
    status.textContent = "❌ Cannot access camera.";
  }
}

startCamera();

captureBtn.addEventListener("click", async () => {
  status.textContent = "Capturing...";
  shutterSound.play();
  flash();

  try {
    const blob = await imageCapture.takePhoto();
    currentBlob = blob;
    showCapturedImage(blob);

    // Freeze video by stopping track
    mediaStream.getVideoTracks()[0].stop();

    captureBtn.disabled = true;
    retakeBtn.style.display = "inline-block";
    spinner.style.display = "block";

    analyzeImage(blob);
  } catch (err) {
    console.error("Capture error:", err);
    status.textContent = "❌ Capture failed.";
  }
});

function showCapturedImage(blob) {
  const img = document.createElement("img");
  img.src = URL.createObjectURL(blob);
  img.style.transform = "scaleX(1)"; // Not mirrored
  result.innerHTML = "";
  result.appendChild(img);
}

retakeBtn.addEventListener("click", () => {
  result.innerHTML = "";
  status.textContent = "📷 Ready to capture again.";
  captureBtn.disabled = false;
  retakeBtn.style.display = "none";
  spinner.style.display = "none";
  currentBlob = null;
  startCamera();
});

async function analyzeImage(blob) {
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
      spinner.style.display = "none";
      console.error(err);
      status.textContent = "❌ Error during analysis.";
    }
  };

  reader.readAsDataURL(blob);
}

function flash() {
  const overlay = document.querySelector(".overlay");
  overlay.style.background = "white";
  setTimeout(() => {
    overlay.style.background = "transparent";
  }, 100);
}
