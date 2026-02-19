const router = require('express').Router();
const { createReport } = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const { reportLimiter } = require('../middleware/rateLimiter');

router.post('/', authenticate, reportLimiter, createReport);

module.exports = router;
