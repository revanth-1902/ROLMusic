import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getLikedSongs } from '../api/authApi';
import SongListItem from '../components/common/SongListItem';
import '../components/styles/page.css';

export default function Favourites() {
  const { token, loginType, openAuthModal } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loginType !== 'user') {
      openAuthModal('Login required to view your favourite songs');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const data = await getLikedSongs(token);
        setSongs(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [loginType, token, openAuthModal]);

  if (loading) {
    return <Box className="page-container"><CircularProgress sx={{ color: '#6c63ff' }} /></Box>;
  }

  return (
    <Box className="page-container">
      <div className="page-header">
        <Typography variant="h4" className="page-title">♡ Favourites</Typography>
        <Typography className="page-sub">Your liked songs</Typography>
      </div>

      {songs.length === 0 ? (
        <div className="page-empty">
          <div className="empty-icon">♡</div>
          <p>No liked songs yet.</p>
        </div>
      ) : (
        <div className="songs-list-container">
          {songs.map((song, index) => (
            <SongListItem key={song._id || song.id || `${song.title}-${index}`} song={song} index={index + 1} />
          ))}
        </div>
      )}
    </Box>
  );
}
