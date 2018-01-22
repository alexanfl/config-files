var tabList = [];
var initList = [];
var isFirstTabCreated = false;
var extensionEnabled;
var shortName = chrome.i18n.getMessage("shortName");

var upgradeNotification = false; // true || false

var allowDuplicatesAcrossWindows = DEFAULT_ALLOWDUPLICATESACROSSWINDOWS;
var ignoreHash = DEFAULT_IGNOREHASH;
var showCount = DEFAULT_SHOWCOUNT;
var refreshOriginal = DEFAULT_REFRESHORIGINAL;
var moveOriginalTab = DEFAULT_MOVEORIGINALTAB;
var whitelist = DEFAULT_WHITELIST;
var whitelistRegexString;
var linkMarkers = DEFAULT_LINKMARKERS;

var duplicateClosedNotificationTabId = null;

// Check if we're using sync or local storage
chrome.storage.sync.get({"syncStorage": DEFAULT_SYNCSTORAGE}, sst => {
  
  console.log("onload, syncStorage", sst.syncStorage);
  
  // Set ls accordingly
  setLS(sst.syncStorage, _ => {
    
    // Now continue to load and setup extension
    ls.get({
      "allowDuplicatesAcrossWindows"  : DEFAULT_ALLOWDUPLICATESACROSSWINDOWS,
      "browserAction"                 : DEFAULT_BROWSERACTION,         // Show popup
      "ignoreHash"                    : DEFAULT_IGNOREHASH,
      "showCount"                     : DEFAULT_SHOWCOUNT,
      "moveTabToWindowEnd"            : -1, // @deprecated
      "refreshOriginal"               : DEFAULT_REFRESHORIGINAL,
      "showContextMenu"               : DEFAULT_SHOWCONTEXTMENU, // Show context menu with duplicate option
      "showNotifications"             : DEFAULT_SHOWNOTIFICATIONS,  
      "startState"                    : DEFAULT_STARTSTATE,                  // Start with default off to prevent all tabs closing when they are redirected to the same wifi sign-in page on guest/public wifis
      "storageLoaded"                 : false,
      "whitelist"                     : DEFAULT_WHITELIST,
      "showWeeklyStatsNotifications"  : DEFAULT_SHOWWEEKLYSTATSNOTIFICATIONS,
      "moveOriginalTab"               : false, // kept empty so that value can be set from moveTabToWindowEnd, if new
      "extensionEnabled"              : DEFAULT_EXTENSION_ENABLED,
    }, st => {
      
      // 22/5/2017 - change moveTabToWindowEnd (T/F) to moveOriginalTab (3 options) - remove in 6 months
      if(!st.moveOriginalTab){
        
        st.moveOriginalTab = st.moveTabToWindowEnd ? MOVE_TAB_TO_WINDOW_END: DEFAULT_MOVEORIGINALTAB;
        
        ls.set({"moveOriginalTab": st.moveOriginalTab});
        ls.remove("moveTabToWindowEnd");
        
        delete st.moveTabToWindowEnd;
      }
      
      
      // Save to storage if not previously stored (new install)
      if(!st["storageLoaded"]){
        st.storageLoaded = true;
        ls.set(st, _ => {
          let er = chrome.runtime.lastError;
          if(er)
            console.error(er);
        });
      }
      
      
      extensionEnabled = st.startState == "off" ? false : st.extensionEnabled;
      // Save new extension state on restart, if start state is off
      if(st.startState == "off")
        ls.set({extensionEnabled: extensionEnabled});
      
      ignoreHash = st.ignoreHash;
      showCount = st.showCount;
      refreshOriginal = st.refreshOriginal;
      allowDuplicatesAcrossWindows = st.allowDuplicatesAcrossWindows;
      moveOriginalTab = st.moveOriginalTab;
      
      whitelist = st.whitelist;
      makeWhitelistRegex();
      
      
      setBadgeAction(st.browserAction);
      
      
      // Add listeners for updated, closed, attached, replaced states
      getAllTabs("startup");
      
      
      // Set context menus based on settings
      setContextMenu();
      
      
      // Set alarm for weekly stats notification, if enabled
      setupWeeklyStatsAlarm(st.showWeeklyStatsNotifications);
      
      
      setVisibleState(extensionEnabled);
      
      
      // Set tabList cleaner alarm
      chrome.alarms.create(ALARM_TABCLEANER, {
        delayInMinutes: 0,
        periodInMinutes: 2
      });
      
      // Set alarm to check for duplicates after 2 minutes
      chrome.alarms.create(ALARM_EXTENSION_INSTALLED_CHECK_DUPLICATES, {"delayInMinutes": 2});
      
    });
  });
});


/**
 * 
 * On Install/Update, track version numbers in GA
 * On Install, also add unInstall URL
 * 
 */
chrome.runtime.onInstalled.addListener(details => {
  console.log("onInstalled", details);
  
  if(details.reason !== "chrome_update"){
    
    let version = chrome.app.getDetails().version;
    
    //Log versions to Google Analytics
    {
      trackButton("appVersion", version);
      trackButton("previousVersion", details.previousVersion);
      trackButton("chromeVersion", getChromeVersion());
      trackButton("appUpdateType", details.reason, version);
    }
    
    
    // move donated
    // Added 19/05/2017 - remove in 6 months
    if(details.reason === "update" && localStorage.donateMoved !== "true"){
      chrome.storage.local.get({
        "donated": DEFAULT_DONATED,
      }, lst => 
        chrome.storage.sync.get({
          "donated": DEFAULT_DONATED
        }, sst => 
          chrome.storage.sync.set({"donated": lst.donated || sst.donated}, _ => {
            chrome.storage.local.remove("donated");
            localStorage.donateMoved = "true";
          })
        )
      );
    }
    
    
    // set ls, open options
    if(details.reason === "install"){
      
      chrome.storage.sync.get({"syncStorage": DEFAULT_SYNCSTORAGE}, sst => {
        console.log("syncStorage", sst.syncStorage);
        // If syncStorage is true, fetch remote settings, else do nothing (keep local/default ones)
        if(sst.syncStorage)
          swapStorage(true);
        
        // Set alarm for 1 min from now to check for duplicates
        chrome.alarms.create(ALARM_EXTENSION_INSTALLED_CHECK_DUPLICATES, {"delayInMinutes": 1});
      });
    }
    
    // Set UNINSTALL_URL
    chrome.management.getSelf(e => {
      if(e.installType != "development")
        chrome.runtime.setUninstallURL(UNINSTALL_URL);
    });
    
    // Show notification if install, or upgradeNotification is true
    if(details.reason === "install" || upgradeNotification){
      showNotification({
        title: chrome.i18n.getMessage("shortName") + " " + (details.reason == 'install' ? "Installed" : "Updated"),
        message: "Extension '" + chrome.i18n.getMessage("appName") + "' was " + (details.reason == 'install' ? "installed." : "updated to latest version."),
        contextMessage: (details.reason == 'install' ? "Installed version " + version : "Upgraded to " + version + " from " + details.previousVersion),
        requireInteraction: false,
        id: NOTIFICATION_EXTENSION_UPDATED,
        isClickable: true,
        buttons: [{
          title: "See what's new in this update",
          iconUrl: ICON_SHOW_CHANGE_NOTES
        }],
      });
    }
    
    // move pocketNotificationCount from localStorage to chrome.storage.sync
    // Added 20/05/2017 - remove in 6 months
    if(localStorage.showPocketNotificationQuery){
      chrome.storage.sync.set({
        "pocketNotificationCount": JSON.parse(localStorage.showPocketNotificationQuery)
      }, _ => localStorage.removeItem("showPocketNotificationQuery"));
    }
    
  }
  
  if(!isFirstTabCreated)
    getAllTabs("update");
  isFirstTabCreated = true;
  
});


// Add listener for extension updates
chrome.runtime.onUpdateAvailable.addListener(details => chrome.runtime.reload());
  

chrome.browserAction.onClicked.addListener(_ => {
  ls.get({
    "browserAction": DEFAULT_BROWSERACTION
  }, st => {
    
    switch(st.browserAction){
      
      case BROWSER_ACTION_DUPLICATE:
        trackButton(GA_BROWSER_ACTION_BUTTON_TRACK, ACTION_DUPLICATE_TAB);
        duplicateThisTab();
        break;
        
      case BROWSER_ACTION_WHITELIST:
        trackButton(GA_BROWSER_ACTION_BUTTON_TRACK, ACTION_ADD_TO_WHITELIST);
        whitelistThisLink();
        break;
        
      case BROWSER_ACTION_WHITELIST_DOMAIN:
        trackButton(GA_BROWSER_ACTION_BUTTON_TRACK, ACTION_ADD_TO_WHITELIST_DOMAIN);
        whitelistThisDomain();
        break;
        
      case BROWSER_ACTION_MOVE_TO_LAST:
        trackButton(GA_BROWSER_ACTION_BUTTON_TRACK, ACTION_MOVE_TO_LAST);
        moveToLast();
        break;
        
      case BROWSER_ACTION_TOGGLESTATE:
        trackButton(GA_BROWSER_ACTION_BUTTON_TRACK, ACTION_TOGGLE_EXTENSION_STATE);
        toggleState();
        break;
    }
  });
});


chrome.storage.onChanged.addListener((changes, areaName) => {
  
  if(areaName === SYNC_STORAGE_NAME && 
    changes.hasOwnProperty("syncStorage") && 
    changes["syncStorage"].hasOwnProperty("newValue")){
    
    swapStorage(changes["syncStorage"].newValue);
  }
  
  if(changes.hasOwnProperty("allowDuplicatesAcrossWindows") && changes["allowDuplicatesAcrossWindows"].hasOwnProperty("newValue"))
    allowDuplicatesAcrossWindows = changes["allowDuplicatesAcrossWindows"].newValue;
  
  if(changes.hasOwnProperty("ignoreHash") && changes["ignoreHash"].hasOwnProperty("newValue"))
    ignoreHash = changes["ignoreHash"].newValue;
  
  if(changes.hasOwnProperty("showCount") && changes["showCount"].hasOwnProperty("newValue"))
    showCount = changes["showCount"].newValue;
  
  if(changes.hasOwnProperty("refreshOriginal") && changes["refreshOriginal"].hasOwnProperty("newValue"))
    refreshOriginal = changes["refreshOriginal"].newValue;
  
  if(changes.hasOwnProperty("moveOriginalTab") && changes["moveOriginalTab"].hasOwnProperty("newValue"))
    moveOriginalTab = changes["moveOriginalTab"].newValue;
  
  if(changes.hasOwnProperty("whitelist") && changes["whitelist"].hasOwnProperty("newValue")){
    whitelist = changes["whitelist"].newValue;
    makeWhitelistRegex();
  }
});


chrome.commands.onCommand.addListener(command => {
  switch(command){
    
    case COMMAND_DUPLICATE:
      trackButton(GA_COMMAND_TRACK, ACTION_DUPLICATE_TAB);
      duplicateThisTab();
      break;
      
    case COMMAND_WHITELIST:
      trackButton(GA_COMMAND_TRACK, ACTION_ADD_TO_WHITELIST);
      whitelistThisLink();
      break;
      
    case COMMAND_WHITELIST_DOMAIN:
      trackButton(GA_COMMAND_TRACK, ACTION_ADD_TO_WHITELIST_DOMAIN);
      whitelistThisDomain();
      break;
      
    case COMMAND_TOGGLE_STATE:
      trackButton(GA_COMMAND_TRACK, ACTION_TOGGLE_EXTENSION_STATE, toggleState());
      break;
      
    case COMMAND_MOVE_TO_LAST:
      trackButton(GA_COMMAND_TRACK, ACTION_MOVE_TO_LAST);
      moveToLast();
      break;
      
    default:
      console.warn("Unknown command:", command);
      //Do Something
  }
});


chrome.contextMenus.onClicked.addListener(contextMenuHandler);


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  if(request && request.type){
    
    switch(request.type){
      
      case MESSAGE_GET_TAB_LIST:
        sendResponse({
          "tabList": tabList, 
          "windowId": sender.tab.windowId,
          "state": extensionEnabled,
        });
        break;
      
      case MESSAGE_SWITCH_TO_TAB:{
        
        if(request.tabId && sender.tab && sender.tab.id){
          chrome.tabs.get(request.tabId, originalTab => {
            
            if(!chrome.runtime.lastError && originalTab){
              chrome.tabs.get(sender.tab.id, duplicateTab => {
                
                if(!chrome.runtime.lastError && duplicateTab){
                  
                  closeAndSwitch({
                    "originalTab": originalTab,
                    "duplicateTab": duplicateTab,
                    "fromContentScript": true,
                    "ctrlKey": request.ctrlKey,
                    "shiftKey": request.shiftKey,
                  });
                  
                  sendResponse(true);
                  
                }
                
                else
                  sendResponse(false);
                
              });
            }
            
            else
              sendResponse(false);
            
          });
          
          return true;
        }
        
        else
          sendResponse(false);
        
        break;
      }
      
      default:
        console.warn("Unidentified request %s from %s", request.type, sender, request);
    }
    
  }
});


function setupWeeklyStatsAlarm(set){
  if(set)
    localSt.get({
      "weeklyNotificationTimestamp": DEFAULT_WEEKLYNOTIFICATIONTIMESTAMP
    }, st => 
      chrome.alarms.create(ALARM_STATS, {
        "periodInMinutes": 7*24*60, // 1 Week
        "when": st.weeklyNotificationTimestamp + 7*24*60*60*1000,
      })
    );
  
  else
    chrome.alarms.clear(ALARM_STATS);
}


function swapStorage(syncStorage, callback){
  
  // Set ls variable
  setLS(syncStorage);
  
  // Move stuff to other storage
  if(syncStorage){
    
    // Move from local to sync
    chrome.storage.local.get(lSt => {
      chrome.storage.sync.get(sSt => {
        
        let st = Object.keys(lSt).reduce((acc, key) => {
          acc[key] = sSt.hasOwnProperty(key) && sSt[key] !== undefined ? sSt[key] : lSt[key];
          return acc;
        }, {});
        
        
        // closed duplicates & timestamp don't transfer to sync storage
        delete(st["closedDuplicates"]);
        delete(st["weeklyNotificationTimestamp"]);
        
        
        // Merge whitelist
        if(!st.whitelist || st.whitelist.length < 1)
          st[whitelist] = lSt.whitelist;
        
        else
          st.whitelist = st.whitelist.concat(lSt.whitelist.filter(item => !st.whitelist.includes(item)));
        
        // save updated/merged data to sync storage
        chrome.storage.sync.set(st, callback);
      });
    });
  }
  
  else {
    
    // Move from sync to local
    chrome.storage.sync.get(st => {
      // "syncStorage" setting always stays in storage.sync
      delete(st["syncStorage"]);
      
      chrome.storage.local.set(st, callback);
    });
  }
}


function updateBrowserActionTitle(title, tabId){
  title = title ? title.toString() : `${shortName} is ${extensionEnabled}. You have ${tabList.length} tabs open.`;
  
  let titleObject = {"title": title};
  if(tabId)
    titleObject["tabId"] = tabId;
  
  chrome.browserAction.setTitle(titleObject);
}


function setBadgeText(text, tabId){
  if(!showCount)
    chrome.browserAction.setBadgeText({"text": ""});
  
  else {
    let badgeText = {"text": text.toString()};
    if(tabId)
      badgeText["tabId"] = tabId;
    
    chrome.browserAction.setBadgeText(badgeText);
    updateBrowserActionTitle(null, tabId);
  }
}


function setBadgeColour(colour, tabId){
  let badgeColor = {"color": colour};
  if(tabId)
    badgeColor["tabId"] = tabId;
  
  chrome.browserAction.setBadgeBackgroundColor(badgeColor);
}

function setBrowserActionIcon(isOn){
  if(isOn)
    chrome.browserAction.setIcon({
      "path": {
        "16": chrome.runtime.getURL("img/cf16.png"),
        "24": chrome.runtime.getURL("img/cf24.png"),
        "32": chrome.runtime.getURL("img/cf32.png")
      }
    });
  else
    chrome.browserAction.setIcon({
      "path": {
        "16": chrome.runtime.getURL("img/cf-disabled16.png"),
        "24": chrome.runtime.getURL("img/cf-disabled24.png"),
        "32": chrome.runtime.getURL("img/cf-disabled32.png")
      }
    });
}


function setBadgeAction(action){
  chrome.browserAction.setPopup({"popup": action === "popup" ? POPUP_URL : ""});
}


function setContextMenu(){
  
  // Remove all previous menus
  chrome.contextMenus.removeAll(_=>{
    
    let err = chrome.runtime.lastError;
    if(err)
      console.warn(err);
    
    // Get list of menus to show from settings
    ls.get({
      "showContextMenu": DEFAULT_SHOWCONTEXTMENU
    }, st => {
      
      // Get all commands
      chrome.commands.getAll(commands => {
        
        let commandsObj;
        
        if(commands && commands.length > 0)
          commandsObj = arrayToObject(commands, "name");
        
        let pageContextMenus = st["showContextMenu"];
        
        if(pageContextMenus){
          
          pageContextMenus.split(",").forEach(contextMenuItem => {
            
            // Get title from messages.json, and append command shortcut, if any
            let title = chrome.i18n.getMessage("contextMenuText_"+contextMenuItem) + (commandsObj[contextMenuItem] && commandsObj[contextMenuItem].shortcut ? " (" + commandsObj[contextMenuItem].shortcut + ")" : "");
            
            if(title){
              
              chrome.contextMenus.create({
                "type": "normal",
                "id": "content_"+contextMenuItem,
                "title": title,
                "contexts": ["page"],
              }, contextMenuCreatorCallback);
              
            } 
            
            else
              console.warn("Didn't find any title for", contextMenuItem);
            
          });
          
        }
        
        
        BROWSER_ACTION_CONTEXT_MENU_LIST.forEach(contextMenuItem => {
          
          let title = chrome.i18n.getMessage("contextMenuText_"+contextMenuItem);
          
          if(title){
            
            title += commandsObj[contextMenuItem] && commandsObj[contextMenuItem].shortcut ? " (" + commandsObj[contextMenuItem].shortcut + ")" : "";
            
            chrome.contextMenus.create({
              type: contextMenuItem === "toggleState_separator" ? "separator" : "normal",
              id: "browserAction_"+contextMenuItem,
              title: title,
              contexts: ["browser_action"],
            }, contextMenuCreatorCallback);
            
          } 
          
          else if(contextMenuItem !== "toggleState_separator")
            console.warn("Didn't find any title for", contextMenuItem);
          
        });
        
      });
      
    });
    
  });
}


function contextMenuHandler(info, tab){
  
  switch(info.menuItemId){
    case BROWSER_ACTION_CONTEXT_MENU_TOGGLESTATE:
      trackButton(GA_BROWSER_ACTION_CONTEXT_MENU_TRACK, ACTION_TOGGLE_EXTENSION_STATE, toggleState());
      break;
      
    case BROWSER_ACTION_CONTEXT_MENU_DUPLICATE:
      trackButton(GA_BROWSER_ACTION_CONTEXT_MENU_TRACK, ACTION_DUPLICATE_TAB);
      duplicateThisTab();
      break;
      
    case BROWSER_ACTION_CONTEXT_MENU_WHITELIST:
      trackButton(GA_BROWSER_ACTION_CONTEXT_MENU_TRACK, ACTION_ADD_TO_WHITELIST);
      whitelistThisLink(tab.url);
      break;
      
    case BROWSER_ACTION_CONTEXT_MENU_RESTORELOST:
      trackButton(GA_BROWSER_ACTION_CONTEXT_MENU_TRACK, ACTION_RESTORE_LOST_TABS);
      restoreLost();
      break;
      
    case BROWSER_ACTION_CONTEXT_MENU_CLOSEALLDUPLICATES:
      trackButton(GA_BROWSER_ACTION_CONTEXT_MENU_TRACK, ACTION_CLOSE_PRE_EXISTING_DUPLICATES);
      removePreExistingDuplicateTabs();
      break;
    
    case CONTENT_CONTEXT_MENU_DUPLICATE:
      trackButton(GA_PAGE_CONTEXT_MENU_TRACK, ACTION_DUPLICATE_TAB);
      duplicateThisTab();
      break;
    
    case CONTENT_CONTEXT_MENU_WHITELIST:
      trackButton(GA_PAGE_CONTEXT_MENU_TRACK, ACTION_ADD_TO_WHITELIST);
      whitelistThisLink(tab.url);
      break;
    
    case CONTENT_CONTEXT_MENU_WHITELIST_DOMAIN:
      trackButton(GA_PAGE_CONTEXT_MENU_TRACK, ACTION_ADD_TO_WHITELIST_DOMAIN);
      whitelistThisDomain(tab.url);
      break;
    
    case CONTENT_CONTEXT_MENU_MOVETOLAST:
      trackButton(GA_PAGE_CONTEXT_MENU_TRACK, ACTION_MOVE_TO_LAST);
      moveToLast(tab.id);
      break;
    
    default:
      console.warn("Unidentified context menu", info.menuItemId);
  }
}


function contextMenuCreatorCallback(){
  let er = chrome.runtime.lastError;
  if(er)
    console.warn("if context menu not created, it should show here: ", er);
}


/**
 * showNotification
 * Displays a chrome.notification for the extension with click through URLs and event tracking 
 * @param {object} notif Object with details of notification - title, message, context, iconType
 * @return {null} null
 */
function showNotification(notif){
  
  chrome.storage.sync.get({"donated": DEFAULT_DONATED}, sst => {
    
    let options = {
      contextMessage: notif.contextMessage || "",
      iconUrl: notif.iconUrl || ICON_NOTIFICATION,
      isClickable: notif.isClickable || false,
      message: notif.message,
      requireInteraction: !!notif.requireInteraction || false,
      title: notif.title || "",
      type: notif.type || "basic",
    };
    
    options.buttons = notif.buttons || [];
    
    //If no buttons, or less than 2 buttons, add a support/donate button
    if(!sst.donated &&
      (!options.buttons || options.buttons.length < 2)){
        options.buttons.push({
          title: "Support ClutterFree!",
          iconUrl: ICON_DONATE,
        });
    }
    
    chrome.notifications.create(notif.id || "", options, id => console.log("notification: ", id));
  });
}


function getChromeVersion(){
  return /Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1] || "none found";
}


/**
 * arrayToObject
 * Converts an array of objects into an object, with each array item indexed by the key of that object. Key value should be unique, and present, for each object in the array.
 * @param {array} arr Array of objects to convert
 * @param {string} key Key on which to index
 * @return {object} Converted object
 */
function arrayToObject(arr, key){
  return arr.reduce((acc, item) => {
    if(item[key])
      acc[item[key]] = item;
    return acc;
  }, {});
}


function popup_switchToTab(tabId){
  chrome.tabs.get(tabId, tab =>{
    if(!chrome.runtime.lastError && tab)
      chrome.windows.update(tab.windowId, {focused: true}, _ => 
        chrome.tabs.update(tabId, {active: true})
      );
  });
}
