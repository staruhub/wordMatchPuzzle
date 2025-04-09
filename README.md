# 单词消消乐 - 儿童英语学习游戏

一款面向儿童的英汉单词匹配游戏，通过简单的卡片匹配消除机制，帮助儿童在游戏中学习英语词汇。

## 功能特点

- 使用内置词库或导入自定义单词
- 点击英文单词卡片可以听到发音
- 连续3次错误匹配后会有提示
- 记录游戏完成时间和尝试次数
- 响应式设计，适配各种屏幕尺寸

## 技术栈

- Next.js
- React
- Tailwind CSS
- Web Speech API

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 运行生产版本

```bash
npm start
```

## 测试

项目包含自定义单词导入功能的测试用例。要运行测试，请先安装测试依赖：

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

然后在 package.json 中添加测试脚本：

```json
"scripts": {
  "test": "jest"
}
```

运行测试：

```bash
npm test
```

## 自定义单词导入

用户可以导入自定义单词列表，格式要求：
- 每行一对单词和翻译，用逗号或制表符分隔
- 至少需要3对单词
- 例如：`apple,苹果`

## 许可证

MIT
