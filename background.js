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
/**
* Background is used to send setting to content from popup.
* content -> background -> popup
*/

chrome.runtime.onMessage.addListener(
async (request) => {
    const type = request?.type;
    if (type === messageConstants.INIT) {
      try {
          const isUsePlugin = await getStoreData('clickup-on');
          const moveDown = await getStoreData('clickup-movedown');
          const moveUp = await getStoreData('clickup-moveup');
          const selectTask = await getStoreData('clickup-selecttask');
          const mustDo = await getStoreData('clickup-mustdo');
          const shouldDo = await getStoreData('clickup-shoulddo');
          const wantDo = await getStoreData('clickup-wantdo');
          const emptyDo = await getStoreData('clickup-emptydo');
          const veryUrgent = await getStoreData('clickup-very');
          const semiUrgent = await getStoreData('clickup-semi');
          const notUrgent = await getStoreData('clickup-not');
          const emptyUrgent = await getStoreData('clickup-empty');
          const veryPriority = await getStoreData('clickup-very-priority');
          const semiPriority = await getStoreData('clickup-semi-priority');
          const normalPriority = await getStoreData('clickup-normal-priority');
          const notPriority = await getStoreData('clickup-not-priority');
          const emptyPriority = await getStoreData('clickup-empty-priority');
          const openDate = await getStoreData('clickup-open');
          const closeDate = await getStoreData('clickup-close');
          const thisWeek = await getStoreData('clickup-thisweek')
          const nextWeek = await getStoreData('clickup-nextweek')
          const thisMonth = await getStoreData('clickup-thismonth')
          const nextMonth = await getStoreData('clickup-nextmonth')
          const longTerm = await getStoreData('clickup-longterm')
          const emptyWhen = await getStoreData('clickup-emptywhen')
          const statusProgress = await getStoreData('clickup-status-progress')
          const autoSelect = await getStoreData('clickup-auto-select')
          const openTask = await getStoreData('clickup-open-task')

          if(isUsePlugin != null) sendMessage({ type: messageConstants.SET_USING, value: isUsePlugin });
          if(moveDown && moveUp && selectTask) {
              sendMessage({ 
                  type: messageConstants.SET_MOVE, 
                  movedown: moveDown,
                  moveup: moveUp,
                  select: selectTask
              });
          }
          if(mustDo && shouldDo && wantDo) {
              sendMessage({ 
                  type: messageConstants.SET_IMPORTANT, 
                  mustdo: mustDo,
                  shoulddo: shouldDo,
                  wantdo: wantDo,
                  emptydo: emptyDo
              });
          }
          if(veryUrgent && semiUrgent && notUrgent) {
              sendMessage({ 
                  type: messageConstants.SET_URGENT, 
                  very: veryUrgent,
                  semi: semiUrgent,
                  not: notUrgent,
                  empty: emptyUrgent
              });
          }
          if(veryPriority && semiPriority && notPriority && normalPriority) {
            sendMessage({ 
                type: messageConstants.SET_PRIORITY, 
                very: veryPriority,
                semi: semiPriority,
                normal: normalPriority,
                not: notPriority,
                empty: emptyPriority
            });
          }
          if(openDate && closeDate) {
            sendMessage({ 
                type: messageConstants.SET_DUEDATE, 
                open: openDate,
                close: closeDate,
            });
          }
          if(thisWeek && nextWeek && thisMonth && nextMonth && longTerm) {
            sendMessage({ 
              type: messageConstants.SET_WHEN, 
              thisWeek, nextWeek, thisMonth, nextMonth, longTerm, emptyWhen
            });
          if(statusProgress) {
            sendMessage({ 
              type: messageConstants.SET_NEW, 
              progress: statusProgress,
              auto_select: autoSelect,
              open_task: openTask
            });
          }
        }
      } catch (exception) {
          logger.error('Failed initialization', exception);
      }
    }
}
);

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

const getStoreData = (key) => {
    return new Promise(resolve => {
      chrome.storage.local.get(key, result => {
        resolve(result && result[key]);
      })
    });
}

const sendMessage = data => {
    return new Promise(resolve => {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length === 0) resolve();
        chrome.tabs.sendMessage(tabs[0].id, data, function(response) {
          resolve(response);
        });
      });
    });
  }