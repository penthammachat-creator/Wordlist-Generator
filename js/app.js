// ============================================================
// Wordlist Generator — app.js
// ============================================================

let currentStep = 1;
let generatedWords = [];
let importedWords = [];
let worker = null;

// --- Leetspeak Mapping ---
const LEET_MAP = { a:'@', e:'3', i:'1', o:'0', s:'5', t:'7', l:'1', b:'8', g:'9' };

function countLeetVariations(word) {
    let leetChars = 0;
    for (const ch of word) {
        if (LEET_MAP[ch.toLowerCase()]) leetChars++;
    }
    return leetChars > 0 ? Math.pow(2, leetChars) - 1 : 0;
}

// --- Web Worker Setup ---
function initWorker() {
    if (worker) worker.terminate();
    worker = new Worker('js/wordgen-worker.js');
    worker.onmessage = function(e) {
        const { type, percent, count, words, stage } = e.data;
        if (type === 'progress') {
            const progressBar = document.getElementById('progress');
            const progressText = document.getElementById('progressText');
            if (percent !== undefined) {
                progressBar.style.width = `${percent}%`;
                const stageLabels = {
                    charset: 'กำลังสร้าง charset...',
                    custom: 'กำลังสร้างคำกำหนดเอง...',
                    thai: 'กำลังแปลงคำไทย...',
                    combine: 'กำลัง combine คำ...',
                    common: 'กำลังเพิ่ม common passwords...',
                    mutate: 'กำลังใช้ prefix/suffix...',
                    year: 'กำลังเพิ่มปี...',
                    dedup: 'กำลัง deduplicate...'
                };
                const label = stageLabels[stage] || `${percent}%`;
                progressText.textContent = percent >= 95 ? 'กำลัง deduplicate...' : `${label} ${percent}%`;
            }
            if (words !== undefined) {
                document.getElementById('wordCount').textContent = words.toLocaleString();
                document.getElementById('fileSize').textContent = formatFileSize(words * 9);
            }
        }
        if (type === 'done') {
            generatedWords = words;
            document.getElementById('progress').style.width = '100%';
            document.getElementById('progressText').textContent = 'เสร็จสิ้น';
            document.getElementById('wordCount').textContent = words.length.toLocaleString();
            const estimatedSize = words.reduce((sum, w) => sum + w.length + 1, 0);
            document.getElementById('fileSize').textContent = formatFileSize(estimatedSize);
            document.getElementById('step2NextBtn').disabled = false;
        }
    };
}

// --- Charset Preview ---
function getCharset() {
    let charset = '';
    if (document.getElementById('upperCase').checked) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (document.getElementById('lowerCase').checked) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (document.getElementById('numbers').checked) charset += '0123456789';
    if (document.getElementById('specialChars').checked) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    return charset;
}

function updateCharsetPreview() {
    const charset = getCharset();
    const el = document.getElementById('charsetPreview');
    if (!charset) {
        el.innerHTML = '<span class="preview-empty">ยังไม่ได้เลือกตัวอักษร</span>';
        return;
    }
    const display = charset.length > 60 ? charset.substring(0, 60) + '...' : charset;
    el.innerHTML = `<span class="preview-chars">${display}</span> <span class="preview-count">(${charset.length} ตัว)</span>`;
}

// --- Estimate ---
function factorial(n) {
    if (n <= 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
}

function uniquePermutations(word) {
    const freq = {};
    for (const ch of word) {
        freq[ch] = (freq[ch] || 0) + 1;
    }
    let result = factorial(word.length);
    for (const ch in freq) {
        result /= factorial(freq[ch]);
    }
    return result;
}

function updateEstimate() {
    const charset = getCharset();
    const minLength = parseInt(document.getElementById('minLength').value) || 1;
    const maxLength = parseInt(document.getElementById('maxLength').value) || 1;
    const customWords = document.getElementById('customWords').value.split(',').map(w => w.trim()).filter(w => w);
    const thaiWords = document.getElementById('thaiWords').value.split(',').map(w => w.trim()).filter(w => w);
    const combineWordsInput = document.getElementById('combineWords').value.split(',').map(w => w.trim()).filter(w => w);
    const appendYear = document.getElementById('appendYear').checked;
    const numberSuffix = document.getElementById('numberSuffix').value;
    const leetspeak = document.getElementById('leetspeak').checked;
    const includeCommon = document.getElementById('includeCommon').checked;

    let count = 0;

    // Charset permutations
    if (charset && minLength <= maxLength) {
        for (let len = minLength; len <= maxLength; len++) {
            count += Math.pow(charset.length, len);
        }
    }

    // Custom words (used as-is, no permutations)
    customWords.forEach(word => {
        count += 1;
        if (leetspeak) {
            count += countLeetVariations(word);
        }
    });

    // Thai words
    thaiWords.forEach(word => {
        count += 1;
        if (leetspeak) {
            const eng = thaiToEng(word);
            count += countLeetVariations(eng);
        }
    });

    // Combine words
    if (combineWordsInput.length >= 2) {
        count += combineWordsInput.length * (combineWordsInput.length - 1);
    }

    // Common passwords
    if (includeCommon) {
        count += 500;
    }

    // Import words
    count += importedWords.length;

    // Year multiplier
    if (appendYear) {
        const yearCount = (parseInt(document.getElementById('yearEnd').value) - parseInt(document.getElementById('yearStart').value) + 1);
        count *= Math.max(yearCount, 1);
    }

    // Number suffix multiplier
    if (numberSuffix !== 'none') {
        const numCount = numberSuffix === '0-9' ? 10 : numberSuffix === '00-99' ? 100 : 1000;
        count *= numCount;
    }

    // Prefix/suffix multiplier
    const prefix = document.getElementById('prefix').value.trim();
    const suffix = document.getElementById('suffix').value.trim();
    if (prefix || suffix) count *= 2;

    // Cap at 5M (matches worker limit)
    const MAX_WORDS = 5000000;
    const capped = count > MAX_WORDS;
    if (capped) count = MAX_WORDS;

    document.getElementById('estimateCount').textContent = capped
        ? count.toLocaleString() + '+'
        : count.toLocaleString();

    // Size warning
    const estBytes = count * 9;
    const warning = document.getElementById('sizeWarning');
    if (estBytes > 10 * 1024 * 1024) {
        warning.classList.remove('hidden');
    } else {
        warning.classList.add('hidden');
    }
}

// --- Validation ---
function validateAndNext() {
    const errorEl = document.getElementById('validationError');
    const errorText = document.getElementById('errorText');
    const minLength = parseInt(document.getElementById('minLength').value);
    const maxLength = parseInt(document.getElementById('maxLength').value);
    const charset = getCharset();
    const customWords = document.getElementById('customWords').value.split(',').map(w => w.trim()).filter(w => w);
    const thaiWords = document.getElementById('thaiWords').value.split(',').map(w => w.trim()).filter(w => w);
    const combineWordsInput = document.getElementById('combineWords').value.split(',').map(w => w.trim()).filter(w => w);

    let errors = [];

    if (!charset && customWords.length === 0 && thaiWords.length === 0 && combineWordsInput.length === 0 && importedWords.length === 0) {
        errors.push('กรุณาเลือกตัวอักษรอย่างน้อย 1 ประเภท หรือใส่คำ');
    }
    if (minLength > maxLength) {
        errors.push('จำนวนตัวอักษรขั้นต่ำต้องไม่มากกว่าสูงสุด');
    }
    if (minLength < 1 || maxLength < 1) {
        errors.push('จำนวนตัวอักษรต้องมากกว่า 0');
    }

    if (errors.length > 0) {
        errorEl.classList.remove('hidden');
        errorText.textContent = errors.join(' | ');
        return;
    }

    errorEl.classList.add('hidden');
    nextStep(2);
}

// --- Step Navigation ---
function nextStep(step) {
    // Terminate worker if leaving step 2
    if (currentStep === 2 && step !== 2 && worker) {
        worker.terminate();
        worker = null;
    }

    document.getElementById(`step${currentStep}`).classList.add('hidden');
    document.getElementById(`step${step}`).classList.remove('hidden');

    document.querySelectorAll('.step').forEach((el, index) => {
        if (index + 1 < step) {
            el.classList.add('completed');
            el.classList.remove('active');
        } else if (index + 1 === step) {
            el.classList.add('active');
            el.classList.remove('completed');
        } else {
            el.classList.remove('active', 'completed');
        }
    });

    currentStep = step;

    if (step === 2) {
        startGeneration();
    }
    if (step === 3) {
        showPreview();
        showSizeWarningStep3();
    }
}

function restart() {
    // Terminate worker if running
    if (worker) {
        worker.terminate();
        worker = null;
    }

    nextStep(1);
    document.getElementById('progress').style.width = '0%';
    document.getElementById('progressText').textContent = 'กำลังเตรียม...';
    document.getElementById('wordCount').textContent = '0';
    document.getElementById('fileSize').textContent = '0 KB';
    document.getElementById('step2NextBtn').disabled = true;
    importedWords = [];
    document.getElementById('importStatus').textContent = '';
    document.getElementById('importFile').value = '';
    updateCharsetPreview();
    updateEstimate();
}

// --- Preview ---
function showPreview() {
    document.getElementById('finalWordCount').textContent = document.getElementById('wordCount').textContent;
    document.getElementById('finalFileSize').textContent = document.getElementById('fileSize').textContent;

    const preview = document.getElementById('previewText');
    if (generatedWords.length === 0) {
        preview.textContent = '(ไม่มีคำ)';
        return;
    }
    const head = generatedWords.slice(0, 50);
    const tail = generatedWords.length > 50 ? generatedWords.slice(-50) : [];
    let text = head.join('\n');
    if (tail.length > 0) {
        text += '\n\n... (ตัดทอน) ...\n\n' + tail.join('\n');
    }
    preview.textContent = text;
}

function showSizeWarningStep3() {
    const sizeStr = document.getElementById('finalFileSize').textContent;
    const warning = document.getElementById('sizeWarningStep3');
    if (sizeStr.includes('MB')) {
        const mb = parseFloat(sizeStr);
        if (mb > 10) {
            warning.classList.remove('hidden');
            return;
        }
    }
    warning.classList.add('hidden');
}

// --- Generation ---
function startGeneration() {
    const config = {
        charset: getCharset(),
        minLength: parseInt(document.getElementById('minLength').value) || 1,
        maxLength: parseInt(document.getElementById('maxLength').value) || 1,
        customWords: document.getElementById('customWords').value.split(',').map(w => w.trim()).filter(w => w),
        thaiWords: document.getElementById('thaiWords').value.split(',').map(w => w.trim()).filter(w => w),
        leetspeak: document.getElementById('leetspeak').checked,
        prefix: document.getElementById('prefix').value.trim(),
        suffix: document.getElementById('suffix').value.trim(),
        numberSuffix: document.getElementById('numberSuffix').value,
        appendYear: document.getElementById('appendYear').checked,
        yearStart: parseInt(document.getElementById('yearStart').value) || 2020,
        yearEnd: parseInt(document.getElementById('yearEnd').value) || 2026,
        combineWordsInput: document.getElementById('combineWords').value.split(',').map(w => w.trim()).filter(w => w),
        combineSeparator: document.getElementById('combineSeparator').value,
        upperCase: document.getElementById('upperCase').checked,
        lowerCase: document.getElementById('lowerCase').checked,
        commonPasswords: document.getElementById('includeCommon').checked ? (typeof COMMON_PASSWORDS !== 'undefined' ? COMMON_PASSWORDS : []) : [],
        importedWords: importedWords,
    };

    document.getElementById('progress').style.width = '0%';
    document.getElementById('progressText').textContent = 'กำลังเตรียม...';
    document.getElementById('step2NextBtn').disabled = true;

    initWorker();
    worker.postMessage({ type: 'generate', config });
}

// --- Download ---
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatForExport(words, format) {
    return words.join('\n');
}

function downloadFiles() {
    const splitOption = document.getElementById('splitOption').value;
    const fileName = document.getElementById('fileName').value || 'wordlist';
    const zipDownload = document.getElementById('zipDownload').checked;
    const exportFormat = document.getElementById('exportFormat').value;

    if (generatedWords.length === 0) {
        alert('ยังไม่มีคำ กรุณาย้อนกลับไปสร้างคำก่อน');
        return;
    }

    // Warn if estimated size exceeds 10MB
    const estimatedSize = generatedWords.reduce((sum, w) => sum + w.length + 1, 0);
    if (estimatedSize > 10 * 1024 * 1024) {
        if (!confirm(`ขนาดไฟล์โดยประมาณ ${formatFileSize(estimatedSize)} — เกิน 10MB แนะนำให้ Split ไฟล์ก่อนดาวน์โหลด\n\nต้องการดาวน์โหลดต่อหรือไม่?`)) {
            return;
        }
    }

    const content = formatForExport(generatedWords, exportFormat);
    const ext = exportFormat === 'plain' ? 'txt' : exportFormat === 'hashcat' ? 'hc' : 'john';
    const files = [];

    if (splitOption === 'none') {
        files.push({ name: `${fileName}.${ext}`, content });
    } else if (splitOption === 'count') {
        const splitCount = parseInt(document.getElementById('splitCount').value) || 2;
        const chunkSize = Math.ceil(generatedWords.length / splitCount);
        for (let i = 0; i < splitCount; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, generatedWords.length);
            if (start >= generatedWords.length) break;
            const chunk = generatedWords.slice(start, end).join('\n');
            files.push({ name: `${fileName}_${String(i + 1).padStart(3, '0')}.${ext}`, content: chunk });
        }
    } else if (splitOption === 'size') {
        const maxSizeMB = parseFloat(document.getElementById('splitSize').value) || 5;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        let currentSize = 0;
        let chunkStart = 0;
        let fileIndex = 1;
        for (let i = 0; i < generatedWords.length; i++) {
            const wordSize = generatedWords[i].length + 1;
            if (currentSize + wordSize > maxSizeBytes && i > chunkStart) {
                const chunk = generatedWords.slice(chunkStart, i).join('\n');
                files.push({ name: `${fileName}_${String(fileIndex).padStart(3, '0')}.${ext}`, content: chunk });
                fileIndex++;
                chunkStart = i;
                currentSize = 0;
            }
            currentSize += wordSize;
        }
        if (chunkStart < generatedWords.length) {
            const chunk = generatedWords.slice(chunkStart).join('\n');
            files.push({ name: `${fileName}_${String(fileIndex).padStart(3, '0')}.${ext}`, content: chunk });
        }
    }

    if (zipDownload && files.length > 1 && typeof JSZip !== 'undefined') {
        const zip = new JSZip();
        files.forEach(file => zip.file(file.name, file.content));
        zip.generateAsync({ type: 'blob' }).then(blob => {
            downloadBlob(blob, `${fileName}.zip`);
        });
    } else {
        files.forEach(file => {
            const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
            downloadBlob(blob, file.name);
        });
    }
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// --- Import Wordlist ---
function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        importedWords = text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
        document.getElementById('importStatus').textContent = `โหลด ${importedWords.length.toLocaleString()} คำแล้ว`;
        updateEstimate();
    };
    reader.readAsText(file);
}

// --- Event Listeners ---
document.getElementById('splitOption').addEventListener('change', function() {
    document.getElementById('splitCountGroup').classList.toggle('hidden', this.value !== 'count');
    document.getElementById('splitSizeGroup').classList.toggle('hidden', this.value !== 'size');
    document.getElementById('zipGroup').classList.toggle('hidden', this.value === 'none');
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('zipGroup').classList.add('hidden');
    document.getElementById('validationError').classList.add('hidden');

    // Import file listener
    document.getElementById('importFile').addEventListener('change', handleImportFile);

    // All inputs that affect estimate
    const estimateInputs = [
        'upperCase', 'lowerCase', 'numbers', 'specialChars', 'minLength', 'maxLength',
        'customWords', 'thaiWords', 'leetspeak', 'prefix', 'suffix', 'numberSuffix',
        'appendYear', 'yearStart', 'yearEnd', 'combineWords', 'combineSeparator',
        'includeCommon'
    ];

    estimateInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => { updateCharsetPreview(); updateEstimate(); });
            el.addEventListener('change', () => { updateCharsetPreview(); updateEstimate(); });
        }
    });

    updateCharsetPreview();
    updateEstimate();
    nextStep(1);
});
