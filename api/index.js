// Vercel Node.js serverless entry point. Vercel's Node runtime accepts an
// Express app directly (it's just a (req, res) => void function), so this
// file only needs to build and export it — no extra adapter needed.
require('dotenv').config();
const { buildApp } = require('../src/app');

module.exports = buildApp();
