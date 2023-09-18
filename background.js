const messageConstants = {
  SET_USING: 'set_using',
  SET_MOVE: 'set_move',
  SET_IMPORTANT: 'set_important',
  SET_URGENT: 'set_urgent',
  SET_PRIORITY: 'set_priority',
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
          const veryUrgent = await getStoreData('clickup-very');
          const semiUrgent = await getStoreData('clickup-semi');
          const notUrgent = await getStoreData('clickup-not');
          const veryPriority = await getStoreData('clickup-very-priority');
          const semiPriority = await getStoreData('clickup-semi-priority');
          const notPriority = await getStoreData('clickup-not-priority');

          if(isUsePlugin) sendMessage({ type: messageConstants.SET_USING, value: isUsePlugin });
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
                  wantdo: wantDo
              });
          }
          if(veryUrgent && semiUrgent && notUrgent) {
              sendMessage({ 
                  type: messageConstants.SET_URGENT, 
                  very: veryUrgent,
                  semi: semiUrgent,
                  not: notUrgent
              });
          }
          if(veryPriority && semiPriority && notPriority) {
            sendMessage({ 
                type: messageConstants.SET_PRIORITY, 
                very: veryPriority,
                semi: semiPriority,
                not: notPriority
            });
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