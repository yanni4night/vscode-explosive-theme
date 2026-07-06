# AGENTS.md — Explosive Theme 开发规范

本文件记录项目的结构和维护规范，供后续 AI agent 参考。

## 项目结构

```
explosive-theme/
├── package.json              # 扩展清单（必须与主题文件保持同步）
├── README.md                 # Marketplace 页面文档（英文）
├── README_CN.md              # 中文翻译版
├── CHANGELOG.md              # 版本历史
├── LICENSE                   # MIT 许可证
├── icon.png                  # Marketplace 图标 (512x512)
├── .vscodeignore             # 打包排除规则
├── .gitignore
├── themes/                   # 主题 JSON 文件目录
│   ├── Explosive Green Dark-color-theme.json
│   ├── Explosive Blue Dark-color-theme.json
│   ├── Explosive Cyan Dark-color-theme.json
│   ├── Explosive Yellow Dark-color-theme.json
│   ├── Explosive High Contrast Green-color-theme.json
│   ├── Explosive High Contrast Red-color-theme.json
│   ├── Explosive High Contrast Yellow-color-theme.json
│   ├── Explosive High Contrast Cyan-color-theme.json
│   ├── Explosive High Contrast Blue-color-theme.json
│   └── Explosive Mixed-color-theme.json
└── screenshots/              # 主题截图
```

## 新增主题后的同步清单

每次生成新的主题文件（放在 `themes/` 目录下）后，**必须**同步更新以下文件：

### 1. `package.json` — 注册主题

在 `contributes.themes` 数组中添加新主题条目：

```json
{
  "label": "主题显示名称",
  "uiTheme": "vs-dark",       // 或 "hc-black"
  "path": "./themes/新文件名-color-theme.json"
}
```

同时更新以下顶层字段：
- `keywords` — 如新主题引入了新色系（如 purple、orange），添加到关键词数组
- `contributes.themes` 总数 — 确保与 `themes/` 目录下的文件数量一致

### 2. `README.md` 和 `README_CN.md` — 添加主题介绍

#### 英文 README

- 在 `## Included Themes` 下找到对应分组（Dark Themes 或 High Contrast Themes）
- 添加新主题条目，格式：`- **主题名** — 颜色风格简述，主色调色值`
- 在 `## Screenshots` 部分添加截图引用

#### 中文 README

- 同步更新 `README_CN.md` 中对应的主题介绍和截图部分

> **注意**：两个 README 顶部都有语言切换链接，确保两者都保留。

### 3. `CHANGELOG.md` — 记录变更

- 如果尚未发布（仍为 `[Unreleased]`），在现有条目中追加新主题
- 如果已发布新版本，创建新的版本区块记录变更

### 4. 可选更新

- `icon.png` — 如主题色系变化较大，考虑更新图标
- `galleryBanner.color` — 如主色调变更，更新横幅颜色

## 主题文件命名规范

- 文件名格式：`{主题名称}-color-theme.json`
- 示例：`Explosive Orange Dark-color-theme.json`
- `package.json` 中的 `path` 必须与文件名完全匹配

## 发布前检查

运行 `npx @vscode/vsce package` 确认打包成功，输出中应包含所有主题文件且无错误。
