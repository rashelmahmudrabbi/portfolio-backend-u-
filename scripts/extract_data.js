const fs = require('fs');
const path = require('path');
const data = require('../src/seed-data.js');

// Assumes portfolio-frontend is located side-by-side with portfolio-backend
const outDir = path.join(__dirname, '..', '..', 'portfolio-frontend', 'assets', 'data');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'data.json'), JSON.stringify(data, null, 2));
console.log('Data successfully extracted to ../portfolio-frontend/assets/data/data.json');
