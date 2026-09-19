const mongoose = require('mongoose');
const Song = require('../models/Song');
const { MONGO_URI } = require('../config/env');

async function seed() {
  await mongoose.connect(MONGO_URI);
  await Song.deleteMany({});

  const songs = [
    {
      title: 'Midnight City',
      artist: 'M83',
      album: 'Hurry Up, We’re Dreaming',
      albumCover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81',
      duration: 242,
      genre: 'Synthwave',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      releaseDate: '2011-10-10',
    },
    {
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      albumCover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
      duration: 200,
      genre: 'Pop',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      releaseDate: '2020-11-20',
    },
  ];

  await Song.insertMany(songs);
  console.log('Seeded songs');
  mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
