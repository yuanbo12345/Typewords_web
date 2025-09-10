import json

# 读取 JSON 文件
with open('cet4_words.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 转换为 JavaScript 格式
js_content = "const cet4Words = [\n"
for item in data:
    # 将中文数组转换为字符串
    chinese_str = "; ".join(item['chinese']).replace('"', '\\"')
    js_content += f"  {{\n"
    js_content += f"    \"word\": \"{item['word']}\",\n"
    js_content += f"    \"phonetic\": \"{item['phonetic']}\",\n"
    js_content += f"    \"chinese\": \"{chinese_str}\"\n"
    js_content += f"  }},\n"
js_content += "];"

# 写入 JavaScript 文件
with open('cet4_words.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("转换完成！")