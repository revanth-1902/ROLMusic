import React, { useRef, useState } from 'react';
import { Modal, Box, Typography, Button, IconButton, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import { triggerHaptic } from '../../utils/haptics';

const THEMES = {
  neon: { name: 'Neon Glass', bg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)', text: '#ffffff', highlight: '#ec4899', cardBg: 'rgba(255, 255, 255, 0.07)' },
  velvet: { name: 'Dark Velvet', bg: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)', text: '#f4f4f5', highlight: '#a855f7', cardBg: 'rgba(255, 255, 255, 0.05)' },
  sunset: { name: 'Sunset Glow', bg: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #9a3412 100%)', text: '#fff7ed', highlight: '#f97316', cardBg: 'rgba(255, 255, 255, 0.1)' },
  cyberpunk: { name: 'Cyberpunk', bg: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #042f2e 100%)', text: '#e0f2fe', highlight: '#06b6d4', cardBg: 'rgba(6, 182, 212, 0.1)' },
};

export default function LyricCardModal({ open, onClose, song, lyricsLines = [] }) {
  const [selectedLyric, setSelectedLyric] = useState(lyricsLines[0]?.text || 'Music speaks when words fail.');
  const [themeKey, setThemeKey] = useState('neon');
  const cardRef = useRef(null);

  const theme = THEMES[themeKey] || THEMES.neon;

  const handleDownloadImage = () => {
    triggerHaptic(30);
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    // Background
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    if (themeKey === 'neon') {
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#311042');
    } else if (themeKey === 'sunset') {
      grad.addColorStop(0, '#431407');
      grad.addColorStop(0.5, '#7c2d12');
      grad.addColorStop(1, '#9a3412');
    } else if (themeKey === 'cyberpunk') {
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#042f2e');
    } else {
      grad.addColorStop(0, '#18181b');
      grad.addColorStop(1, '#09090b');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Inner Card
    ctx.fillStyle = theme.cardBg;
    ctx.beginPath();
    ctx.roundRect(80, 80, 920, 920, 40);
    ctx.fill();

    // App Brand Header
    ctx.fillStyle = theme.highlight;
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ROL MUSIC', 540, 180);

    // Lyric Quote
    ctx.fillStyle = theme.text;
    ctx.font = 'bold 54px sans-serif';
    
    const words = (selectedLyric || '♪').split(' ');
    let line = '';
    let y = 420;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 800 && n > 0) {
        ctx.fillText(line, 540, y);
        line = words[n] + ' ';
        y += 75;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 540, y);

    // Track Title & Artist footer
    ctx.fillStyle = theme.highlight;
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(song?.title || 'Song Title', 540, 840);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '32px sans-serif';
    ctx.fillText(song?.artistName || song?.artist || 'Artist', 540, 900);

    // Download PNG
    const link = document.createElement('a');
    link.download = `${(song?.title || 'lyric').toLowerCase().replace(/\s+/g, '-')}-card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 460 }, bg: '#090d16', borderRadius: '24px', p: 3,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff', outline: 'none'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            📸 Create Lyric Card
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#94a3b8' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Theme Select */}
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel sx={{ color: '#94a3b8' }}>Card Theme</InputLabel>
          <Select
            value={themeKey}
            label="Card Theme"
            onChange={(e) => setThemeKey(e.target.value)}
            sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
          >
            {Object.entries(THEMES).map(([k, t]) => (
              <MenuItem key={k} value={k}>{t.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Lyric Select */}
        {lyricsLines.length > 0 && (
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel sx={{ color: '#94a3b8' }}>Select Lyric Line</InputLabel>
            <Select
              value={selectedLyric}
              label="Select Lyric Line"
              onChange={(e) => setSelectedLyric(e.target.value)}
              sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
            >
              {lyricsLines.map((l, idx) => (
                <MenuItem key={idx} value={l.text}>
                  {l.text.length > 40 ? l.text.substring(0, 40) + '...' : l.text}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Card Preview */}
        <Box
          ref={cardRef}
          sx={{
            background: theme.bg, borderRadius: '16px', p: 3, mb: 3, textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)', minHeight: 200, display: 'flex',
            flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Typography sx={{ color: theme.highlight, fontSize: '0.75rem', fontWeight: 800, tracking: 2, mb: 1, textTransform: 'uppercase' }}>
            ROL Music
          </Typography>
          <Typography sx={{ color: theme.text, fontWeight: 700, fontSize: '1.25rem', mb: 2, fontStyle: 'italic', px: 1 }}>
            "{selectedLyric}"
          </Typography>
          <Typography sx={{ color: theme.highlight, fontWeight: 700, fontSize: '0.9rem' }}>
            {song?.title}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
            {song?.artistName || song?.artist}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadImage}
            sx={{
              borderRadius: '12px', background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              fontWeight: 700, textTransform: 'none', py: 1.2
            }}
          >
            Download Card Image
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
