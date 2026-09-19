const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { CORS_ORIGIN, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const songRoutes = require('./routes/songRoutes');
const userRoutes = require('./routes/userRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const corsOrigins = (CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: corsOrigins.length > 0 ? corsOrigins : true,
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: Number(RATE_LIMIT_WINDOW_MS),
  max: Number(RATE_LIMIT_MAX),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/users', userRoutes);
app.use('/api/playlists', playlistRoutes);

app.use(errorHandler);

module.exports = app;
