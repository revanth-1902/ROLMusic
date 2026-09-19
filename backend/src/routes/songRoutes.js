const express = require('express');
const { getSongs, createSong, likeSong, unlikeSong, playSong } = require('../controllers/songController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getSongs);
router.post('/', createSong);
router.post('/:songId/like', authMiddleware, likeSong);
router.delete('/:songId/unlike', authMiddleware, unlikeSong);
router.post('/:songId/play', authMiddleware, playSong);

module.exports = router;
