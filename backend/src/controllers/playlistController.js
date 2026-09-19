const Playlist = require('../models/Playlist');
const { findSongByIdentifier } = require('./songController');

async function createPlaylist(req, res, next) {
  try {
    const { playlistName, privacy = 'private' } = req.body;

    if (!playlistName) {
      return res.status(400).json({ success: false, error: 'playlistName is required' });
    }

    const playlist = await Playlist.create({ userId: req.user._id, playlistName, privacy });
    res.status(201).json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
}

async function getUserPlaylists(req, res, next) {
  try {
    const playlists = await Playlist.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: playlists });
  } catch (error) {
    next(error);
  }
}

async function getPlaylistDetails(req, res, next) {
  try {
    const { playlistId } = req.params;
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }

    if (playlist.userId.toString() !== req.user._id.toString() && playlist.privacy !== 'public') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
}

async function getPublicPlaylists(req, res, next) {
  try {
    const playlists = await Playlist.find({ privacy: 'public' }).sort({ createdAt: -1 });
    res.json({ success: true, data: playlists });
  } catch (error) {
    next(error);
  }
}

async function addSongToPlaylist(req, res, next) {
  try {
    const { playlistId, songId } = req.params;
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }

    if (playlist.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'You can only edit your own playlists' });
    }

    const song = await findSongByIdentifier(songId, req.body);
    const songObj = song ? song.toObject() : (req.body && (req.body.title || req.body.id) ? { ...req.body, id: req.body.id || songId, sourceId: req.body.sourceId || songId } : { id: songId });

    const targetIdStr = String(songId);
    const alreadyAdded = playlist.songs.some(item => {
      if (!item) return false;
      const id1 = item._id ? String(item._id) : null;
      const id2 = item.id ? String(item.id) : null;
      const id3 = item.sourceId ? String(item.sourceId) : null;
      return id1 === targetIdStr || id2 === targetIdStr || id3 === targetIdStr || String(item) === targetIdStr;
    });

    if (alreadyAdded) {
      return res.status(409).json({ success: false, error: 'Song already exists in playlist' });
    }

    playlist.songs.push(songObj);
    await playlist.save();

    res.json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
}

async function removeSongFromPlaylist(req, res, next) {
  try {
    const { playlistId, songId } = req.params;
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }

    if (playlist.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'You can only edit your own playlists' });
    }

    const targetIdStr = String(songId);
    playlist.songs = playlist.songs.filter(item => {
      if (!item) return false;
      const id1 = item._id ? String(item._id) : null;
      const id2 = item.id ? String(item.id) : null;
      const id3 = item.sourceId ? String(item.sourceId) : null;
      return id1 !== targetIdStr && id2 !== targetIdStr && id3 !== targetIdStr && String(item) !== targetIdStr;
    });

    await playlist.save();

    res.json({ success: true, message: 'Song removed from playlist' });
  } catch (error) {
    next(error);
  }
}

module.exports = { createPlaylist, getUserPlaylists, getPlaylistDetails, getPublicPlaylists, addSongToPlaylist, removeSongFromPlaylist };
