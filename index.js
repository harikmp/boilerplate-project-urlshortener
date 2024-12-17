require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.original_url;

  if (!originalUrl || !isValidUrl(originalUrl)) {
      return res.status(400).json({ error: "Invalid URL" });
  }

  const shortUrlId = currentId++;
  
  urlDatabase[shortUrlId] = originalUrl;

  res.json({
      original_url: originalUrl,
      short_url: shortUrlId
  });
});

function isValidUrl(url) {
  const regex = /^(ftp|http|https):\/\/[^ "]+$/;
  return regex.test(url);
}

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
