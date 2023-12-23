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
const progressElm = $(".progress");
const btnToast = $(".btn-toast");
const toastContainerElm = $(".toast");
const closeToastBtn = $(".close-toast");

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
  createToastMsg: function () {
    toastContainerElm.classList.add("active");
    progressElm.classList.add("active");
    setTimeout(() => {
      toastContainerElm.classList.remove("active");
    }, 5000); //1s = 1000millisecond
    setTimeout(() => {
      progressElm.classList.remove("active");
    }, 5300);
  },
  handleCloseToast: function () {
    closeToastBtn.onclick = function (e) {
      toastContainerElm.classList.remove("active");
      progressElm.classList.remove("active");
    };
  },
  handleDarkMode: function () {
    const darkModeElm = $(".darkmode__btn");
    const darkModeBtnElm = $(".darkmode");
    darkModeElm.onclick = function (event) {
      darkModeBtnElm.classList.toggle("active");
      document.body.classList.toggle("dark-theme");
    };
  },
  compareDate: function (startDate, dueDate) {
    const currStartDate = new Date(startDate);
    const currDueDate = new Date(dueDate);
    const numStartDate = parseInt(
      `${currStartDate.getFullYear()}${(currStartDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${currStartDate
        .getDate()
        .toString()
        .padStart(2, "0")}`,
      10
    );
    const numDueDate = parseInt(
      `${currDueDate.getFullYear()}${(currDueDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${currDueDate.getDate().toString().padStart(2, "0")}`,
      10
    );
    return numStartDate === numDueDate;
  },

  getCurrTime: function () {
    const newDate = new Date();
    const currTime = `${newDate.getHours()}:${
      newDate.getMinutes
    }:${newDate.getSeconds()}`;
    return currTime;
  },
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
        const dateSelected = currentSelected.getTime();
        const formatTime = `${currentSelected.getHours()}:${currentSelected.getMinutes()}:${currentSelected.getSeconds()}`;
        app.startTime = formatTime;
        app.starteDate = instance.input.value;
        app.setupDueDatePicker(currentSelected);
        //check max time
        //check min Time
        const currentDate = new Date();
        //neu ngay dc chon lon ngay hien tai
        if (dateSelected > currentDate.getTime()) {
          this.set("minTime", null);
        } else {
          const currTime = app.getCurrTime();
          this.set("minTime", currTime);
        }
      },
      onOpen: function (selectedDates, dateStr, instance) {
        const currentDate = new Date();
        console.log(currentDate.getHours());
        const formatCurrTime = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
        this.set("minTime", formatCurrTime);
      },
    });
  },

  setupDueDatePicker: function (currentStartDate) {
    flatpickr("#due-date__picker", {
      enableTime: true,
      minDate: app.starteDate || "today",
      dateFormat: "Y/m/d H:i:S",
      time_24hr: true,
      enableSeconds: true,
      onChange: function (selectedDates, dateStr, instance) {
        app.dueDate = instance.input.value;
        //
        const checkCompareDate = app.compareDate(
          currentStartDate,
          selectedDates[0]
        );
        //
        const currTime = app.getCurrTime();
        console.log(app.startTime);
        const check = checkCompareDate ? app.startTime : null;
        //
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

  preventDefaultForm: function () {
    formGroupElm.onsubmit = function (event) {
      event.preventDefault();
    };
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

  handleEventTodo: function () {
    todoListsElm.forEach((column) => {
      column.ondragover = function (event) {
        event.preventDefault();
        const draggingEl = $(".todo-item.is-dragging");
        if (!draggingEl) return;
        const remainingEl = event.currentTarget.querySelectorAll(
          ".todo-item:not(.is-dragging)"
        );
        const targetElm = [...remainingEl].find((item) => {
          return event.pageY <= item.offsetTop + item.offsetHeight / 2;
        });
        column.insertBefore(draggingEl, targetElm);
      };
      column.ondrop = function (event) {
        event.preventDefault();
        const draggedItemId = event.dataTransfer.getData("text/plain");
        //update status
        const existIndex = app.todos.findIndex(
          (todo) => todo.id === draggedItemId
        );
        if (existIndex !== -1) {
          const newTodos = [...app.todos];
          newTodos[existIndex].status = column.dataset.columname;
          const todoNodeList = document.querySelectorAll(".todo-item");
          const arrId = [...todoNodeList].map(
            (todoNode) => todoNode.dataset.id
          );
          const indexMap = {};
          arrId.forEach((item, index) => {
            indexMap[item] = index;
          });

          const sortedArr = newTodos.sort(
            (a, b) => indexMap[a.id] - indexMap[b.id]
          );
          app.syncTodo(sortedArr);
        }
      };
      //
      const todoItemElm = column.querySelectorAll(".todo-item");
      todoItemElm.forEach((todoItem) => {
        todoItem.addEventListener("dragstart", (event) => {
          todoItem.classList.add("is-dragging");
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
  syncTodo: function (newTodos) {
    this.saveTodosToLocalStorage(newTodos);
    this.loadTodosFromLocalStorage();
    this.renderTodos();
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
  checkDueDateTodo: function () {
    setInterval(() => {
      const currentDate = new Date();
      const currentDateTime = currentDate.getTime();
      this.todos.forEach((todoItem) => {
        const dueDate = new Date(todoItem.dueDate);
        if (todoItem.status === "Todo" || todoItem.status === "Doing") {
          if (currentDateTime >= dueDate.getTime()) {
            app.createToastMsg();
          }
        }
      });
    }, 5500);
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
          app.syncTodo(newTodos);
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
          break;
        case this.STATUS.DOING:
          existTodo.status = this.STATUS.DONE;
          break;
      }

      this.syncTodo(this.todos);
    }
  },
  deleteTodo: function (todoId) {
    const newTodos = this.todos.filter((todo) => todo.id !== todoId);
    this.syncTodo(newTodos);
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
        (item) => item.status === columnName
      );
      if (todoInColumn.length > 0) {
        let html = todoInColumn.map((todo) => {
          return `
          <div data-id="${todo.id}" draggable="true"
                  class="todo-item h-[150px] frink-0 overflow-hidden flex flex-col select-none shadow-lg"
                >
                  <div class="flex items-center justify-between w-full">
                    <div
                      class="todo-item__content flex-1 flex gap-x-3 items-center items-center"
                    >
                      <div class="flex justify-center items-center">
                        <i
                          class="bi bi-check-lg checkbox-status text-base text-white"
                        ></i>
                      </div>
                      <div class="task-content whitespace-wrap text-base font-medium">
                        ${todo.text}
                      </div>
                    </div>

                    <div
                      class="todo-item__content ml-2 gap-x-2 flex items-center items-center"
                    >
                    ${
                      todo.status !== "Done"
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
    this.checkDueDateTodo();
    this.handleCloseToast();
    this.handleDarkMode();
  },
};

window.document.addEventListener("DOMContentLoaded", app.start());
