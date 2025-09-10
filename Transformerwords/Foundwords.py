import json
import requests
import time
import os

# 如果需要支持 docx 文件
try:
    from docx import Document
except ImportError:
    print("⚠️ 如果要解析 .docx 文件，请先运行: pip install python-docx")

def read_words_from_file(filename):
    words = []
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".txt":
        with open(filename, "r", encoding="utf-8") as f:
            words = [line.strip() for line in f if line.strip()]
    elif ext == ".docx":
        doc = Document(filename)
        for para in doc.paragraphs:
            word = para.text.strip()
            if word:
                words.append(word)
    else:
        raise ValueError("仅支持 txt 或 docx 文件")

    return words

# 有道翻译API（非官方接口）
def get_word_info(word):
    url = "https://dict.youdao.com/jsonapi"
    params = {
        "q": word,
        "dicts": '{"count":99,"dicts":[["ec","phrs"]]}'
    }
    try:
        r = requests.get(url, params=params, timeout=5)
        data = r.json()

        # 音标
        phonetic = ""
        if "simple" in data and "word" in data["simple"]:
            w = data["simple"]["word"][0]
            uk = w.get("ukphone", "")
            us = w.get("usphone", "")
            phonetic = f"英 [{uk}] 美 [{us}]" if uk or us else ""

        # 中文释义
        translations = []
        if "ec" in data and "word" in data["ec"]:
            for item in data["ec"]["word"][0].get("trs", []):
                if "tr" in item:
                    translations.append(item["tr"][0]["l"]["i"][0])

        return {
            "word": word,
            "phonetic": phonetic,
            "definition": translations
        }
    except Exception:
        return {
            "word": word,
            "phonetic": "",
            "definition": []
        }

def main(input_file, output_file="cet4_words.json"):
    words = read_words_from_file(input_file)
    print(f"📖 共读取 {len(words)} 个单词")

    results = []
    for i, w in enumerate(words, 1):
        info = get_word_info(w)
        results.append(info)
        print(f"[{i}/{len(words)}] ✅ {w} -> {info['definition']}")
        time.sleep(0.5)  # 避免请求过快

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"🎉 完成！结果已保存到 {output_file}")


if __name__ == "__main__":
    # 修改为你的 txt 或 docx 文件路径
    main("cet4.txt")   # 例子：txt 文件，每行一个单词
    # main("cet4.docx")  # 如果是 word 文件就用这个
