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

    // ===== 更新右侧学习面板 + 高亮左侧单词 =====
    function updateWordDisplay() {
        if (!words.length) return;
        const w = words[currentIndex];
        wordDisplay.textContent = w.word;
        phoneticDisplay.textContent = w.phonetic || "";
        chineseDisplay.textContent = w.chinese || "";
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
        } else {
            // 切换到学习模式
            wordDisplay.classList.remove("hidden");
            dictationWord.classList.add("hidden");
            panelLearning.classList.remove("hidden");
            panelDictation.classList.add("hidden");
        }
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
                if (!nxt.includes("_")) {
                    if (nxt === w.toLowerCase()) {
                        correctCount++;
                        correctCountEl.textContent = correctCount;
                        if (correctCount >= 10) {
                            currentIndex = (currentIndex + 1) % words.length;
                            updateWordDisplay();
                            switchMode(false);
                        } else {
                            dictationWord.textContent = "_ ".repeat(w.length).trim();
                        }
                    } else {
                        correctCount = 0;
                        correctCountEl.textContent = 0;
                        dictationWord.textContent = "_ ".repeat(w.length).trim();
                        // 添加震动效果
                        document.querySelector(".word-display-area").classList.add("vibrate");
                        setTimeout(() => {
                            document.querySelector(".word-display-area").classList.remove("vibrate");
                        }, 500);
                    }
                }
            } else if (e.code === "Backspace") {
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

    playBtn.addEventListener("click", playPronunciation);
});
