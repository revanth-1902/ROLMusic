const User = require('../models/User');

async function getLikedSongs(req, res, next) {
  try {
    const user = await User.findById(req.user._id).lean();
    const likedSongs = (user.likedSongs || []).map(item => item.song);
    res.json({ success: true, data: likedSongs });
  } catch (error) {
    next(error);
  }
}

async function getRecentlyPlayed(req, res, next) {
  try {
    const user = await User.findById(req.user._id).lean();
    const recentlyPlayed = (user.recentlyPlayed || []).slice(0, 20).sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));
    res.json({ success: true, data: recentlyPlayed });
  } catch (error) {
    next(error);
  }
}

module.exports = { getLikedSongs, getRecentlyPlayed };
