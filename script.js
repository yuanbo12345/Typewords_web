// 保证 DOM 已渲染再执行所有逻辑
document.addEventListener("DOMContentLoaded", async () => {
    // ===== 字典加载 =====
    async function loadDictionary() {
        try {
            const res = await fetch(window.DICTIONARY_PATH || "dictionary.json");
            if (!res.ok) throw new Error("字典文件加载失败");
            return await res.json();
        } catch (e) {
            console.error("❌ 无法加载字典:", e);
            return [];
        }
    }

    // ===== 全局状态 =====
    let words = [], currentIndex = 0, correctCount = 0;
    let targetCount = 10; // 默认连续正确次数

    // ===== DOM 引用（放在 DOMContentLoaded 里，确保能拿到） =====
    const wordList = document.getElementById("word-list");
    const wordDisplay = document.getElementById("word");
    const dictationWord = document.getElementById("dictation-word");
    const phoneticDisplay = document.getElementById("phonetic");
    const chineseDisplay = document.getElementById("chinese");
    const playBtn = document.getElementById("play-pronunciation");
    const audioEl = document.getElementById("pronunciation-audio");

    const panelLearning = document.getElementById("panel-learning");
    const panelDictation = document.getElementById("panel-dictation");
    const correctCountEl = document.getElementById("correct-count");
    const targetCountEl = document.getElementById("target-count");
    const targetCountEl2 = document.getElementById("target-count2");

    // 设置相关元素
    const settingsBtn = document.getElementById("settings-btn");
    const settingsPanel = document.getElementById("settings-panel");
    const targetCountInput = document.getElementById("target-count-input");
    const saveSettingsBtn = document.getElementById("save-settings");
    const cancelSettingsBtn = document.getElementById("cancel-settings");

    // ===== 调整字体大小以适应内容 =====
    function adjustFontSize(element, text) {
        // 重置为默认大小
        element.style.fontSize = "2.5em";
        
        // 获取元素的宽度
        const maxWidth = element.parentElement.offsetWidth * 0.8; // 80%的父元素宽度
        
        // 如果文本宽度超过最大宽度，减小字体大小
        let fontSize = 2.5; // 默认字体大小
        element.textContent = text;
        
        while (element.scrollWidth > maxWidth && fontSize > 0.8) {
            fontSize -= 0.1;
            element.style.fontSize = fontSize + "em";
        }
    }

    // ===== 更新右侧学习面板 + 高亮左侧单词 =====
    function updateWordDisplay() {
        if (!words.length) return;
        const w = words[currentIndex];
        // 调整单词显示区域的字体大小以适应内容
        adjustFontSize(wordDisplay, w.word);
        phoneticDisplay.textContent = w.phonetic || "";
        // 限制中文释义的高度，防止挤占单词区域
        const chineseText = w.chinese || "";
        chineseDisplay.textContent = chineseText;
        // 确保单词区域始终可见
        wordDisplay.style.visibility = "visible";
        dictationWord.style.visibility = "visible";
        // 高亮
        [...wordList.children].forEach((li, i) =>
            li.classList.toggle("active", i === currentIndex)
        );
    }

    // ===== 构建左侧单词列表 =====
    function buildWordList() {
        wordList.innerHTML = "";
        words.forEach((w, i) => {
            const li = document.createElement("li");
            li.className = "word-list-item";
            li.innerHTML = `
        <div class="word-text">${w.word}</div>
        <div class="chinese-text">${w.chinese || ""}</div>
      `;
            li.addEventListener("click", () => {
                currentIndex = i;
                updateWordDisplay();
                switchMode(false);   // 强制回学习模式
            });
            wordList.appendChild(li);
        });
    }

    // ===== 发音 =====
    function playPronunciation() {
        if (!words.length) return;
        const w = words[currentIndex].word;
        audioEl.src = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(w)}&type=2`;
        audioEl.play().catch(e => console.error("播放失败:", e));
    }

    // ===== 模式切换 =====
    function switchMode(toDictation) {
        if (toDictation) {
            // 切换到默写模式
            wordDisplay.classList.add("hidden");
            dictationWord.classList.remove("hidden");
            panelLearning.classList.add("hidden");
            panelDictation.classList.remove("hidden");
            correctCount = 0;
            correctCountEl.textContent = 0;
            const w = words[currentIndex].word;
            dictationWord.textContent = "_ ".repeat(w.length).trim();
            // 调整默写模式下划线显示区域的字体大小
            adjustFontSize(dictationWord, "_ ".repeat(w.length).trim());
        } else {
            // 切换到学习模式
            wordDisplay.classList.remove("hidden");
            dictationWord.classList.add("hidden");
            panelLearning.classList.remove("hidden");
            panelDictation.classList.add("hidden");
        }
        // 确保单词区域可见
        updateWordDisplay();
    }

    // ===== 设置功能 =====
    function initSettings() {
        // 设置按钮点击事件
        settingsBtn.addEventListener("click", () => {
            targetCountInput.value = targetCount;
            settingsPanel.classList.toggle("hidden");
        });

        // 保存设置
        saveSettingsBtn.addEventListener("click", () => {
            const newTargetCount = parseInt(targetCountInput.value);
            if (newTargetCount >= 1 && newTargetCount <= 50) {
                targetCount = newTargetCount;
                targetCountEl.textContent = targetCount;
                targetCountEl2.textContent = targetCount;
                settingsPanel.classList.add("hidden");
            } else {
                alert("请输入1-50之间的数字");
            }
        });

        // 取消设置
        cancelSettingsBtn.addEventListener("click", () => {
            settingsPanel.classList.add("hidden");
        });
    }

    // ===== 键盘事件 =====
    document.addEventListener("keydown", e => {
        const inDict = !panelDictation.classList.contains("hidden");
        if (!inDict) {                       // 学习模式
            if (e.code === "Space") {
                e.preventDefault();
                switchMode(true);
            } else if (e.code === "ArrowUp") {
                currentIndex = (currentIndex - 1 + words.length) % words.length;
                updateWordDisplay();
            } else if (e.code === "ArrowDown") {
                currentIndex = (currentIndex + 1) % words.length;
                updateWordDisplay();
            } else if (e.code === "Enter") {
                playPronunciation();
            }
        } else {                             // 默写模式
            const w = words[currentIndex].word;
            if (/^[a-zA-Z]$/i.test(e.key)) {
                let cur = dictationWord.textContent.replace(/\s/g, "");
                let nxt = cur.replace("_", e.key.toLowerCase());
                dictationWord.textContent = nxt.split("").join(" ");
                // 调整字体大小
                adjustFontSize(dictationWord, nxt.split("").join(" "));
                if (!nxt.includes("_")) {
                    if (nxt === w.toLowerCase()) {
                        correctCount++;
                        correctCountEl.textContent = correctCount;
                        if (correctCount >= targetCount) {
                            currentIndex = (currentIndex + 1) % words.length;
                            updateWordDisplay();
                            switchMode(false);
                        } else {
                            dictationWord.textContent = "_ ".repeat(w.length).trim();
                            // 调整字体大小
                            adjustFontSize(dictationWord, "_ ".repeat(w.length).trim());
                        }
                    } else {
                        correctCount = 0;
                        correctCountEl.textContent = 0;
                        dictationWord.textContent = "_ ".repeat(w.length).trim();
                        // 调整字体大小
                        adjustFontSize(dictationWord, "_ ".repeat(w.length).trim());
                        // 添加震动效果
                        document.querySelector(".word-display-area").classList.add("vibrate");
                        setTimeout(() => {
                            document.querySelector(".word-display-area").classList.remove("vibrate");
                        }, 500);
                    }
                }
            } else if (e.code === "Backspace") {
                e.preventDefault();
                let cur = dictationWord.textContent;
                // 找到最后一个非下划线字符的位置
                let lastCharIndex = -1;
                for (let i = cur.length - 1; i >= 0; i--) {
                    if (cur[i] !== '_' && cur[i] !== ' ') {
                        lastCharIndex = i;
                        break;
                    }
                }
                // 如果找到了非下划线字符，则删除它并恢复下划线
                if (lastCharIndex !== -1) {
                    let newContent = cur.substring(0, lastCharIndex) + '_' + cur.substring(lastCharIndex + 1);
                    dictationWord.textContent = newContent;
                    // 调整字体大小
                    adjustFontSize(dictationWord, newContent);
                }
            } else if (e.code === "Escape") {
                switchMode(false);
            }
        }
    });

    // ===== 初始化 =====
    words = await loadDictionary();
    if (!words.length) {
        wordList.innerHTML = "<li style='padding:20px;text-align:center;color:#666'>未找到单词</li>";
        return;
    }
    buildWordList();
    updateWordDisplay();
    // 确保默认显示学习模式
    switchMode(false);
    // 初始化设置功能
    initSettings();

    playBtn.addEventListener("click", playPronunciation);
});
