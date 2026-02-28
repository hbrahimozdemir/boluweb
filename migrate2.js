const fs = require('fs');
const contentPath = 'public/content.json';
const data = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

function toDDMMYYYY(dateStr) {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}.${parts[1]}.${parts[0]}`;
        }
    }
    return dateStr;
}

if (data.events) data.events.forEach(e => e.date = toDDMMYYYY(e.date));
if (data.announcements) data.announcements.forEach(a => a.date = toDDMMYYYY(a.date));

fs.writeFileSync(contentPath, JSON.stringify(data, null, 4));
console.log('Migrated to DD.MM.YYYY');
