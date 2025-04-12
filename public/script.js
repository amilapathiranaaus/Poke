const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const status = document.getElementById("status");
const result = document.getElementById("result");

navigator.mediaDevices.getUserMedia({
  video: { facingMode: { exact: "environment" } }
}).then(stream => {
  video.srcObject = stream;
}).catch(() => {
  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;
  });
});

function detectAndCropCard(imageData) {
  const src = cv.matFromImageData(imageData);
  const gray = new cv.Mat();
  const edges = new cv.Mat();
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
  cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0);
  cv.Canny(gray, edges, 50, 150);
  cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  let cardContour = null;
  let maxArea = 0;

  for (let i = 0; i < contours.size(); ++i) {
    const cnt = contours.get(i);
    const peri = cv.arcLength(cnt, true);
    const approx = new cv.Mat();
    cv.approxPolyDP(cnt, approx, 0.02 * peri, true);
    if (approx.rows === 4) {
      const area = cv.contourArea(cnt);
      if (area > maxArea) {
        maxArea = area;
        cardContour = approx.clone();
      }
    }
  }

  let croppedImage = null;

  if (cardContour) {
    const rect = cv.boundingRect(cardContour);
    croppedImage = src.roi(rect);
  }

  gray.delete(); edges.delete(); contours.delete(); hierarchy.delete();

  return croppedImage || src; // fallback to full image if not found
}

captureBtn.addEventListener("click", async () => {
  status.textContent = "📷 Capturing and processing...";

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const interval = setInterval(() => {
    if (cv && cv.imread) {
      clearInterval(interval);
      const croppedMat = detectAndCropCard(imageData);

      const newCanvas = document.createElement('canvas');
      newCanvas.width = croppedMat.cols;
      newCanvas.height = croppedMat.rows;
      const newCtx = newCanvas.getContext('2d');

      const imgData = new ImageData(new Uint8ClampedArray(croppedMat.data), croppedMat.cols, croppedMat.rows);
      newCtx.putImageData(imgData, 0, 0);
      croppedMat.delete();

      newCanvas.toBlob(async blob => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const res = await fetch('https://poke-backend-osfk.onrender.com/process-card', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageBase64: reader.result }),
            });

            const data = await res.json();
            if (data.name && data.price) {
              status.textContent = "✅ Card recognized!";
              result.innerHTML = `
                <strong>Name:</strong> ${data.name}<br/>
                <strong>Price:</strong> $${data.price}
              `;
            } else {
              status.textContent = "⚠️ Could not identify the card.";
            }
          } catch (err) {
            console.error(err);
            status.textContent = "❌ Error during processing.";
          }
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg');
    }
  }, 100);
});
