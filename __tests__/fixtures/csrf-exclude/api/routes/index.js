const { Router } = require('express');

const router = Router();

router.post('/csrf', (req, res) => {
  res.json({ success: true });
});

router.post('/no-csrf', (req, res) => {
  res.json({ success: true });
});

module.exports = router;
