const addButton = document.querySelector("#addButton");
const deleteButton = document.querySelector("#deleteButton");
const editButton = document.querySelector("#editButton");
const searchButton = document.querySelector("#searchButton");
const taskName = document.querySelector("#taskNameInput");
const taskDate = document.querySelector("#taskDateInput");
const tasksList = document.querySelector("#tasksList");
const selectTaskForm = document.querySelector("#selectTask");
const alertMessage = document.querySelector("#alert");
const form = document.querySelector("#editTask");
const pattern = /(\d{4})\-(\d{2})\-(\d{2})/; // do formatowania daty po pobraniu z LocalStorage w postaci stringa

searchButton.addEventListener("click", (e) => {
  e.preventDefault();
  highlightSearch();
});

addButton.addEventListener("click", (e) => {
  e.preventDefault();
  if (taskName.value.length > 2 && taskName.value.length < 256) {
    if (
      taskDate.value &&
      new Date(taskDate.value).setHours(new Date().getHours() + 1) >= new Date()
    ) {
      const task = {
        name: taskName.value,
        date: new Date(taskDate.value),
        active: false,
      };
      taskName.value = "";
      taskDate.value = "";
      removeAlertMessage();
      saveToLocalStorage(task);
      showTasks();
    } else setAlertMessage("Data nie może być z przeszłości");
  } else setAlertMessage("Nazwa musi składać się z 3-255 znaków");
});

deleteButton.addEventListener("click", (e) => {
  e.preventDefault();
  let allTasks = JSON.parse(localStorage.getItem("allTasks"));
  allTasks = allTasks === null ? [] : allTasks;
  for (var i = 0; i < allTasks.length; i++) {
    if (allTasks[i].active == true) {
      allTasks.splice(i, 1);
      i--;
    }
  }
  localStorage.setItem("allTasks", JSON.stringify(allTasks));
  showTasks();
});

editButton.addEventListener("click", (e) => {
  e.preventDefault();
  removeAlertMessage();
  let allTasks = JSON.parse(localStorage.getItem("allTasks"));
  allTasks = allTasks === null ? [] : allTasks;
  let taskID = document.querySelector(".active");
  if (taskID != null) {
    taskID = taskID.value;
    taskName.value = allTasks[taskID].name;
    taskDate.value = new Date(allTasks[taskID].date)
      .toISOString()
      .substr(0, 10);
    taskName.focus();
    if (addButton.parentNode == form) showEditView();
  } else setAlertMessage("Nie zostało wybrane zadanie do edycji");
});

showTasks = () => {
  alertMessage.classList.remove("alertMessage");
  alertMessage.innerHTML = "";
  let allTasks = JSON.parse(localStorage.getItem("allTasks"));
  allTasks = allTasks === null ? [] : allTasks;
  tasksList.innerHTML = "";
  if (allTasks) {
    allTasks.sort((a, b) => new Date(a.date) - new Date(b.date));

    for (var i = 0; i < allTasks.length; i++) {
      let task = allTasks[i];
      task.date = new Date(task.date);
      tasksList.innerHTML +=
        "<li id = task" +
        i +
        " value=" +
        i +
        " onClick=changeStatus(" +
        i +
        ")> " +
        task.date.toISOString().substr(0, 10).replace(pattern, "$3.$2.$1") +
        " | " +
        task.name +
        "</li>";
      selectTaskForm.appendChild(tasksList);
      statusCheck(task, i);
    }
  }
  localStorage.setItem("allTasks", JSON.stringify(allTasks));
};

handleSaveChanges = () => {
  let allTasks = JSON.parse(localStorage.getItem("allTasks"));
  activeTasks = allTasks.filter((task) => task.active === true);
  if (activeTasks.length > 1) {
    setAlertMessage("Możesz edytować tylko jedno zadanie");
  } else {
    if (taskName.value.length > 2 && taskName.value.length < 256) {
      if (
        taskDate.value &&
        new Date(taskDate.value).setHours(new Date().getHours() + 1) >=
          new Date()
      ) {
        activeTasks[0].name = taskName.value;
        activeTasks[0].date = new Date(taskDate.value)
          .toISOString()
          .substr(0, 10);
        localStorage.setItem("allTasks", JSON.stringify(allTasks));
        setHomeScreen();
      } else setAlertMessage("Data nie może być z przeszłości");
    } else setAlertMessage("Nazwa musi składać się z 3-255 znaków");
  }
};

setHomeScreen = () => {
  form.removeChild(saveChangesButton);
  form.removeChild(cancelChangesButton);
  form.appendChild(addButton);
  taskName.value = "";
  taskDate.value = "";
  let allTasks = JSON.parse(localStorage.getItem("allTasks"));
  for (task of allTasks) {
    task.active = false;
  }
  localStorage.setItem("allTasks", JSON.stringify(allTasks));
  removeAlertMessage();
  showTasks();
};

changeStatus = (id) => {
  let allTasks = JSON.parse(localStorage.getItem("allTasks"));
  allTasks[id].active = !allTasks[id].active;
  localStorage.setItem("allTasks", JSON.stringify(allTasks));
  showTasks();
};

saveToLocalStorage = (task) => {
  let allTasks = JSON.parse(localStorage.getItem("allTasks"));
  allTasks = allTasks === null ? [] : allTasks;
  allTasks[allTasks.length] = task;
  localStorage.setItem("allTasks", JSON.stringify(allTasks));
};

highlightSearch = () => {
  const text = document.querySelector("#searchField").value.toLowerCase();
  if (text) {
    if (
      text == "li" ||
      text == "<li" ||
      text == "<li " ||
      text == "</li>" ||
      text == "</" ||
      text == "</l" ||
      text == "</li" ||
      text == "<" ||
      text == ">"
    ) {
      setAlertMessage("Nie odnaleziono frazy");
    } else {
      removeAlertMessage();
      const query = new RegExp("(\\b" + text + ")", "gim");
      const e = document.querySelector("#tasksList").innerHTML;
      const enew = e.replace(/(<span>|<\/span>)/gim, "");
      const newe = enew.replace(query, "<span>$1</span>");
      document.querySelector("#tasksList").innerHTML = newe;
      if (e === newe) setAlertMessage("Brak nowych dopasowań");
    }
  } else setAlertMessage("Wprowadź szukaną frazę");
};

showEditView = () => {
  form.removeChild(addButton);
  saveChangesButton = document.createElement("button");
  saveChangesButton.setAttribute("onClick", "handleSaveChanges()");
  saveChangesButton.textContent = "Zapisz zmiany";
  cancelChangesButton = document.createElement("button");
  cancelChangesButton.setAttribute("onClick", "setHomeScreen()");
  cancelChangesButton.textContent = "Anuluj";
  form.appendChild(saveChangesButton);
  form.appendChild(cancelChangesButton);
};

statusCheck = (task, id) => {
  let currentTask = document.querySelector("#task" + id);
  if (currentTask) {
    if (task.active == true) {
      currentTask.classList.add("active");
    } else {
      currentTask.classList.remove("active");
    }
  }
};

setAlertMessage = (message) => {
  alertMessage.innerHTML = message;
  alertMessage.classList.add("alertMessage");
};

removeAlertMessage = () => {
  alertMessage.innerHTML = "";
  alertMessage.classList.remove("alertMessage");
};

showTasks();
