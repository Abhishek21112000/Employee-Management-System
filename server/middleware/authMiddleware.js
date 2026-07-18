import jwt from 'jsonwebtoken';
import Employee from '../models/Employee.js';

const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies or Authorization header
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.employee = await Employee.findById(decoded.userId).select('-password');

      if (!req.employee) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.employee || !roles.includes(req.employee.role)) {
      return res.status(403).json({
        message: `Role ${req.employee?.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

export { protect, authorize };
