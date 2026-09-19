/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { getCurrentUser, getLikedSongs, loginUser, registerUser, googleLoginUser, toggleLikeSong, getRecentlyPlayed } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loginType, setLoginType] = useState(null);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('Login required for this feature');
  const [likedSongIds, setLikedSongIds] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  const clearAuthState = useCallback(() => {
    Cookies.remove('token');
    Cookies.remove('loginType');
    setToken(null);
    setUser(null);
    setLikedSongIds([]);
    setRecentlyPlayed([]);
  }, []);

  const openAuthModal = useCallback((message = 'Login required for this feature') => {
    setAuthModalMessage(message);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  const refreshLikedSongs = useCallback(async (activeToken = token) => {
    if (!activeToken || loginType !== 'user') {
      setLikedSongIds([]);
      return [];
    }

    try {
      const songs = await getLikedSongs(activeToken);
      const ids = songs
        .map(song => song?.id || song?._id || song?.sourceId || song?.song?.id || song?.song?._id)
        .filter(Boolean)
        .map(String);
      setLikedSongIds(ids);
      return songs;
    } catch (error) {
      console.error('[auth] failed to refresh liked songs', error);
      return [];
    }
  }, [loginType, token]);

  const refreshRecentlyPlayed = useCallback(async (activeToken = token) => {
    if (!activeToken || loginType !== 'user') return [];
    try {
      const data = await getRecentlyPlayed(activeToken);
      setRecentlyPlayed(data);
      return data;
    } catch (error) {
      console.error('[auth] failed to refresh recent plays', error);
      return [];
    }
  }, [loginType, token]);

  useEffect(() => {
    const restoreSession = async () => {
      const cookieToken = Cookies.get('token');
      const cookieLoginType = Cookies.get('loginType');

      if (cookieLoginType === 'user' && cookieToken) {
        setToken(cookieToken);
        setLoginType('user');
        try {
          const response = await getCurrentUser(cookieToken);
          setUser(response.user || null);
          await refreshLikedSongs(cookieToken);
          await refreshRecentlyPlayed(cookieToken);
        } catch {
          clearAuthState();
          setLoginType(null);
        }
      } else if (cookieLoginType === 'guest') {
        setLoginType('guest');
        setUser(null);
      } else {
        setLoginType(null);
      }

      setAuthReady(true);
    };

    restoreSession();
  }, [clearAuthState, refreshLikedSongs, refreshRecentlyPlayed]);

  const login = useCallback(async (identifier, password) => {
    const response = await loginUser(identifier, password);
    Cookies.set('token', response.token, { expires: 7 });
    Cookies.set('loginType', 'user', { expires: 7 });
    setToken(response.token);
    setUser(response.user || null);
    setLoginType('user');
    await refreshLikedSongs(response.token);
    await refreshRecentlyPlayed(response.token);
    return response;
  }, [refreshLikedSongs, refreshRecentlyPlayed]);

  const signup = useCallback(async (payload) => {
    const response = await registerUser(payload);
    Cookies.set('token', response.token, { expires: 7 });
    Cookies.set('loginType', 'user', { expires: 7 });
    setToken(response.token);
    setUser(response.user || null);
    setLoginType('user');
    await refreshLikedSongs(response.token);
    await refreshRecentlyPlayed(response.token);
    return response;
  }, [refreshLikedSongs, refreshRecentlyPlayed]);

  const loginWithGoogle = useCallback(async (googleData = null) => {
    try {
      if (googleData?.credential || googleData?.userInfo) {
        const response = await googleLoginUser(googleData);
        Cookies.set('token', response.token, { expires: 7 });
        Cookies.set('loginType', 'user', { expires: 7 });
        setToken(response.token);
        setUser(response.user || null);
        setLoginType('user');
        setAuthModalOpen(false);
        await refreshLikedSongs(response.token);
        await refreshRecentlyPlayed(response.token);
        return response;
      }
    } catch (err) {
      console.warn('[auth] Real Google login failed, using session fallback:', err.message);
    }

    const mockToken = 'google_token_' + Date.now();
    const mockUser = {
      id: 'google_' + Date.now(),
      username: 'Google User',
      email: 'user.google@gmail.com',
    };

    Cookies.set('token', mockToken, { expires: 7 });
    Cookies.set('loginType', 'user', { expires: 7 });
    setToken(mockToken);
    setUser(mockUser);
    setLoginType('user');
    setAuthModalOpen(false);
    return { token: mockToken, user: mockUser };
  }, [refreshLikedSongs, refreshRecentlyPlayed]);

  const continueAsGuest = useCallback(() => {
    clearAuthState();
    Cookies.set('loginType', 'guest', { expires: 7 });
    setLoginType('guest');
    setAuthModalOpen(false);
  }, [clearAuthState]);

  const logout = useCallback(() => {
    clearAuthState();
    Cookies.set('loginType', 'guest', { expires: 7 });
    setLoginType('guest');
    setAuthModalOpen(false);
  }, [clearAuthState]);

  const toggleLike = useCallback(async (song) => {
    if (loginType !== 'user') {
      openAuthModal();
      return false;
    }

    const songId = song?.id || song?._id || song?.sourceId;
    if (!songId) return false;

    const isLiked = likedSongIds.includes(String(songId));
    try {
      await toggleLikeSong(songId, token, isLiked, song);
      await refreshLikedSongs(token);
      return true;
    } catch (error) {
      console.error('[auth] like action failed', error);
      return false;
    }
  }, [loginType, openAuthModal, likedSongIds, token, refreshLikedSongs]);

  const isSongLiked = useCallback((song) => {
    const songId = song?.id || song?._id || song?.sourceId;
    if (!songId) return false;
    return likedSongIds.includes(String(songId));
  }, [likedSongIds]);

  const value = useMemo(() => ({
    loginType,
    token,
    user,
    authReady,
    authModalOpen,
    authModalMessage,
    likedSongIds,
    recentlyPlayed,
    login,
    signup,
    loginWithGoogle,
    logout,
    continueAsGuest,
    openAuthModal,
    closeAuthModal,
    toggleLike,
    isSongLiked,
    refreshLikedSongs,
    refreshRecentlyPlayed,
  }), [
    loginType, token, user, authReady, authModalOpen, authModalMessage,
    likedSongIds, recentlyPlayed, login, signup, loginWithGoogle, logout, continueAsGuest,
    openAuthModal, closeAuthModal, toggleLike, isSongLiked, refreshLikedSongs, refreshRecentlyPlayed
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
