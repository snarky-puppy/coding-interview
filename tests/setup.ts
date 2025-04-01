// Setup file for Jest tests

// Mock Express
jest.mock('express', () => {
  const express = jest.fn(() => ({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    listen: jest.fn((port, cb) => {
      if (cb) cb();
      return { close: jest.fn() };
    }),
  }));
  express.Router = jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }));
  express.json = jest.fn();
  express.urlencoded = jest.fn();
  express.static = jest.fn();
  return express;
});

// Mock PostgreSQL
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

// Mock Express Session
jest.mock('express-session', () => {
  return jest.fn(() => (req, res, next) => {
    req.session = {
      userId: 1,
      username: 'test',
      role: 'employee',
      authenticated: true,
      destroy: jest.fn((cb) => cb()),
    };
    next();
  });
});

// Mock body-parser
jest.mock('body-parser', () => ({
  json: jest.fn(() => (req, res, next) => next()),
  urlencoded: jest.fn(() => (req, res, next) => next()),
}));

// Mock cookie-parser
jest.mock('cookie-parser', () => {
  return jest.fn(() => (req, res, next) => next());
});

// Global mock for Request and Response objects
global.mockRequest = () => ({
  body: {},
  params: {},
  query: {},
  session: {
    userId: 1,
    username: 'test',
    role: 'employee',
    authenticated: true,
    destroy: jest.fn((cb) => cb && cb()),
  },
  cookies: {},
});

global.mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.sendFile = jest.fn().mockReturnValue(res);
  res.header = jest.fn().mockReturnValue(res);
  return res;
};

// Mock fetch for frontend tests
global.fetch = jest.fn();