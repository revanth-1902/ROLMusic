const express = require('express');
const { getLikedSongs, getRecentlyPlayed } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/liked-songs', authMiddleware, getLikedSongs);
router.get('/recently-played', authMiddleware, getRecentlyPlayed);

module.exports = router;
