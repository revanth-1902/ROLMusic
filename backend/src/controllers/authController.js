const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');

function signToken(user) {
  return jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

async function register(req, res, next) {
  try {
    const { username, email, phoneNumber, password } = req.body;

    if (!username || !email || !phoneNumber || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Username, email, or phone number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, phoneNumber, password: hashedPassword });
    const token = signToken(user);

    res.status(201).json({ success: true, token, user: { id: user._id, username: user.username, email: user.email, phoneNumber: user.phoneNumber } });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Identifier and password are required' });
    }

    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }, { phoneNumber: identifier }] });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = signToken(user);
    res.json({ success: true, token, user: { id: user._id, username: user.username, email: user.email, phoneNumber: user.phoneNumber } });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    res.json({ success: true, user: req.user, data: req.user });
  } catch (error) {
    next(error);
  }
}

async function googleLogin(req, res, next) {
  try {
    const { credential, userInfo } = req.body;
    let email, name;

    if (credential) {
      const { OAuth2Client } = require('google-auth-library');
      const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name || payload.given_name || email.split('@')[0];
    } else if (userInfo && userInfo.email) {
      email = userInfo.email;
      name = userInfo.name || email.split('@')[0];
    } else {
      return res.status(400).json({ success: false, error: 'Google credentials required' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      const baseUsername = name.replace(/\s+/g, '').toLowerCase() || 'googleuser';
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter++}`;
      }

      user = await User.create({
        username,
        email,
        phoneNumber: '0000000000',
        password: randomPassword,
      });
    }

    const token = signToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
      }
    });
  } catch (error) {
    console.error('[authController] Google login error:', error.message);
    res.status(401).json({ success: false, error: error.message || 'Google authentication failed' });
  }
}

module.exports = { register, login, getMe, googleLogin };
