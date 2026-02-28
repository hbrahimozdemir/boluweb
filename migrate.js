const fs = require('fs');

const months = {
    'Ocak': '01',
    'Şubat': '02',
    'Mart': '03',
    'Nisan': '04',
    'Mayıs': '05',
    'Haziran': '06',
    'Temmuz': '07',
    'Ağustos': '08',
    'Eylül': '09',
    'Ekim': '10',
    'Kasım': '11',
    'Aralık': '12'
};

function parseTurkishDateToISO(dateStr) {
    if (!dateStr) return '';
    try {
        const parts = dateStr.trim().split(' ');
        if (parts.length === 3) {
            let day = parts[0];
            if (day.length === 1) day = '0' + day;
            const monthName = parts[1];
            const year = parts[2];
            const month = months[monthName];
            if (month && year && year.length === 4) {
                return `${year}-${month}-${day}`;
            }
        }
        // If it's already a valid date string or something else, try splitting slightly differently?
        // Fallback or leave as is if parsing fails
        return dateStr;
    } catch (e) {
        return dateStr;
    }
}

const contentPath = 'public/content.json';
const data = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

if (data.events) {
    data.events = data.events.map(e => ({ ...e, date: parseTurkishDateToISO(e.date) }));
}

if (data.announcements) {
    data.announcements = data.announcements.map(a => ({ ...a, date: parseTurkishDateToISO(a.date) }));
}

fs.writeFileSync(contentPath, JSON.stringify(data, null, 4));
console.log('Migration completed successfully.');
