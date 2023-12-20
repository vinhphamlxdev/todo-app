const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const submitBtn = $(".btn-add");
const inputElm = $(".input-value");
const dueDateElm = $("#picker-date");
const todoLayoutElm = $(".todo-layout");
const todoListsElm = $$(".todo-list");

const app = {
  todos: [],
  STATUS: {
    TODO: "Todo",
    DOING: "Doing",
    DONE: "Done",
  },
  todoColumnNames: ["Todo", "Doing", "Done"],
  setupDatePicker: function () {
    flatpickr("#picker-date", {
      enableTime: true,
      minDate: "today",
      dateFormat: "Y-m-d H:i",
      onChange: function (selectedDates, dateStr, instance) {
        console.log("Selected Date and Time:", dateStr);
      },
    });
  },
  handleEvent: function () {
    const _this = this;
    submitBtn.onclick = function (event) {
      event.preventDefault();
      const dueDateVal = dueDateElm.value;
      const inputVal = inputElm.value;
      if (inputVal.trim() === "") {
        alert("Vui lòng nhập nội dung cho todo!");
        return;
      }
      if (dueDateVal.trim() === "") {
        alert("Vui lòng chọn ngày hết  hạn!");
        return;
      }
      const dueDate = new Date(dueDateVal);
      const newTodoItem = {
        id: crypto.randomUUID(),
        status: _this.STATUS.TODO,
        text: inputElm.value,
        dueDate,
        columnName: _this.STATUS.TODO,
      };
      _this.todos.push(newTodoItem);
      _this.saveTodosToLocalStorage(_this.todos);
      _this.renderTodos();
      inputElm.value = "";
    };
  },
  handleDeleteTodo: function () {
    todoListsElm.forEach((column) => {
      const todoItemElm = column.querySelectorAll(".todo-item");
      console.log(todoItemElm);
      todoItemElm.forEach((todoItem) => {
        todoItem.onclick = function (event) {
          if (event.target && event.target.closest(".delete-btn")) {
            const todoId = event.currentTarget.dataset.id;
            console.log(event.target);
            app.deleteTodo(todoId);
          }
        };
      });
    });
  },

  changeTodoStatus: function (todoId) {
    console.log(todoId);
    const existTodo = this.todos.find((t) => t.id === todoId);

    if (existTodo) {
      switch (existTodo.status) {
        case this.STATUS.TODO:
          existTodo.status = this.STATUS.DOING;
          existTodo.columnName = this.STATUS.DOING;
          break;
        case this.STATUS.DOING:
          existTodo.status = this.STATUS.DONE;
          existTodo.columnName = this.STATUS.DONE;

          break;
      }

      this.saveTodosToLocalStorage(this.todos);
      this.loadTodosFromLocalStorage();
      this.renderTodos();
    }
  },
  deleteTodo: function (todoId) {
    let newTodos = this.todos.filter((todo) => todo.id !== todoId);
    console.log(newTodos);
    this.saveTodosToLocalStorage(newTodos);
    this.loadTodosFromLocalStorage();
    this.renderTodos();
  },
  saveTodosToLocalStorage: function (todos) {
    localStorage.setItem("todos", JSON.stringify(todos));
    console.log("ok");
  },
  loadTodosFromLocalStorage: function () {
    const todoFromStorage = localStorage.getItem("todos");
    this.todos = todoFromStorage ? JSON.parse(todoFromStorage) : [];
  },

  renderTodos: function () {
    this.todoColumnNames.forEach((columnName) => {
      const todoColumnElm = $(`.todo-column--${columnName.toLowerCase()}`);
      const todoInColumn = this.todos.filter(
        (item) => item.columnName === columnName
      );
      if (todoInColumn.length > 0) {
        let html = todoInColumn.map((todo) => {
          return `
          <div data-id="${todo.id}" class="todo-item select-none shadow-sm">
          <div
          class="todo-item__content flex items-center items-center"
        >
        <div class=" flex justify-center items-center">
        <i class="bi bi-check-lg checkbox-status text-base text-white"></i>
        </div>

        </div>  
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
            class="todo-item__content gap-x-2 flex items-center items-center"
          >
            <i class="bi bi-pencil text-xl icon-edit"></i>
            <i class="bi delete-btn bi-trash text-xl icon-trash"></i>
          </div>
        </div>
          
          `;
        });
        todoColumnElm.innerHTML = html.join("");
      } else {
        todoColumnElm.innerHTML = "";
      }
    });
    this.handleDeleteTodo();
  },

  start: function () {
    this.setupDatePicker();
    this.loadTodosFromLocalStorage();
    this.renderTodos();
    this.handleEvent();
  },
};

app.start();
