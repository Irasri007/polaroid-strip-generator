const video = document.getElementById('camera');
let currentFilter = 'none';

// Start the camera
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
});

// Set filter on video preview
function setFilter(filter) {
  currentFilter = filter;
  video.style.filter = filter;
}

// Capture a photo with filter
function capturePhoto() {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  ctx.filter = currentFilter;
  ctx.drawImage(video, 0, 0, 200, 200);
  return canvas.toDataURL('image/png');
}

// Capture 3 photos in a row
function startCapture() {
  const video = document.getElementById('camera');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const strip = document.getElementById('strip');
  strip.innerHTML = ''; // Clear previous photos

  let count = 0;
  const interval = setInterval(() => {
    ctx.filter = video.style.filter;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    addPhotoToStrip(dataUrl);

    count++;
    if (count === 3) clearInterval(interval);
  }, 2000); // capture every 2 seconds
}


// Upload the polaroid strip to backend
function uploadStrip() {
  const polaroidDivs = document.querySelectorAll('.polaroid');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const width = 200;
  const heightPerPhoto = 250;  // 200 for image + 50 for caption
  canvas.width = width;
  canvas.height = polaroidDivs.length * heightPerPhoto;

  polaroidDivs.forEach((polaroid, index) => {
    const img = polaroid.querySelector('img');
    const captionInput = polaroid.querySelector('input');

    ctx.drawImage(img, 0, index * heightPerPhoto, width, 200);

    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      captionInput.value || '',
      width / 2,
      index * heightPerPhoto + 220
    );
  });

  const dataURL = canvas.toDataURL('image/png');

  fetch('http://localhost:3000/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData: dataURL })
  })
    .then(res => res.json())
    .then(data => {
      const linkDiv = document.createElement('div');
      linkDiv.innerHTML = `Image uploaded! <a href="${data.url}" target="_blank">View Strip</a>`;
      document.body.appendChild(linkDiv);
    })
    .catch(err => console.error('Error:', err));
}

// Add this inside script.js
function addPhotoToStrip(dataUrl) {
  const strip = document.getElementById('strip');
  
  const polaroidDiv = document.createElement('div');
  polaroidDiv.className = 'polaroid';
  
  const img = document.createElement('img');
  img.src = dataUrl;
  
  const captionInput = document.createElement('input');
  captionInput.type = 'text';
  captionInput.placeholder = 'Add caption';
  captionInput.className = 'caption';

  polaroidDiv.appendChild(img);
  polaroidDiv.appendChild(captionInput);
  strip.appendChild(polaroidDiv);
}
function downloadStrip() {
  const polaroidDivs = document.querySelectorAll('.polaroid');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const width = 200;
  const heightPerPhoto = 250;
  canvas.width = width;
  canvas.height = polaroidDivs.length * heightPerPhoto;

  polaroidDivs.forEach((polaroid, index) => {
    const img = polaroid.querySelector('img');
    const captionInput = polaroid.querySelector('input');

    ctx.drawImage(img, 0, index * heightPerPhoto, width, 200);

    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      captionInput.value || '',
      width / 2,
      index * heightPerPhoto + 220
    );
  });

  const link = document.createElement('a');
  link.download = 'polaroid_strip.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
function handleUpload(event) {
  const files = event.target.files;
  const strip = document.getElementById('strip');

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      addPhotoToStrip(e.target.result);
    };
    reader.readAsDataURL(file);
  });

  // Reset the file input after each selection to allow re-upload of same files if needed
  event.target.value = '';
}



