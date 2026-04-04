const Schedule = require('../models/Schedule');
const aiService = require('../services/aiService');
const scheduler = require('../services/scheduler');

exports.generateSchedule = async (req, res) => {
    try {
        const files = req.files;

        if (!files.registration || !files.syllabus || !files.routine || !files.calendar || !files.holidayCalendar) {
            return res.status(400).json({ error: 'All 5 PDFs are required' });
        }

        // 1. Process files using Gemini AI
        console.log("Analyzing PDFs with Gemini 2.5 Flash...");
        const parsedData = await aiService.parseDocuments(files);

        // 2. Schedule generation logic with constraints
        // (Classes 9-5, Lunch 1:00 PM, Dinner 8:30 PM, plus Holiday logic)
        console.log("Generating optimal schedule...");
        const { calendarEvents, subjectCards, todoList, alerts } = scheduler.createPlan(parsedData);

        // 3. Save to MongoDB
        const newSchedule = new Schedule({
            calendarEvents,
            subjectCards,
            todoList,
            alerts
        });
        await newSchedule.save();

        res.status(200).json({
            message: 'Schedule generated successfully',
            scheduleId: newSchedule._id,
            schedule: newSchedule
        });

    } catch (error) {
        console.error('Error generating schedule:', error);
        res.status(500).json({ error: 'Failed to generate schedule: ' + error.message });
    }
};

exports.getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find().sort({ createdAt: -1 });
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
};
