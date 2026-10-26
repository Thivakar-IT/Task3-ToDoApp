const taskInput = document.getElementById("taskInput");
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const message = document.getElementById("message");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

const emptyMessage = document.getElementById("emptyMessage");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let messageTimer;

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function showMessage(text) {
    message.textContent = text;

    clearTimeout(messageTimer);

    messageTimer = setTimeout(() => {
        message.textContent = "";
    }, 2500);
}

function updateStats() {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;

    totalTasks.textContent = tasks.length;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
}

function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = tasks
        .map((task, index) => ({ ...task, originalIndex: index }))
        .filter(task => {
            if (currentFilter === "pending") {
                return !task.completed;
            }

            if (currentFilter === "completed") {
                return task.completed;
            }

            return true;
        });

    filteredTasks.forEach(task => {
        const li = document.createElement("li");

        if (task.completed) {
            li.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task as completed");

        checkbox.addEventListener("change", () => {
            tasks[task.originalIndex].completed = checkbox.checked;

            saveTasks();
            renderTasks();
        });

        const span = document.createElement("span");
        span.textContent = task.text;

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.textContent = "Delete";
        deleteBtn.setAttribute("aria-label", `Delete ${task.text}`);

        deleteBtn.addEventListener("click", () => {
            tasks.splice(task.originalIndex, 1);

            saveTasks();
            renderTasks();
            showMessage("Task deleted successfully.");
        });

        li.append(checkbox, span, deleteBtn);
        taskList.appendChild(li);
    });

    updateStats();

    emptyMessage.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    clearCompletedBtn.disabled =
        !tasks.some(task => task.completed);

    clearCompletedBtn.style.opacity =
        clearCompletedBtn.disabled ? "0.5" : "1";
}

taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
        showMessage("Please enter a task first.");
        taskInput.focus();
        return;
    }

    tasks.push({
        text: text,
        completed: false
    });

    saveTasks();

    currentFilter = "all";

    filterButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === "all"
        );
    });

    renderTasks();

    taskInput.value = "";
    taskInput.focus();

    showMessage("Task added successfully!");
});

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(item => {
            item.classList.toggle("active", item === button);
        });

        renderTasks();
    });
});

clearCompletedBtn.addEventListener("click", () => {
    const completedCount = tasks.filter(task => task.completed).length;

    if (completedCount === 0) {
        showMessage("No completed tasks to clear.");
        return;
    }

    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    renderTasks();

    showMessage(`${completedCount} completed task(s) cleared.`);
});

renderTasks();