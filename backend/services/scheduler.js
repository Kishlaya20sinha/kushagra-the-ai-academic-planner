exports.createPlan = (parsedData) => {
    // Expected structure from Gemini: { subjectSniper: [], priorityQueue: [], contextualAlerts: [] }
    const { subjectSniper = [], priorityQueue = [], contextualAlerts = [] } = parsedData;

    // 1. Process Priority Queue
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const processedQueue = priorityQueue
        .filter(task => {
            // Hard Drop: 0-credit or unwanted classes
            if (task.credits === 0 || task.subject.toLowerCase().includes('constitution')) return false;
            if (task.subject.toLowerCase().includes('summer training') || task.title.toLowerCase().includes('summer training')) return false;

            // Calculate exact days left based on today's real date
            const examDate = new Date(task.examDate);
            if (isNaN(examDate.getTime())) {
                task.calculatedDaysLeft = 30; // fallback if AI fails to find date
                return true;
            }

            const timeDiff = examDate.getTime() - today.getTime();
            const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

            // Drop if the exam is already over!
            if (daysLeft < 0) return false;

            task.calculatedDaysLeft = daysLeft === 0 ? 1 : daysLeft;
            return true;
        })
        .map(task => {
            let days = task.calculatedDaysLeft;
            let marks = parseInt(task.marks) || 0;
            let credits = parseFloat(task.credits) || 1;

            // Priority logic: Multiply by credits so 4.0 courses outweigh 1.5 labs
            const priorityScore = (marks * credits) / days;

            return {
                ...task,
                daysLeft: days,
                priorityScore
            };
        }).sort((a, b) => b.priorityScore - a.priorityScore);

    // 2. Build 7-Day Calendar Events
    const calendarEvents = [];
    let queueIndex = 0;

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + dayOffset);
        currentDate.setHours(0, 0, 0, 0);

        const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

        // Fixed Classes (Monday - Friday)
        if (!isWeekend) {
            // Morning Block 9:00 - 13:00
            const morningStart = new Date(currentDate);
            morningStart.setHours(9, 0, 0);
            const morningEnd = new Date(currentDate);
            morningEnd.setHours(13, 0, 0);

            calendarEvents.push({
                title: 'Fixed Class/Lab',
                start: morningStart,
                end: morningEnd,
                allDay: false,
                resourceColor: '#10b981', // Green for fixed
                isFixedClass: true,
                priorityScore: 0
            });

            // Afternoon Block 14:00 - 17:00
            const noonStart = new Date(currentDate);
            noonStart.setHours(14, 0, 0);
            const noonEnd = new Date(currentDate);
            noonEnd.setHours(17, 0, 0);

            calendarEvents.push({
                title: 'Fixed Class/Lab',
                start: noonStart,
                end: noonEnd,
                allDay: false,
                resourceColor: '#10b981',
                isFixedClass: true,
                priorityScore: 0
            });
        }

        // Available Study Blocks (Morning 5-8, Evening 18-20:30, Night 21:30-23:30)
        const studyBlocks = [
            { startH: 5, startM: 0, endH: 8, endM: 0 },
            { startH: 18, startM: 0, endH: 20, endM: 30 },
            { startH: 21, startM: 30, endH: 23, endM: 30 }
        ];

        // On weekends, add more study blocks (e.g. 10-13, 14-17)
        if (isWeekend) {
            studyBlocks.push({ startH: 10, startM: 0, endH: 13, endM: 0 });
            studyBlocks.push({ startH: 14, startM: 0, endH: 17, endM: 0 });
        }

        for (const block of studyBlocks) {
            const blockStart = new Date(currentDate);
            blockStart.setHours(block.startH, block.startM, 0);
            const blockEnd = new Date(currentDate);
            blockEnd.setHours(block.endH, block.endM, 0);

            // Find the highest-priority task that still has time left on this day.
            // Cycle round-robin through the queue so all subjects get repeated coverage
            // rather than exhausting the list and falling back to "Self Study".
            const eligibleTasks = processedQueue.filter(t => t.daysLeft > dayOffset);

            if (eligibleTasks.length > 0) {
                const task = eligibleTasks[queueIndex % eligibleTasks.length];
                queueIndex++;

                calendarEvents.push({
                    title: `[${task.subject}] ${task.title}`,
                    start: blockStart,
                    end: blockEnd,
                    allDay: false,
                    resourceColor: task.priorityScore > 10 ? '#ef4444' : (task.priorityScore > 5 ? '#f59e0b' : '#3b82f6'),
                    isFixedClass: false,
                    priorityScore: task.priorityScore
                });
            } else {
                calendarEvents.push({
                    title: `Self Study / Skill Up Time`,
                    start: blockStart,
                    end: blockEnd,
                    allDay: false,
                    resourceColor: '#8b5cf6',
                    isFixedClass: false,
                    priorityScore: 0
                });
            }
        }
    }

    // Return the 4-part structure as expected by the controller
    return {
        calendarEvents,
        subjectCards: subjectSniper,
        todoList: processedQueue,
        alerts: contextualAlerts
    };
};
