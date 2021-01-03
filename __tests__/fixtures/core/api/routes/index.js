import app from 'express';

const router = app.Router();

class TestError extends Error {
  constructor() {
    super();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TestError);
    }

    this.name = 'TestError';
    this.message = 'something went wrong';
    this.status = 500;
    this.data = { test: 'some data' };
  }
}

router.get('/error', (req, res, next) => {
  next(new Error('something went wrong'));
});

router.get('/individual-error', (req, res, next) => {
  next(new TestError());
});

module.exports = router;
