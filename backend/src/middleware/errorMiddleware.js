const { sendError } = require('../utils/response');

const notFound = (req, res, next) => {
  return sendError(res, `Route not found: ${req.originalUrl}`, 404);
};

const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('[Error Middleware]:', err);
  }

  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal server error';

  // Handle Mongoose duplicate key (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    if (field === 'turfId' || (err.keyPattern && err.keyPattern.startTime)) {
      message = 'This slot has just been reserved by another customer. Please choose another slot.';
    } else if (field === 'email') {
      message = 'An account with this email address already exists.';
    } else {
      message = `Duplicate value entered for ${field}.`;
    }
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(', ');
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format: ${err.value}`;
  }

  return sendError(res, message, statusCode);
};

module.exports = {
  notFound,
  errorHandler,
};
