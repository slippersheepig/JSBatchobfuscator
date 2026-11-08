function obfuscateCode() {
    const input = document.getElementById('Code');
    const output = document.getElementById('ObfCode');
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Uniform random permutation of the alphabet (Fisher-Yates shuffle)
    const letters = Array.from(alphabet);
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }

    // Random batch variable name, always 9 chars long to avoid collisions
    const variableName = 'a' + Array.from(
        { length: 8 },
        () => '0123456789abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 36)]
    ).join('');

    // Map each character to a batch substring reference %variable:~index,1%
    const charMap = {};
    for (let i = 0; i < letters.length; i++) {
        charMap[letters[i]] = '%' + variableName + ':~' + i + ',1%';
    }

    let obfuscated = '';
    for (const character of input.value) {
        obfuscated += charMap[character] || character;
    }

    output.value = '@echo off\n'
        + 'Set ' + variableName + '=' + letters.join('') + '\n'
        + 'cls\n'
        + obfuscated;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('Code').addEventListener('input', obfuscateCode);
});
