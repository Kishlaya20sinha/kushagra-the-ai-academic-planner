const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const calendarEventSchema = new Schema({
    title: String,
    start: Date,
    end: Date,
    allDay: Boolean,
    resourceColor: String, // e.g. '#ef4444' for high priority, '#10b981' for fixed class
    isFixedClass: Boolean,
    priorityScore: Number
});

const subjectCardSchema = new Schema({
    courseCode: String,
    name: String,
    topics: [String],
    weightageBreakdown: [{ testName: String, marks: Number }]
});

const priorityQueueSchema = new Schema({
    subject: String,
    title: String,
    priorityScore: Number,
    marks: Number,
    daysLeft: Number,
    tag: String // e.g. 'Critical', 'Low Priority'
});

const alertSchema = new Schema({
    alertType: String, // 'Fest Mode', 'Routine Conflict', 'General'
    message: String
});

const scheduleSchema = new Schema({
    createdAt: { type: Date, default: Date.now },
    calendarEvents: [calendarEventSchema],
    subjectCards: [subjectCardSchema],
    todoList: [priorityQueueSchema],
    alerts: [alertSchema]
});

module.exports = mongoose.model('Schedule', scheduleSchema);
