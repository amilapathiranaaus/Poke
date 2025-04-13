const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const overlay = document.createElement("canvas");
overlay.style.position = "absolute";
overlay.style.top = video.offsetTop + "px";
overlay.style.left = video.offsetLeft + "px";
overlay.style.zIndex = 10;
document.querySelector(".video-wrapper").appendChild(overlay);

let streaming = false;

navigator.mediaDevices.getUserMedia({
  video: { facingMode: { ideal: "environment" } }
}).then(stream => {
  video.srcObject = stream;
  video.onloadedmetadata = () => {
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    streaming = true;
    detectContours();
  };
});

function detectContours() {
  if (!streaming || typeof cv === 'undefined') {
    requestAnimationFrame(detectContours);
    return;
  }

  const ctx = canvas.getContext("2d");
  const overlayCtx = overlay.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const src = cv.imread(canvas);
  const gray = new cv.Mat();
  const blur = new cv.Mat();
  const edges = new cv.Mat();
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0);
  cv.Canny(blur, edges, 75, 200);
  cv.findContours(edges, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

  overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
  for (let i = 0; i < contours.size(); i++) {
    const cnt = contours.get(i);
    const approx = new cv.Mat();
    cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

    if (approx.rows === 4 && cv.contourArea(approx) > 10000) {
      overlayCtx.strokeStyle = 'lime';
      overlayCtx.lineWidth = 4;
      overlayCtx.beginPath();
      for (let j = 0; j < 4; j++) {
        const pt = approx.intPtr(j);
        if (j === 0) overlayCtx.moveTo(pt[0], pt[1]);
        else overlayCtx.lineTo(pt[0], pt[1]);
      }
      overlayCtx.closePath();
      overlayCtx.stroke();
    }

    cnt.delete(); approx.delete();
  }

  src.delete(); gray.delete(); blur.delete(); edges.delete(); contours.delete(); hierarchy.delete();

  requestAnimationFrame(detectContours);
}
