const clickUpTurboDebugMode = true;
const messageConstants = {
  SET_USING: 'set_using',
  SET_MOVE: 'set_move',
  SET_IMPORTANT: 'set_important',
  SET_URGENT: 'set_urgent',
  SET_PRIORITY: 'set_priority',
  INIT: 'init'
}

var cuTaskRows = [];
let currentFocused = 0;
let toggleMarker;
let shiftPressed = false;

var isUsePlugin = true;
var moveDownkey = 'j';
var moveUpKey = 'k';
var selectTask = 'l';
var setImportantMust = '1';
var setImportantShould = '2';
var setImportantWant = '3';
var setUrgentVery = '7';
var setUrgentSemi = '8';
var setUrgentNot = '9';
var setPriorityVery = 'u';
var setPrioritySemi = 'o';
var setPriorityNot = 'p';

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


  /**
  * Wait all functions until DOM is loaded
  */

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

  /**
  * Refresh all events
  */

  function refreshAll() {
    refreshTasks()
    document.removeEventListener("keydown", onKeyDown);
    document.addEventListener("keydown", onKeyDown);
    cuTaskRows[currentFocused].classList.add("active-list-item");
  }

  function refreshTasks() {
    cuTaskRows = document.querySelectorAll("cu-task-row");
    cuTaskRows.forEach((element, index) => {
        element.setAttribute("order", index);
    });
  }

  /**
  * Handle all key events
  * @param {keypress event} event
  */

  function onKeyDown(event) {
    testing("Key Down Pressed==");
    if(!isUsePlugin) return;
    handleEscapeKey(event);
    handleNavigationKeys(event);
    handleImportantKey(event);
    handleUrgentKey(event);
  }

  /**
  * Unselect task
  * @param {keypress event} event
  */

  function handleEscapeKey(event) {
    if (event.code === "Escape") {
      toggleMarker = null;
    }
  }

  /**
  * Handle key events for move up/down/select
  * @param {keypress event} event
  */

  function handleNavigationKeys(event) {
    if (event.key === moveDownkey || event.key === moveUpKey) {
      navigateTasks(event.key === moveUpKey);
    }
    if (event.key === selectTask) {
      const currentRow = cuTaskRows[currentFocused];
      if (toggleMarker && !shiftPressed) {
        // toggleMarker.click();
      }
      toggleMarker = $(currentRow).find(".cu-task-row-toggle__marker");
      toggleMarker.click();
    }
  }

  /**
  * Update state of focused task from move up/down
  */

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

  /**
  * Update state of focused task
  */

  function updateFocusedTask() {
    console.log("Current Focused:", cuTaskRows[currentFocused]);
    cuTaskRows.forEach((el) => el.classList.remove("active-list-item"));

    cuTaskRows[currentFocused].classList.add("active-list-item");

    getSelectedTask().focus();
    getSelectedTask().scrollIntoView({ behavior: 'smooth', block: 'center' });

    // $(".cu-dt-controls").hide();
  }

  /**
  * Get index from option name
  * @param {HTML NODE} node
  * @param {String} field
  */

  function getIdxFromCustomName(node, field) {
    for(let i = 0; i < node.children.length; i ++) {
      if(node.children[i].children[1].innerHTML.toLowerCase().indexOf(field)>-1) {
        return i;
      }
    }
    return null
  }

  /**
  * Handle key events for important option
  * @param {keypress event} event
  */

  function handleImportantKey(event) {
    if ((event.key == setImportantMust || event.key == setImportantShould || event.key == setImportantWant) && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {
      document.getElementsByClassName('cu-dt-controls__item_cf')[0].click()   //custom menu click
      setTimeout(() => {
        let columnList = document.getElementsByClassName('cu-dropdown__menu_left')[0].children[0].getElementsByClassName('columns-list__body')[0]
        let order = getIdxFromCustomName(columnList, 'important')
        if(order) {
          columnList.children[order].click()
  
          setTimeout(() => {
            document.getElementsByClassName('cu-dt-controls__cf-body')[0].children[0].getElementsByClassName('cu-custom-fields__type-dropdown')[0].click()
            setTimeout(() => {
              let num = event.key == setImportantMust? 1 : (event.key == setImportantShould? 2: 3)
              document.getElementsByClassName('cu-select__dropdown-menu-options')[0].getElementsByTagName('cu-select-option')[num].children[0].children[0].click()
              document.getElementsByClassName('cu-select__dropdown-menu-options')[0].getElementsByTagName('cu-select-option')[num].children[0].children[0].click()
              setTimeout(() => {
                document.querySelector("[data-test=dashboard-table-toolbar-save]").click()
              }, 200);
            }, 200);
          }, 200);
        }
      }, 200);
    }
  }

  /**
  * Handle key events for urgent option
  * @param {keypress event} event
  */

  function handleUrgentKey(event) {
    if ((event.key == setUrgentVery || event.key == setUrgentSemi || event.key == setUrgentNot) && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {
      document.getElementsByClassName('cu-dt-controls__item_cf')[0].click()   //custom menu click
      setTimeout(() => {
        let columnList = document.getElementsByClassName('cu-dropdown__menu_left')[0].children[0].getElementsByClassName('columns-list__body')[0]
        let order = getIdxFromCustomName(columnList, 'urgent')
        if(order) {
          columnList.children[order].click()
  
          setTimeout(() => {
            document.getElementsByClassName('cu-dt-controls__cf-body')[0].children[0].getElementsByClassName('cu-custom-fields__type-dropdown')[0].click()
            setTimeout(() => {
              let num = event.key == setUrgentVery? 1: (event.key == setUrgentSemi? 2: 3)
              document.getElementsByClassName('cu-select__dropdown-menu-options')[0].getElementsByTagName('cu-select-option')[num].children[0].children[0].click()
              document.getElementsByClassName('cu-select__dropdown-menu-options')[0].getElementsByTagName('cu-select-option')[num].children[0].children[0].click()
              setTimeout(() => {
                document.querySelector("[data-test=dashboard-table-toolbar-save]").click()
              }, 200);
            }, 200);
          }, 200);
        }
      }, 200);
    }
  }

  /**
  * Handle key events for priority option
  * @param {keypress event} event
  */

  function handlePriorityKey(event) {
    if ((event.key == setPriorityVery || event.key == setPrioritySemi || event.key == setPriorityNot) && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {
      document.getElementsByClassName('cu-dt-controls__item_cf')[0].click()   //custom menu click
      setTimeout(() => {
        let columnList = document.getElementsByClassName('cu-dropdown__menu_left')[0].children[0].getElementsByClassName('columns-list__body')[0]
        let order = getIdxFromCustomName(columnList, 'priority')
        if(order) {
          columnList.children[order].click()
  
          setTimeout(() => {
            document.getElementsByClassName('cu-dt-controls__cf-body')[0].children[0].getElementsByClassName('cu-custom-fields__type-dropdown')[0].click()
            setTimeout(() => {
              let num = event.key == setUrgentVery? 1: (event.key == setUrgentSemi? 2: 3)
              document.getElementsByClassName('cu-select__dropdown-menu-options')[0].getElementsByTagName('cu-select-option')[num].children[0].children[0].click()
              document.getElementsByClassName('cu-select__dropdown-menu-options')[0].getElementsByTagName('cu-select-option')[num].children[0].children[0].click()
              setTimeout(() => {
                document.querySelector("[data-test=dashboard-table-toolbar-save]").click()
              }, 200);
            }, 200);
          }, 200);
        }
      }, 200);
    }
  }

});

function testing(logString) {
  if (clickUpTurboDebugMode) {
    console.log(logString);
  }
}

const logger = {
  log: (...params) => {
    console.log(...params);
  },
  error: (...params) => {
    console.error(...params);
  },
  info: (...params) => {
    console.info(...params);
  }
}

/**
* Add Event listener from Popup
*/

!(() => {
  isUsePlugin = localStorage.getItem('clickup-useplugin')? true : false;
  moveDownkey = 'j';
  moveUpKey = 'k';
  selectTask = 'l';
  setImportantMust = '1';
  setImportantShould = '2';
  setImportantWant = '3';
  setUrgentVery = '7';
  setUrgentSemi = '8';
  setUrgentNot = '9';

  chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
      const type = request?.type;
      logger.info('request received', request)
      if (type === messageConstants.SET_USING) {
        try {
          isUsePlugin = request.value
          localStorage.setItem('clickup-useplugin', isUsePlugin)
        } catch (exception) {
          logger.error('Failed initialization', exception);
        }
      } else if(type === messageConstants.SET_MOVE){
        try {
          moveDownkey = request.movedown
          moveUpKey = request.moveup
          selectTask = request.select
          localStorage.setItem('clickup-move', JSON.stringify({moveDown: moveDownkey, moveUp: moveUpKey, selectTask: selectTask}))
        } catch (exception) {
          logger.error('Failed initialization', exception);
        } 
      } else if(type === messageConstants.SET_IMPORTANT){
        try {
          setImportantMust = request.mustdo
          setImportantShould = request.shoulddo
          setImportantWant = request.wantdo
          localStorage.setItem('clickup-important', JSON.stringify({mustdo: setImportantMust, shoulddo: setImportantShould, wantdo: setImportantWant}))
        } catch (exception) {
          logger.error('Failed initialization', exception);
        } 
      } else if(type === messageConstants.SET_URGENT){
        try {
          setUrgentVery = request.very
          setUrgentSemi = request.semi
          setUrgentNot = request.not
          localStorage.setItem('clickup-urgent', JSON.stringify({very: setUrgentVery, semi: setUrgentSemi, not: setUrgentNot}))
        } catch (exception) {
          logger.error('Failed initialization', exception);
        } 
      } else if(type === messageConstants.SET_PRIORITY){
        try {
          setPriorityVery = request.very
          setPrioritySemi = request.semi
          setPriorityNot = request.not
          localStorage.setItem('clickup-priority', JSON.stringify({very: setPriorityVery, semi: setPrioritySemi, not: setPriorityNot}))
        } catch (exception) {
          logger.error('Failed initialization', exception);
        } 
      }
    }
  );

  chrome.runtime.sendMessage({type: messageConstants.INIT}, function(response) {
    // console.log(response);
  });
})();
