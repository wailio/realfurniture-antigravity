const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Users/hp/Desktop/Dio M/realfurniture/public/arthome-collection';
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

const images = [
  // Background images
  { url: 'https://arthomefurniture.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-02-at-4.00.40-PM.jpeg', file: 'living-room-bg.jpg' },
  { url: 'https://arthomefurniture.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-02-at-4.00.41-PM.jpeg', file: 'dining-room-bg.jpg' },
  { url: 'https://arthomefurniture.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-02-at-4.00.39-PM.jpeg', file: 'the-home-bg.jpg' },
  
  // Tooltip product images
  { url: 'https://arthomefurniture.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-02-at-4.02.51-PM-300x200.jpeg', file: 'curved-sofa.jpg' },
  { url: 'https://arthomefurniture.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-02-at-4.03.45-PM-200x300.jpeg', file: 'marble-coffee-table.jpg' },
  { url: 'https://arthomefurniture.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-02-at-4.01.51-PMv-300x200.jpeg', file: 'armless-lounge-sofa.jpg' },
  { url: 'https://arthomefurniture.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-02-at-4.03.32-PM-150x150.jpeg', file: 'midnight-marble-dining-table.jpg' },
  { url: 'https://arthomefurniture.com/wp-content/uploads/2026/03/20-200x300.jpeg', file: 'curved-modern-lounge-chair.jpg' },
  { url: 'https://arthomefurniture.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-02-at-4.03.53-PM-200x300.jpeg', file: 'single-round-tea-table.jpg' },
  { url: 'https://arthomefurniture.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-02-at-4.03.19-PM-200x300.jpeg', file: 'geometric-white-tea-table.jpg' },
  { url: 'https://arthomefurniture.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-02-at-4.01.44-PM-300x200.jpeg', file: 'boucle-chaise-sectional-sofa.jpg' },
  { url: 'https://arthomefurniture.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-02-at-4.01.45-PM-300x200.jpeg', file: 'sculptural-boucle-accent-chair.jpg' }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        console.error('Failed to download ' + url + ' status: ' + res.statusCode);
        return resolve(false);
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        console.log('Downloaded: ' + path.basename(dest));
        resolve(true);
      });
    }).on('error', err => {
      console.error('Error downloading ' + url, err.message);
      resolve(false);
    });
  });
}

async function run() {
  for (const item of images) {
    const dest = path.join(targetDir, item.file);
    await downloadFile(item.url, dest);
  }
  console.log('All downloads completed!');
}

run();
