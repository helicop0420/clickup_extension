const clickUpTurboDebugMode = true;
const messageConstants = {
  SET_USING: 'set_using',
  SET_MOVE: 'set_move',
  SET_IMPORTANT: 'set_important',
  SET_URGENT: 'set_urgent',
  SET_PRIORITY: 'set_priority',
  SET_DUEDATE: 'set_date',
  SET_WHEN: 'set_when',
  SET_NEW: 'set_new',
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
var setImportantEmpty = '4';
var setUrgentVery = '7';
var setUrgentSemi = '8';
var setUrgentNot = '9';
var setUrgentEmpty = '0';
var setPriorityVery = 'a';
var setPrioritySemi = 's';
var setPriorityNormal = 'c';
var setPriorityNot = 'f';
var setPriorityEmpty = 'g';
var openDateKey = 'o';
var closeDateKey = 'p';
var thisWeek = 'q';
var nextWeek = 'w';
var thisMonth = 'e';
var nextMonth = 'r';
var longTerm = 't';
var emptyWhen = 'y';
var setProgressKey = '5'


function getSelectedTask() {
  return cuTaskRows[currentFocused];
}

var attempts = 0;
var timeout;

var domLoaded = false;

const style = document.createElement("style");
const activeColor = '#e9e9e9'
const turbo_style = `

.active-list-item {
  background-color: ${activeColor};
}
.active-list-item .cu-task-row__toggle-container {
  background-color: ${activeColor} !important;
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
    if(!isUsePlugin) return;
    if(document.getElementsByTagName('cu-create-task-draft').length > 0) return;  //create ticket modal
    if(document.getElementsByTagName('cu-manager-view-task').length > 0 || document.getElementsByTagName('cu-task-view').length > 0) {
      handleProgressKey(event);
      handleWhenViewKey(event);
      handleImportantViewKey(event);
      handleUrgentViewKey(event);
      // handlePriorityViewKey(event);
    } else {
      handleEscapeKey(event);
      handleNavigationKeys(event);
      handleImportantKey(event);
      handleUrgentKey(event);
      handlePriorityKey(event);
      openDueDate(event);
      closeDueDate(event);
      handleWhenKey(event);
    }    
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
  * Get index from correct status
  * @param {HTML NODE} node
  * @param {String} field
  */

  function getIdxFromViewStatus(node, field) {
    for(let i = 0; i < node.length; i ++) {
      if(node[i].ariaLabel.toLowerCase().indexOf(field)>-1) {
        return i;
      }
    }
    return null
  }

  /**
  * Get index from correct status
  * @param {HTML NODE} node
  * @param {String} field
  */

  function getIdxFromViewCustom(node, field) {
    for(let i = 0; i < node.length; i ++) {
      if(node[i].innerText.toLowerCase().indexOf(field)>-1) {
        return i;
      }
    }
    return null
  }

  /**
  * Handle key events for when option
  * @param {keypress event} event
  */

  function handleWhenKey(event) {
    if ((event.key == thisWeek || event.key == nextWeek || event.key == thisMonth || event.key == nextMonth || event.key == longTerm || event.key == emptyWhen) && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {
      document.getElementsByClassName('cu-dt-controls__item_cf')[0].click()   //custom menu click
      setTimeout(() => {
        let columnList = document.getElementsByClassName('cu-dropdown__menu_left')[0].children[0].getElementsByClassName('columns-list__body')[0]
        let order = getIdxFromCustomName(columnList, 'when')
        if(order != null) {
          columnList.children[order].click()
  
          setTimeout(() => {
            document.getElementsByClassName('cu-dt-controls__cf-body')[0].children[0].getElementsByClassName('cu-custom-fields__type-dropdown')[0].click()
            setTimeout(() => {
              let num = 0;
              switch (event.key) {
                case thisWeek:
                  num = 1
                  break;
                case nextWeek:
                  num = 2
                  break
                case thisMonth:
                  num = 3
                  break
                case nextMonth:
                  num = 4
                  break
                case longTerm:
                  num = 5
                  break
                case emptyWhen:
                  num = 0
                  break
              }
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
  * Handle key events for when option in openning task
  * @param {keypress event} event
  */

  function handleWhenViewKey(event) {
    if ((event.key == thisWeek || event.key == nextWeek || event.key == thisMonth || event.key == nextMonth || event.key == longTerm || event.key == emptyWhen) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {
      let collapseBtn = document.getElementsByClassName('cu-task-custom-fields__collapsed')
      if(collapseBtn?.length > 0 && collapseBtn[0].innerText.toLowerCase().indexOf('show')>-1) collapseBtn[0].click();
  
      setTimeout(() => {
        let customList = document.getElementsByClassName('cu-task-custom-fields__row')
        let idx = getIdxFromViewCustom(customList, 'when')
    
        customList[idx].children[1].getElementsByTagName('cu-edit-task-dropdown-custom-field-value')[0].children[0].click();

        setTimeout(() => {
          let num = 0;
          switch (event.key) {
            case thisWeek:
              num = 1
              break;
            case nextWeek:
              num = 2
              break
            case thisMonth:
              num = 3
              break
            case nextMonth:
              num = 4
              break
            case longTerm:
              num = 5
              break
            case emptyWhen:
              num = 0
              break
          }
          document.getElementsByClassName('cu-select__dropdown-menu-options')[0].getElementsByTagName('cu-select-option')[num].children[0].click()
          document.getElementsByClassName('cu-select__dropdown-menu-options')[0].getElementsByTagName('cu-select-option')[num].children[0].click()
        }, 400);
      }, 200);
    }
  }

  /**
  * Handle key events for important option in openning task
  * @param {keypress event} event
  */

  function handleImportantViewKey(event) {
    if ((event.key == setImportantMust || event.key == setImportantShould || event.key == setImportantWant || event.key == setImportantEmpty) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {
      let collapseBtn = document.getElementsByClassName('cu-task-custom-fields__collapsed')
      if(collapseBtn?.length > 0 && collapseBtn[0].innerText.toLowerCase().indexOf('show')>-1) collapseBtn[0].click();
  
      setTimeout(() => {
        let customList = document.getElementsByClassName('cu-task-custom-fields__row')
        let idx = getIdxFromViewCustom(customList, 'important')
    
        customList[idx].children[1].getElementsByTagName('cu-edit-task-dropdown-custom-field-value')[0].children[0].click();

        setTimeout(() => {
          let num = event.key == setImportantMust? 1 : (event.key == setImportantShould? 2: (event.key == setImportantWant ? 3 : 0))
          document.getElementsByClassName('cu-select__dropdown-menu-options')[0].getElementsByTagName('cu-select-option')[num].children[0].click()
          document.getElementsByClassName('cu-select__dropdown-menu-options')[0].getElementsByTagName('cu-select-option')[num].children[0].click()
        }, 400);
      }, 200);
    }
  }

  /**
  * Handle key events for important option
  * @param {keypress event} event
  */

  function handleImportantKey(event) {
    if ((event.key == setImportantMust || event.key == setImportantShould || event.key == setImportantWant || event.key == setImportantEmpty) && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {
      document.getElementsByClassName('cu-dt-controls__item_cf')[0].click()   //custom menu click
      setTimeout(() => {
        let columnList = document.getElementsByClassName('cu-dropdown__menu_left')[0].children[0].getElementsByClassName('columns-list__body')[0]
        let order = getIdxFromCustomName(columnList, 'important')
        if(order) {
          columnList.children[order].click()
  
          setTimeout(() => {
            document.getElementsByClassName('cu-dt-controls__cf-body')[0].children[0].getElementsByClassName('cu-custom-fields__type-dropdown')[0].click()
            setTimeout(() => {
              let num = event.key == setImportantMust? 1 : (event.key == setImportantShould? 2: (event.key == setImportantWant ? 3 : 0))
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
  * Handle key events for urgent option in openning task
  * @param {keypress event} event
  */

   function handleUrgentViewKey(event) {
    if ((event.key == setUrgentVery || event.key == setUrgentSemi || event.key == setUrgentNot || event.key == setUrgentEmpty) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {
      let collapseBtn = document.getElementsByClassName('cu-task-custom-fields__collapsed')
      if(collapseBtn?.length > 0 && collapseBtn[0].innerText.toLowerCase().indexOf('show')>-1) collapseBtn[0].click();
  
      setTimeout(() => {
        let customList = document.getElementsByClassName('cu-task-custom-fields__row')
        let idx = getIdxFromViewCustom(customList, 'urgent')
    
        customList[idx].children[1].getElementsByTagName('cu-edit-task-dropdown-custom-field-value')[0].children[0].click();

        setTimeout(() => {
          let num = event.key == setUrgentVery? 1: (event.key == setUrgentSemi? 2: (event.key == setUrgentNot ? 3 : 0))
          document.getElementsByClassName('cu-select__dropdown-menu-options')[0].getElementsByTagName('cu-select-option')[num].children[0].click()
          document.getElementsByClassName('cu-select__dropdown-menu-options')[0].getElementsByTagName('cu-select-option')[num].children[0].click()
        }, 400);
      }, 200);
    }
  }

  /**
  * Handle key events for urgent option
  * @param {keypress event} event
  */

  function handleUrgentKey(event) {
    if ((event.key == setUrgentVery || event.key == setUrgentSemi || event.key == setUrgentNot || event.key == setUrgentEmpty) && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {
      document.getElementsByClassName('cu-dt-controls__item_cf')[0].click()   //custom menu click
      setTimeout(() => {
        let columnList = document.getElementsByClassName('cu-dropdown__menu_left')[0].children[0].getElementsByClassName('columns-list__body')[0]
        let order = getIdxFromCustomName(columnList, 'urgent')
        if(order) {
          columnList.children[order].click()
  
          setTimeout(() => {
            document.getElementsByClassName('cu-dt-controls__cf-body')[0].children[0].getElementsByClassName('cu-custom-fields__type-dropdown')[0].click()
            setTimeout(() => {
              let num = event.key == setUrgentVery? 1: (event.key == setUrgentSemi? 2: (event.key == setUrgentNot ? 3 : 0))
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
  * Handle key events for priority option in openning task
  * @param {keypress event} event
  */

  function handlePriorityViewKey(event) {
    if ((event.key == setPriorityVery || event.key == setPrioritySemi || event.key == setPriorityNot || event.key == setPriorityNormal || event.key == setPriorityEmpty) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {
      document.getElementsByClassName('task__column task__toolbar')[0].getElementsByTagName('cu-priority-list-dropdown')[0].children[0].children[0].click()
  
      setTimeout(() => {
        let num = event.key == setPriorityVery? 0: (event.key == setPrioritySemi? 1: (event.key == setPriorityNormal?2: (event.key == setPriorityNot? 3 : 4)))
        let element = document.getElementsByTagName('cu-priority-list')[0].children[0].children[num].children[0];
        element.click();
        document.getElementsByTagName('cu-priority-list')[0].parentElement.parentElement.innerHTML = '';
        document.getElementsByClassName('task__column task__toolbar')[0].getElementsByTagName('cu-priority-list-dropdown')[0].children[0].classList.remove('cu-dropdown_open');
        document.getElementsByClassName('task__column task__toolbar')[0].getElementsByTagName('cu-priority-list-dropdown')[0].children[0].children[0].setAttribute('aria-expanded', 'false')
        // document.getElementsByClassName('cdk-overlay-container')[0].click();
        document.getElementsByClassName('cdk-overlay-container')[0].innerHTML = '';
        document.getElementsByClassName('task__column task__toolbar')[0].getElementsByTagName('cu-priority-list-dropdown')[0].children[0].children[0].click()

        
        var event = new MouseEvent('click', {
          'view': window,
          'bubbles': true,
          'cancelable': true
        });
      
        // Dispatch the event on the element
        document.getElementsByClassName('cdk-overlay-container')[0].dispatchEvent(event);
      }, 200);
    }
  }

  /**
  * Handle key events for priority option
  * @param {keypress event} event
  */

  function handlePriorityKey(event) {
    if ((event.key == setPriorityVery || event.key == setPrioritySemi || event.key == setPriorityNot || event.key == setPriorityNormal || event.key == setPriorityEmpty) && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {
      document.querySelector('div[data-test="dashboard-table-toolbar-set-priority"]').querySelector('div[dropdownmodifierclass="cu-priority-list-dropdown-customizations"]').children[0].click()
      setTimeout(() => {
        let num = event.key == setPriorityVery? 0: (event.key == setPrioritySemi? 1: (event.key == setPriorityNormal?2: (event.key == setPriorityNot? 3 : 4)))
        document.getElementsByClassName('priority-list-item ng-star-inserted')[num].children[0].click()
      }, 200);
    }
  }

  /**
  * Handle key events for convert task to 'in progress' in open task
  * @param {keypress event} event
  */

  function handleProgressKey(event) {
    if ((event.key == setProgressKey) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {
      if(document.getElementsByClassName('task-status')?.length > 0) {
        document.getElementsByClassName('task-status')[0].children[0].children[0].click();
      }
      if(document.getElementsByClassName('cu-status-button-badge__body')?.length > 0) {
        document.getElementsByClassName('cu-status-button-badge__body')[0].children[0].click();
      }
      setTimeout(() => {
        let progressList = document.getElementsByClassName('status-list__item')
        let idx = getIdxFromViewStatus(progressList, 'in progress')

        progressList[idx].click()
        window.location.reload()
      }, 200)
    }
  }

   /**
  * Handle key events for open due date
  * @param {keypress event} event
  */

   function openDueDate(event) {
    if ((event.key == openDateKey) && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {
      document.getElementsByTagName('cu-dashboard-table-toolbar')[0].getElementsByClassName('cu-recurring-date-dropdown__dropdown cu-dropdown')[0].children[0].click()
    }
   }

   /**
  * Handle key events for close due date
  * @param {keypress event} event
  */

   function closeDueDate(event) {
    if(event.key == closeDateKey) {
      document.getElementsByClassName('cu-calendar-picker__done')[0].click()
      setTimeout(() => {
        document.querySelector("[data-test=dashboard-table-toolbar-save]").click()
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
  setPriorityVery = 'a';
  setPrioritySemi = 's';
  setPriorityNormal = 'c';
  setPriorityNot = 'f';
  openDateKey = 'o';
  closeDateKey = 'p';
  thisWeek = 'q';
  nextWeek = 'w';
  thisMonth = 'e';
  nextMonth = 'r';
  longTerm = 't';
  setProgressKey = '5';

  chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
      const type = request?.type;
      logger.info('request received', request)
      if (type === messageConstants.SET_USING) {
        try {
          isUsePlugin = request.value
          localStorage.setItem('clickup-useplugin', isUsePlugin)
          if(isUsePlugin) {
            cuTaskRows[currentFocused].classList.add("active-list-item");
          } else {
            cuTaskRows[currentFocused].classList.remove("active-list-item");
          }

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
          setImportantEmpty = request.emptydo
          localStorage.setItem('clickup-important', JSON.stringify({mustdo: setImportantMust, shoulddo: setImportantShould, wantdo: setImportantWant, emptydo: setImportantEmpty}))
        } catch (exception) {
          logger.error('Failed initialization', exception);
        } 
      } else if(type === messageConstants.SET_URGENT){
        try {
          setUrgentVery = request.very
          setUrgentSemi = request.semi
          setUrgentNot = request.not
          setUrgentEmpty = request.empty
          localStorage.setItem('clickup-urgent', JSON.stringify({very: setUrgentVery, semi: setUrgentSemi, not: setUrgentNot, empty: setUrgentEmpty}))
        } catch (exception) {
          logger.error('Failed initialization', exception);
        } 
      } else if(type === messageConstants.SET_PRIORITY){
        try {
          setPriorityVery = request.very
          setPrioritySemi = request.semi
          setPriorityNormal = request.normal
          setPriorityNot = request.not
          setPriorityEmpty = request.empty
          localStorage.setItem('clickup-priority', JSON.stringify({very: setPriorityVery, semi: setPrioritySemi, normal: setPriorityNormal, not: setPriorityNot, empty: setPriorityEmpty}))
        } catch (exception) {
          logger.error('Failed initialization', exception);
        } 
      } else if(type === messageConstants.SET_DUEDATE){
        try {
          openDateKey = request.open
          closeDateKey = request.close
          localStorage.setItem('clickup-date', JSON.stringify({open: openDateKey, close: closeDateKey}))
        } catch (exception) {
          logger.error('Failed initialization', exception);
        } 
      } else if(type === messageConstants.SET_WHEN){
        try {
          thisWeek = request.thisWeek;
          nextWeek = request.nextWeek;
          thisMonth = request.thisMonth;
          nextMonth = request.nextMonth;
          longTerm = request.longTerm;
          emptyWhen = request.emptyWhen;
          localStorage.setItem('clickup-when', JSON.stringify({thisWeek, nextWeek, thisMonth, nextMonth, longTerm, emptyWhen}))
        } catch (exception) {
          logger.error('Failed initialization', exception);
        } 
      } else if(type == messageConstants.SET_NEW) {
        try {
          setProgressKey = request.progress
          localStorage.setItem('clickup-status-progress', JSON.stringify({progress: setProgressKey}))
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
