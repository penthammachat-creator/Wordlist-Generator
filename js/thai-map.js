// Thai Kedmanee to English QWERTY mapping
// Source: poonkasemk.github.io/keyboardTranslation/
const pairs = [
    // TH, EN
    ['ๅ','1'], ['+','!'], ['๑','@'], ['/','2'], ['-','3'], ['๒','#'], ['ภ','4'], ['๓','$'], ['ถ','5'], ['๔','%'], ['ุ','6'], ['ู','^'], ['ึ','7'], ['฿','&'], ['ค','8'], ['๕','*'], ['ต','9'], ['๖','('], ['จ','0'], ['๗',')'], ['ข','-'], ['๘','_'], ['ช','=' ], ['๙','+'],
    ['ๆ','q'], ['๐','Q'], ['ไ','w'], ['"','W'], ['ำ','e'], ['ฎ','E'], ['พ','r'], ['ฑ','R'], ['ะ','t'], ['ธ','T'], ['ั','y'], ['ํ','Y'], ['ี','u'], ['๊','U'], ['ร','i'], ['ณ','I'], ['น','o'], ['ฯ','O'], ['ย','p'], ['ญ','P'], ['บ','['], ['ฐ','{'], ['ล',']'], ['ฃ','\\'], ['ฅ','|'],
    ['ฟ','a'], ['ฤ','A'], ['ห','s'], ['ฆ','S'], ['ก','d'], ['ฏ','D'], ['ด','f'], ['โ','F'], ['เ','g'], ['ฌ','G'], ['้','h'], ['็','H'], ['่','j'], ['๋','J'], ['า','k'], ['ษ','K'], ['ส','l'], ['ศ','L'], ['ว',';'], ['ซ',':'], ['ง','\'' ], ['.','\"'],
    ['ผ','z'], ['(','Z'], ['ป','x'], [')','X'], ['แ','c'], ['ฉ','C'], ['อ','v'], ['ฮ','V'], ['ิ','b'], ['ฺ','B'], ['ื','n'], ['์','N'], ['ท','m'], ['?','M'], ['ม',','], ['ฒ','<'], ['ใ','.'], ['ฬ','>'], ['ฝ','/'], ['ฦ','?']
];

// Create mapping objects
const TH_to_EN = Object.fromEntries(pairs);
const EN_to_TH = Object.fromEntries(pairs.map(([th,en]) => [en, th]));

// Convert Thai text to English keyboard sequence
function thaiToEng(text) {
    let result = '';
    for (const ch of text) {
        result += (TH_to_EN[ch] !== undefined) ? TH_to_EN[ch] : ch;
    }
    return result;
}

// Convert English text to Thai keyboard sequence
function engToThai(text) {
    let result = '';
    for (const ch of text) {
        result += (EN_to_TH[ch] !== undefined) ? EN_to_TH[ch] : ch;
    }
    return result;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { thaiToEng, engToThai, TH_to_EN, EN_to_TH };
}