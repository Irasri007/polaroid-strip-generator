const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});


// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload Route
app.post('/upload', (req, res) => {
  const { imageData } = req.body;
  if (!imageData) return res.status(400).send('No image data');

  const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
  const fileName = `polaroid_${Date.now()}.png`;
  const filePath = path.join(__dirname, 'uploads', fileName);

  fs.writeFile(filePath, base64Data, 'base64', (err) => {
    if (err) return res.status(500).send('Failed to save image');
    res.json({ url: `/uploads/${fileName}` });
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
