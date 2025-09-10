# 英语单词学习和默写检查应用

## 项目结构

```
E:\Typrword\src\
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # 主要逻辑
├── cet4_words.js       # 四级词汇数据文件
├── pronunciation/      # 发音文件目录
└── README.md           # 项目说明文件
```

## 功能说明

### 学习模式
- 展示单词、音标、中文释义和发音按钮
- 点击发音按钮可播放单词发音

### 默写模式
- 展示单词的下划线（每个字母一个下划线）
- 用户输入单词拼写
- 输入错误则从头开始
- 连续10次正确则自动进入下一个单词

## 安装和调试方法

### 方法一：纯静态网页（推荐）
1. 确保您的计算机上安装了现代浏览器（如Chrome, Firefox, Edge等）
2. 将所有项目文件保存在同一目录下
3. 双击 `index.html` 文件即可在浏览器中运行应用

### 方法二：通过本地服务器运行
1. 确保您的计算机上安装了Node.js环境
2. 将所有项目文件保存在同一目录下
3. 打开命令行工具，导航到项目根目录
4. 运行以下命令启动本地服务器：
   ```
   node server.js
   ```
5. 打开浏览器，访问 http://localhost:8080

## 自定义单词本

如果需要使用自定义的单词本，可以通过以下方式：

### 方法一：直接编辑 cet4_words.js 文件
1. 修改 `cet4_words.js` 文件中的 `cet4Words` 数组
2. 每个单词对象应包含以下字段：
   - `word`: 单词本身（字符串）
   - `phonetic`: 音标（字符串）
   - `chinese`: 中文释义（字符串）
   - `pronunciation`: 发音文件路径（字符串）

示例：
```javascript
{
  "word": "example",
  "phonetic": "/ɪɡˈzæmp(ə)l/",
  "chinese": "例子",
  "pronunciation": "pronunciation/example.mp3"
}
```

### 方法二：使用转换工具（推荐用于大量词汇）
1. 准备一个包含四级词汇的文件（支持TXT、CSV、JSON格式）
2. 使用 `convert_vocabulary.py` 脚本将文件转换为JavaScript格式：
   ```
   python convert_vocabulary.py
   ```
3. 按照提示操作，生成新的 `cet4_words.js` 文件
4. 将生成的文件替换项目中的 `cet4_words.js` 文件

详细使用说明请参考 `convert_vocabulary_readme.md` 文件。

## 注意事项

- 本项目使用浏览器原生功能，无需额外安装依赖
- 发音功能依赖于浏览器的音频播放能力
- 确保发音文件存在于 `pronunciation` 目录中
- 如果需要添加更多四级词汇，可以继续在 `cet4_words.js` 文件中添加