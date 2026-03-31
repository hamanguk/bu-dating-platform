const router = require('express').Router();
const { getEvents, createEvent, deleteEvent, toggleEventLike } = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', authenticate, getEvents);
router.post('/', authenticate, upload.array('images', 5), createEvent);
router.delete('/:id', authenticate, deleteEvent);
router.post('/:id/like', authenticate, toggleEventLike);

module.exports = router;
