import express from 'express';
import bcrypt from 'bcryptjs';
import { generateTokens } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({ 
        error: 'Email, username, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await req.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await req.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        level: true,
        experience: true,
        coins: true,
        createdAt: true
      }
    });

    // Generate tokens
    const tokens = generateTokens(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      ...tokens
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user
    const user = await req.prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Generate tokens
    const tokens = generateTokens(user.id);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      ...tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, firstName, lastName, avatar } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ 
        error: 'Google ID and email are required' 
      });
    }

    // Check if user exists
    let user = await req.prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email }
        ]
      }
    });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user = await req.prisma.user.update({
          where: { id: user.id },
          data: { googleId }
        });
      }
    } else {
      // Create new user
      const username = email.split('@')[0] + Math.random().toString(36).substr(2, 4);
      
      user = await req.prisma.user.create({
        data: {
          googleId,
          email,
          username,
          firstName,
          lastName,
          avatar
        }
      });
    }

    // Generate tokens
    const tokens = generateTokens(user.id);

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Google login successful',
      user: userWithoutPassword,
      ...tokens
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});

// Apple OAuth login
router.post('/apple', async (req, res) => {
  try {
    const { appleId, email, firstName, lastName } = req.body;

    if (!appleId) {
      return res.status(400).json({ 
        error: 'Apple ID is required' 
      });
    }

    // Check if user exists
    let user = await req.prisma.user.findFirst({
      where: {
        OR: [
          { appleId },
          email ? { email } : {}
        ].filter(Boolean)
      }
    });

    if (user) {
      // Update Apple ID if not set
      if (!user.appleId) {
        user = await req.prisma.user.update({
          where: { id: user.id },
          data: { appleId }
        });
      }
    } else {
      // Create new user
      const username = (email ? email.split('@')[0] : 'user') + 
                      Math.random().toString(36).substr(2, 4);
      
      user = await req.prisma.user.create({
        data: {
          appleId,
          email,
          username,
          firstName,
          lastName
        }
      });
    }

    // Generate tokens
    const tokens = generateTokens(user.id);

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Apple login successful',
      user: userWithoutPassword,
      ...tokens
    });
  } catch (error) {
    console.error('Apple login error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Apple' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if user still exists
    const user = await req.prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        level: true,
        experience: true,
        coins: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);

    res.json({
      message: 'Token refreshed successfully',
      user,
      ...tokens
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export default router;
