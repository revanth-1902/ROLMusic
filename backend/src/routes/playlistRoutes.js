const express = require('express');
const { createPlaylist, getUserPlaylists, getPlaylistDetails, getPublicPlaylists, addSongToPlaylist, removeSongFromPlaylist } = require('../controllers/playlistController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createPlaylist);
router.get('/', authMiddleware, getUserPlaylists);
router.get('/public', getPublicPlaylists);
router.get('/:playlistId', authMiddleware, getPlaylistDetails);
router.post('/:playlistId/add-song/:songId', authMiddleware, addSongToPlaylist);
router.delete('/:playlistId/remove-song/:songId', authMiddleware, removeSongFromPlaylist);

module.exports = router;
