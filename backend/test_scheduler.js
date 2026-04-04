const scheduler = require('./services/scheduler');

const mockData = [
    { subject: 'Computer Science', task: 'Data Structures', marks: 80, daysToExam: 2 }, // Priority 40
    { subject: 'Mathematics', task: 'Calculus', marks: 100, daysToExam: 10 },           // Priority 10
    { subject: 'Physics', task: 'Thermodynamics', marks: 50, daysToExam: 5 },           // Priority 10
    { subject: 'English', task: 'Literature Review', marks: 30, daysToExam: 15 }        // Priority 2
];

console.log("Testing Scheduler Logic...");
const plan = scheduler.createPlan(mockData);

let pass = true;
for (const item of plan) {
    console.log(`- Scheduled: ${item.startTime} to ${item.endTime} : ${item.subject} | Priority: ${item.priority.toFixed(2)}`);

    const startHour = parseInt(item.startTime.split(':')[0]);

    if (startHour >= 9 && startHour < 17) {
        console.error(`❌ Constraint Violation: Task scheduled during class hours (${item.startTime})`);
        pass = false;
    }
    if (item.startTime === '13:00') {
        console.error(`❌ Constraint Violation: Task scheduled during lunch (${item.startTime})`);
        pass = false;
    }
    if (item.startTime === '20:30') {
        console.error(`❌ Constraint Violation: Task scheduled during dinner (${item.startTime})`);
        pass = false;
    }
}

if (pass) {
    console.log('✅ ALL CONSTRAINTS MET! Test Passed.');
} else {
    console.log('❌ CONSTRAINTS FAILED!');
}
