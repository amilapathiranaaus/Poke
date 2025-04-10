const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snap = document.getElementById('snap');
const context = canvas.getContext('2d');
const resultDisplay = document.getElementById('result');

// Start camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  });

// On button click
snap.addEventListener('click', async () => {
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = canvas.toDataURL('image/png');
  resultDisplay.textContent = "Processing...";

  const cardName = await getCardNameFromImage(imageData);
  const price = await getCardPrice(cardName);

  resultDisplay.textContent = `${cardName} - $${price}`;
});

// OCR using Google Vision
async function getCardNameFromImage(imageDataUrl) {
  const base64 = imageDataUrl.split(',')[1];
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=YOUR_GOOGLE_CLOUD_VISION_API_KEY`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: base64 },
          features: [{ type: 'TEXT_DETECTION' }]
        }]
      })
    }
  );
  const result = await response.json();
  const text = result.responses?.[0]?.fullTextAnnotation?.text || '';
  const cardName = extractCardName(text);
  return cardName;
}

// Extract card name from text
function extractCardName(rawText) {
  const lines = rawText.split('\n');
  // Assume card name is the first line or first capitalized line
  return lines.find(line => line && /^[A-Za-z0-9\-'\s]+$/.test(line)) || 'Unknown Card';
}

// Search card price using Pokémon TCG API
async function getCardPrice(cardName) {
  const encodedName = encodeURIComponent(`"${cardName}"`);
  const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${encodedName}`);
  const data = await response.json();
  const card = data.data?.[0];
  const price = card?.tcgplayer?.prices?.normal?.market || "N/A";
  return price;
}
