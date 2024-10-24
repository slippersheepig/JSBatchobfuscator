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
    var lines = code.split('\n');
    for (var line of lines) {
        // 检查是否包含敏感信息（如账号和密码）
        if (/^\s*set\s+.*?=.*?/.test(line)) {
            // 对包含敏感信息的行进行混淆
            var codeobfuLine = "";
            for (var i = 0; i < line.length; i++) {
                var char = line[i];

                // 处理 % 符号
                if (char === '%' && line[i + 1] !== ' ') {
                    var endIdx = line.indexOf('%', i + 1);
                    if (endIdx !== -1) {
                        codeobfuLine += '%' + line.slice(i + 1, endIdx + 1) + '%'; 
                        i = endIdx; // 跳过已处理的部分
                    } else {
                        codeobfuLine += char; // 如果没有找到结束的 %，则保留当前字符
                    }
                } else if (lettertab[char]) {
                    codeobfuLine += lettertab[char];
                } else {
                    codeobfuLine += char; // 其他字符直接保留
                }
            }
            codeobfu += codeobfuLine + '\n'; // 添加混淆后的行
        } else {
            // 其他行直接保留
            codeobfu += line + '\n';
        }
    }

    // 生成最终混淆后的代码
    textareaobf.value = '@echo off\n' + setlettre + '\n' + codeobfu + '\necho Finished! Press any key to exit...\npause\nexit /b';
}
