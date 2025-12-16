let todos = [];
let nextId = 1;

function addTask() {
  const input = document.getElementById("taskInput");
  const title = input.value.trim();

  if (!title) return;

  todos.push({
    id: nextId++,
    title,
    done: false
  });

  input.value = "";
  render();
}

function toggleDone(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  todo.done = !todo.done;
  render();
}

function deleteTask(id) {
  todos = todos.filter(t => t.id !== id);
  render();
}

function render() {
  const list = document.getElementById("list");
  const stats = document.getElementById("stats");

  list.innerHTML = "";

  todos.forEach(todo => {
    const li = document.createElement("li");
    li.className = "todo" + (todo.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => toggleDone(todo.id));

    const span = document.createElement("span");
    span.textContent = todo.title;

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.addEventListener("click", () => deleteTask(todo.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);

    list.appendChild(li);
  });

  const pending = todos.filter(t => !t.done).length;
  stats.textContent = `Pendientes: ${pending} / Total: ${todos.length}`;
}
