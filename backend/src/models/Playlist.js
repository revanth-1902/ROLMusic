const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  playlistName: { type: String, required: true, trim: true },
  privacy: { type: String, enum: ['public', 'private'], default: 'private' },
  songs: [{ type: Object }],
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);
