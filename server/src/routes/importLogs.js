const express = require('express');
const router = express.Router();
const ImportLog = require('../models/ImportLog');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const pageSize = 10;
    const total = await ImportLog.countDocuments();
    const logs = await ImportLog.find({})
      .sort({ importDate: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.json({
      logs,
      pages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch import logs.' });
  }
});

module.exports = router;