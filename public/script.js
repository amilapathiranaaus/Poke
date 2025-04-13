const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
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
  status.textContent = "📷 Capturing and analyzing...";

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(blob => {
    capturedBlob = blob;

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
          result.innerHTML = '';
        }
      } catch (err) {
        console.error(err);
        status.textContent = "❌ Error during processing.";
      }
    };

    reader.readAsDataURL(capturedBlob);
  }, "image/jpeg");
});
