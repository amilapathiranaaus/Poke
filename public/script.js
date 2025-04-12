const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const getInfoBtn = document.getElementById("getInfoBtn");
const status = document.getElementById("status");
const result = document.getElementById("result");

let capturedBlob = null;

navigator.mediaDevices.getUserMedia({
  video: { facingMode: { exact: "environment" } }
}).then(stream => {
  video.srcObject = stream;
}).catch(() => {
  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;
  });
});

captureBtn.addEventListener("click", () => {
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(blob => {
    capturedBlob = blob;
    getInfoBtn.disabled = false;
    status.textContent = "Image captured. Ready to get price.";
    result.innerHTML = '';
  }, "image/jpeg");
});

getInfoBtn.addEventListener("click", async () => {
  if (!capturedBlob) return;

  status.textContent = "Uploading and analyzing...";
  getInfoBtn.disabled = true;

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
          <strong>Name:</strong> ${data.name}<br/>
          <strong>Price:</strong> ${data.price ? `$${data.price}` : 'N/A'}<br/>
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
