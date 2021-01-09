const { Router } = require('express');

const router = Router();

router.get('/some-async-data', (req, res) => {
  res.json({ success: true, data: 'some async data' });
});

module.exports = router;
