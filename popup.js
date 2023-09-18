const messageConstants = {
  SET_USING: 'set_using',
  SET_MOVE: 'set_move',
  SET_IMPORTANT: 'set_important',
  SET_URGENT: 'set_urgent',
  SET_PRIORITY: 'set_priority',
  INIT: 'init'
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
* Send data from popup to content
* @param {JSON} data
*/

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

const getStoreData = (key) => {
  return new Promise(resolve => {
    chrome.storage.local.get(key, result => {
      resolve(result && result[key]);
    })
  });
}

const setStoreData = (key, value) => {
  return new Promise(resolve => {
    chrome.storage.local.set({ [key]: value }, result => {
      resolve(result);
    });
  })
}

/**
* Load all settings from stroage
*/

const loadStoredData = async () => {
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

  logger.log('useplugin', isUsePlugin);
  if(isUsePlugin) {
    $('#btn-on').attr('class', 'btn btn-primary btn-custom active')
    $('#btn-off').attr('class', 'btn btn-default btn-custom')
  } else {
    $('#btn-off').attr('class', 'btn btn-primary btn-custom active')
    $('#btn-on').attr('class', 'btn btn-default btn-custom')
  }

  if(moveDown) {
    $('#move_down').val(moveDown)
  }
  if(moveUp) {
    $('#move_up').val(moveUp)
  }
  if(selectTask) {
    $('#select_task').val(selectTask)
  }
  if(mustDo) {
    $('#must_do').val(mustDo)
  }
  if(shouldDo) {
    $('#should_do').val(shouldDo)
  }
  if(wantDo) {
    $('#want_do').val(wantDo)
  }
  if(veryUrgent) {
    $('#urgent_very').val(veryUrgent)
  }
  if(semiUrgent) {
    $('#urgent_semi').val(semiUrgent)
  }
  if(notUrgent) {
    $('#urgent_not').val(notUrgent)
  }
  if(veryPriority) {
    $('#priority_very').val(veryPriority)
  }
  if(semiPriority) {
    $('#priority_semi').val(semiPriority)
  }
  if(notPriority) {
    $('#priority_not').val(notPriority)
  }
}
const addEventListenerById = (id, eventName, callback) => {
  const element = document.getElementById(id);
  if (!element) return false;
  element.addEventListener(eventName, callback);
}

const init = async () => {
  logger.log('popup init');
  loadStoredData();
}

/**
* Add listeners from content
*/

chrome.runtime.onMessage.addListener(
  async (request) => {
    const type = request?.type;
    console.log('request received', type)
    if (type === messageConstants.INIT) {
      try {
        sendMoveMessage()
        sendImportantMessage()
        sendUrgentMessage()
        sendPriorityMessage()
      } catch (exception) {
        logger.error('Failed initialization', exception);
      }
    }
  }
);

document.addEventListener('DOMContentLoaded', init);

$('.btn-toggle').click(function() {
  $(this).find('.btn').toggleClass('active');  
  
  if ($(this).find('.btn-primary')) {
    $(this).find('.btn').toggleClass('btn-primary');
  }
  $(this).find('.btn').toggleClass('btn-default');

  if( $('#btn-on').hasClass('active')) {
    setStoreData('clickup-on', true)
    sendMessage({ type: messageConstants.SET_USING, value: true });
  } else {
    setStoreData('clickup-on', false)
    sendMessage({ type: messageConstants.SET_USING, value: false });
  }
});

//======================================  MOVEMENT ======================================

$('#btn_move_save').click(function() {
  $('#move_error').hide()
  if($('#move_down').val()=='' || $('#move_up').val()=='' || $('#select_task').val()=='' ) {
    $('#move_error').show()
    return;
  }

  setMovementData();
  sendMoveMessage();
})
$('#btn_move_reset').click(function() {
  $('#move_down').val('j')
  $('#move_up').val('k')
  $('#select_task').val('l')
  
  setMovementData();
  sendMoveMessage();
})

function setMovementData() {
  setStoreData('clickup-movedown', $('#move_down').val().toLowerCase())
  setStoreData('clickup-moveup', $('#move_up').val().toLowerCase())
  setStoreData('clickup-selecttask', $('#select_task').val().toLowerCase())
}

function sendMoveMessage() {
  sendMessage({ 
    type: messageConstants.SET_MOVE, 
    movedown: $('#move_down').val().toLowerCase(),
    moveup: $('#move_up').val().toLowerCase(),
    select: $('#select_task').val().toLowerCase()
  });
}

//======================================= IMPORTANT ==========================================

$('#btn_important_save').click(function() {
  $('#important_error').hide()
  if($('#must_do').val()=='' || $('#should_do').val()=='' || $('#want_do').val()=='' ) {
    $('#important_error').show()
    return;
  }

  setImportantData()
  sendImportantMessage()
})
$('#btn_important_reset').click(function() {
  $('#must_do').val('1')
  $('#should_do').val('2')
  $('#want_do').val('3')
  
  setImportantData();
  sendImportantMessage();
})

function setImportantData() {
  setStoreData('clickup-mustdo', $('#must_do').val().toLowerCase())
  setStoreData('clickup-shoulddo', $('#should_do').val().toLowerCase())
  setStoreData('clickup-wantdo', $('#want_do').val().toLowerCase())
}

function sendImportantMessage() {
  sendMessage({ 
    type: messageConstants.SET_IMPORTANT, 
    mustdo: $('#must_do').val().toLowerCase(),
    shoulddo: $('#should_do').val().toLowerCase(),
    wantdo: $('#want_do').val().toLowerCase()
  });
}

//========================================= URGENT =========================================

$('#btn_urgent_save').click(function() {
  $('#urgent_error').hide()
  if($('#urgent_very').val()=='' || $('#urgent_semi').val()=='' || $('#urgent_not').val()=='' ) {
    $('#urgent_error').show()
    return;
  }

  setUrgentData()
  sendUrgentMessage()
})
$('#btn_urgent_reset').click(function() {
  $('#urgent_very').val('7')
  $('#urgent_semi').val('8')
  $('#urgent_not').val('9')
  
  setUrgentData();
  sendUrgentMessage();
})

function setUrgentData() {
  setStoreData('clickup-very', $('#urgent_very').val().toLowerCase())
  setStoreData('clickup-semi', $('#urgent_semi').val().toLowerCase())
  setStoreData('clickup-not', $('#urgent_not').val().toLowerCase())
}

function sendUrgentMessage() {
  sendMessage({ 
    type: messageConstants.SET_URGENT, 
    very: $('#urgent_very').val().toLowerCase(),
    semi: $('#urgent_semi').val().toLowerCase(),
    not: $('#urgent_not').val().toLowerCase()
  });
}

//========================================= PRIORITY =========================================

$('#btn_priority_save').click(function() {
  $('#priority_error').hide()
  if($('#priority_very').val()=='' || $('#priority_semi').val()=='' || $('#priority_not').val()=='' ) {
    $('#priority_error').show()
    return;
  }

  setPriorityData()
  sendPriorityMessage()
})
$('#btn_priority_reset').click(function() {
  $('#priority_very').val('u')
  $('#priority_semi').val('o')
  $('#priority_not').val('p')
  
  setPriorityData();
  sendPriorityMessage();
})

function setPriorityData() {
  setStoreData('clickup-very', $('#priority_very').val().toLowerCase())
  setStoreData('clickup-semi', $('#priority_semi').val().toLowerCase())
  setStoreData('clickup-not', $('#priority_not').val().toLowerCase())
}

function sendPriorityMessage() {
  sendMessage({ 
    type: messageConstants.SET_PRIORITY, 
    very: $('#priority_very').val().toLowerCase(),
    semi: $('#priority_semi').val().toLowerCase(),
    not: $('#priority_not').val().toLowerCase()
  });
}