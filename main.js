const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const inputElm = $(".input-value");
let dueDateElm = $("#due-date__picker");
let startDateElm = $("#start-date__picker");
const todoLayoutElm = $(".todo-layout");
const todoListsElm = $$(".todo-list");
const formGroupElm = $(".form-group");
const updateBtn = $(".btn-update");
const submitBtn = $(".btn-add");

const app = {
  todos: [],
  starteDate: "",
  dueDate: "",
  startTime: "",
  isEditing: false,
  STATUS: {
    TODO: "Todo",
    DOING: "Doing",
    DONE: "Done",
  },
  todoColumnNames: ["Todo", "Doing", "Done"],
  setupStartDatePicker: function (checkMaxDate, checkMaxTime) {
    flatpickr("#start-date__picker", {
      enableTime: true,
      minDate: "today",
      maxDate: checkMaxDate || null,
      maxTime: checkMaxTime || null,
      dateFormat: "Y/m/d H:i:S",
      time_24hr: true,
      enableSeconds: true,
      onChange: function (selectedDates, dateStr, instance) {
        const currentSelected = selectedDates[0];
        const currendDay = currentSelected.getTime();
        const formatTime = `${currentSelected.getHours()}:${currentSelected.getMinutes()}:${currentSelected.getSeconds()}`;
        app.startTime = formatTime;
        app.starteDate = instance.input.value;
        app.setupDueDatePicker(currendDay);
        console.log(checkMaxDate);
      },
    });
  },
  preventDefaultForm: function () {
    formGroupElm.onsubmit = function (event) {
      event.preventDefault();
    };
  },

  setupDueDatePicker: function (currendStartDay) {
    flatpickr("#due-date__picker", {
      enableTime: true,
      minDate: app.starteDate || "today",
      dateFormat: "Y/m/d H:i:S",
      minTime: app.startTime,
      time_24hr: true,
      enableSeconds: true,
      onChange: function (selectedDates, dateStr, instance) {
        app.dueDate = instance.input.value;
        const currentSelectTime = selectedDates[0].getTime();
        const check =
          currentSelectTime === currendStartDay ? app.startTime : null;
        this.set("minTime", check);
        const checkMaxDate = `${selectedDates[0].getFullYear()}/${
          selectedDates[0].getMonth() + 1
        }/${selectedDates[0].getDate()}`;
        const checkMaxTime = `${selectedDates[0].getHours()}:${
          selectedDates[0].getMinutes() - 1
        }:${selectedDates[0].getSeconds()}`;
        app.setupStartDatePicker(checkMaxDate, checkMaxTime);
      },
    });
  },
  handleEvent: function () {
    const _this = this;
    //add todo
    submitBtn.onclick = function (event) {
      const newTodoItem = {
        id: crypto.randomUUID(),
        status: _this.STATUS.TODO,
        text: inputElm.value,
        startDate: _this.starteDate,
        dueDate: _this.dueDate,
        columnName: _this.STATUS.TODO,
      };
      if (!_this.checkEmptyValue()) {
        _this.todos.unshift(newTodoItem);
        _this.saveTodosToLocalStorage(_this.todos);
        _this.renderTodos();
        _this.resetValue();
      } else {
        Swal.fire({
          text: "Please complete all information",
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    };
  },
  resetValue: function () {
    inputElm.value = "";
    startDateElm.value = "";
    dueDateElm.value = "";
    this.starteDate = "";
    this.dueDate = "";
  },
  insertAboveTask: function (column, mouseY) {
    const todoItems = column.querySelectorAll(".todo-item:not(.is-dragging)");
    let closestTask = null;
    let closestOffset = Number.POSITIVE_INFINITY;

    todoItems.forEach((todoItem) => {
      const { top, height } = todoItem.getBoundingClientRect();
      const offset = mouseY - top;

      // Adjust this condition based on where you want to insert the dragged item
      if (offset < 0 && offset < closestOffset && offset < height / 2) {
        closestOffset = offset;
        closestTask = todoItem;
      }
    });

    return closestTask;
  },

  handleEventTodo: function () {
    todoListsElm.forEach((column) => {
      column.addEventListener("dragover", (event) => {
        event.preventDefault();
        const draggedItemId = event.dataTransfer.getData("text/plain");
        const draggedItem = document.querySelector(
          `[data-id="${draggedItemId}"]`
        );
        const bottomTodoItem = app.insertAboveTask(column, event.clientY);
        if (!bottomTodoItem) {
          column.appendChild(draggedItem);
        } else {
          column.insertBefore(draggedItem, bottomTodoItem);
        }
      });
      column.addEventListener("drop", (event) => {
        event.preventDefault();
        const draggedItemId = event.dataTransfer.getData("text/plain");
        const draggedItem = column.dataset.columnName;
        //update status
        const existIndex = app.todos.findIndex(
          (todo) => todo.id === draggedItemId
        );
        if (existIndex !== -1) {
          // this.todos[existIndex].status =
        }
      });
      //
      const todoItemElm = column.querySelectorAll(".todo-item");
      todoItemElm.forEach((todoItem) => {
        todoItem.addEventListener("dragstart", (event) => {
          todoItem.classList.add(".is-dragging");
          event.dataTransfer.setData("text/plain", todoItem.dataset.id);
        });
        todoItem.addEventListener("dragend", (event) => {
          todoItem.classList.remove("is-dragging");
        });

        //
        todoItem.onclick = function (event) {
          if (event.target && event.target.closest(".delete-btn")) {
            const todoId = event.currentTarget.dataset.id;
            app.deleteTodo(todoId);
          }
          //change status
          if (event.target && event.target.closest(".checkbox-status")) {
            const todoId = event.currentTarget.dataset.id;
            app.changeTodoStatus(todoId);
          }
          //edit todo
          if (event.target && event.target.closest(".edit-btn")) {
            const todoId = event.currentTarget.dataset.id;
            app.handleEditTodo(todoId);
          }
        };
      });
    });
  },
  checkEmptyValue: function () {
    if (inputElm.value.trim() === "") {
      return true;
    }
    if (!app.starteDate) {
      return true;
    }
    if (!app.dueDate) {
      return true;
    }
    return false;
  },
  updateTodo: function (todoId) {
    const existIndex = this.todos.findIndex((todo) => todo.id === todoId);
    if (existIndex !== -1) {
      updateBtn.onclick = function () {
        const newTodos = [...app.todos];
        newTodos[existIndex] = {
          ...newTodos[existIndex],
          text: inputElm.value,
          startDate: app.starteDate,
          dueDate: app.dueDate,
        };
        if (!app.checkEmptyValue()) {
          app.saveTodosToLocalStorage(newTodos);
          app.loadTodosFromLocalStorage();
          app.renderTodos();
          app.resetValue();
          app.isEditing = false;
          updateBtn.style.display = "none";
          submitBtn.style.display = "flex";
        } else {
          Swal.fire({
            text: "Please complete all information",
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      };
    }
  },
  handleEditTodo: function (todoId) {
    const existTodo = this.todos.find((todo) => todo.id === todoId);
    if (existTodo) {
      this.isEditing = true;
      inputElm.value = existTodo.text;
      startDateElm.value = existTodo.startDate;
      dueDateElm.value = existTodo.dueDate;
      this.starteDate = existTodo.startDate;
      this.dueDate = existTodo.dueDate;
      this.updateTodo(todoId);
      submitBtn.style.display = "none";
      updateBtn.style.display = "flex";
    }
  },

  changeTodoStatus: function (todoId) {
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
    const newTodos = this.todos.filter((todo) => todo.id !== todoId);
    this.saveTodosToLocalStorage(newTodos);
    this.loadTodosFromLocalStorage();
    this.renderTodos();
  },
  saveTodosToLocalStorage: function (todos) {
    localStorage.setItem("todos", JSON.stringify(todos));
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
          <div data-id="${todo.id}" draggable="true"
                  class="todo-item h-[150px] flex flex-col select-none shadow-lg"
                >
                  <div class="flex items-center justify-between w-full">
                    <div
                      class="todo-item__content flex gap-x-3 items-center items-center"
                    >
                      <div class="flex justify-center items-center">
                        <i
                          class="bi bi-check-lg checkbox-status text-base text-white"
                        ></i>
                      </div>
                      <div class="task-content text-base font-medium">
                        ${todo.text}
                      </div>
                    </div>

                    <div
                      class="todo-item__content ml-2 gap-x-2 flex items-center items-center"
                    >
                    ${
                      todo.columnName !== "Done"
                        ? `
                    <i class="bi bi-pencil text-xl edit-btn"></i>
                    `
                        : ""
                    }
                      <i class="bi delete-btn bi-trash text-xl icon-trash"></i>
                    </div>
                  </div>
                  <div
                    class="set-date__time w-full flex justify-between items-center"
                  >
                    <div class="flex gap-x-1 items-center">
                      <span>start:</span>
                      <span class="italic  pt-1  text-sm font-normal"
                        >${todo.startDate}</span
                      >
                    </div>
                    <div class="flex gap-x-1 items-center">
                      <span>end:</span>
                      <span class="italic pt-1 text-sm font-normal"
                        >${todo.dueDate}</span
                      >
                    </div>
                  </div>
                </div>
          `;
        });
        todoColumnElm.innerHTML = html.join("");
      } else {
        todoColumnElm.innerHTML = "";
      }
    });
    this.handleEventTodo();
  },

  start: function () {
    this.setupStartDatePicker();
    this.setupDueDatePicker();
    this.loadTodosFromLocalStorage();
    this.renderTodos();
    this.handleEvent();
    this.preventDefaultForm();
  },
};

window.document.addEventListener("DOMContentLoaded", app.start());
