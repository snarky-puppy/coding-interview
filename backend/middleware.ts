import express from 'express';

// Basic authentication middleware (intentionally flawed)
export const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.authenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Insecure role check - just trusts the role in the session
// Doesn't verify against database - intentionally insecure
export const isManager = (req: express.Request): boolean => {
  return req.session.role === 'manager' || req.session.role === 'admin';
};
