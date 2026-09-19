const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  sourceId: { type: String, trim: true, unique: true, sparse: true },
  title: { type: String, required: true, trim: true },
  artist: { type: String, required: true, trim: true },
  album: { type: String, trim: true },
  albumCover: { type: String, trim: true },
  duration: { type: Number, required: true },
  genre: { type: String, trim: true },
  audioUrl: { type: String, required: true, trim: true },
  releaseDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Song', songSchema);
