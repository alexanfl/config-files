/*
 * Copyright Arne Kepp 2010-2012
 * Copyright KickBack AS 2013-2016
 *
 * All rights reserved.
 */
const DATA_URL = 'https://kickback.no/plugin/v3/data.json'
const REDIRECT_PAGE_REGEX = /^https:\/\/(santander\.)?kickback\.no\/redirect\/partner\/(\d+)/

const GOOGLE_SERP_REGEX = /^http(s?):\/\/(www\.)?google\.(.*)\/.*[#|?|&]q/
const BING_SERP_REGEX = /^http(s)?:\/\/(www\.)?bing\.com\/search\?q/
const VERSION = '3.0.2';
const BROWSER = 'chrome';

// TODO Could handle other redirect variants more gracefully as well


// =========== Initilialization ===========
const SLIDER_SUPPRESSION_TIMEOUT = 900*1000; // 15 minutes
var SLIDER_SUPPRESSION_PREFIX = 'slider_activate_';
var LOAD_ATTEMPT = null;
var LOAD_SUCCESS = null;

// Use Object as domain lookup table since localStorage implementation can vary, will be small
var DOMAIN_TABLE;
var USER_INFO;

// Load whatever we had, in case there are network issues right after startup
try {
  DOMAIN_TABLE = (localStorage.getItem('DOMAIN_TABLE') != null) ? JSON.parse(localStorage.getItem('DOMAIN_TABLE')) : null;
  USER_INFO = (localStorage.getItem('USER_INFO') != null) ? JSON.parse(localStorage.getItem('USER_INFO')) : null;
} catch(e) {
  // Start from scratch
    localStorage.clear();
  DOMAIN_TABLE = null;
  USER_INFO = {}
}

// Fetch the list and build the cache.
// But sometimes the internet connection is not immediately available,
// so we retry after 2 minutes
try {
  loadData(function(error,success) {
    if (null !== error) {
      setTimeout(function() {
        loadData()
      },120*1000)
    }
  });
} catch(e) {
  }

// Reload every 3 hours
setInterval(function() {
  try {
    loadData()  
  } catch(e) {
      }
}, 3*3600*1000)

// =========== Common functions ===========
function readData(jsonObj) {
  // Create the quick lookup table
  createDomainTable(jsonObj);
  
  USER_INFO = jsonObj.userInfo;
  
  localStorage.clear();
  localStorage.setItem('USER_INFO', JSON.stringify(jsonObj.userInfo));
  localStorage.setItem('DOMAIN_TABLE', JSON.stringify(DOMAIN_TABLE));
  
  ['merchant','offer','tracker'].forEach(function(type) {
    var typePlural = type + 's';
    
    if(! jsonObj[typePlural]) {
      return;
    }
    
    var count = 0;
    jsonObj[typePlural].forEach(function(entry){
      entry.type = type;
      localStorage.setItem(entry.id, JSON.stringify(entry))
      count++;
    })
    
      })
}

function createDomainTable(jsonObj) {
    
  var table = {};
  
  jsonObj.domains.forEach(function(de){
    var key = de.domain
    delete de.domain
    
    table[key] = de
  })
  
  DOMAIN_TABLE = table
}

function loadData(cb) {
    
  var now = (new Date()).getTime();
  // These are lower boundaries: Wait 100s between attempts, or one hour after succesful attempt
  if ((LOAD_ATTEMPT != null && (now - LOAD_ATTEMPT) < 100*1000)
      || (LOAD_SUCCESS != null && (now - LOAD_SUCCESS) < 3600*1000)) {
        return;
  }
  
  LOAD_ATTEMPT = now;
  
  var qs = ["v=3.0.2","b=chrome"];
  if (USER_INFO && USER_INFO.sid) qs.push("sid=" + USER_INFO.sid);
  
  
  var xhr = new XMLHttpRequest();
  xhr.open('GET', DATA_URL + '?' + qs.join('&'), true);
  
  xhr.onreadystatechange = function(data) {
    if (this.readyState == 4) {
      var cbError = null;
      var cbData = null;
      
      if (this.status == 200) {
                var jsonObj = JSON.parse(this.responseText)
        readData(jsonObj);
        // SC 200 and valid JSON, who could ask for more?
        LOAD_SUCCESS = (new Date()).getTime()
        cbData = this.status;
      } else {
                cbError = this.status;
      }
      
      if (undefined !== cb) {
        cb(cbError,cbData)
      }
    }
  }
  
  xhr.send(); 
}

function cleanDomain(currentUrl) {
  // Google doesn't trust the click handlers for Firefox
  var googleSerpUrlMatches = currentUrl.match(/^https?:\/\/(www\.)?google\.([a-z\.]*)\/url\?(.*)url=([^&]*)&/);
  if (googleSerpUrlMatches != null) {
    currentUrl = decodeURIComponent(googleSerpUrlMatches[5]);
      }
  
  domain_name_parts = currentUrl.match(/:\/\/(.[^/]+)/)[1].split('.')
  if(domain_name_parts.length > 1) {
    var domain = domain_name_parts[domain_name_parts.length - 2].toLowerCase()
    var tld = domain_name_parts[domain_name_parts.length - 1].toLowerCase()
    return domain + '.' + tld;
  } else {
    return domain_name_parts[0].toLowerCase()
  }
}

function findMerchantMatch(url) {
  if (null == url) {
    return false;
  }
  
  var prefix = url.substr(0,7).toLowerCase();
  if('http://' != prefix && 'https:/' != prefix) return false;
  
  // Lookup
  var key = cleanDomain(url)
  var de = DOMAIN_TABLE[key]
  
  if (! de) {
        return false;
  }
  
  if (de.type == 'merchant') {    
    return JSON.parse(localStorage.getItem(de.id));
  }
  // Could also be offer or tracker, ignoring these for now
  return false;
}

/**
 * Check if the current URL is a Google or Bing search result page
 */
function isSerpCandidate(url) {
  if (null == url) {
    return false;
  }
  
    if (GOOGLE_SERP_REGEX.exec(url) != null) {
    return true;
  }
  if (BING_SERP_REGEX.exec(url) != null) {
    return true;
  }
  
  return false;
}

function isRedirectPage(url) {
  return (REDIRECT_PAGE_REGEX.exec(url) != null);
}

function isSliderSuppressed(merchantId) {
  // Check whether slider was recently activated or closed
  var lastSliderActivate = sessionStorage.getItem(SLIDER_SUPPRESSION_PREFIX + merchantId);
  if (lastSliderActivate) {
    var diff = (new Date()).getTime() - lastSliderActivate;
    if (diff < SLIDER_SUPPRESSION_TIMEOUT) {
            return true;
    }
  }
  return false;
}

function suppressSlider(merchantId) {
  // This logs clicks to merchants, so we need incognito:split to ensure it is cleared
  sessionStorage.setItem(SLIDER_SUPPRESSION_PREFIX+merchantId, (new Date()).getTime());
}

function gatherData() {
  var tsStart = (new Date()).getTime();
  
  var res = { merchants: [], offers: [] }
  
  for(var key in localStorage) {
    if(isNaN(key)) continue;
    
    var e = localStorage[key];
    var eo = JSON.parse(e);
    if (eo.type == 'merchant') {
      res.merchants.push(eo)
    } else if (eo.type == 'offer') {
      res.offers.push(eo)
    }
  }
  
    
  return res;
}

function gatherJson() {
  return JSON.stringify(gatherData())
}

/**
 * Listen for URLs, message the injected script if it
 * relates to a SERP or domain of a merchant we know
 */
function messageHandler(msgId, msgPayload, sendResponse) {
  if('serpUrl' == msgId) {
    merchant = findMerchantMatch(msgPayload.url)
    if (false !== merchant) {
      sendResponse({merchant: merchant})
    }
    
  } else if ('suppressSlider' == msgId) {
    var merchantId = msgPayload.merchantId;
        suppressSlider(merchantId)
    sendResponse({})
    
  } else if ('getPanelData' == msgId) {
    // Not used by Safari
    sendResponse(gatherJson())
  }
  
}

function tabEventHandler(tabUrl, sendMessageToTab) {
  merchant = findMerchantMatch(tabUrl);
  if (false !== merchant) {
    if(isSliderSuppressed(merchant.id)) {
            return;
    } else {
            sendMessageToTab('merchantMatch', { merchant: merchant, targetUrl: tabUrl })
    }
    
  } else if (isSerpCandidate(tabUrl)) {      
        sendMessageToTab('serpMatch', {})
    
  } else if (isRedirectPage(tabUrl)) {
    var matches = REDIRECT_PAGE_REGEX.exec(tabUrl)
    var merchantId = matches[2];
        suppressSlider(merchantId);
  }
}

// =========== Browser specific functions ===========

if (BROWSER == 'safari') {
  // Tab events
  safari.application.addEventListener("navigate", function(evt) {
            
    // In case we want to send a message to the tab after processing
    function sendMessageToTab(msgId, msg) {
                        evt.target.page.dispatchMessage(msgId, msg)
    }
    
    tabEventHandler(evt.target.url, sendMessageToTab)
  }, true)
  
  // Message events  
  safari.application.addEventListener("message", function(evt) {
            function sendResponse(msg) {
      // Our very own callback system
      var msgId = (evt.message.cbId != null) ? evt.message.cbId : evt.name;
                        evt.target.page.dispatchMessage(msgId,msg)
    }
    
    messageHandler(evt.name, evt.message, sendResponse)
  }, false)
  
} else {
  // Tab events
  chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
      if (changeInfo.status != 'complete' || tab.active == false) {
        return;
      }
      
      // In case we want to send a message to the tab after processing
      function sendMessageToTab(msgId, msg) {
        // Embed the message id into the message object
        msg.id = msgId;
        chrome.tabs.sendMessage(tabId, msg)
      }
      
      tabEventHandler(tab.url, sendMessageToTab)
    })
  
  // Message events
  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      messageHandler(request.id, request, sendResponse) 
    }) 
}
