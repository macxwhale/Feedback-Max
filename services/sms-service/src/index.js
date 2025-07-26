
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3006;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'sms-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/sms', require('./routes/sms'));

app.listen(PORT, () => {
  console.log(`SMS service running on port ${PORT}`);
});
