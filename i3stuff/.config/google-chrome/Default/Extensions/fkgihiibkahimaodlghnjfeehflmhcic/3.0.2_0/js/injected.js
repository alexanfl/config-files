;(function() {
const VERSION = '3.0.2';
const BROWSER = 'chrome';
const UTM_TERM_SERP = 'serp';
const UTM_TERM_SLIDER = 'slider';
const UTM = 'utm_source=extension&utm_medium='+BROWSER+'&utm_campaign=' + VERSION;

var sendMessage;
var safariCallbacks = {};
var safariCallbackId = 1;

if (BROWSER == 'safari') {
  
  safari.self.addEventListener("message", function(evt) {
            
    if (undefined !== safariCallbacks[evt.name]) {
      // This is a callback
      safariCallbacks[evt.name](evt.message);
      delete safariCallbacks[evt.name];
      
    } else {
      // Normal message  
      messageHandler(evt.name, evt.message);  
    }
    
  }, false)
  
  sendMessage = function(message, cb) {
    if (undefined !== cb) {
      // Safari doesn't have callbacks, so we implement our own
      var cbId = "cb" + safariCallbackId++;
      message.cbId = cbId;
      safariCallbacks[cbId] = cb;
    }
            safari.self.tab.dispatchMessage(message.id, message)
  }
  
} else {
  
  chrome.runtime.onMessage.addListener(function(msg) {
    messageHandler(msg.id, msg)
  })
  
  sendMessage = function(message, cb) {
    chrome.runtime.sendMessage(message, cb);
  }
}


function messageHandler(msgId, msg) {
  // If the received message has the expected format.
  if ('merchantMatch' == msgId) {
    // We're on the page of a supported merchant
    doSliderInject(msg)
    
  } else if ('serpMatch' == msgId) {
    // This is a known search result, start scan
    doSerpScan(msg)
  }
}

function suppressSlider(merchantId) {
  sendMessage({ id: 'suppressSlider', merchantId: merchantId })
}

/**
 * Shortcut
 */
function createEl(type,className,appendTo) {
  var el = document.createElement(type);
  el.setAttribute('class',className);
  
  if (undefined !== appendTo) {
    appendTo.appendChild(el);
  }
  
  return el;
}

/**
 * Clean a potentially malicious string,
 * in case somebody manages to hijack our domain.
 */
function escapeHtml(str,allowFwdSlashesAndAmp) {
  var ret = String(str)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
  
  // May need these in URLs
  if (! allowFwdSlashesAndAmp) ret.replace(/\//g, "&#x2F;").replace(/&/g, "&amp;")
  
  return ret;
}

function createMerchantUrl(merchant,targetUrl,utmTerm) {
  return escapeHtml(merchant.url,true) + '?'+UTM+'&utm_term='+utmTerm+'&target=' + encodeURIComponent(escapeHtml(targetUrl,true))
}

function setBackgroundFromExtension(el, imagePath, otherStyle) {
  var uri;
  if ('safari' == BROWSER) {
    uri = safari.extension.baseURI + imagePath;
  } else {
    uri = chrome.extension.getURL(imagePath);
  }
  el.setAttribute('style','background-image: url(\''+ uri +'\'); ' + otherStyle)
}

/**
 * Decorate search results on public search engines,
 * to emphasize results where we can provide an advantage.
 *
 * Triggered by response to scan result in doSerpScan
 */
function serpPrependHeader(el, merchant, targetUrl) {
  var safeUrl = createMerchantUrl(merchant,targetUrl,UTM_TERM_SERP);
  var safeReward = escapeHtml(merchant.reward);
  var safeTitle = escapeHtml(merchant.title);
  targetUrl = null
  merchant = null;
  
  
  var div = createEl('div', 'kb-headerinject')
  var a = createEl('a','kb-link',div);
  a.textContent = safeTitle + ' gir opptil '+safeReward+' kickback - klikk her!'
  a.setAttribute('href',safeUrl)
  a.setAttribute('target','_blank')
  
  setBackgroundFromExtension(div,'img/logo-round.svg', "width: 100%;")
  el.parentElement.insertBefore(div,el);
}

/**
 * Since the URL rules are too complex for manifest.json,
 * we let background's tab listener decide when to
 * trigger the scan of a search engine result page
 *
 * The results are rendered async, so we need to keep trying until
 * Google's scripts have appended them to the page.
 */
function doSerpScan(msg) {  
  //  var nodeList = [];
  
  // TODO MutationObserver , but tricky on Googles pages  
  function isResultReady() {
    nodeList = document.querySelectorAll('#res .rc > h3.r a, #b_results li h2 a');
        return (nodeList.length > 0);
  }

  // Retry up to 50 times, 100ms apart
  var count = 50;
  var timerId = setInterval(function() {
    count--;
    
    if (isResultReady() || count == 0) {
      clearInterval(timerId);
            doSerpDecorate(nodeList);
    }
  }, 100)
}

function doSerpDecorate(nodeList) {
  // The scan is triggered by a message from tab listener, so after DOM is ready
    
  // In Firefox you cannot use forEach on NodeList
  for(i=0;i<nodeList.length; i++) {
    var namespace = function(el) {
            
      var targetUrl = el.getAttribute('href')
            
      // Ask the backend if we know this destination
      sendMessage({ id: 'serpUrl', url: targetUrl }, function(response) {
                if (response === undefined || !response.merchant) return;
        
        // We will only get here if there was a match
        serpPrependHeader(el, response.merchant, targetUrl);
      })
    }
    namespace(nodeList[i]);
  }
}

/**
 * Create a slider that comes down in top right corner
 * of current tab with a link to activate the cashback or offer
 */
function doSliderInject(msg) {
  var merchant = msg.merchant;
  var safeUrl = createMerchantUrl(merchant, msg.targetUrl, UTM_TERM_SLIDER);
  
  var slider = makeSlider(merchant, safeUrl);
  document.getElementsByTagName('body')[0].appendChild(slider);
  
  // TODO Animation: div.slideDown();
}

function makeSlider(merchant, safeUrl) {
  var safeId = escapeHtml(merchant.id);
  var safeReward = escapeHtml(merchant.reward)
  var safeTitle = escapeHtml(merchant.title);
  merchant = null;
  
  var outer     = createEl('div',   'kb-sliderinject');
  var closeSpan = createEl('span',  'kb-close', outer);
  var logoDiv   = createEl('div',   'kb-logo',  outer);
  var inner     = createEl('div',   'kb-inner', outer);
  var infoSpan  = createEl('span',  'kb-info',  inner);
  var btnDiv    = createEl('div',   'kb-btn',   inner);
  
  // Add text content
  infoSpan.textContent  = "Få opptil " + safeReward
    + " kickback hos " + safeTitle;
  btnDiv.textContent    = "Aktiver KickBack";
  
  // Firefox doesnt deal gracefully if we specify these in CSS, wrong prefix
  setBackgroundFromExtension(btnDiv,    'img/arrow.svg',"")
  setBackgroundFromExtension(closeSpan, 'img/close.svg',"")
  setBackgroundFromExtension(logoDiv,   'img/logo-round.svg',"")
  
  // Click handlers
  closeSpan.onclick = function() {
    suppressSlider(safeId)
    outer.hidden = true
  }
  btnDiv.onclick = function() { window.open(safeUrl, '_self') }
  
  // TODO Repeat for onkeydown?
  
  return outer;
}
})()