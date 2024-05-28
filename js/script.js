document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("form").addEventListener("submit", function (e) {
    e.preventDefault();
    addTodo();

    Swal.fire({
      position: "center",
      icon: "success",
      title: "Todo Berhasil Ditambahkan",
      showConfirmButton: false,
      timer: 1500,
    }).then(() => {
      location.reload();
    });
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

const todos = [];
const RENDER_EVENT = "render-todo";

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedTodoList = document.getElementById("todos");
  uncompletedTodoList.innerHTML = "";

  const completedTodoList = document.getElementById("completed-todos");
  completedTodoList.innerHTML = "";

  for (const todoItem of todos) {
    const todoElement = makeTodo(todoItem);

    if (!todoItem.isCompleted) {
      uncompletedTodoList.append(todoElement);
    } else {
      completedTodoList.append(todoElement);
    }
  }
});

function generateId() {
  return +new Date();
}

function generateTodoObject(id, task, date, isCompleted) {
  return {
    id,
    task,
    date,
    isCompleted,
  };
}

function addTodo() {
  const textTodo = document.getElementById("title").value;
  const dateTodo = document.getElementById("date").value;

  const generatedID = generateId();
  const todoObject = generateTodoObject(generatedID, textTodo, dateTodo, false);
  todos.push(todoObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeTodo(todoObject) {
  const textTitle = document.createElement("h2");
  textTitle.innerText = todoObject.task;

  const textDate = document.createElement("p");
  textDate.innerText = todoObject.date;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textDate);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `todo-${todoObject.id}`);

  if (todoObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.addEventListener("click", function () {
      undoTodo(todoObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.addEventListener("click", function () {
      deleteTodo(todoObject.id);
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    checkButton.addEventListener("click", function () {
      completeTodo(todoObject.id);
    });

    container.append(checkButton);
  }

  return container;
}

function completeTodo(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findTodo(todoId) {
  for (const todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }

  return null;
}

function undoTodo(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteTodo(todoId) {
  const todoTarget = findTodoIndex(todoId);

  if (todoTarget === -1) return;

  todos.splice(todoTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findTodoIndex(todoId) {
  for (const index in todos) {
    if (todos[index].id === todoId) {
      return index;
    }
  }

  return -1;
}

const SAVED_EVENT = "saved-todo";
const STORAGE_KEY = "TODO_APPS";

function isStorageExist() {
  if (typeof Storage == undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }

  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener(SAVED_EVENT, () => {
  localStorage.getItem(STORAGE_KEY);
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const todo of data) {
      todos.push(todo);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
