import rateLimit,{ ipKeyGenerator } from 'express-rate-limit';


export const strictLimiterIpBased = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  
  // No keyGenerator = defaults to req.ip
});



// Strict limiter for sensitive operations (auth, payments)
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 20,
  message: 'Too many attempts, please try again later .',
  standardHeaders: true,
  legacyHeaders: false,
//   skipSuccessfulRequests: true,
  keyGenerator: (req, res) => {
    // Use user ID if authenticated, otherwise use IP
     return req.user ? req.user.id : ipKeyGenerator(req, res);
  }
});
// General limiter for most routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: 'Too many requests, please try again later .',
  standardHeaders: true,
  legacyHeaders: false,
});

// Lenient limiter for read-only operations
export const lenientLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});