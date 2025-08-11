// Debug feriados
const { isNationalHoliday, getNationalHolidays } = require('./src/lib/business-days/holidays-br.ts');

const newYear = new Date('2024-01-01');
console.log('Data:', newYear.toISOString());
console.log('É feriado?', isNationalHoliday(newYear));

const holidays = getNationalHolidays(2024);
console.log('Feriados 2024:', holidays.map(h => `${h.dateISO}: ${h.name}`));
