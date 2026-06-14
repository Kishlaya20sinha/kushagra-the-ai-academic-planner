const express = require('express');
const router = express.Router();
const multer = require('multer');
const scheduleController = require('../controllers/scheduleController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const pdfOnly = (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
        return cb(new Error(`Only PDF files are accepted. Received: ${file.mimetype}`));
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter: pdfOnly,
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB per file
});

const uploadFields = upload.fields([
    { name: 'registration', maxCount: 1 },
    { name: 'syllabus', maxCount: 1 },
    { name: 'routine', maxCount: 1 },
    { name: 'calendar', maxCount: 1 },
    { name: 'holidayCalendar', maxCount: 1 }
]);

router.post('/generate', (req, res, next) => {
    uploadFields(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, scheduleController.generateSchedule);

router.get('/', scheduleController.getSchedules);

module.exports = router;
