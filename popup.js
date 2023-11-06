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
  if(emptyDo) {
    $('#empty_do').val(emptyDo)
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
  if(emptyUrgent) {
    $('#urgent_empty').val(emptyUrgent)
  }
  if(veryPriority) {
    $('#priority_very').val(veryPriority)
  }
  if(semiPriority) {
    $('#priority_semi').val(semiPriority)
  }
  if(normalPriority) {
    $('#priority_normal').val(normalPriority)
  }
  if(notPriority) {
    $('#priority_not').val(notPriority)
  }
  if(emptyPriority) {
    $('#priority_empty').val(emptyPriority)
  }
  if(openDate) {
    $('#date_open').val(openDate)
  }
  if(closeDate) {
    $('#date_close').val(closeDate)
  }
  if(thisWeek) {
    $('#when_thisweek').val(thisWeek)
  }
  if(nextWeek) {
    $('#when_nextweek').val(nextWeek)
  }
  if(thisMonth) {
    $('#when_thismonth').val(thisMonth)
  }
  if(nextMonth) {
    $('#when_nextmonth').val(nextMonth)
  }
  if(longTerm) {
    $('#when_longterm').val(longTerm)
  }
  if(emptyWhen) {
    $('#when_empty').val(emptyWhen)
  }
  if(statusProgress) {
    $('#status_progress').val(statusProgress)
  }
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
        sendDateMessage()
        sendNewMessage()
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
$('#btn_move_clear').click(function() {
  $('#move_down').val('')
  $('#move_up').val('')
  $('#select_task').val('')
  
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

//======================================= WHEN ==========================================

$('#btn_when_save').click(function() {
  $('#when_error').hide()
  if($('#when_thisweek').val()=='' || $('#when_nextweek').val()=='' || $('#when_thismonth').val()=='' || $('#when_nextmonth').val()=='' || $('#when_longterm').val()=='' ) {
    $('#when_error').show()
    return;
  }

  setWhenData()
  sendWhenMessage()
})
$('#btn_when_reset').click(function() {
  $('#when_thisweek').val('q')
  $('#when_nextweek').val('w')
  $('#when_thismonth').val('e')
  $('#when_nextmonth').val('r')
  $('#when_longterm').val('t')
  $('#when_empty').val('y')
  
  setWhenData();
  sendWhenMessage();
})
$('#btn_when_clear').click(function() {
  $('#when_thisweek').val('')
  $('#when_nextweek').val('')
  $('#when_thismonth').val('')
  $('#when_nextmonth').val('')
  $('#when_longterm').val('')
  $('#when_empty').val('')
  
  setWhenData();
  sendWhenMessage();
})

function setWhenData() {
  setStoreData('clickup-thisweek', $('#when_thisweek').val().toLowerCase())
  setStoreData('clickup-nextweek', $('#when_nextweek').val().toLowerCase())
  setStoreData('clickup-thismonth', $('#when_thismonth').val().toLowerCase())
  setStoreData('clickup-nextmonth', $('#when_nextmonth').val().toLowerCase())
  setStoreData('clickup-longterm', $('#when_longterm').val().toLowerCase())
  setStoreData('clickup-emptywhen', $('#when_empty').val().toLowerCase())
}

function sendWhenMessage() {
  sendMessage({ 
    type: messageConstants.SET_WHEN, 
    thisWeek: $('#when_thisweek').val().toLowerCase(),
    nextWeek: $('#when_nextweek').val().toLowerCase(),
    thisMonth: $('#when_thismonth').val().toLowerCase(),
    nextMonth: $('#when_nextmonth').val().toLowerCase(),
    longTerm: $('#when_longterm').val().toLowerCase(),
    emptyWhen: $('#when_empty').val().toLowerCase(),
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
  $('#empty_do').val('4')
  
  setImportantData();
  sendImportantMessage();
})
$('#btn_important_clear').click(function() {
  $('#must_do').val('')
  $('#should_do').val('')
  $('#want_do').val('')
  $('#empty_do').val('')
  
  setImportantData();
  sendImportantMessage();
})

function setImportantData() {
  setStoreData('clickup-mustdo', $('#must_do').val().toLowerCase())
  setStoreData('clickup-shoulddo', $('#should_do').val().toLowerCase())
  setStoreData('clickup-wantdo', $('#want_do').val().toLowerCase())
  setStoreData('clickup-emptydo', $('#empty_do').val().toLowerCase())
}

function sendImportantMessage() {
  sendMessage({ 
    type: messageConstants.SET_IMPORTANT, 
    mustdo: $('#must_do').val().toLowerCase(),
    shoulddo: $('#should_do').val().toLowerCase(),
    wantdo: $('#want_do').val().toLowerCase(),
    emptydo: $('#empty_do').val().toLowerCase()
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
  $('#urgent_empty').val('0')
  
  setUrgentData();
  sendUrgentMessage();
})
$('#btn_urgent_clear').click(function() {
  $('#urgent_very').val('')
  $('#urgent_semi').val('')
  $('#urgent_not').val('')
  $('#urgent_empty').val('')
  
  setUrgentData();
  sendUrgentMessage();
})

function setUrgentData() {
  setStoreData('clickup-very', $('#urgent_very').val().toLowerCase())
  setStoreData('clickup-semi', $('#urgent_semi').val().toLowerCase())
  setStoreData('clickup-not', $('#urgent_not').val().toLowerCase())
  setStoreData('clickup-empty', $('#urgent_empty').val().toLowerCase())
}

function sendUrgentMessage() {
  sendMessage({ 
    type: messageConstants.SET_URGENT, 
    very: $('#urgent_very').val().toLowerCase(),
    semi: $('#urgent_semi').val().toLowerCase(),
    not: $('#urgent_not').val().toLowerCase(),
    empty: $('#urgent_empty').val().toLowerCase()
  });
}

//========================================= PRIORITY =========================================

$('#btn_priority_save').click(function() {
  $('#priority_error').hide()
  if($('#priority_very').val()=='' || $('#priority_semi').val()=='' || $('#priority_not').val()=='' || $('#priority_normal').val()=='' ) {
    $('#priority_error').show()
    return;
  }

  setPriorityData()
  sendPriorityMessage()
})
$('#btn_priority_reset').click(function() {
  $('#priority_very').val('a')
  $('#priority_semi').val('s')
  $('#priority_normal').val('c')
  $('#priority_not').val('f')
  $('#priority_empty').val('g')
  
  setPriorityData();
  sendPriorityMessage();
})
$('#btn_priority_clear').click(function() {
  $('#priority_very').val('')
  $('#priority_semi').val('')
  $('#priority_normal').val('')
  $('#priority_not').val('')
  $('#priority_empty').val('')
  
  setPriorityData();
  sendPriorityMessage();
})

function setPriorityData() {
  setStoreData('clickup-very', $('#priority_very').val().toLowerCase())
  setStoreData('clickup-semi', $('#priority_semi').val().toLowerCase())
  setStoreData('clickup-normal', $('#priority_normal').val().toLowerCase())
  setStoreData('clickup-not-priority', $('#priority_not').val().toLowerCase())
  setStoreData('clickup-empty-priority', $('#priority_empty').val().toLowerCase())
}

function sendPriorityMessage() {
  sendMessage({ 
    type: messageConstants.SET_PRIORITY, 
    very: $('#priority_very').val().toLowerCase(),
    semi: $('#priority_semi').val().toLowerCase(),
    normal: $('#priority_normal').val().toLowerCase(),
    not: $('#priority_not').val().toLowerCase(),
    empty: $('#priority_empty').val().toLowerCase(),
  });
}

//========================================= DUE DATE =========================================

$('#btn_date_save').click(function() {
  $('#date_error').hide()
  if($('#date_open').val()=='' || $('#date_close').val()=='') {
    $('#date_error').show()
    return;
  }

  setDateData()
  sendDateMessage()
})
$('#btn_date_reset').click(function() {
  $('#date_open').val('o')
  $('#date_close').val('p')
  
  setDateData();
  sendDateMessage();
})
$('#btn_date_clear').click(function() {
  $('#date_open').val('')
  $('#date_close').val('')
  
  setDateData();
  sendDateMessage();
})

function setDateData() {
  setStoreData('clickup-open', $('#date_open').val().toLowerCase())
  setStoreData('clickup-close', $('#date_close').val().toLowerCase())
}

function sendDateMessage() {
  sendMessage({ 
    type: messageConstants.SET_DUEDATE, 
    open: $('#date_open').val().toLowerCase(),
    close: $('#date_close').val().toLowerCase(),
  });
}

//================================================= NEW Features =========================================

$('#btn_new_save').click(function() {
  $('#new_error').hide()
  // if($('#new_open').val()=='' || $('#date_close').val()=='') {
  //   $('#new_error').show()
  //   return;
  // }

  setNewData()
  sendNewMessage()
})
$('#btn_new_reset').click(function() {
  $('#status_progress').val('5')
  
  setNewData();
  sendDateMessage();
})

function setNewData() {
  setStoreData('clickup-status-progress', $('#status_progress').val().toLowerCase())
}

function sendNewMessage() {
  sendMessage({ 
    type: messageConstants.SET_NEW, 
    progress: $('#status_progress').val().toLowerCase(),
  });
}