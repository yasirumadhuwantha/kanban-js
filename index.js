import Kanban from "./kanban.js";

const todo = document.querySelector(".cards.todo");
const pending = document.querySelector(".cards.pending");
const completed = document.querySelector(".cards.completed");

const taskbox = [todo, pending, completed];

function addTaskCard(task, index) {
    const element = document.createElement("form");
    element.className = "card";
    element.draggable = true;
    element.dataset.id = task.taskId;
    element.innerHTML = `
        <input value="${task.content}" type="text" name="task" autocomplete="off" disabled="disabled">
        <div>
            <span class="task-id">#${task.taskId}</span>
            <span>
                <button class="bi bi-pencil edit" data-id="${task.taskId}" type="button"></button>
                <button class="bi bi-check-lg update hide" data-id="${task.taskId}" data-column="${index}" type="button"></button>
                <button class="bi bi-trash3 delete" data-id="${task.taskId}" type="button"></button>
            </span>
        </div>
    `;
    taskbox[index].appendChild(element);
}

Kanban.getAllTasks().forEach((tasks, index) => {
    tasks.forEach(task => {
        addTaskCard(task, index);
    });
});

const addForm = document.querySelectorAll(".add");
addForm.forEach(form => {
    form.addEventListener("submit", event => {
        event.preventDefault();
        if (form.task.value.trim()) {
            const columnId = form.submit.dataset.id;
            const task = Kanban.insertTask(columnId, form.task.value.trim());
            addTaskCard(task, columnId);
            form.reset();
        }
    });
});

taskbox.forEach(column => {
    column.addEventListener("click", event => {
        const target = event.target;
        const formInput = target.closest(".card")?.querySelector('input[name="task"]');
        if (!formInput) return;

        if (target.classList.contains("edit")) {
            event.preventDefault();
            formInput.removeAttribute("disabled");
            formInput.focus();
            target.classList.add("hide");
            target.nextElementSibling.classList.remove("hide");
        }

        if (target.classList.contains("update")) {
            event.preventDefault();
            formInput.setAttribute("disabled", "disabled");
            target.classList.add("hide");
            target.previousElementSibling.classList.remove("hide");

            const taskId = target.dataset.id;
            const columnId = target.dataset.column;
            const content = formInput.value.trim();

            Kanban.updateTask(taskId, {
                columnId: Number(columnId),
                content: content
            });
        }

        if (target.classList.contains("delete")) {
            event.preventDefault();
            const card = target.closest(".card");
            const taskId = target.dataset.id;
            card.remove();
            Kanban.deleteTask(taskId);
        }
    });
});

let draggedCard = null;

document.addEventListener("dragstart", event => {
    const card = event.target.closest(".card");
    if (card) {
        draggedCard = card;
        card.classList.add("dragging");
    }
});

document.addEventListener("dragend", event => {
    const card = event.target.closest(".card");
    if (card) {
        card.classList.remove("dragging");

        const targetColumn = card.closest(".cards");
        if (targetColumn) {
            const columnIndex = taskbox.indexOf(targetColumn);
            const taskId = card.dataset.id;
            const content = card.querySelector('input[name="task"]').value;

            const updateBtn = card.querySelector(".update");
            if (updateBtn) {
                updateBtn.dataset.column = columnIndex;
            }

            Kanban.updateTask(taskId, {
                columnId: columnIndex,
                content: content
            });
        }
        draggedCard = null;
    }
});

taskbox.forEach(column => {
    column.addEventListener("dragover", event => {
        event.preventDefault();

        if (draggedCard && !column.contains(draggedCard)) {
            column.appendChild(draggedCard);
        }
    });

    column.addEventListener("drop", event => {
        event.preventDefault();
    });
});