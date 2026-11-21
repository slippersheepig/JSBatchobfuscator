'use strict';

(() => {
    const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const VAR_NAME_CHARS = ALPHABET.slice(0, 36);
    const VAR_SUFFIX_LENGTH = 8;
    const CMD_MAX_LINE_LENGTH = 8191;

    // Label definitions (e.g. ":start") are matched literally by cmd.exe without variable expansion.
    const LABEL_LINE_PATTERN = /^[ \t]*:[^:\s]/;

    // Preserve cmd.exe percent constructs (%% escapes, %~dp0 modifiers, %0-%9/%*, %VAR%, or stray % to EOL)
    // while matching individual ASCII alphanumeric characters outside those tokens for substitution.
    const BATCH_TOKEN_PATTERN = /%%|%(?:~[fdpnxsatz]*(?:\$[^:\r\n]+:)?[0-9]|[0-9*]|[^%\r\n]+%|[^\r\n]*)|[0-9a-zA-Z]/gi;

    function shuffle(items) {
        const result = items.slice();
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    function createVariableName() {
        let name = 'a';
        for (let i = 0; i < VAR_SUFFIX_LENGTH; i++) {
            name += VAR_NAME_CHARS[Math.floor(Math.random() * VAR_NAME_CHARS.length)];
        }
        return name;
    }

    function obfuscateBatchCode(source) {
        if (!source.trim()) {
            return '';
        }

        const letters = shuffle(Array.from(ALPHABET));
        const variableName = createVariableName();

        const charMap = new Map();
        for (let i = 0; i < letters.length; i++) {
            charMap.set(letters[i], '%' + variableName + ':~' + i + ',1%');
        }

        const obfuscatedBody = source
            .split(/\r?\n/)
            .map((line) => (
                LABEL_LINE_PATTERN.test(line)
                    ? line
                    : line.replace(BATCH_TOKEN_PATTERN, (token) => charMap.get(token) ?? token)
            ))
            .join('\n');

        return '@echo off\n'
            + 'Set ' + variableName + '=' + letters.join('') + '\n'
            + 'cls\n'
            + obfuscatedBody;
    }

    function getLongestLineLength(text) {
        if (!text) {
            return 0;
        }
        let maxLen = 0;
        for (const line of text.split('\n')) {
            if (line.length > maxLen) {
                maxLen = line.length;
            }
        }
        return maxLen;
    }

    function formatStats(text) {
        if (!text) {
            return '0 lines · 0 chars';
        }
        const lines = text.split('\n').length;
        const chars = text.length;
        return lines + (lines === 1 ? ' line' : ' lines') + ' · ' + chars.toLocaleString() + (chars === 1 ? ' char' : ' chars');
    }

    async function copyText(text, fallbackElement) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }
        fallbackElement.focus();
        fallbackElement.select();
        const copied = document.execCommand('copy');
        fallbackElement.setSelectionRange(0, 0);
        if (!copied) {
            throw new Error('Clipboard copy failed');
        }
    }

    function downloadBatchFile(content) {
        const crlfContent = content.replace(/\r?\n/g, '\r\n');
        const blob = new Blob([crlfContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'obfuscated.bat';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function init() {
        const input = document.getElementById('Code');
        const output = document.getElementById('ObfCode');
        if (!input || !output) {
            return;
        }

        const clearBtn = document.getElementById('ClearBtn');
        const regenBtn = document.getElementById('RegenBtn');
        const copyBtn = document.getElementById('CopyBtn');
        const downloadBtn = document.getElementById('DownloadBtn');
        const inputStats = document.getElementById('InputStats');
        const outputStats = document.getElementById('OutputStats');
        const lengthWarning = document.getElementById('LengthWarning');

        let copyResetTimer = null;

        function resetCopyLabel() {
            if (!copyBtn) {
                return;
            }
            if (copyResetTimer !== null) {
                clearTimeout(copyResetTimer);
                copyResetTimer = null;
            }
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('btn-success');
        }

        function updateUI() {
            const hasInput = input.value.length > 0;
            const hasOutput = output.value.length > 0;

            if (clearBtn) {
                clearBtn.disabled = !hasInput;
            }
            if (regenBtn) {
                regenBtn.disabled = !hasOutput;
            }
            if (copyBtn) {
                copyBtn.disabled = !hasOutput;
            }
            if (downloadBtn) {
                downloadBtn.disabled = !hasOutput;
            }
            if (inputStats) {
                inputStats.textContent = formatStats(input.value);
            }
            if (outputStats) {
                outputStats.textContent = formatStats(output.value);
            }
            if (lengthWarning) {
                const longest = getLongestLineLength(output.value);
                const tooLong = longest > CMD_MAX_LINE_LENGTH;
                lengthWarning.hidden = !tooLong;
                if (tooLong) {
                    lengthWarning.textContent = 'Line exceeds cmd.exe 8,191-char limit (' + longest.toLocaleString() + ' chars)';
                }
            }
        }

        function runObfuscation() {
            resetCopyLabel();
            output.value = obfuscateBatchCode(input.value);
            updateUI();
        }

        input.addEventListener('input', runObfuscation);

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                runObfuscation();
                input.focus();
            });
        }

        if (regenBtn) {
            regenBtn.addEventListener('click', runObfuscation);
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                if (!output.value) {
                    return;
                }
                try {
                    await copyText(output.value, output);
                    resetCopyLabel();
                    copyBtn.textContent = 'Copied!';
                    copyBtn.classList.add('btn-success');
                    copyResetTimer = setTimeout(resetCopyLabel, 1800);
                } catch {
                    resetCopyLabel();
                    copyBtn.textContent = 'Copy failed';
                    copyResetTimer = setTimeout(resetCopyLabel, 1800);
                }
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                if (!output.value) {
                    return;
                }
                downloadBatchFile(output.value);
            });
        }

        runObfuscation();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
