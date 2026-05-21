const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/',    verifyToken, courseController.addCourse);
router.get('/',     verifyToken, courseController.getCourses);
router.get('/:id',  verifyToken, courseController.getCourseById);
router.put('/:id',  verifyToken, courseController.updateCourse);
router.delete('/:id', verifyToken, courseController.deleteCourse);

module.exports = router;
