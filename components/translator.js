const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js");
const britishOnly = require('./british-only.js');

class Translator {
  americanToBritish(text) {
    const dict = { ...americanOnly, ...americanToBritishSpelling };
    const titles = americanToBritishTitles;
    const timeRegex = /([1-9]|1[0-2]):([0-5][0-9])/g;
    const translated = this.translate(text, dict, titles, timeRegex, 'toBritish');
    return translated;
  }

  britishToAmerican(text) {
    const dict = { ...britishOnly, ...this.reverseDict(americanToBritishSpelling) };
    const titles = this.reverseDict(americanToBritishTitles);
    const timeRegex = /([1-9]|1[0-2])\.([0-5][0-9])/g;
    const translated = this.translate(text, dict, titles, timeRegex, 'toAmerican');
    return translated;
  }

  reverseDict(dict) {
    return Object.entries(dict).reduce((acc, [key, value]) => {
      acc[value] = key;
      return acc;
    }, {});
  }

  translate(text, dict, titles, timeRegex, direction) {
    const lowerText = text.toLowerCase();
    let translated = text;

    Object.entries(titles).forEach(([key, value]) => {
      const regex = new RegExp(`(?<=^|\\s)${this.escapeRegex(key)}(?=\\s|$)`, 'gi');
      if (regex.test(lowerText)) {
        const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
        translated = translated.replace(regex, `<span class="highlight">${capitalizedValue}</span>`);
      }
    });

    const sortedDict = Object.entries(dict).sort((a, b) => b[0].length - a[0].length);

    sortedDict.forEach(([key, value]) => {
      const regex = new RegExp(`(?<=^|[\\s.,!?])${this.escapeRegex(key)}(?=[\\s.,!?]|$)`, 'gi');
      translated = translated.replace(regex, (match) => {
        const isCapitalized = match[0] === match[0].toUpperCase();
        const replacement = isCapitalized 
          ? value.charAt(0).toUpperCase() + value.slice(1) 
          : value;
        return `<span class="highlight">${replacement}</span>`;
      });
    });

    translated = translated.replace(timeRegex, (match) => {
      const replacement = direction === 'toBritish' 
        ? match.replace(':', '.') 
        : match.replace('.', ':');
      return `<span class="highlight">${replacement}</span>`;
    });

    return translated;
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

module.exports = Translator;
