const clickUpTurboDebugMode = true;


var cuTaskRows = [];
let currentFocused = 0;
let toggleMarker;
let shiftPressed = false;



function getSelectedTask() {
  return cuTaskRows[currentFocused];
}

var attempts = 0;
var timeout;

var domLoaded = false;

const style = document.createElement("style");

const turbo_style = `

.active-list-item {
  background-color: #e9e9e9 !important;
}

.active-list-item .cu-task-row-main__link-text-inner {

}

.dark-theme .cu-dt-controls {
	border-color: #0d1520;
	background: #0d1520 !important;
	opacity: 0;
}

.dark-theme .cu-dt-controls:hover {
  opacity: 1;
}


.dark-theme .cu-dashboard-table__scroll {
	background: #0d1520 !important;
}

body.dark-theme {
  --cu-background-main: #0d1520 !important;
}

.dark-theme .cu-task-list-header__item_main {
	background: #0d1520 !important;
	color: transparent;
}

.dark-theme .cu-task-row__main {
	background-color: #0a0c1b5c !important;
}

.dark-theme .cu-task-list-header {
	background: #0a0c1b5c !important;
	color: transparent;
}

.cu-task-row-assignee, .cu-task-row__priority, .cu-task-row-recurring-date-picker {
	background: transparent !important;
}

.cu-task-row__container {
	background: #0a0c1b5c !important;
}



`;

document.head.appendChild(style);
style.innerHTML = turbo_style;







$(document).ready( function(){
  timeout = setTimeout(waitingForDOM, 3000);



  function waitingForDOM() {

    testing("Start waiting for DOM");

    cuTaskRows = document.querySelectorAll("cu-task-row");
    attempts++;
      // If cutTaskRows is empty, then wait 500ms and try again
      // Make only 20 attempts

    if (cuTaskRows.length === 0) {
      testing("No task found");

      if (attempts < 20) {
        testing("Waiting for DOM — Attempt " + attempts + "");
        timeout = setTimeout(waitingForDOM, 1500);
      }
      else {
        testing("Stopping");
        clearTimeout(timeout);
        return;
      }
    }
    else {
      testing("DOM Loaded After " + attempts + " attempts");
      testing("Number of Rows = " + cuTaskRows.length);
      clearTimeout(timeout);
      domLoadedFunction();
    }
  }



  function domLoadedFunction() {
    if (domLoaded) {
      testing("Prevented multiple loading");
      return;
    }
    domLoaded = true;
    let observerWorking = false;

    const observer = new MutationObserver(() => {
      if (observerWorking) {
        return;
      }

      observerWorking = true;

      // Add 500ms delay
      setTimeout(function() {
        testing("Invoked observer function");
        initializeClickTurbo();
        observerWorking = false;
      }, 1500);
    });

    initializeClickTurbo();
    const targetNode = document.querySelector("cu-task-row");
    const config = {
        childList: true,
        subtree: true
    };
    observer.observe(targetNode, config);
  }




  function initializeClickTurbo() {
    testing("Initialize Keyboard Shortcuts");
    refreshAll();
  }


  function refreshAll() {
    refreshTasks()
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("keydown", onKeyDown);
    cuTaskRows[currentFocused].classList.add("active-list-item");
  }

  function refreshTasks() {
    cuTaskRows = document.querySelectorAll("cu-task-row");
    cuTaskRows.forEach((element, index) => {
        element.setAttribute("order", index);
    });
  }




  function onKeyUp(event) {
    if (event.code == "Shift") {
      testing("Shift Released");
      shiftPressed = false;
    }
  }



  function onKeyDown(event) {
    testing("Key Down Pressed==");

    handleEscapeKey(event);
    // handleShiftKey(event);
    handleNavigationKeys(event);
    // handleToggleTaskCompletion(event);
    handleEnterKey(event);
    // handleNewTaskKey(event);
    handleImportantKey(event);
    handleUrgentKey(event);
  }

  function handleEscapeKey(event) {
    if (event.code === "Escape") {
      toggleMarker = null;
    }
  }

  function handleShiftKey(event) {
    if (event.code == "Shift") {
      testing("Shift is held");
      shiftPressed = true;
    }
  }

  function handleNavigationKeys(event) {
    if (event.code === "KeyK" || event.code === "KeyJ") {
      navigateTasks(event.code === "KeyK");
    }
    if (event.code === "KeyL") {
      const currentRow = cuTaskRows[currentFocused];
      if (toggleMarker && !shiftPressed) {
        toggleMarker.click();
      }
      toggleMarker = $(currentRow).find(".cu-task-row-toggle__marker");
      toggleMarker.click();
    }
  }

  function navigateTasks(up) {
    refreshTasks();

    currentFocused = up
      ? currentFocused === 0
        ? cuTaskRows.length - 1
        : currentFocused - 1
      : currentFocused === cuTaskRows.length - 1
      ? 0
      : currentFocused + 1;

    updateFocusedTask();
  }

  function updateFocusedTask() {
    console.log("Current Focused:", cuTaskRows[currentFocused]);

    

    cuTaskRows.forEach((el) => el.classList.remove("active-list-item"));

    cuTaskRows[currentFocused].classList.add("active-list-item");

    getSelectedTask().focus();
    getSelectedTask().scrollIntoView({ behavior: 'smooth', block: 'center' });

    $(".cu-dt-controls").hide();

    // if (toggleMarker && !shiftPressed) {
    //   toggleMarker.click();
    // }
    // toggleMarker = $(currentRow).find(".cu-task-row-toggle__marker");
    // toggleMarker.click();
  }

  function handleToggleTaskCompletion(event) {
    if (event.code === "KeyX") {
      if (cuTaskRows[currentFocused]) {
        const cuTaskRowStatus = cuTaskRows[currentFocused].querySelector(".cu-task-row-status__done-btn");
        cuTaskRowStatus.click();
      }
    }
  }

  function handleEnterKey(event) {
    if (event.key == "Enter" && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
      setTimeout(function() {
        refreshTaskRows();
      }, 500);
    }
  }

  function handleImportantKey(event) {
    if (event.keyCode>=49 && event.keyCode<=51 && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {
      // updateFocusedTask()
      document.getElementsByClassName('cu-dt-controls__item_cf')[0].click()   //custom menu click
      setTimeout(() => {
        document.getElementsByClassName('cu-dropdown__menu_left')[0].children[0].getElementsByClassName('columns-list__body')[0].children[2].click()
        setTimeout(() => {
          document.getElementsByClassName('cu-dt-controls__cf-body')[0].children[0].getElementsByClassName('cu-custom-fields__type-dropdown')[0].click()
          setTimeout(() => {
            let num = Number(event.key)
            document.getElementsByClassName('cu-select__dropdown-menu-options')[0].getElementsByTagName('cu-select-option')[num].children[0].children[0].click()
            document.getElementsByClassName('cu-select__dropdown-menu-options')[0].getElementsByTagName('cu-select-option')[num].children[0].children[0].click()
            setTimeout(() => {
              document.querySelector("[data-test=dashboard-table-toolbar-save]").click()
            }, 200);
          }, 200);
        }, 200);
      }, 200);
    }
  }

  function handleUrgentKey(event) {
    if ((event.key == '7' || event.key == '8' || event.key == '9') && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {
      // updateFocusedTask()
      document.getElementsByClassName('cu-dt-controls__item_cf')[0].click()   //custom menu click
      setTimeout(() => {
        document.getElementsByClassName('cu-dropdown__menu_left')[0].children[0].getElementsByClassName('columns-list__body')[0].children[1].click()
        setTimeout(() => {
          document.getElementsByClassName('cu-dt-controls__cf-body')[0].children[0].getElementsByClassName('cu-custom-fields__type-dropdown')[0].click()
          setTimeout(() => {
            let num = event.key == '7'? 1: (event.key == '8'? 2: 3)
            console.log('correct num', num)
            document.getElementsByClassName('cu-select__dropdown-menu-options')[0].getElementsByTagName('cu-select-option')[num].children[0].children[0].click()
            document.getElementsByClassName('cu-select__dropdown-menu-options')[0].getElementsByTagName('cu-select-option')[num].children[0].children[0].click()
            setTimeout(() => {
              document.querySelector("[data-test=dashboard-table-toolbar-save]").click()
            }, 200);
          }, 200);
        }, 200);
      }, 200);
    }
  }

  function handleNewTaskKey(event) {
    if (event.key === "n" && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {

      testing("Key N Pressed");

      if(cuTaskRows[currentFocused] != null && cuTaskRows[currentFocused] != undefined) {
        event.preventDefault();
        event.stopPropagation();
        createNewTask();
      }
    }
  }

  function createNewTask() {
    const $selectedTask = $(getSelectedTask());
    const level = $selectedTask.data("level");

    if (level > 1) {
      createSubtask($selectedTask, level);
    } else {
      createMainTask($selectedTask);
    }
  }

  function createSubtask($selectedTask, level) {
    const mainTaskDiv = $selectedTask.closest(`.cu-task-row[data-level=${level - 1}]`);
    const createSubtaskButton = mainTaskDiv.find('.cu-subtasks-by-status-popup__count-add-btn');
    $(createSubtaskButton).click();
  }

  function createMainTask($selectedTask) {
    const taskListDiv = $selectedTask.parents(".cu-task-list");
    let newTaskButton = taskListDiv.find("cu-task-list-footer").find("button.cu-task-list-footer__add");
    testing("New Task Button");
    testing(newTaskButton);
    $(newTaskButton).click();
  }

}); // /jquery



// Helpers

function testing(logString) {
  if (clickUpTurboDebugMode) {
    console.log(logString);
  }
}