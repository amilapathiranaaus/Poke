navigator.mediaDevices.getUserMedia({
  video: { facingMode: { exact: "environment" } }
})
.then(stream => {
  video.srcObject = stream;
})
.catch(err => {
  // fallback to front camera if environment cam isn't availabl
  console.warn("Back camera not available, using default.", err);
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    });
});

