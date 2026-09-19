const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phoneNumber: { type: String, required: false, unique: true, sparse: true, trim: true },
  password: { type: String, required: true },
  recentlyPlayed: [{
    song: { type: Object, required: true },
    playedAt: { type: Date, default: Date.now },
  }],
  likedSongs: [{
    song: { type: Object, required: true },
    likedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
