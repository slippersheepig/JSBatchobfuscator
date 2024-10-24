function printCode() {
    var textarea = document.getElementById('Code');
    var textareaobf = document.getElementById('ObfCode');
    var set = "a" + Math.random().toString(36).substring(10); // random set
    var letters = Array.from("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ").sort(() => Math.random() - 0.5).join('');
    var setlettre = "Set " + set + "=" + letters;
    var code = textarea.value;
    var codeobfu = "";
    var lettertab = {};

    // 生成替换字符映射
    for (var i = 0; i < letters.length; i++) {
        lettertab[letters[i]] = "%" + set + ":~" + i + ",1%";
    }

    // 替换代码中的字符
    for (var i = 0; i < code.length; i++) {
        var char = code[i];
        
        // 处理 % 符号
        if (char === '%' && code[i + 1] !== ' ') {
            var endIdx = code.indexOf('%', i + 1);
            if (endIdx !== -1) {
                codeobfu += '%' + code.slice(i + 1, endIdx + 1) + '%'; // 保留 % 之间的内容
                i = endIdx; // 跳过已处理的部分
            } else {
                codeobfu += char; // 如果没有找到结束的 %，则保留当前字符
            }
        } else if (lettertab[char]) {
            codeobfu += lettertab[char];
        } else {
            codeobfu += char; // 其他字符直接保留
        }
    }

    // 生成最终混淆后的代码
    textareaobf.value = '@echo on\n' + setlettre + '\n' + codeobfu + '\necho Finished! Press any key to exit...\npause\nexit /b';
}
