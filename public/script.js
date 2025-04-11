const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const downloadLink = document.getElementById("downloadLink");

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

  canvas.toBlob(async blob => {
    const filename = `pokemon-${Date.now()}.jpg`;

    const res = await fetch(`/get-signed-url?filename=${filename}`);
    const { url } = await res.json();

    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "image/jpeg" },
      body: blob
    });

    alert("Uploaded to S3 successfully!");
  }, "image/jpeg");
});
