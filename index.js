require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const dns = require("dns");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Simple in-memory store for short URLs
let urlDatabase = {};
let currentId = 1;

app.post("/api/shorturl", async (req, res) => {
  const originalUrl = req.body.url;
  try {
    const isValid = await isValidUrl(originalUrl);
    if (!isValid) {
        return res.status(200).json({ error: 'invalid url' });
    }

    // Generate a short URL ID (just using an incremental ID for simplicity)
    const shortUrlId = currentId++;

    // Store the original URL with the short URL ID
    urlDatabase[shortUrlId] = originalUrl;

    // Return a JSON response with the original and short URLs
    return res.json({
        original_url: originalUrl,
        short_url: shortUrlId
    });

} catch (err) {
    // Handle any other errors (e.g., DNS lookup errors)
    return res.status(200).json({ error: 'invalid url' });
}
});

/*
function isValidUrl(url) {
  const regex = /^(ftp|http|https):\/\/[^ "]+$/;
  //const regex = /^(ftp|http|https):\/\/\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}$/;
  //const regex = /^(https?):\/\/(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}$/;
  //const regex = /^(https?):\/\/(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(\/)?$/;
  return regex.test(url);
}*/

function isValidUrl(url) {
  return new Promise((resolve, reject) => {
      // This regular expression checks for both:
      // - http://example.com
      // - http://www.example.com
      // - http://example.com/
      // - http://www.example.com/
      //const regex = /^(https?):\/\/(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(\/)?$/;
      const regex = /^(ftp|http|https):\/\/[^ "]+$/;

      // First, check if the URL matches the format using regex
      if (!regex.test(url)) {
          return reject(false);  // Reject if the format is invalid
      }

      // Extract hostname from the URL
      const hostname = new URL(url).hostname;

      // Use DNS lookup to check if the hostname resolves
      dns.lookup(hostname, (err, address, family) => {
          if (err) {
              return reject(false);  // Reject if DNS lookup fails
          } else {
              return resolve(true);  // Resolve if DNS lookup succeeds
          }
      });
  });
}

// Redirect route for short URLs
app.get("/api/shorturl/:id", (req, res) => {
  const shortUrlId = req.params.id;
  const originalUrl = urlDatabase[shortUrlId];
  
  if (!originalUrl) {
      return res.status(404).send("invalid url");
  }
  
  res.redirect(originalUrl);  // Redirect to the original URL
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
