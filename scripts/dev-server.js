require('dotenv').config();
const { buildApp } = require('../src/app');

const port = process.env.PORT || 8000;
buildApp().listen(port, () => {
  console.log(`Portfolio backend running at http://localhost:${port}`);
  console.log(`Admin panel:  http://localhost:${port}/admin`);
  console.log(`API root:     http://localhost:${port}/api/health`);
});
