import json
import os
import uuid
from datetime import datetime

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)
DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tasks.json")
CATEGORY_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "categories.json")

DEFAULT_CATEGORIES = ["工作", "个人", "学习", "其他"]


def load_categories():
    if os.path.exists(CATEGORY_FILE):
        with open(CATEGORY_FILE, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                pass
    return list(DEFAULT_CATEGORIES)


def save_categories(cats):
    with open(CATEGORY_FILE, "w", encoding="utf-8") as f:
        json.dump(cats, f, ensure_ascii=False, indent=2)


def load_tasks():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def save_tasks(tasks):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(tasks, f, ensure_ascii=False, indent=2)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    tasks = load_tasks()
    priority_order = {"high": 0, "medium": 1, "low": 2}
    tasks.sort(key=lambda t: (t["completed"], priority_order.get(t["priority"], 3)))
    return jsonify(tasks)


@app.route("/api/tasks", methods=["POST"])
def create_task():
    data = request.get_json()
    if not data or not data.get("title", "").strip():
        return jsonify({"error": "标题不能为空"}), 400

    task = {
        "id": str(uuid.uuid4()),
        "title": data["title"].strip(),
        "description": data.get("description", "").strip(),
        "priority": data.get("priority", "medium"),
        "category": data.get("category", "其他"),
        "due_date": data.get("due_date", ""),
        "completed": False,
        "created_at": datetime.now().isoformat(),
    }
    tasks = load_tasks()
    tasks.append(task)
    save_tasks(tasks)
    return jsonify(task), 201


@app.route("/api/tasks/<task_id>", methods=["PUT"])
def update_task(task_id):
    tasks = load_tasks()
    for task in tasks:
        if task["id"] == task_id:
            data = request.get_json()
            if "completed" in data:
                task["completed"] = data["completed"]
            if "title" in data:
                task["title"] = data["title"].strip()
            if "description" in data:
                task["description"] = data.get("description", "").strip()
            if "priority" in data:
                task["priority"] = data["priority"]
            if "category" in data:
                task["category"] = data["category"]
            if "due_date" in data:
                task["due_date"] = data["due_date"]
            save_tasks(tasks)
            return jsonify(task)
    return jsonify({"error": "任务不存在"}), 404


@app.route("/api/tasks/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    tasks = load_tasks()
    tasks = [t for t in tasks if t["id"] != task_id]
    save_tasks(tasks)
    return jsonify({"ok": True})


@app.route("/api/categories", methods=["GET"])
def get_categories():
    return jsonify(load_categories())


@app.route("/api/categories", methods=["POST"])
def add_category():
    data = request.get_json()
    name = (data.get("name", "") if data else "").strip()
    if not name:
        return jsonify({"error": "分类名不能为空"}), 400
    cats = load_categories()
    if name in cats:
        return jsonify({"error": "分类已存在"}), 409
    cats.append(name)
    save_categories(cats)
    return jsonify(cats), 201


@app.route("/api/categories/<name>", methods=["DELETE"])
def delete_category(name):
    cats = load_categories()
    if name in DEFAULT_CATEGORIES:
        return jsonify({"error": "不能删除默认分类"}), 403
    if name not in cats:
        return jsonify({"error": "分类不存在"}), 404
    cats.remove(name)
    save_categories(cats)
    return jsonify(cats)


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
