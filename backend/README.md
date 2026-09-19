# Music Streaming Backend

A production-ready Node.js + Express + MongoDB backend for a music streaming platform.

## Features
- JWT authentication with register/login
- Songs, liked songs, recently played and playlists
- Clean validation and error handling
- CORS, helmet and rate limiting
- Seed script for sample songs

## Quick start
1. Copy .env.example to .env and update values.
2. Install dependencies: npm install
3. Start the server: npm run dev
4. Seed sample songs: npm run seed

## API overview
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/songs
- POST /api/songs/:songId/like
- DELETE /api/songs/:songId/unlike
- POST /api/songs/:songId/play
- GET /api/users/liked-songs
- GET /api/users/recently-played
- POST /api/playlists
- POST /api/playlists/:playlistId/add-song/:songId
- DELETE /api/playlists/:playlistId/remove-song/:songId
- GET /api/playlists/public

## Example request
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","email":"demo@example.com","phoneNumber":"1234567890","password":"secret123"}'
```
