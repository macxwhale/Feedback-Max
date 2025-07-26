
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'notification-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/notifications', require('./routes/notifications'));

app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});
