let tasks = [];
let currentFilter = "all";
let currentPriority = "all";
let currentCategory = "all";

async function fetchTasks() {
  const res = await fetch("/api/tasks");
  tasks = await res.json();
  render();
}

function render() {
  renderStats();
  renderList();
}

function renderStats() {
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const pending = total - done;
  document.getElementById("stats").innerHTML = `
    <span>总计 <strong>${total}</strong></span>
    <span class="done">已完成 <strong>${done}</strong></span>
    <span class="pending">待完成 <strong>${pending}</strong></span>
  `;
}

function renderList() {
  const list = document.getElementById("task-list");
  let filtered = tasks;

  if (currentFilter === "active") filtered = filtered.filter((t) => !t.completed);
  if (currentFilter === "completed") filtered = filtered.filter((t) => t.completed);
  if (currentPriority !== "all") filtered = filtered.filter((t) => t.priority === currentPriority);
  if (currentCategory !== "all") filtered = filtered.filter((t) => t.category === currentCategory);

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty">暂无任务，快来添加吧</div>';
    return;
  }

  list.innerHTML = filtered.map((t) => {
    const dueHtml = formatDueDate(t.due_date);
    return `
      <li class="task-item priority-${t.priority} ${t.completed ? "completed" : ""}">
        <input type="checkbox" class="task-checkbox" ${t.completed ? "checked" : ""}
               onchange="toggleTask('${t.id}')">
        <div class="task-body">
          <div class="task-title">${esc(t.title)}</div>
          ${t.description ? `<div class="task-desc">${esc(t.description)}</div>` : ""}
          <div class="task-meta">
            <span class="tag tag-priority-${t.priority}">${priorityLabel(t.priority)}</span>
            <span class="tag tag-category">${esc(t.category)}</span>
            ${dueHtml}
          </div>
        </div>
        <button class="delete-btn" onclick="deleteTask('${t.id}')" title="删除">×</button>
      </li>`;
  }).join("");
}

function formatDueDate(dateStr) {
  if (!dateStr) return "";
  const today = new Date().toISOString().slice(0, 10);
  let cls = "";
  if (dateStr < today) cls = "overdue";
  else if (dateStr <= new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)) cls = "soon";
  return `<span class="due-date ${cls}">${dateStr}</span>`;
}

function priorityLabel(p) {
  return { high: "高", medium: "中", low: "低" }[p] || p;
}

function esc(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".filter-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.filter === filter);
  });
  render();
}

async function addTask() {
  const title = document.getElementById("new-title").value.trim();
  if (!title) return alert("请输入任务标题");

  const body = {
    title,
    description: document.getElementById("new-desc").value,
    priority: document.getElementById("new-priority").value,
    category: document.getElementById("new-category").value,
    due_date: document.getElementById("new-due-date").value,
  };

  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    document.getElementById("new-title").value = "";
    document.getElementById("new-desc").value = "";
    document.getElementById("new-due-date").value = "";
    await fetchTasks();
  }
}

async function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: !task.completed }),
  });
  await fetchTasks();
}

async function deleteTask(id) {
  await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  await fetchTasks();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  });

  document.getElementById("priority-filter").addEventListener("change", (e) => {
    currentPriority = e.target.value;
    render();
  });

  document.getElementById("category-filter").addEventListener("change", (e) => {
    currentCategory = e.target.value;
    render();
  });

  document.getElementById("add-btn").addEventListener("click", addTask);
  document.getElementById("new-title").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
  });

  fetchTasks();
});
