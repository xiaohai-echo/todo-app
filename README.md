# Todo App

一个轻量级的 Web 待办事项应用，基于 Flask + 原生前端构建，数据存储在本地 JSON 文件中。

## 功能

- 任务的添加、查看、完成、删除
- 优先级标记（高/中/低），左侧色条 + 标签区分
- 自定义分类管理（可动态增删，默认 4 个分类受保护）
- 截止日期设置，超期红色提醒、3天内到期黄色提醒
- 按状态、优先级、分类组合筛选
- 完成统计面板（总数/已完成/待完成）

## 技术栈

- **后端**: Flask (Python)
- **前端**: 原生 HTML + CSS + JavaScript
- **存储**: JSON 文件（无需数据库）

## 项目结构

```
daily-report/
├── app.py              # Flask 应用 + REST API
├── templates/
│   └── index.html      # 页面模板
├── static/
│   ├── style.css       # 样式
│   └── app.js          # 前端逻辑
├── tasks.json          # 任务数据（自动生成）
├── categories.json     # 分类数据（自动生成）
└── README.md
```

## 快速开始

### 环境要求

- Python 3.8+

### 安装依赖

```bash
pip install flask
```

### 启动应用

```bash
python app.py
```

浏览器访问 `http://localhost:5000`

## API

| Method | Endpoint          | Description |
|--------|-------------------|-------------|
| GET    | /api/tasks        | 获取任务列表 |
| POST   | /api/tasks        | 创建任务     |
| PUT    | /api/tasks/\<id\> | 更新任务     |
| DELETE | /api/tasks/\<id\> | 删除任务     |
| GET    | /api/categories    | 获取分类列表 |
| POST   | /api/categories    | 添加分类     |
| DELETE | /api/categories/\<name\> | 删除分类 |

### 任务数据结构

```json
{
  "id": "uuid",
  "title": "任务标题",
  "description": "详细描述",
  "priority": "high | medium | low",
  "category": "工作 | 个人 | 学习 | 其他",
  "due_date": "2026-05-08",
  "completed": false,
  "created_at": "2026-05-07T16:00:00"
}
```
