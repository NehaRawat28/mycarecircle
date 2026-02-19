const cron = require('node-cron');

const startReminderJob = () => {
    console.log('Starting reminder job...');
    
    // Run every hour (you can adjust this schedule)
    cron.schedule('0 * * * *', () => {
        console.log('Running reminder job...');
        // Add your reminder logic here
    });
    
    console.log('Reminder job scheduled successfully');
};

module.exports = startReminderJob;