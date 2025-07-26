
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3007;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'asset-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/assets', require('./routes/assets'));

app.listen(PORT, () => {
  console.log(`Asset service running on port ${PORT}`);
});
