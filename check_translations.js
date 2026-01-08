
const { translations } = require('./frontend/app/i18n/translations.ts');

const trKeys = Object.keys(translations.tr);
const enKeys = Object.keys(translations.en);
const jpKeys = Object.keys(translations.jp);

const missingEn = trKeys.filter(key => !enKeys.includes(key));
const missingJp = trKeys.filter(key => !jpKeys.includes(key));

console.log('Missing EN keys:', missingEn);
console.log('Missing JP keys:', missingJp);

if (missingEn.length === 0 && missingJp.length === 0) {
    console.log('All keys are present in EN and JP.');
}
