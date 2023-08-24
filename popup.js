
const messageConstants = {
  REQ_INIT: 'req_init',
  REQ_REFRESH_REPORT: 'req_report_refresh',
  RES_INIT: 'res_init',
}

const storeConstants = {
  INITIAL_REPORT_STATUS: 'ads_initial_report_status',
  DAILY_REPORT_STATUS: 'ads_daily_report_status',
  EMAIL: 'ads_email'
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

const sendMessage = data => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(data, response => {
      resolve(response);
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

const loadStoredData = async () => {
  const email = await getStoreData(storeConstants.EMAIL) || '';
  if (!email) return;

  document.getElementById('ads_email').value = email;
}

const storeData = async () => {
  const email = document.getElementById('ads_email').value || '';
  setStoreData(storeConstants.EMAIL, email);
}

const resetData = async () => {
  setStoreData(storeConstants.EMAIL, '');
  document.getElementById('ads_email').value = '';
}

const addEventListenerById = (id, eventName, callback) => {
  const element = document.getElementById(id);
  if (!element) return false;
  element.addEventListener(eventName, callback);
}

const init = async () => {
  logger.log('popup init');
  loadStoredData();
  sendMessage({ type: messageConstants.REQ_INIT });

  // addEventListenerById('ads_save', 'click', storeData);
}

chrome.runtime.onMessage.addListener(
  async (request) => {
    const type = request?.type;
    if (type === messageConstants.RES_INIT) {
      const signinStatus = request.status;
      const booksMetadata = request.booksMetadata;
      updateSigninStatus(signinStatus);
      if (signinStatus) {
        updateBooksList(booksMetadata);
      }
    } else if (type === messageConstants.REQ_REFRESH_REPORT) {
      updateReportList();
    } else {
      logger.log('Unknown request type', request);
    }
  }
);

document.addEventListener('DOMContentLoaded', init);

// escapeHtml function can be used to sanitize any user input before it is added
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

$('.btn-toggle').click(function() {
  $(this).find('.btn').toggleClass('active');  
  
  if ($(this).find('.btn-primary')) {
    $(this).find('.btn').toggleClass('btn-primary');
  }
  $(this).find('.btn').toggleClass('btn-default');
});