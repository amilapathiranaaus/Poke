const video = document.getElementById("video");
const overlay = document.getElementById("overlay");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const getPriceBtn = document.getElementById("getInfoBtn");
const status = document.getElementById("status");
const result = document.getElementById("result");

let capturedBlob = null;
let streaming = false;

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
  video.addEventListener("loadedmetadata", () => {
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
    startContourDetection();
  });
});

function startContourDetection() {
  if (typeof cv === 'undefined') {
    return setTimeout(startContourDetection, 100);
  }

  const ctx = overlay.getContext("2d");
  const src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const edges = new cv.Mat();
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  function detect() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      ctx.drawImage(video, 0, 0, overlay.width, overlay.height);
      let imageData = ctx.getImageData(0, 0, overlay.width, overlay.height);
      src.data.set(imageData.data);

      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
      cv.Canny(blurred, edges, 75, 200);
      cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      ctx.clearRect(0, 0, overlay.width, overlay.height);
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'lime';

      for (let i = 0; i < contours.size(); ++i) {
        const cnt = contours.get(i);
        const approx = new cv.Mat();
        cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

        if (approx.rows === 4 && cv.contourArea(approx) > 10000) {
          ctx.beginPath();
          for (let j = 0; j < 4; ++j) {
            let point = approx.intPtr(j);
            ctx.lineTo(point[0], point[1]);
          }
          ctx.closePath();
          ctx.stroke();
          approx.delete();
        }
      }
    }
    requestAnimationFrame(detect);
  }
  detect();
}

captureBtn.addEventListener("click", () => {
  status.textContent = "Capturing image... hold still";

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
  }, 800);
});

getPriceBtn.addEventListener("click", async () => {
  if (!capturedBlob) return;

  status.textContent = "Uploading and analyzing...";
  getPriceBtn.disabled = true;

  const reader = new FileReader();
  reader.onloadend = async () => {
    try {
      const base64data = reader.result;
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
