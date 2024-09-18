const express = require('express');
const { createNote, getNotes, updateNote, deleteNote } = require('../controllers/noteController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').post(protect, createNote).get(protect, getNotes);
router.route('/:id').put(protect, admin, updateNote).delete(protect, admin, deleteNote);

module.exports = router;

