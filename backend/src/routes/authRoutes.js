const express = require('express');
const { register, login, getMe, googleLogin } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', authMiddleware, getMe);

module.exports = router;
