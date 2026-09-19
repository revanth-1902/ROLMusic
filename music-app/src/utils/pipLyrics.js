/**
 * Picture-in-Picture (PiP) Floating Lyric Window Utility
 * Renders album art, track details, and active LRC lyrics to a canvas stream in a floating video window
 */

let pipVideo = null;
let pipCanvas = null;
let pipCtx = null;
let currentSongData = null;
let currentLyricText = '';

export const isPiPSupported = () => {
  return typeof document !== 'undefined' && 'pictureInPictureEnabled' in document;
};

export const initPiPLyricsCanvas = () => {
  if (!pipCanvas) {
    pipCanvas = document.createElement('canvas');
    pipCanvas.width = 512;
    pipCanvas.height = 512;
    pipCtx = pipCanvas.getContext('2d');
  }

  if (!pipVideo) {
    pipVideo = document.createElement('video');
    pipVideo.muted = true;
    pipVideo.playsInline = true;
    pipVideo.srcObject = pipCanvas.captureStream(30);
  }
};

export const renderPiPFrame = (song, activeLyric) => {
  if (!pipCtx || !pipCanvas) initPiPLyricsCanvas();
  currentSongData = song;
  currentLyricText = activeLyric || '♪ Playing on ROLMusic ♪';

  const width = pipCanvas.width;
  const height = pipCanvas.height;

  // Background
  const grad = pipCtx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(0.5, '#1e1b4b');
  grad.addColorStop(1, '#020617');
  pipCtx.fillStyle = grad;
  pipCtx.fillRect(0, 0, width, height);

  // Cover image / placeholder
  const title = song?.title || 'ROLMusic';
  const artist = song?.artistName || song?.artist || 'Now Playing';

  // Card box
  pipCtx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  pipCtx.beginPath();
  pipCtx.roundRect(24, 24, width - 48, height - 48, 24);
  pipCtx.fill();

  // Header Title
  pipCtx.fillStyle = '#ec4899';
  pipCtx.font = 'bold 20px sans-serif';
  pipCtx.textAlign = 'center';
  pipCtx.fillText('ROL MUSIC', width / 2, 64);

  // Track Title
  pipCtx.fillStyle = '#ffffff';
  pipCtx.font = 'bold 28px sans-serif';
  const truncatedTitle = title.length > 25 ? title.substring(0, 24) + '...' : title;
  pipCtx.fillText(truncatedTitle, width / 2, 120);

  // Artist Name
  pipCtx.fillStyle = '#94a3b8';
  pipCtx.font = '500 20px sans-serif';
  pipCtx.fillText(artist, width / 2, 155);

  // Lyric Divider Line
  pipCtx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
  pipCtx.lineWidth = 2;
  pipCtx.beginPath();
  pipCtx.moveTo(80, 190);
  pipCtx.lineTo(width - 80, 190);
  pipCtx.stroke();

  // Active Lyric Display (Word Wrap)
  pipCtx.fillStyle = '#38bdf8';
  pipCtx.font = 'bold 26px sans-serif';
  pipCtx.textAlign = 'center';

  const words = currentLyricText.split(' ');
  let line = '';
  let y = 260;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = pipCtx.measureText(testLine);
    if (metrics.width > width - 96 && n > 0) {
      pipCtx.fillText(line, width / 2, y);
      line = words[n] + ' ';
      y += 38;
    } else {
      line = testLine;
    }
  }
  pipCtx.fillText(line, width / 2, y);
};

export const togglePiPLyrics = async (song, activeLyric) => {
  if (!isPiPSupported()) {
    throw new Error('Picture-in-Picture is not supported in this browser');
  }

  initPiPLyricsCanvas();
  renderPiPFrame(song, activeLyric);

  if (document.pictureInPictureElement) {
    await document.exitPictureInPicture();
    return false;
  } else {
    await pipVideo.play();
    await pipVideo.requestPictureInPicture();
    return true;
  }
};
