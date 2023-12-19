const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const submitBtn = $(".btn-add");
const inputElm = $(".input-value");
const dueDateElm = $("#picker-date");
const deleteBtnElms = $$(".delete-btn");
const todoLayoutELm = $(".todo-layout");
console.log(deleteBtnElms);
const app = {
  TODO: "Todo",
  DOING: "Doing",
  DONE: "DONE",
  todos: [],
  handleEvent: function () {
    const _this = this;
    flatpickr("#picker-date", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      onChange: function (selectedDates, dateStr, instance) {
        console.log("Selected Date and Time:", dateStr);
      },
    });
    submitBtn.onclick = function (event) {
      event.preventDefault();
      let dueDateVal = dueDateElm.value;
      console.log(dueDateVal);
      const dueDate = new Date(dueDateVal);
      let newTodoItem = {
        id: new Date().toISOString(),
        status: _this.TODO,
        text: inputElm.value,
        dueDate,
        columnName: _this.TODO,
      };
      _this.todos.push(newTodoItem);
      _this.saveTodosToLocalStorage(_this.todos);
      _this.renderTodos();
      console.log(_this.todos);
    };
    //delete todo
    deleteBtnElms.forEach((deleteButton) => {
      deleteButton.onclick = function (event) {
        console.log(event);
        const todoId = event.target.closest(".todo-item").dataset.id;
        const column = event.target.closest(".todo-item").dataset.column;
        _this.deleteTodo(todoId, column);
        _this.renderTodos();
      };
    });
  },
  deleteTodo: function (todoId, columnName) {
    let newTodos = this.todos.filter(
      (todo) => todo !== todoId || todo.columnName !== columnName
    );
    this.saveTodosToLocalStorage(newTodos);
  },
  saveTodosToLocalStorage: function (todos) {
    localStorage.setItem("todos", JSON.stringify(todos));
  },
  loadTodosFromLocalStorage: function () {
    const todoFromStorage = localStorage.getItem("todos");
    this.todos = todoFromStorage ? JSON.parse(todoFromStorage) : [];
  },

  renderTodos: function () {
    const todoListElm = $(".todo-status__todo");
    if (this.todos?.length > 0) {
      let html = this.todos
        .filter((item) => item.status === this.TODO)
        .map((todo, index) => {
          return `
    
    <div data-id="${todo.id}" class="todo-item shadow-sm">
    <div
      class="todo-item__content flex items-center items-center gap-x-3"
    >
      <div class="task-content text-base font-medium">${todo.text}</div>
    </div>
    <div
      class="todo-item__content flex items-center items-center"
    >
      <span class="due-date text-sm font-normal">28-8-2024</span>
    </div>
    <div
      class="todo-item__content flex items-center items-center"
    >
      <button class="btn--todo btn">todo</button>
    </div>
    <div
      class="todo-item__content gap-x-2 flex items-center items-center"
    >
      <i class="bi bi-pencil text-xl icon-edit"></i>
      <i class="bi delete-btn bi-trash text-xl icon-trash"></i>
    </div>
  </div>
    `;
        });
      todoListElm.innerHTML = html.join("");
    }
  },

  start: function () {
    this.handleEvent();
    this.loadTodosFromLocalStorage();
    this.renderTodos();
  },
};

document.addEventListener("DOMContentLoaded", function () {
  app.start();
});
