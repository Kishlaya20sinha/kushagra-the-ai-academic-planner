const express = require('express');
const router = express.Router();
const multer = require('multer');
const scheduleController = require('../controllers/scheduleController');

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Route to handle 5 PDF uploads
router.post('/generate', upload.fields([
    { name: 'registration', maxCount: 1 },
    { name: 'syllabus', maxCount: 1 },
    { name: 'routine', maxCount: 1 },
    { name: 'calendar', maxCount: 1 },
    { name: 'holidayCalendar', maxCount: 1 }
]), scheduleController.generateSchedule);

router.get('/', scheduleController.getSchedules);

module.exports = router;
