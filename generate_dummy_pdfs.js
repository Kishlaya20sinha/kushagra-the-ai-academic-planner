const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'dummy_pdfs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

function createPDF(filename, title, content) {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(path.join(outDir, filename)));
    doc.fontSize(25).text(title, 100, 100);
    doc.fontSize(12).text(content, 100, 150);
    doc.end();
}

createPDF('registration.pdf', 'Registration Slip', 'Student Name: John Doe\nSemester: Fall 2026\nSubjects:\n- Math 101\n- Physics 202\n- Computer Science 303\n- English 404');
createPDF('syllabus.pdf', 'Syllabus (300 Pages)', 'Math 101: Calculus and Algebra\nPhysics 202: Thermodynamics\nComputer Science 303: Data Structures\nEnglish 404: Literature Review\n\n(Imagine 300 pages of advanced detail here...)');
createPDF('routine.pdf', 'Routine (5 Pages)', 'Monday: 9 AM - 5 PM Classes\nTuesday: 9 AM - 5 PM Classes\nWednesday: 9 AM - 5 PM Classes\nThursday: 9 AM - 5 PM Classes\nFriday: 9 AM - 5 PM Classes\n\nLunch Break: 1:00 PM - 2:00 PM\nDinner: 8:30 PM - 9:30 PM');
createPDF('calendar.pdf', 'Academic Calendar', 'Semester Start: Today\nMidterms: In 45 Days\nFinals: In 90 Days\n\nMarks Distribution:\nMath: 100\nPhysics: 100\nCS: 100\nEnglish: 100');
createPDF('holidayCalendar.pdf', 'Holiday Calendar', 'National Holidays:\n- Republic Day: Jan 26\n- Independence Day: Aug 15\n\nUniversity Fest: Technika starts in 10 days.');
console.log('Dummy PDFs generated successfully in e:\\New folder\\dummy_pdfs');
