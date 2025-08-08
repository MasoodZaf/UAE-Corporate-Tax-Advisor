const express = require('express');
const app = express();
const port = 3000;

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'TaxMaster AI API Health Check',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TaxMaster AI Backend',
    version: '1.0.0',
    environment: 'development'
  });
});

app.listen(port, 'localhost', () => {
  console.log(`Test server running on http://localhost:${port}`);
  console.log('Health check: http://localhost:3000/health');
});