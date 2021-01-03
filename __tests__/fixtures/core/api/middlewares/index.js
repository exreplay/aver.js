import app from 'express';

const router = app.Router();

router.get('/middlewares', (req, res) => {
  res.send('test');
});

module.exports = router;
