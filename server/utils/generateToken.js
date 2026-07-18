import jwt from 'jsonwebtoken';

const generateToken = (res, userId, role) => {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  // Set JWT as HTTP-Only cookie (optional, but good for security)
  // For this project, we'll also return it in the response so the frontend can store it in localStorage/memory if needed.
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Must be true for sameSite: 'none'
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // Allow cross-site cookies from Vercel to Render
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

export default generateToken;
