const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const inputElm = $(".input-value");
let dueDateElm = $("#due-date__picker");
let startDateElm = $("#start-date__picker");
const todoLayoutElm = $(".todo-layout");
const todoListsElm = $$(".todo-list");
const formGroupElm = $(".form-group");
const updateBtn = $(".btn-update");
const addNewTodoBtn = $(".btn-add");
const progressElm = $(".progress");
const btnToast = $(".btn-toast");
const toastContainerElm = $(".toast");
const notificationsElm = $(".notifications");

const app = {
  todos: [],
  startDate: "",
  dueDate: "",
  startTime: "",
  dueTime: "",
  startFlatpickr: null,
  dueFlatpickr: null,
  isEditing: false,
  intervalId: null,
  startSelectedDate: "",
  dueDateSelected: "",
  checkStartDate: {
    checkMaxDate: "",
    checkMaxTime: "",
  },
  firstPageload: true,
  STATUS: {
    TODO: "Todo",
    DOING: "Doing",
    DONE: "Done",
  },
  todoColumnNames: ["Todo", "Doing", "Done"],

  handleDarkMode: function () {
    const darkModeElm = $(".darkmode__btn");
    const darkModeBtnElm = $(".darkmode");
    darkModeElm.onclick = function (event) {
      darkModeBtnElm.classList.toggle("active");
      document.body.classList.toggle("dark-theme");
    };
  },

  getCurrTime: function () {
    const newDate = new Date();
    const currTime = `${newDate.getHours()}:${newDate.getMinutes()}:${newDate.getSeconds()}`;
    return currTime;
  },
  isSameDateWithCurrDate: function (dateComp) {
    if (!dateComp) {
      return false;
    }
    const dateCompFormat = `${dateComp.getDate()}/${
      dateComp.getMonth() + 1
    }/${dateComp.getFullYear()}`;
    const now = new Date();
    const formatCurrDate = `${now.getDate()}/${
      now.getMonth() + 1
    }/${now.getFullYear()}`;
    return formatCurrDate === dateCompFormat;
  },
  isSameDate: function (startDate, dueDate) {
    if (!startDate || !dueDate) {
      return false;
    }
    const startDateFormat = `${startDate.getDate()}/${
      startDate.getMonth() + 1
    }/${startDate.getFullYear()}`;
    const duedateFormat = `${dueDate.getDate()}/${
      dueDate.getMonth() + 1
    }/${dueDate.getFullYear()}`;
    return duedateFormat.toString() === startDateFormat.toString();
  },
  setupStartDatePicker: function () {
    app.startFlatpickr = flatpickr("#start-date__picker", {
      enableTime: true,
      minDate: "today",
      maxDate: app.checkStartDate.checkMaxDate || null,
      maxTime: app.checkStartDate.checkMaxTime || null,
      dateFormat: "Y/m/d H:i:S",
      time_24hr: true,
      enableSeconds: true,
      onChange: function (selectedDates, dateStr, instance) {
        const currentSelected = selectedDates[0];
        if (!currentSelected) return;
        const formatTime = `${currentSelected.getHours()}:${currentSelected.getMinutes()}:${currentSelected.getSeconds()}`;
        app.startTime = formatTime;
        app.startDate = instance.input.value;
        app.startSelectedDate = currentSelected;

        //neu ngay dc chon bang ngay hien tai
        if (app.isSameDateWithCurrDate(currentSelected)) {
          this.set("minTime", app.getCurrTime());
        } else {
          this.set("minTime", null);
        }
        //set maxtime for start date
        const isSameDateSelected = app.isSameDate(
          app.dueDateSelected,
          selectedDates[0]
        );

        const maxTime = isSameDateSelected ? app.dueTime : null;
        this.set("maxTime", maxTime);
      },
      onOpen: function (selectedDates, dateStr, instance) {
        this.set("maxDate", app.checkStartDate.checkMaxDate || null);
      },
    });
  },

  setupDueDatePicker: function () {
    app.dueFlatpickr = flatpickr("#due-date__picker", {
      enableTime: true,
      dateFormat: "Y/m/d H:i:S",
      time_24hr: true,
      minDate: app.startDate,
      enableSeconds: true,
      onChange: function (selectedDates, dateStr, instance) {
        if (!selectedDates.length) return;
        app.dueDate = instance.input.value;

        //
        //get max time for startDate
        const currentSelectedDuedate = selectedDates[0];
        app.dueDateSelected = currentSelectedDuedate;
        if (!currentSelectedDuedate) return;
        const formatTime = `${currentSelectedDuedate.getHours()}:${currentSelectedDuedate.getMinutes()}:${currentSelectedDuedate.getSeconds()}`;
        app.dueTime = formatTime;
        //set start time for due date
        const isSameDateSelected = app.isSameDate(
          app.startSelectedDate,
          selectedDates[0]
        );
        console.log(isSameDateSelected);
        const checkMintime = isSameDateSelected ? app.startTime : null;
        this.set("minTime", checkMintime);
        //
        const checkMaxDate = `${selectedDates[0].getFullYear()}/${
          selectedDates[0].getMonth() + 1
        }/${selectedDates[0].getDate()}`;
        const checkMaxTime = `${selectedDates[0].getHours()}:${
          selectedDates[0].getMinutes() - 1
        }:${selectedDates[0].getSeconds()}`;
        app.checkStartDate.checkMaxDate = checkMaxDate;
        app.checkStartDate.checkMaxTime = checkMaxTime;
      },
      onOpen: function (selectedDates, dateStr, instance) {
        const check = app.startDate || "today";
        console.log(app.startDate);
        this.set("minDate", check || null);
        this.set("minTime", app.getCurrTime());
      },
    });
  },
  renderToastMsg: function (newArrTodo = []) {
    newArrTodo.forEach((todo, index) => {
      const notifiItem = document.createElement("div");
      notifiItem.className = "toast warning";
      notifiItem.style = `--delay: ${index / 2}s`;
      notifiItem.innerHTML = `
          <div
            class="w-[35px] bg-[#ffcb33]   shrink-0 h-[35px] flex justify-center items-center rounded-full"
          >
            <i class="bi bi-info text-lg text-white icon-warning"></i>
          </div>
          <div class="content w-full flex flex-col gap-y-1">
            <div class="title text-2xl">warning</div>
            <div class="flex justify-between w-full items-center">
              <span class="desc-todo">${todo.text}</span>
              <span>Due date: ${todo.dueDate}</span>
            </div>
          </div>
          <i
            class="fa-solid fa-xmark cursor-pointer absolute top-2 right-2 text-base toast-delete-btn"
          ></i>

          <div class="toast-progress"></div>
      `;

      notificationsElm.appendChild(notifiItem);

      const progress = notifiItem.querySelector(".toast-progress");
      const deleteBtn = notifiItem.querySelector(".toast-delete-btn");

      progress.onanimationend = (e) => {
        e.stopPropagation();
        notifiItem.classList.add("hide");

        notifiItem.onanimationend = (e) => e.currentTarget.remove();
      };

      deleteBtn.onclick = () => {
        notifiItem.classList.add("hide");
        notifiItem.onanimationend = (e) => e.currentTarget.remove();
      };
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
    addNewTodoBtn.onclick = function (event) {
      const newTodoItem = {
        id: crypto.randomUUID(),
        status: _this.STATUS.TODO,
        text: inputElm.value,
        startDate: _this.startDate,
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
    this.starteDate = "";
    this.dueDate = "";
    app.startFlatpickr.clear();
    app.startFlatpickr.set("maxDate", null);
    app.dueFlatpickr.clear();
    app.checkStartDate.checkMaxDate = "";
    app.checkStartDate.checkMaxTime = "";
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
    if (!app.startDate) {
      return true;
    }
    if (!app.dueDate) {
      return true;
    }
    return false;
  },

  checkDueDateTodo: function () {
    app.intervalId = setInterval(() => {
      let newArr = [];
      const todosDuedate = this.todos.filter(
        (todoItem) => todoItem.status !== "Done"
      );
      todosDuedate.forEach((todoItem, index) => {
        if (!todoItem.checked || app.firstPageload) {
          const currentDateTime = Date.now();
          const dueDate = new Date(todoItem.dueDate);
          if (index === todosDuedate.length - 1) app.firstPageload = false;
          if (currentDateTime >= dueDate.getTime()) {
            todoItem.checked = true;
            newArr.push(todoItem);
            // app.syncTodo(app.todos);
          }
        }
      });

      app.renderToastMsg(newArr);
    }, 1000);
  },
  updateTodo: function (todoId) {
    updateBtn.onclick = function () {
      const updateTodos = app.todos.map((todo) => {
        if (todo.id === todoId) {
          const currTime = Date.now();
          const duedateTodo = new Date(todo.dueDate);
          return {
            ...todo,
            text: inputElm.value,
            startDate: app.startDate,
            dueDate: app.dueDate,
            checked: currTime >= duedateTodo.getTime() ? true : false,
          };
        }
        return todo;
      });
      if (!app.checkEmptyValue()) {
        app.syncTodo(updateTodos);
        app.resetValue();
        app.isEditing = false;
        updateBtn.style.display = "none";
        addNewTodoBtn.style.display = "flex";
      } else {
        Swal.fire({
          text: "Please complete all information",
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    };
  },
  handleEditTodo: function (todoId) {
    const existTodo = this.todos.find((todo) => todo.id === todoId);
    if (existTodo) {
      this.isEditing = true;
      inputElm.value = existTodo.text;
      app.startFlatpickr.setDate(existTodo.startDate);
      // startDateElm.value = existTodo.startDate;
      // dueDateElm.value = existTodo.dueDate;
      app.dueFlatpickr.setDate(existTodo.dueDate);
      this.startDate = existTodo.startDate;
      this.dueDate = existTodo.dueDate;
      //
      const newDate = new Date(existTodo.dueDate);
      const newDuedate = `${newDate.getFullYear()}/${
        newDate.getMonth() + 1
      }/${newDate.getDate()}`;
      app.checkStartDate.checkMaxDate = newDuedate;
      //
      this.updateTodo(todoId);
      addNewTodoBtn.style.display = "none";
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
          const currTime = Date.now();
          const duedateTodo = new Date(todo.dueDate);
          const checkDuedate = currTime >= duedateTodo.getTime();
          return `
          <div data-id="${todo.id}" draggable="true"
                  class="todo-item h-[150px] frink-0  overflow-hidden flex flex-col select-none shadow-lg"
                >
                  <div class="flex items-center justify-between w-full">
                    <div
                      class="todo-item__content flex-1 flex gap-x-3 items-center items-center"
                    >
                      <div class="flex justify-center shrink-0 w-7 checkbox-box h-7 rounded-full items-center">
                        <i
                          class="bi bi-check-lg checkbox-status text-base"
                        ></i>
                      </div>
                      <div class="task-content  todo__content-name whitespace-wrap text-base font-medium ${
                        checkDuedate ? "todo-name--duedate" : ""
                      }">
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
                    <div class="flex gap-x-1 items-center ${
                      checkDuedate ? "is-duedate" : ""
                    }">
                      <span class="text-inherit">end:</span>
                      <span class="italic pt-1 text-inherit text-sm  font-normal "
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
    this.handleDarkMode();
  },
};

window.document.addEventListener("DOMContentLoaded", app.start());
