import http from 'http';
import fs from 'fs';
import path from 'path';

const libraryDir = 'F:\\Med Prep\\library_content';
const PORT = 3500;

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const urlObj = new URL(req.url || '', `http://localhost:${PORT}`);
  
  // API Endpoint: /api/preview
  if (urlObj.pathname === '/api/preview') {
    const filePath = urlObj.searchParams.get('path');
    if (!filePath) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Path parameter is required.');
      return;
    }

    const absolutePath = path.resolve(libraryDir, filePath);
    if (!absolutePath.startsWith(libraryDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Access denied.');
      return;
    }

    if (fs.existsSync(absolutePath)) {
      fs.readFile(absolutePath, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error reading file.');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found.');
    }
    return;
  }

  // API Endpoint: /api/images/:chapName/:imgName
  const imageMatch = urlObj.pathname.match(/\/api\/images\/(.*?)\/(.*)/);
  if (imageMatch) {
    const chapName = decodeURIComponent(imageMatch[1]);
    const imgName = decodeURIComponent(imageMatch[2]);
    const imgPath = path.join(libraryDir, chapName, 'images', imgName);

    if (fs.existsSync(imgPath)) {
      const ext = path.extname(imgPath).toLowerCase();
      let contentType = 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      if (ext === '.gif') contentType = 'image/gif';

      fs.readFile(imgPath, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error.');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Image not found.');
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Pure Node.js library preview server running on http://localhost:${PORT}`);
});
