// ============================================================
// Web Worker — Word Generation Engine (Streaming)
// ============================================================

let generatedWords = [];
let cancelled = false;

self.onmessage = function(e) {
    const { type, config } = e.data;

    if (type === 'generate') {
        cancelled = false;
        generatedWords = [];
        generate(config);
    }

    if (type === 'cancel') {
        cancelled = true;
    }
};

// --- Leetspeak ---
const LEET_MAP = { a:'@', e:'3', i:'1', o:'0', s:'5', t:'7', l:'1', b:'8', g:'9' };

function generateLeetspeakVariations(word) {
    const results = [word];
    const chars = word.split('');
    const leetChars = [];
    const leetIndexes = [];
    chars.forEach((ch, i) => {
        if (LEET_MAP[ch.toLowerCase()]) {
            leetIndexes.push(i);
            leetChars.push(LEET_MAP[ch.toLowerCase()]);
        }
    });
    if (leetIndexes.length === 0) return results;
    const total = Math.pow(2, leetIndexes.length);
    for (let mask = 1; mask < total; mask++) {
        const variant = chars.slice();
        leetIndexes.forEach((idx, j) => {
            if (mask & (1 << j)) variant[idx] = leetChars[j];
        });
        results.push(variant.join(''));
    }
    return results;
}

// --- Thai Mapping ---
const pairs = [
    ['ๅ','1'], ['+','!'], ['๑','@'], ['/','2'], ['-','3'], ['๒','#'], ['ภ','4'], ['๓','$'], ['ถ','5'], ['๔','%'], ['ุ','6'], ['ู','^'], ['ึ','7'], ['฿','&'], ['ค','8'], ['๕','*'], ['ต','9'], ['๖','('], ['จ','0'], ['๗',')'], ['ข','-'], ['๘','_'], ['ช','='], ['๙','+'],
    ['ๆ','q'], ['๐','Q'], ['ไ','w'], ['"','W'], ['ำ','e'], ['ฎ','E'], ['พ','r'], ['ฑ','R'], ['ะ','t'], ['ธ','T'], ['ั','y'], ['ํ','Y'], ['ี','u'], ['๊','U'], ['ร','i'], ['ณ','I'], ['น','o'], ['ฯ','O'], ['ย','p'], ['ญ','P'], ['บ','['], ['ฐ','{'], ['ล',']'], ['ฃ','\\'], ['ฅ','|'],
    ['ฟ','a'], ['ฤ','A'], ['ห','s'], ['ฆ','S'], ['ก','d'], ['ฏ','D'], ['ด','f'], ['โ','F'], ['เ','g'], ['ฌ','G'], ['้','h'], ['็','H'], ['่','j'], ['๋','J'], ['า','k'], ['ษ','K'], ['ส','l'], ['ศ','L'], ['ว',';'], ['ซ',':'], ['ง','\''], ['.', '\"'],
    ['ผ','z'], ['(','Z'], ['ป','x'], [')','X'], ['แ','c'], ['ฉ','C'], ['อ','v'], ['ฮ','V'], ['ิ','b'], ['ฺ','B'], ['ื','n'], ['์','N'], ['ท','m'], ['?','M'], ['ม',','], ['ฒ','<'], ['ใ','.'], ['ฬ','>'], ['ฝ','/'], ['ฦ','?']
];
const TH_to_EN = Object.fromEntries(pairs);

function thaiToEng(text) {
    let result = '';
    for (const ch of text) {
        result += (TH_to_EN[ch] !== undefined) ? TH_to_EN[ch] : ch;
    }
    return result;
}

// --- Helpers ---
function getNumberSuffixes(range) {
    if (range === 'none') return [''];
    if (range === '0-9') return Array.from({length: 10}, (_, i) => String(i));
    if (range === '00-99') return Array.from({length: 100}, (_, i) => String(i).padStart(2, '0'));
    if (range === '000-999') return Array.from({length: 1000}, (_, i) => String(i).padStart(3, '0'));
    return [''];
}

function getYearRange(start, end) {
    const years = [];
    for (let y = start; y <= end; y++) years.push(String(y));
    return years;
}

function combineWords(words, separator) {
    if (words.length < 2) return [];
    const results = [];
    for (let i = 0; i < words.length; i++) {
        for (let j = 0; j < words.length; j++) {
            if (i === j) continue;
            results.push(words[i] + separator + words[j]);
        }
    }
    return results;
}

// --- Permutations (streaming) ---
function* permuteGen(arr, start) {
    if (start === arr.length) {
        yield arr.slice();
        return;
    }
    const seen = new Set();
    for (let i = start; i < arr.length; i++) {
        if (seen.has(arr[i])) continue;
        seen.add(arr[i]);
        [arr[start], arr[i]] = [arr[i], arr[start]];
        yield* permuteGen(arr, start + 1);
        [arr[start], arr[i]] = [arr[i], arr[start]];
    }
}

function generateCaseVariations(word, upperCase, lowerCase) {
    const variations = [];
    const letters = word.split('');
    const length = letters.length;
    if (upperCase && lowerCase) {
        const total = Math.pow(2, length);
        for (let i = 0; i < total; i++) {
            let variation = '';
            for (let j = 0; j < length; j++) {
                variation += (i >> j) & 1 ? letters[j].toUpperCase() : letters[j].toLowerCase();
            }
            variations.push(variation);
        }
    } else if (upperCase) {
        variations.push(word.toUpperCase());
    } else if (lowerCase) {
        variations.push(word.toLowerCase());
    } else {
        variations.push(word);
    }
    return variations;
}

// --- Batch helper ---
function addBatch(words) {
    generatedWords.push(...words);
    if (generatedWords.length >= 10000) {
        self.postMessage({ type: 'progress', words: generatedWords.length });
        // Yield to let UI update
        const start = Date.now();
        while (Date.now() - start < 1) {}
    }
}

// --- Charset Generation (batched) ---
function generateCharsetWords(minLength, maxLength, charset, updateProgress) {
    const maxWords = 5000000;
    let count = 0;
    let totalEstimate = 0;
    for (let len = minLength; len <= maxLength; len++) {
        totalEstimate += Math.pow(charset.length, len);
    }

    let progressCount = 0;
    const BATCH_SIZE = 5000;

    for (let length = minLength; length <= maxLength; length++) {
        const totalCombinations = Math.pow(charset.length, length);
        if (count + totalCombinations > maxWords) break;

        const indices = new Array(length).fill(0);
        const batch = [];

        while (true) {
            let word = '';
            for (let i = 0; i < length; i++) {
                word += charset[indices[i]];
            }
            batch.push(word);
            count++;
            progressCount++;

            if (batch.length >= BATCH_SIZE) {
                addBatch(batch);
                batch.length = 0;
                if (progressCount % 50000 === 0) {
                    self.postMessage({
                        type: 'progress',
                        words: generatedWords.length,
                        percent: Math.min(90, Math.round((progressCount / totalEstimate) * 100))
                    });
                }
            }

            let pos = length - 1;
            while (pos >= 0) {
                indices[pos]++;
                if (indices[pos] < charset.length) break;
                indices[pos] = 0;
                pos--;
            }
            if (pos < 0) break;
        }

        if (batch.length > 0) {
            addBatch(batch);
        }
    }
}

// --- Main Generation ---
function generate(config) {
    const {
        charset, minLength, maxLength,
        customWords, thaiWords,
        leetspeak, prefix, suffix, numberSuffix,
        appendYear, yearStart, yearEnd,
        combineWordsInput, combineSeparator,
        upperCase, lowerCase,
        commonPasswords, importedWords
    } = config;

    self.postMessage({ type: 'progress', words: 0, percent: 0, stage: 'charset' });

    // 1) Charset permutations
    if (charset && minLength <= maxLength) {
        generateCharsetWords(minLength, maxLength, charset);
    }

    if (cancelled) return self.postMessage({ type: 'done', words: generatedWords, count: generatedWords.length });

    self.postMessage({ type: 'progress', words: generatedWords.length, percent: 20, stage: 'custom' });

    // 2) Custom words (use as-is, no permutations)
    customWords.forEach(word => {
        const batch = [word];
        if (leetspeak) {
            generateLeetspeakVariations(word).forEach(v => {
                if (!batch.includes(v)) batch.push(v);
            });
        }
        addBatch(batch);
    });

    if (cancelled) return self.postMessage({ type: 'done', words: generatedWords, count: generatedWords.length });

    self.postMessage({ type: 'progress', words: generatedWords.length, percent: 40, stage: 'thai' });

    // 3) Thai words
    thaiWords.forEach(word => {
        const eng = thaiToEng(word);
        const batch = [eng];
        if (leetspeak) {
            generateLeetspeakVariations(eng).forEach(v => {
                if (!batch.includes(v)) batch.push(v);
            });
        }
        addBatch(batch);
    });

    if (cancelled) return self.postMessage({ type: 'done', words: generatedWords, count: generatedWords.length });

    self.postMessage({ type: 'progress', words: generatedWords.length, percent: 50, stage: 'combine' });

    // 4) Combine words
    if (combineWordsInput.length >= 2) {
        const combined = combineWords(combineWordsInput, combineSeparator);
        const batch = [...combined];
        if (leetspeak) {
            combined.forEach(w => {
                generateLeetspeakVariations(w).forEach(v => {
                    if (!batch.includes(v)) batch.push(v);
                });
            });
        }
        addBatch(batch);
    }

    if (cancelled) return self.postMessage({ type: 'done', words: generatedWords, count: generatedWords.length });

    self.postMessage({ type: 'progress', words: generatedWords.length, percent: 60, stage: 'common' });

    // 5) Common passwords
    if (commonPasswords && commonPasswords.length > 0) {
        addBatch([...commonPasswords]);
    }

    // 6) Imported words
    if (importedWords && importedWords.length > 0) {
        addBatch([...importedWords]);
    }

    if (cancelled) return self.postMessage({ type: 'done', words: generatedWords, count: generatedWords.length });

    self.postMessage({ type: 'progress', words: generatedWords.length, percent: 70, stage: 'mutate' });

    // 7) Prefix / Suffix
    const baseWords = [...generatedWords];
    if (prefix) {
        const batch = [];
        baseWords.forEach(w => {
            batch.push(prefix + w);
            if (batch.length >= 5000) { addBatch(batch); batch.length = 0; }
        });
        if (batch.length > 0) addBatch(batch);
    }
    if (suffix) {
        const batch = [];
        baseWords.forEach(w => {
            batch.push(w + suffix);
            if (batch.length >= 5000) { addBatch(batch); batch.length = 0; }
        });
        if (batch.length > 0) addBatch(batch);
    }

    if (cancelled) return self.postMessage({ type: 'done', words: generatedWords, count: generatedWords.length });

    // 8) Number suffix
    const numSuffixes = getNumberSuffixes(numberSuffix);
    if (numberSuffix !== 'none') {
        const batch = [];
        baseWords.forEach(w => {
            numSuffixes.forEach(n => {
                batch.push(w + n);
                if (batch.length >= 5000) { addBatch(batch); batch.length = 0; }
            });
        });
        if (batch.length > 0) addBatch(batch);
    }

    if (cancelled) return self.postMessage({ type: 'done', words: generatedWords, count: generatedWords.length });

    self.postMessage({ type: 'progress', words: generatedWords.length, percent: 85, stage: 'year' });

    // 9) Year append
    if (appendYear) {
        const years = getYearRange(yearStart, yearEnd);
        const batch = [];
        baseWords.forEach(w => {
            years.forEach(y => {
                batch.push(w + y);
                if (batch.length >= 5000) { addBatch(batch); batch.length = 0; }
            });
        });
        if (batch.length > 0) addBatch(batch);
    }

    if (cancelled) return self.postMessage({ type: 'done', words: generatedWords, count: generatedWords.length });

    self.postMessage({ type: 'progress', words: generatedWords.length, percent: 95, stage: 'dedup' });

    // 10) Deduplicate
    generatedWords = [...new Set(generatedWords)];

    self.postMessage({ type: 'done', words: generatedWords, count: generatedWords.length });
}
