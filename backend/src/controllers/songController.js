const mongoose = require('mongoose');
const Song = require('../models/Song');
const User = require('../models/User');

async function findSongByIdentifier(songId, songData = null) {
  if (!songId) return null;
  const isMongoId = mongoose.Types.ObjectId.isValid(songId);
  let song = null;

  if (isMongoId) {
    song = await Song.findOne({ $or: [{ _id: songId }, { sourceId: songId }] });
  } else {
    song = await Song.findOne({ sourceId: songId });
  }

  if (!song && songData && (songData.title || songData.name)) {
    const sourceId = songData.sourceId || songData.id || songId;
    const existing = await Song.findOne({ sourceId });
    if (existing) return existing;

    song = await Song.create({
      sourceId,
      title: songData.title || songData.name || 'Untitled',
      artist: songData.artist || songData.artistName || 'Unknown Artist',
      album: songData.album || '',
      albumCover: songData.albumCover || songData.cover || '',
      duration: Number(songData.duration) || 0,
      genre: songData.genre || '',
      audioUrl: songData.audioUrl || songData.src || '',
      releaseDate: songData.releaseDate ? new Date(songData.releaseDate) : undefined,
    });
  }

  return song;
}

async function getSongs(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [songs, total] = await Promise.all([
      Song.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      Song.countDocuments(),
    ]);

    res.json({ success: true, data: songs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
}

async function createSong(req, res, next) {
  try {
    const sourceId = req.body?.sourceId || req.body?.id;
    if (sourceId) {
      const existing = await Song.findOne({ sourceId });
      if (existing) {
        return res.status(200).json({ success: true, data: existing });
      }
    }

    const payload = {
      ...req.body,
      sourceId: sourceId || undefined,
      title: req.body.title || req.body.name || 'Untitled',
      artist: req.body.artist || req.body.artistName || 'Unknown Artist',
      albumCover: req.body.albumCover || req.body.cover || '',
      audioUrl: req.body.audioUrl || req.body.src || '',
    };

    const song = await Song.create(payload);
    res.status(201).json({ success: true, data: song });
  } catch (error) {
    next(error);
  }
}

async function likeSong(req, res, next) {
  try {
    const { songId } = req.params;
    const user = await User.findById(req.user._id);
    let song = await findSongByIdentifier(songId, req.body);
    const songObj = song ? song.toObject() : (req.body && (req.body.title || req.body.id) ? { ...req.body, id: req.body.id || songId, sourceId: req.body.sourceId || songId } : { id: songId });

    const targetIdStr = String(songId);
    const alreadyLiked = user.likedSongs.some(item => {
      if (!item.song) return false;
      const s = item.song;
      const id1 = s._id ? String(s._id) : null;
      const id2 = s.id ? String(s.id) : null;
      const id3 = s.sourceId ? String(s.sourceId) : null;
      return id1 === targetIdStr || id2 === targetIdStr || id3 === targetIdStr || String(item.song) === targetIdStr;
    });

    if (alreadyLiked) {
      return res.status(409).json({ success: false, error: 'Song already liked' });
    }

    user.likedSongs.push({ song: songObj, likedAt: new Date() });
    await user.save();

    res.status(201).json({ success: true, data: user.likedSongs[user.likedSongs.length - 1] });
  } catch (error) {
    next(error);
  }
}

async function unlikeSong(req, res, next) {
  try {
    const { songId } = req.params;
    const user = await User.findById(req.user._id);
    const targetIdStr = String(songId);

    user.likedSongs = user.likedSongs.filter(item => {
      if (!item.song) return false;
      const s = item.song;
      const id1 = s._id ? String(s._id) : null;
      const id2 = s.id ? String(s.id) : null;
      const id3 = s.sourceId ? String(s.sourceId) : null;
      return id1 !== targetIdStr && id2 !== targetIdStr && id3 !== targetIdStr && String(item.song) !== targetIdStr;
    });

    await user.save();
    res.json({ success: true, message: 'Song unliked successfully' });
  } catch (error) {
    next(error);
  }
}

async function playSong(req, res, next) {
  try {
    const { songId } = req.params;
    let song = await findSongByIdentifier(songId, req.body);
    const songObj = song ? song.toObject() : (req.body && (req.body.title || req.body.id) ? { ...req.body, id: req.body.id || songId, sourceId: req.body.sourceId || songId } : { id: songId });

    const user = await User.findById(req.user._id);
    const targetIdStr = String(songId);

    const existingIndex = user.recentlyPlayed.findIndex(item => {
      if (!item.song) return false;
      const s = item.song;
      const id1 = s._id ? String(s._id) : null;
      const id2 = s.id ? String(s.id) : null;
      const id3 = s.sourceId ? String(s.sourceId) : null;
      return id1 === targetIdStr || id2 === targetIdStr || id3 === targetIdStr || String(item.song) === targetIdStr;
    });

    if (existingIndex >= 0) {
      user.recentlyPlayed.splice(existingIndex, 1);
    }

    user.recentlyPlayed.unshift({ song: songObj, playedAt: new Date() });
    user.recentlyPlayed = user.recentlyPlayed.slice(0, 20);
    await user.save();

    res.json({ success: true, data: user.recentlyPlayed[0] });
  } catch (error) {
    next(error);
  }
}

module.exports = { findSongByIdentifier, getSongs, createSong, likeSong, unlikeSong, playSong };
