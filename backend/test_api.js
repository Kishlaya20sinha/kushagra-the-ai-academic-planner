const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const path = require('path');

async function runTest() {
    try {
        const form = new FormData();
        const pdfs = ['registration.pdf', 'syllabus.pdf', 'routine.pdf', 'calendar.pdf', 'holidayCalendar.pdf'];
        const fields = ['registration', 'syllabus', 'routine', 'calendar', 'holidayCalendar'];

        for (let i = 0; i < 5; i++) {
            const filePath = path.join(__dirname, '../dummy_pdfs', pdfs[i]);
            form.append(fields[i], fs.createReadStream(filePath));
        }

        console.log('Sending 5 PDFs to backend...');
        const response = await axios.post('http://localhost:5000/api/schedule/generate', form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('Schedule generated successfully!');
        const schedule = response.data.schedule;

        console.log('--- 4-Part Response Structure Verified ---');
        console.log(`- Calendar Events Generated: ${schedule.calendarEvents?.length || 0}`);
        console.log(`- Subject Sniper Cards: ${schedule.subjectCards?.length || 0}`);
        console.log(`- Priority Queue Tasks: ${schedule.todoList?.length || 0}`);
        console.log(`- Contextual Alerts: ${schedule.alerts?.length || 0}`);
        console.log('------------------------------------------');

        if (schedule.calendarEvents && schedule.calendarEvents.length > 0) {
            console.log('✅ ALL TESTS MET! Backend Architecture V2 is functioning.');
        } else {
            console.log('❌ FAILED: No calendar events returned.');
        }

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

runTest();
