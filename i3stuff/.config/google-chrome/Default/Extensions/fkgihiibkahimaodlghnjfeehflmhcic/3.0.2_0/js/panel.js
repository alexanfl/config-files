const VERSION = '3.0.2';
const BROWSER = 'chrome';
const UTM = 'utm_source=extension&utm_medium='+BROWSER+'&utm_campaign=' + VERSION;
const URL_BASE    = 'https://kickback.no'
const URL_SEARCH  = URL_BASE + '/soek/?'+UTM+'&op=&query=';
const URL_ACCOUNT = URL_BASE + '/konto?'+UTM;
const URL_HELP    = URL_BASE + '/hjelp?'+UTM;
const URL_CONTACT = URL_BASE + '/hjelp/henvendelse?'+UTM;

/**
 * Shortcut: Create an element with the specified class and append it to the provided element.
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
 * Clean a potentially malicious string, in case the JSON feed has been tained somehow.
 */
function escapeHtml(str,allowFwdSlashesAndAmp) {
  var ret = String(str)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
  
  // May need / and & in URLs
  if (! allowFwdSlashesAndAmp) ret.replace(/\//g, "&#x2F;").replace(/&/g, "&amp;")
  
  return ret;
}

function renderOffer(docFrag, offer) {
  // Extract and sanitize everything we are going to use
  var safeTitle       = escapeHtml(offer.title)
  var safeDescription = escapeHtml(offer.description)
  var safeReward      = escapeHtml(offer.reward)
  var safeUrl         = escapeHtml(offer.url, true)
  var safeLogo        = escapeHtml(offer.logo, true)
  
  offer = null; // Null the variable so we don't accidentally use unsanitized data
  
  
  var article     = createEl('article','offer',         docFrag);
  var clearfix    = createEl('div',    'clearfix',      article);
  
  var left        = createEl('div',    'left',          clearfix);
  var image       = createEl('div',    'merchant-logo', left);
  var button      = createEl('button', 'btn btn-offer', left);

  var name        = createEl('span',   'name',          article);
  
  var description = createEl('div',    'description',   article);
  
  // Add text content
  name.textContent = safeTitle;
  button.textContent = "Opptil " + safeReward + " tilbake";
  button.setAttribute('style',"float: right;")
  description.appendChild(document.createTextNode(safeDescription))
  image.setAttribute('style', "background-image: url('"+safeLogo+"');")
  
  button.addEventListener('click', function() { wrappedOpenUrl( safeUrl, false ) } )
  // TODO Repeat for onkeydown?
}

function renderMerchant(docFrag, merchant) {
  // Extract and sanitize everything we are going to use
  var safeTitle       = escapeHtml(merchant.title)
  var safeReward      = escapeHtml(merchant.reward)
  var safeImage       = escapeHtml(merchant.logo, true)
  var safeUrl         = escapeHtml(merchant.url, true)
  merchant = null; // Null the variable so we don't accidentally use unsanitized data
  
  
  var article      = createEl('article','merchant',      docFrag);
  var image        = createEl('div',    'merchant-logo', article);
  var name         = createEl('span',   'name',          article);
  var points       = createEl('span',   'points',        article);
  
  var description  = createEl('div',    'description',   article);
  
  // Add text content
  name.textContent = safeTitle;
  image.setAttribute('style', "background-image: url('"+safeImage+"')")
  points.textContent = 'Opptil '+safeReward+' tilbake';
  article.addEventListener('click', function() { wrappedOpenUrl( safeUrl, false ) })
}

function renderContent(data) {
  var keys = ['offers','merchants'];
  keys.forEach(function(key) {    
    // Register click handlers for the tabs
    var otherKey = ('merchants' == key) ? 'offers' : 'merchants'; 
    var otherTab = document.querySelector('li.tab.'+otherKey);
    var selectedTab = document.querySelector('li.tab.'+key)
   
    selectedTab.addEventListener('click',function() {
      // Toggle which tab is active
      selectedTab.attributes.class.textContent += " active";
      var otherClass = otherTab.attributes.class;
      otherClass.textContent = otherClass.textContent.replace("active","")
      
      // Toggle which tab content is visible
      document.querySelector('#'+key).hidden = false;
      document.querySelector('#'+otherKey).hidden = true;
    })
    
    // The data is in an object. In order to sort it, we need an array.
    // ECMAScript 2017 will have Object.values
    var ar = [];
    data[key].forEach(function(o) {
      ar.push(o);
    })
    
    ar.sort(function(a,b) {
      if (undefined !== a.priority && undefined !== b.priority) {
        return parseInt(b.priority) - parseInt(a.priority);
      } else {
        return parseInt(b.id) - parseInt(a.id);
      }
    })
    
    // Insert content, i.e. merchants and offers
    var docFrag = document.createDocumentFragment()
    ar.forEach(function(o) {
      ('merchants' == key) ? renderMerchant(docFrag, o) : renderOffer(docFrag, o); 
    })
    document.getElementById(key).appendChild(docFrag);
  })
}

function submitSearch() {
  var value = document.querySelector('input.search.square').value;
  wrappedOpenUrl(URL_SEARCH + encodeURIComponent(value), false)
}

function wrappedOpenUrl(url, newWindow) {
  if ('safari' == BROWSER) {
    if (newWindow) {
      safari.application.activeBrowserWindow.openTab().url = url;
      safari.extension.popovers[0].hide()
    } else {
      safari.application.activeBrowserWindow.activeTab.url = url;
      safari.extension.popovers[0].hide()
    }
  } else {
    if (newWindow) {
      chrome.tabs.create({url: url})
    } else {
      chrome.tabs.query({ active: true, currentWindow: true },function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: url})
        window.close()
      })
    }
  }
}

function attachUrlToSelector(selector,url) {
  document.querySelector(selector).addEventListener('click',function() {
    wrappedOpenUrl(url, false)
  })
}

function registerListeners() {
  // Search. Separate handlers since the button isnt a real submit button
  document.querySelector('form.searchform'    ).addEventListener('submit', submitSearch)
  document.querySelector('input.search.submit').addEventListener('click',  submitSearch)
  
  attachUrlToSelector('li.account a', URL_ACCOUNT)
  attachUrlToSelector('li.help a',    URL_HELP)
  attachUrlToSelector('li.contact a', URL_CONTACT)
}

if ('safari' == BROWSER) {
  document.addEventListener('DOMContentLoaded', function() {
    var data = safari.extension.globalPage.contentWindow.gatherData()
    renderContent(data)
    registerListeners()
    })
} else {
  // Start everything by sending a message to the background
  chrome.runtime.sendMessage({ id: 'getPanelData' }, function(response) {
    //document.addEventListener('DOMContentLoaded', function() {
      renderContent(JSON.parse(response))
      registerListeners()
    //})
  })
}
