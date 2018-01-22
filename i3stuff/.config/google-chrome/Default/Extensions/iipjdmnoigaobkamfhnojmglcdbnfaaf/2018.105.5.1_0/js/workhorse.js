// @checked
chrome.alarms.onAlarm.addListener(alarm => {
  
  switch(alarm.name){
    
    case ALARM_TABCLEANER:
      removeDuplicatesFromTabList();
      break;
    
    case ALARM_STATS:
      weeklyNotification();
      break;
      
    case ALARM_EXTENSION_INSTALLED_CHECK_DUPLICATES:
      if(extensionEnabled){
        
        // Check for duplicates and show notification if there's any
        let duplicateCount = markDuplicateTabs();
        
        if(duplicateCount > 0){
          
          showNotification({
            id: NOTIFICATION_DUPLICATES_FOUND,
            title: "Duplicate tabs found",
            message: `${duplicateCount} duplicate tabs found. Close them?`,
            contextMessage: "Click notification to dismiss.",
            buttons: [
              {
                title: "Close duplicate tabs",
                iconUrl: ICON_CLOSE_DUPLICATES,
              },
              {
                title: "Keep all tabs",
                iconUrl: ICON_KEEP_ALL_TABS,
              }
            ]
          });
        }
        
      }
      break;
      
    default:
      console.warn("Unidentified alarm: " + alarm.name);
  }
});


// @checked
function weeklyNotification(){
  
  localSt.get({
    "closedDuplicates" : DEFAULT_CLOSED_DUPLICATES, 
    "weeklyNotificationTimestamp" : DEFAULT_WEEKLYNOTIFICATIONTIMESTAMP
  }, st => {
    
    // Calculate this week's total
    let notificationOptions;
    
    let count = st.closedDuplicates.filter(duplicate => duplicate.timestamp > st.weeklyNotificationTimestamp).length
    
    // Notification if at least MIN_DUPLICATES_NOTIFICATION_DISPLAY tabs were closed in the week
    if(count > MIN_DUPLICATES_NOTIFICATION_DISPLAY && st.weeklyNotificationTimestamp > 0){
      
      // Track notification display in GA
      trackButton(NOTIFICATION_WEEKLY_STATS, "displayed_weekly", count);
      
      notificationOptions = {
        id: NOTIFICATION_WEEKLY_STATS,
        title: "Another Clutter Free week",
        message: count + " duplicate tabs prevented this week!",
      };
      
      if(st.closedDuplicates.length > MIN_SHOW_STATS_PAGE){
        notificationOptions.buttons = [{
          title: "See details",
          iconUrl: ICON_OPEN_STATS,
        }];
      }
      
      // Show notification
      showNotification(notificationOptions);
      
    } 
    
    // Notification if at least ONE tab was closed this week, and MIN_SHOW_STATS_PAGE total tabs have been closed to date
    else if(st.closedDuplicates.length > MIN_SHOW_STATS_PAGE && count > 0){
      
      // Track notification display in GA
      trackButton(NOTIFICATION_WEEKLY_STATS, "displayed_total", st.closedDuplicates.length);
      
      notificationOptions = {
        id: NOTIFICATION_WEEKLY_STATS,
        title: "Clutter Free keeping lean",
        message: st.closedDuplicates.length + " duplicate tabs prevented so far!",
      };
      
      notificationOptions.buttons = [{
        title: "See details",
        iconUrl: ICON_OPEN_STATS
      }];
      
      // Show notification
      showNotification(notificationOptions);
      
    } 
    
    else
      console.log("No notification condition satisfied");
    
    // Save new timestamp from which next notification's total will be calculated
    localSt.set({"weeklyNotificationTimestamp": Date.now()});
  });  
}


// @checked
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  
  switch(notificationId){
    
    case NOTIFICATION_WEEKLY_STATS:{
      if(buttonIndex === 0){
        // Track opening of stats page
        trackButton(GA_NOTIFICATION_TRACK, notificationId, BUTTON_SHOW_STATS);
        
        // Open stats page
        chrome.tabs.create({url: chrome.runtime.getURL("stats.html")});
        
      } else {
        
        // Donation clicked
        trackButton(GA_NOTIFICATION_TRACK, notificationId, BUTTON_DONATE);
        setDonated(true, notificationId);
        
      }
      break;
    }
      
    case NOTIFICATION_EXTENSION_UPDATED:{
      if(buttonIndex === 0){
        
        trackButton(GA_NOTIFICATION_TRACK, notificationId, BUTTON_SHOW_CHANGES);
        chrome.tabs.create({url: UPDATE_NOTES_URL});
        
      } else {
        
        // Donation clicked
        trackButton(GA_NOTIFICATION_TRACK, notificationId, BUTTON_DONATE);
        setDonated(true, notificationId);
        
      }
      break;
    }
      
    case NOTIFICATION_DUPLICATES_FOUND:{
      switch(buttonIndex){
        
        case 0:{
          // Close duplicate tabs
          trackButton(GA_NOTIFICATION_TRACK, notificationId, BUTTON_CLOSE_DUPLICATES);
          removePreExistingDuplicateTabs(true);
          break;
        }
          
        case 1:{
          // Mark (marked) duplicates as unmarked
          trackButton(GA_NOTIFICATION_TRACK, notificationId, BUTTON_KEEP_DUPLICATES);
          
          tabList.forEach(tab => {
            if(tab.isDuplicate)
              delete tab.isDuplicate;
          });
          
          break;
        }
        
        case 2:{
          // Donation clicked
          trackButton(GA_NOTIFICATION_TRACK, notificationId, BUTTON_DONATE);
          setDonated(true, notificationId);
          break;
        }
          
      }
      break;
    }
    
    case NOTIFICATION_TABS_RESTORED:{
      // Donation clicked
      trackButton(GA_NOTIFICATION_TRACK, notificationId, BUTTON_DONATE);
      setDonated(true, notificationId);
      break;
    }
    
    case NOTIFICATION_URL_WHITELISTED:{
      switch(buttonIndex){
        
        case 0:{
          // Open Settings
          trackButton(GA_NOTIFICATION_TRACK, notificationId, BUTTON_OPEN_OPTIONS);
          chrome.runtime.openOptionsPage();
          break;
        }
        
        case 1:{
          // Donation clicked
          trackButton(GA_NOTIFICATION_TRACK, notificationId, BUTTON_DONATE);
          setDonated(true, notificationId);
          break;
        }
      }
      break;
    }
    
    case NOTIFICATION_DUPLICATE_CLOSED:{
      switch(buttonIndex){
        
        case 0:{
          // Open original
          if(duplicateClosedNotificationTabId !== null){
            trackButton(GA_NOTIFICATION_TRACK, notificationId, BUTTON_GO_TO_ORIGINAL);
            chrome.tabs.update(duplicateClosedNotificationTabId, {active: true});
            duplicateClosedNotificationTabId = null;
          }
          break;
        }
        
        case 1:{
          // Open Settings
          trackButton(GA_NOTIFICATION_TRACK, notificationId, BUTTON_OPEN_OPTIONS);
          chrome.runtime.openOptionsPage();
          break;
        }
        
      }
      break;
    }
    
    default:
      console.warn("Unknown notification: ", notificationId);
  }
  
  
  // Clear notification
  chrome.notifications.clear(notificationId);
});


// @checked
chrome.notifications.onClicked.addListener(notificationId => {
  
  chrome.notifications.clear(notificationId, _ => {
    
    switch(notificationId){
      
      case NOTIFICATION_EXTENSION_UPDATED:{
        trackButton(GA_NOTIFICATION_TRACK, notificationId, ACTION_SHOW_CHANGES);
        
        chrome.tabs.create({url: UPDATE_NOTES_URL});
        break;
      }
        
      case NOTIFICATION_WEEKLY_STATS:{
        // Track opening of stats page
        trackButton(GA_NOTIFICATION_TRACK, notificationId, ACTION_SHOW_STATS);
        
        // Open stats page
        chrome.tabs.create({url: chrome.runtime.getURL("stats.html")});
        break;
      }
        
      case NOTIFICATION_TABS_RESTORED:
        // Do nothing
        break;
      
      case NOTIFICATION_URL_WHITELISTED:
        trackButton(GA_NOTIFICATION_TRACK, notificationId, ACTION_OPEN_SETTINGS);
        chrome.runtime.openOptionsPage();
        break;
      
      case NOTIFICATION_DUPLICATE_CLOSED:{
        // Open original
        if(duplicateClosedNotificationTabId !== null){
          trackButton(GA_NOTIFICATION_TRACK, notificationId, ACTION_GO_TO_ORIGINAL);
          chrome.tabs.update(duplicateClosedNotificationTabId, {active: true});
          duplicateClosedNotificationTabId = null;
        }
        break;
      }
      
      default:
        console.warn("Unidentified notification", notificationId);
    }
  });
});


// @checked
chrome.tabs.onCreated.addListener(tab => {
  
  if(!isFirstTabCreated){
    
    if(extensionEnabled == undefined) fetchState();
    
    getAllTabs("update");
    isFirstTabCreated = true;
    
  }
});


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  
  if(tab.incognito)
    return;
  
  if(!isFirstTabCreated || tabList.length === 0){
    
    if(extensionEnabled == undefined) fetchState();
    
    getAllTabs("update");
    isFirstTabCreated = true;
    
  }
  
  let initListIndex = findInList({
    searchList: INIT,
    searchKey: 'tabId',
    searchValue: tab.id
  });
  
  // Do not check for duplicates in the tabs from initList till they've completed loading one-time
  if(initListIndex > -1 && (initList[initListIndex].status != "complete")){
    
    // update URL in initList if changeInfo.url has changed
    if(!!changeInfo.url){
      
      updateList({
        'list' : INIT,
        'arrIndex' : initListIndex,
        'update' : 'url',
        'newValue' : tab.url,
      });
      
    }
    
    // update initListIndex.status to if changeInfo.status has changed
    if(!!changeInfo.status){
      
      updateList({
        "list" : INIT,
        "arrIndex" : initListIndex,
        "update" : "status",
        "newValue" : changeInfo.status,
      });
      
    }
    
    if(changeInfo.pinned != undefined){
      updateList({
        "list" : INIT,
        "arrIndex": initListIndex,
        "update": "pinned",
        "newValue": changeInfo.pinned,
      });
    }
  } 
  
  // Only need to proceed if url is being updated
  else if(!!changeInfo.url){
    
    let tabListIndex = findInList({
      searchKey: 'tabId',
      searchValue: tabId
    });
    
    
    // Save changes to pinned state
    if(changeInfo.pinned !== undefined && tabListIndex > -1){
      updateList({
        "update": "pinned",
        "newValue": changeInfo.pinned,
        "arrIndex": tabListIndex
      });
    }

    
    // If extension state == "off", save updated tab to list and return
    if(!extensionEnabled || inWhiteList(changeInfo.url)){
      
      // New tab
      if(tabListIndex == -1)
        addToList(tab);
      
      // update url for the tab in list
      else
        updateList({
          "update" : "url",
          "arrIndex" : tabListIndex,
          "newValue" : tab.url,
          "completed": changeInfo.status === "complete"
        });
      
    } 
    
    // Extension is on, url not in whitelist, so proceed
    else {
      
      // Check if url is already in tab list
      let urlListIndex = findInList({
        searchKey: 'url',
        windowId: tab.windowId,
        searchValue: changeInfo.url
      });
      
      // Also check if duplicate tab is not 'self'
      if(urlListIndex > -1 && tabList[urlListIndex].tabId !== tabId){
        
        //
        // We have a duplicate tab, close this and switch to original
        //
        
        // Check if old tab really exists in browser
        chrome.tabs.get(tabList[urlListIndex].tabId, oldTab => {
          
          let err = chrome.runtime.lastError;
          
          // Old tab doesn't exist anymore
          if(err){
            
            console.log("last-error: ", err);
            
            // Remove old tab from tabList
            tabList.splice(urlListIndex, 1);
            
            // Add new tab to tabList
            if(tabListIndex == -1)
              addToList(tab);
            
            // Update url for new tab in tabList
            else
              updateList({
                "update" : "url",
                "arrIndex" : tabListIndex,
                "newValue" : tab.url,
                "completed": changeInfo.status === "complete"
              });
            
          } 
          
          // Old tab exists, so close & switch
          else {
            
            closeAndSwitch({
              "originalTab": oldTab,
              "duplicateTab": tab,
            });
            
          }
          
          setBadgeText(tabList.length);
          
        });
        
      } 
      
      else {
        
        // New unique url
        // If tab already exists, update, else add
        
        // New tab
        if(tabListIndex == -1)
          addToList(tab);
        
        // update url for the tab in list
        else
          updateList({
            "update" : "url",
            "arrIndex" : tabListIndex,
            "newValue" : tab.url,
            "completed": changeInfo.status === "complete"
          });
        
      }
      
    }
  }
  
  else if(changeInfo.pinned != undefined){
    
    let tabListIndex = findInList({
      searchKey: 'tabId',
      searchValue: tabId
    });
    
    if(tabListIndex > -1)
      // Save changes to pinned state
      updateList({
        "update": "pinned",
        "newValue": changeInfo.pinned,
        "arrIndex": tabListIndex
      });
  }
  
  
  setBadgeText(tabList.length);
  
  
  if(POCKET_PAGE_REGEX.test(tab.url)){
    
    if(!!changeInfo.url)
      chrome.tabs.sendMessage(tab.id, {type: "urlchange"});
    
    // If page loaded, and it's a Pocket page, insert cf script and css
    if(changeInfo.status === "complete")
      chrome.tabs.insertCSS(tabId, {file: "css/pocket_cf.css"}, _ => 
        chrome.tabs.executeScript(tabId, {file: "js/ext/jquery-2.1.1.min.js"}, _ => 
          chrome.tabs.executeScript(tabId, {file: "js/pocket_cf.js"})
        )
      );
    
  }
});


// @checked
chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  
  if(!isFirstTabCreated){
    
    if(extensionEnabled == undefined) fetchState();
    
    getAllTabs("update");
    isFirstTabCreated = true;
    
  }
  
  else {
    
    // Find removed tabId in tabList
    let tabListIndex = findInList({
      searchKey: 'tabId',
      searchValue: removedTabId
    });

    
    // Found
    if(tabListIndex > -1){
      
      // update to new tabId
      updateList({
        'update' : 'tabId',
        'arrIndex' : tabListIndex,
        'newValue' : addedTabId
      });
      
      chrome.tabs.get(addedTabId, tab => {
        
        // If url not undefined
        if(!tab.url)
          return;
        
        // If extension state == "off", save updated tab to list and return
        if(!extensionEnabled || inWhiteList(tab.url)){
          
          // update url for the tab in list
          updateList({
            'update' : 'url',
            'arrIndex' : tabListIndex,
            'newValue' : tab.url
          });
          
          console.log("Tab: " + tab.id + ' Updated. List size: ' + tabList.length + ".", "(In Replace - inwhitelist or dedup off)");
          
        }
        
        
        else {
          
          // Check if url is already in tab list
          let urlListIndex = findInList({
            "searchKey": 'url',
            "windowId": tab.windowId,
            "searchValue": tab.url
          });
          
          if(urlListIndex > -1 && tabList[urlListIndex].tabId != tab.id){
            
            // If url is already in list (urlIndex > -1 && urlIndex != tabListIndex) 
            // We have a duplicate tab, close this and switch to original
            chrome.tabs.get(tabList[urlListIndex].tabId, originalTab => {
              if(originalTab)
                closeAndSwitch({
                  "originalTab": originalTab,
                  "duplicateTab": tab,
                });
            });
            
            console.log("Tab: " + tab.id + ' Duplicate prevented. List size: ' + tabList.length + ".", "(In Replace - close&switch called)");
            
          } 
          
          else {
            
            // Else update this tab's url
            updateList({
              'update' : 'url',
              'arrIndex' : tabListIndex,
              'newValue' : tab.url
            });
            
            console.log("Tab: " + tab.id + ' Replaced. List size: ' + tabList.length + ".", "(In Replace - non-duplicate, URL updated)");
            
          }
          
          setBadgeText(tabList.length);
          
        }
        
      });
    } 
    
    else 
      setBadgeText(tabList.length);
  }
});


// @checked
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if(!isFirstTabCreated){
    
    if(extensionEnabled == undefined) fetchState();
    
    getAllTabs("update");
    isFirstTabCreated = true;
    
  }
  
  else {
    
    let tabListIndex = findInList({
      searchKey: 'tabId',
      searchValue: tabId
    });
    
    if(tabListIndex > -1)
      removeFromList(tabListIndex);
    
    
    setBadgeText(tabList.length);
    
    console.log("Tab: " + tabId + ' Removed. List size: ' + tabList.length);
  }
});


// @checked
chrome.windows.onRemoved.addListener(windowId => {
  if(!isFirstTabCreated){
    
    if(extensionEnabled == undefined) fetchState();
    
    getAllTabs("update");
    isFirstTabCreated = true;
    
  }
  
  else {
    
    for (let i = tabList.length - 1; i >= 0; i--) {
      if(tabList[i].windowId == windowId)
        removeFromList(i);
    }
    
    setBadgeText(tabList.length);
    console.log("All tabs for window: " + windowId + ' removed in onDetached. List size: ' + tabList.length);
    
  }
});


// @checked
chrome.tabs.onDetached.addListener((tabId, detachInfo) => {
  
  if(!isFirstTabCreated){
    
    if(extensionEnabled == undefined) fetchState();
    
    getAllTabs("update");
    isFirstTabCreated = true;
    
  }
  
  else {
    
    let tabListIndex = findInList({
      searchKey: 'tabId',
      searchValue: tabId
    });
    
    if(tabListIndex > -1)
      removeFromList(tabListIndex);
    
    
    setBadgeText(tabList.length);
    console.log("Tab: " + tabId + ' removed in onDetached. List size: ' + tabList.length);
    
  }
});


// @checked
chrome.tabs.onAttached.addListener((tabId, attachInfo) => {
  
  if(!isFirstTabCreated){
    
    if(extensionEnabled == undefined) fetchState();
    
    getAllTabs("update");
    isFirstTabCreated = true;
    
  }
  
  else {
    
    chrome.tabs.get(tabId, tab => {
      if(!tab.incognito){
        addToList(tab);
        console.log("Tab: " + tabId + ' added in onAttached;  List size: ' + tabList.length);
      }
      
      setBadgeText(tabList.length);
    });
  }
});


chrome.webRequest.onBeforeRedirect.addListener(details => {
    
    if(details.type !== "main_frame")
      return;
    
    // console.log(`
    // url: ${details.url},
    // redirectUrl: ${details.redirectUrl},
    // tabId: ${details.tabId},
    // resourceType: ${details.type},
    // isMainFrame: ${details.type === "main_frame"},
    // `);
    
    // Check if tab is already in list
    let tabListIndex = findInList({
      searchKey: 'tabId',
      searchValue: details.tabId
    });
    
    if(tabListIndex > -1)
      tabList[tabListIndex].redirecting = true;
    
  },
  {urls: ["<all_urls>"]}
);


// @checked
function addToList(newTab, isInitOrBoth){
  newTab.url = newTab.url.replace(TRAILING_SLASH_REGEX,"$1$3");
  
  if(isInitOrBoth == INIT || isInitOrBoth == "both"){
    
    initList.push({
      tabId : newTab.id,
      url : newTab.url,
      windowId: newTab.windowId,
      status: newTab.status, //init
      pinned: newTab.pinned
    });
    
    if(isInitOrBoth == INIT)
      return;
    
  }
  
  tabList.push({
    tabId : newTab.id,
    url : newTab.url,
    previousUrl : "chrome://newtab",
    windowId: newTab.windowId,
    pinned: newTab.pinned
  });
  
  updateTabListChange({
    "type": MESSAGE_TAB_ADDED,
    "tabId": newTab.id,
    "url": newTab.url
  });
}


// @checked
function updateList(updateObj){
  
  if(updateObj.list && updateObj.list == INIT){
    
    if(updateObj.update === "url")
      updateObj.newValue = updateObj.newValue.replace(TRAILING_SLASH_REGEX,"$1$3");
    
    initList[updateObj.arrIndex][updateObj.update] = updateObj.newValue;
    return initList;
    
  } else {
    
    let oldTabId = tabList[updateObj.arrIndex].tabId;
    
    for (let i=0; i < tabList.length; i++) {
      
      if(tabList[i].tabId === oldTabId) {
        
        if(updateObj.update === "url"){
          
          if(!tabList[i].redirecting)
            tabList[i].previousUrl = tabList[i].url;
          else
            delete tabList[i].redirecting;
          
          updateObj.newValue = updateObj.newValue.replace(TRAILING_SLASH_REGEX,"$1$3");
          
        }
        
        if(updateObj.completed !== undefined)
          tabList[i].completed = updateObj.completed;
        
        tabList[i][updateObj.update] = updateObj.newValue;
      }
      
    }
    
    updateTabListChange({
      "type": MESSAGE_TAB_UPDATED,
      "tabId": oldTabId,
      "url": tabList[updateObj.arrIndex].url
    });
    
    return tabList;
    
  }
}


// @checked
function removeFromList(tabListIndex){
  let oldTabId = tabList[tabListIndex].tabId;
  
  tabList = tabList.filter(tab => tab.tabId !== oldTabId);
  
  updateTabListChange({
    "type": MESSAGE_TAB_REMOVED,
    "tabId": oldTabId
  });
}


// @checked
// {changeType, tabId}
function updateTabListChange(changeObj){
  chrome.tabs.query({}, tabs => 
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        "type": changeObj.type,
        "windowId": tab.windowId,
        "change": changeObj
      });
    })
  );
}


// @checked
function findInList(searchObj){
  
  // Remove any trailing '/' before comparing.
  if(searchObj.searchKey === "url")
    searchObj.searchValue = searchObj.searchValue.replace(TRAILING_SLASH_REGEX,"$1$3").toLowerCase();
  
  
  if(searchObj.searchList && searchObj.searchList == INIT){
    
    if(searchObj.searchKey === "url"){
      
      searchObj.searchValue = searchObj.searchValue.replace(SUSPENDERPREFIX, "");
      
      return initList.findIndex(tab => (!allowDuplicatesAcrossWindows || (allowDuplicatesAcrossWindows && tab.windowId === searchObj.windowId)) && tab.url.replace(SUSPENDERPREFIX, "").toLowerCase() === searchObj.searchValue);
      
    } 
    
    else {
      
      return initList.findIndex(tab => tab[searchObj.searchKey] === searchObj.searchValue);
      
    }
    
  } 
  
  else if(searchObj.searchKey === "url"){
    
    if(ignoreHash){
      
      // Remove hash from searchValue
      let searchURL = searchObj.searchValue.replace(SUSPENDERPREFIX, "").replace(REMOVE_HASH_REGEX, "");
      // let tabListURL = "";
      
      return tabList.findIndex(tab => {
        
        let tabListURL = tab.url.substr(0, tab.url.indexOf("#") > -1 ? tab.url.indexOf("#") : tab.url.length).replace(SUSPENDERPREFIX, "").toLowerCase();
        
        return (!allowDuplicatesAcrossWindows || (allowDuplicatesAcrossWindows && tab.windowId === searchObj.windowId)) && tabListURL === searchURL;
      });
      
      
    }
    
    else {
      
      searchObj.searchValue = searchObj.searchValue.replace(SUSPENDERPREFIX, "");
      
      return tabList.findIndex(tab => (!allowDuplicatesAcrossWindows || (allowDuplicatesAcrossWindows && tab.windowId === searchObj.windowId)) && tab.url.replace(SUSPENDERPREFIX, "").toLowerCase() === searchObj.searchValue);
      
    }
      
  }
    
  else {
    
    return tabList.findIndex(tab => tab[searchObj.searchKey] === searchObj.searchValue);
    
  }
    
  return -1;
}


// @checked
// {originalTab, duplicateTab}
function closeAndSwitch(switchObj){
  
  // Add url to closedDuplicates, for Stats
  localSt.get({
    "closedDuplicates": DEFAULT_CLOSED_DUPLICATES
  }, lst => {
    
    // If URL is from Great Suspender, decode it before saving
    let duplicateURL = switchObj.originalTab.url
      .replace(SUSPENDERPREFIX, "");
    
    // If URL is same as last url, return
    if(lst.closedDuplicates.length > 0 && // at least one entry in the array to compare against
       duplicateURL === lst.closedDuplicates[lst.closedDuplicates.length - 1].url && // same url as current
       lst.closedDuplicates[lst.closedDuplicates.length - 1].timestamp - Date.now() <= 1000) // was added less than a second back
      return;
    
    lst.closedDuplicates.push({
      url: duplicateURL,
      timestamp: Date.now(),
    });
    
    localSt.set({"closedDuplicates": lst.closedDuplicates});
  });
  
  
  chrome.windows.get(switchObj.duplicateTab.windowId, {"populate": true}, duplicateWindow => {
    
    let closeDuplicateTab = false;
    let deleteLater = false;
    
    // Send 'duplicateTab' one back in history, or close it if new
    if(!switchObj.fromContentScript){
      
      let currTab = tabList[findInList({
        searchKey: "tabId",
        searchValue: switchObj.duplicateTab.id
      })];
      
      
      // New tab, from open tab in bg - close it
      if((!switchObj.duplicateTab.active || !currTab || currTab.url === CHROME_NEW_TAB_URL) && !switchObj.duplicateTab.pinned){// && switchObj.duplicateTab.windowId !== switchObj.originalTab.windowId){
        if(duplicateWindow.tabs.length > 1 && moveOriginalTab === MOVE_TAB_TO_DUPLICATE_POSITION)
          chrome.tabs.remove(switchObj.duplicateTab.id);
        else
          deleteLater = true;
        
        closeDuplicateTab = true;
      }
        
      // Send 'duplicateTab' to recorded previousUrl
      else
        chrome.tabs.update(switchObj.duplicateTab.id, {url: currTab.url}); //currTab.previousUrl
      
    }
    
    let makeActive = switchObj.fromContentScript && (switchObj.ctrlKey || switchObj.shiftKey) ? false : switchObj.duplicateTab.active;
    
    // Move location of tab within the windows
    {
      
      // From content script, with `SHIFT` key `ON` => move original tab to a new window
      if(switchObj.fromContentScript && switchObj.shiftKey){
        
        chrome.windows.get(switchObj.duplicateTab.windowId, oldWindow =>
          chrome.windows.create({
            "tabId": switchObj.originalTab.id,
            "focused": true,
            "state": oldWindow.state || normal,
          })
        );
        
      }
      
      else if(moveOriginalTab !== MOVE_TAB_DONT_MOVE && !switchObj.originalTab.pinned){
        
        // Move original to end of window, and close duplicate if `deleteLater` is `ON`
        if(moveOriginalTab === MOVE_TAB_TO_WINDOW_END)
          chrome.tabs.move(switchObj.originalTab.id, {
            index: -1
          }, _ => deleteLater && chrome.tabs.remove(switchObj.duplicateTab.id));
        
        // Move original to duplicate's position, and close duplicate if `deleteLater` is `ON`
        else
          chrome.tabs.move(switchObj.originalTab.id, {
            "index": switchObj.duplicateTab.active && !closeDuplicateTab ? (switchObj.duplicateTab.index + 1) : switchObj.duplicateTab.index,
            "windowId": switchObj.duplicateTab.windowId,
          }, _=> deleteLater && chrome.tabs.remove(switchObj.duplicateTab.id));
        
      } 
      
      else if(moveOriginalTab === MOVE_TAB_DONT_MOVE){
        
        // Duplicate is to be kept in background, and is not placed after the source
        if(!makeActive && (switchObj.originalTab.index - switchObj.duplicateTab.index != 1 || switchObj.originalTab.windowId != switchObj.duplicateTab.windowId)){
          
          duplicateClosedNotificationTabId = switchObj.originalTab.id;
          
          // Show a notification, pass original tab id to notification, in case user wants to switch to it from notification
          showNotification({
            "id": NOTIFICATION_DUPLICATE_CLOSED,
            "title": "Duplicate tab closed",
            "message": "Click to go to the original. Or change settings to move original to where duplicate was.",
            "contextMessage": switchObj.originalTab.url.replace(SUSPENDERPREFIX, ""),
            "isClickable": true,
            "buttons": [
              {
                "title": "Go to original tab",
                "iconUrl": ICON_GO_TO_ORIGINAL,
              },
              {
                "title": "Open settings",
                "iconUrl": ICON_OPEN_SETTINGS,
              },
            ]
          });
          
        }
        
        // Close duplicate if `deleteLater` is `ON`
        if(deleteLater)
          chrome.tabs.remove(switchObj.duplicateTab.id);
      }
        
      
    }
    
    
    // Switch to target tab, if duplicate wouldn't have been active, and activate the suspended tabs
    {
      
      let moveToWindowId = moveOriginalTab !== MOVE_TAB_DONT_MOVE ? switchObj.duplicateTab.windowId : switchObj.originalTab.windowId;
      
      switchToTab(switchObj.originalTab, makeActive, moveToWindowId);
      
    }
    
  });
}


// @checked
function switchToTab(originalTab, isActive, moveToWindowId){
  
  let originalTabOptions = {
    active: isActive
  }
  
  
  if(SUSPENDERPREFIX.test(originalTab.url))
    originalTabOptions.url = originalTab.url.replace(SUSPENDERPREFIX, "");
  
  chrome.tabs.update(originalTab.id, originalTabOptions, updatedTab => {
    
    if(refreshOriginal){
      chrome.tabs.reload(updatedTab.id, {bypassCache: true});
      console.log("refreshed original");
    }
    
    // And switch to original tab's window
    if(isActive)
      chrome.windows.update(moveToWindowId, {focused: true});
    
  });
}


// @checked
function duplicateThisTab(){
  
  chrome.tabs.query({
    currentWindow: true,
    active: true,
    windowType: "normal"
  }, tabs => {
    
    let err = chrome.runtime.lastError;
    if(err)
      console.warn("Couldn't move tab", err);
    
    else if(tabs && tabs[0]){
      if(extensionEnabled){
        
        chrome.tabs.create({
          "url": url_parameter(tabs[0].url, getDeDupParam(), 1)
        });
        
      } 
      
      else {
        chrome.tabs.duplicate(tabs[0].id);
      }
      
    }
  });
}


// @checked
function moveToLast(tabId){
  
  if(tabId){
    
    chrome.tabs.get(tabId, tab => {
      
      let err = chrome.runtime.lastError;
      if(err)
        console.warn("Couldn't move tab", err);
      
      else if(tab){
        
        chrome.tabs.move(tab.id, {
          index: -1
        }, t => {
          let err = chrome.runtime.lastError;
          if(err) console.warn("Couldn't move tab", err);
        });
        
      }
    });
    
  } 
  
  else {
    
    chrome.tabs.query({
      currentWindow: true,
      active: true,
      windowType: "normal"
    }, tabs => {
      
      let err = chrome.runtime.lastError;
      if(err)
        console.warn("Couldn't move tab", err);
      
      else if(tabs && tabs[0]){
        
        chrome.tabs.move(tabs[0].id, {
          index: -1
        }, t => {
          let err = chrome.runtime.lastError;
          if(err)
            console.warn("Couldn't move tab", err);
        });
      }
    });
  }
}


// @checked
function getDeDupParam(){
  return "deDup"+Math.ceil(Math.random()*1000000);
}


// @checked
function inWhiteList(url){
  url = url.replace(SUSPENDERPREFIX, "");
  
  if(whitelistRegexString === undefined)
    makeWhitelistRegex();
  
  if(whitelistRegexString != "")
    return RegExp(whitelistRegexString,'i').test(url);
    
  else
    return false;
}


// @checked
function makeWhitelistRegex(){
  whitelistRegexString = whitelist.length > 0 ? `.*${whitelist.join('|')}.*` : "";
}


// @checked
function addToWhiteList(url){
  // Remove trailing slash before comparing URLs
  url = url.replace(/\/$/,"");
  
  if(!whitelist.includes(url)){
    whitelist.push(url);
    ls.set({"whitelist": whitelist});
  }
}


// @checked
function removeFromWhiteList(url){
  let index = whitelist.indexOf(url);
  
  if(index > -1){
    whitelist.splice(index, 1);
    ls.set({"whitelist": whitelist});   
  }
}


// @checked
function getAllTabs(runAt){
  
  if(runAt === "startup"){
    
    chrome.windows.getAll({populate: true}, windows => {
      windows.forEach(eachWindow => 
        eachWindow.tabs.forEach(tab => {
          
          if(tab.url)
            tab.url = tab.url.replace(TRAILING_SLASH_REGEX,"$1$3");
          addToList(tab, INIT);
          
        })
      );
      
      setBadgeText(initList.length);
    });
    
  } 
  
  else {
    
    tabList = [];
    
    chrome.windows.getAll({populate: true}, windows => {
      windows.forEach(eachWindow => 
        eachWindow.tabs.forEach(tab => {
          
          if(findInList({
            searchKey: 'tabId',
            searchValue: tab.id
          }) == -1){
            
            if(tab.url)
              tab.url = tab.url.replace(TRAILING_SLASH_REGEX,"$1$3");
            
            addToList(tab);
            
          }
          
        })
      );
      
      setBadgeText(tabList.length);
      console.log('Created tab list: ' + tabList.length);
    });
    
  }
}


// @checked
function restoreLost(){
  
  if(tabList.length == 0){
    // fill tabList -- this should never happen!!
  }
  
  let tabCount = 0;
  
  // Iterate over tabs in initList
  for (let i = initList.length - 1; i >= 0; i--) {
    
    // For each tab.id, check if it's in tabList
    if(findInList({
      searchKey: 'tabId',
      searchValue: initList[i].tabId
    }) == -1){
      
      // If not in tabList
      // add a dedup number and launch
      let url = url_parameter(initList[i]["url"], getDeDupParam(), 1);
      
      // add the new deduped tab.id & url to initlist
      chrome.tabs.create({
        url: url
      }, newTab => addToList(newTab, "both"));
      
      tabCount++;
      
      // remove this old tab.id, url from initlist
      initList.splice(i,1);
        
    }
    
  }
  
  ls.get({
    "showNotifications": DEFAULT_SHOWNOTIFICATIONS
  }, st => {
    
    if(st.showNotifications)
      showNotification({
        id: NOTIFICATION_TABS_RESTORED,
        title: "Tabs restored",
        message: tabCount + ' tab' + (tabCount > 1 ? 's' : '') + 'restored.'
      });
    
  });
}


// @checked
function whitelistThisLink(url){
  
  ls.get({
    "showNotifications": DEFAULT_SHOWNOTIFICATIONS
  }, st => {
    
    if(url){
      
      url = url.replace(SUSPENDERPREFIX, "");
      
      addToWhiteList(url);
      
      if(st.showNotifications)
        showNotification({
          "id": NOTIFICATION_URL_WHITELISTED,
          "title": "Whitelist updated",
          "message": "Page added to whitelist",
          "contextMessage": url,
          "buttons":[{
            "title": "Open settings",
            "iconUrl": ICON_OPEN_SETTINGS,
          }]
        });
      
    }
    
    else {
      
      chrome.tabs.query({
        currentWindow: true,
        active: true,
        windowType: "normal"
      }, tabs => {
        
        let err = chrome.runtime.lastError;
        
        if(err)
          console.warn("Couldn't move tab", err);
        
        else if(tabs && tabs[0] && tabs[0].url && tabs[0].url.trim() !== ""){
          
          addToWhiteList(tabs[0].url.replace(SUSPENDERPREFIX, ""));
          
          if(st.showNotifications)
            showNotification({
              "id": NOTIFICATION_URL_WHITELISTED,
              "title": "Whitelist updated",
              "message": "Page added to whitelist",
              "contextMessage": url,
              "buttons":[{
                "title": "Open settings",
                "iconUrl": ICON_OPEN_SETTINGS,
              }]
            });
          
        }
        
      });
      
    }
  });
}


// @checked
function whitelistThisDomain(url){
  
  ls.get({
    "showNotifications": DEFAULT_SHOWNOTIFICATIONS
  }, st => {
    
    if(url){
      
      let urlParts = url.replace(SUSPENDERPREFIX, "").split("/");
      
      if(urlParts.length >= 3){
        
        url = urlParts[0] + "//" + urlParts[2];
        
        addToWhiteList(url);
        
        if(st.showNotifications)
          showNotification({
            "id": NOTIFICATION_URL_WHITELISTED,
            "title": "Whitelist updated",
            "message": "Domain added to whitelist",
            "contextMessage": url,
            "buttons":[{
              "title": "Open settings",
              "iconUrl": ICON_OPEN_SETTINGS,
            }]
          });
        
      }
      
    }
    
    else {
      
      chrome.tabs.query({
        currentWindow: true,
        active: true,
        windowType: "normal"
      }, tabs => {
        
        let err = chrome.runtime.lastError;
        
        if(err)
          console.warn("Couldn't get tab", err);
        
        else if(tabs && tabs[0] && tabs[0].url && tabs[0].url.trim() !== ""){
          
          let urlParts = tabs[0].url.replace(SUSPENDERPREFIX, "").split("/");
          
          if(urlParts.length >= 3){
            
            let url = urlParts[0] + "//" + urlParts[2];
            
            addToWhiteList(url);
            
            if(st.showNotifications)
              showNotification({
                "id": NOTIFICATION_URL_WHITELISTED,
                "title": "Whitelist updated",
                "message": "Domain added to whitelist",
                "contextMessage": url,
                "buttons":[{
                  "title": "Open settings",
                  "iconUrl": ICON_OPEN_SETTINGS,
                }]
              });
            
          }
          
        }
        
      });
      
    }
  });
}


// @checked
function removeDuplicatesFromTabList(){
  
  if(tabList.length === 0)
    return;
  
  let isDuplicate = false;
  
  // Remove duplicate tab entries
  tabList.filter((tab, i) => !tabList.includes(tab, i+1))
  
  // Remove dead/lost tab entries
  chrome.windows.getAll({populate: true}, windows => {
    
    let allTabs = windows.reduce((tabs, eachWindow) => tabs.concat(eachWindow.tabs), []);
    let found;
    
    for (let j = tabList.length - 1; j >= 0; j--) {
      
      found = false;
      
      // Iterate over allTabs
      for (let i = 0; i < allTabs.length; i++) {
        
        if(tabList[j].tabId === allTabs[i].id){
          found = true;
          break;
        }
        
      }
      
      if(!found)
        tabList.splice(j,1);
    }
    
    setBadgeText(tabList.length);
    
  });
}


// @checked
function toggleState(){
  
  // Add command/shortcut to toggle context menu
  chrome.commands.getAll(commands => {
    
    let commandsObj;
    
    if(commands && commands.length > 0){
      
      commandsObj = arrayToObject(commands, "name");
      
      chrome.contextMenus.update(BROWSER_ACTION_CONTEXT_MENU_TOGGLESTATE, {
        title: (!extensionEnabled ? "Enable" : "Disable") + " Extension" + (commandsObj.toggleState && commandsObj.toggleState.shortcut ? " (" + commandsObj.toggleState.shortcut + ")" : ""),
      }, () => {
        let err = chrome.runtime.lastError;
        if(err)
          console.warn(err);
      });
      
    }
    
  });
  
  
  extensionEnabled = !extensionEnabled;
  setVisibleState(extensionEnabled);
  
  // Save extension state to persist across restarts
  ls.set({extensionEnabled: extensionEnabled})
  
  if(extensionEnabled){
    
    let duplicateCount = markDuplicateTabs();
    
    if(duplicateCount > 0)
      showNotification({
        id: NOTIFICATION_DUPLICATES_FOUND,
        title: "Duplicate tabs found",
        message: `${duplicateCount} duplicate tabs found. Close them?`,
        contextMessage: "Click notification to dismiss.",
        buttons: [
          {
            title: "Close duplicate tabs",
            iconUrl: ICON_CLOSE_DUPLICATES,
          },
          {
            title: "Keep all tabs",
            iconUrl: ICON_KEEP_ALL_TABS,
          }
        ]
      });
    
  }
  
  return extensionEnabled;
}


function setVisibleState(isOn){
  
  setBadgeColour(isOn ? ON_COLOUR : OFF_COLOUR);
  updateBrowserActionTitle();
  setBrowserActionIcon(isOn);
  updateTabListChange({
    "type": MESSAGE_STATE_UPDATED,
    "state": isOn,
  });
  
}


// @checked
function fetchState(callback){
  ls.get({
    "startState": DEFAULT_STARTSTATE,
    "extensionEnabled": DEFAULT_EXTENSION_ENABLED
  }, st => {
    
    extensionEnabled = st.startState == "off" ? false : st.extensionEnabled;
    
    if(callback && typeof callback === "function")
      callback();

  });  
}


// @checked
function markDuplicateTabs(){
  let duplicateCount = 0;
  
  // Mark duplicate tabs
  for (let i = 0; i < tabList.length; i++) {
    
    if(inWhiteList(tabList[i].url) || tabList[i].pinned)
      continue;
    
    if(tabList[i].isDuplicate)
      duplicateCount++;
    
    else {
      
      for (let j = i + 1; j < tabList.length; j++) {
        
        if(!tabList[j].isDuplicate && tabList[i].url.replace(SUSPENDERPREFIX, "") === tabList[j].url.replace(SUSPENDERPREFIX, "")){
          
          tabList[i].isDuplicate = true;
          duplicateCount++;
          break;
          
        }
        
      }
      
    }
  }
  
  return duplicateCount;
}


// @checked
function removePreExistingDuplicateTabs(fromNotification){
  
  // Remove any duplicate entries in array before starting
  removeDuplicatesFromTabList();
  
  let duplicateCount = markDuplicateTabs();
  
  if(duplicateCount > 0){
    
    // Remove duplicate tabs
    for (let i = tabList.length - 1; i >= 0; i--) {
      if(tabList[i].isDuplicate){
        chrome.tabs.remove(tabList[i].tabId);
        tabList.splice(i,1);
      }
    }
    
    // Update badge text
    setBadgeText(tabList.length);
    
    // Show notification
    if(!fromNotification){
      showNotification({
        id: NOTIFICATION_PREVIOUS_DUPLICATES_REMOVED,
        title: "Removed duplicates",
        message: `${duplicateCount} duplicate tabs removed.`,
        contextMessage: "Click notification to dismiss.",
      });
    }
  }
}


// @checked
function setDonated(donated, from){
  if(donated){
    chrome.storage.sync.set({"donated": true});
    trackButton(GA_DONATED_TRACK, true, from);
    chrome.tabs.create({url: DONATE_URL});
  } else {
    console.log("setDonated(false)","Shouldn't be here if not donated.");
  }
}


// @checked
function url_parameter(url, param, value) {
  // From: http://browse-tutorials.com/snippet/alter-url-get-parameters-using-javascript
  
  const val = new RegExp('(\\?|\\&)' + param + '=.*?(?=(&|$))');
  const qstring = /\?.+$/;
  
  let parts = url.toString().split('#'),
    hash = parts[1],
    return_url = url;
    
  url = parts[0];
 
  // Check for parameter existance: Replace it and determine whether & or ? will be added at the beginning.
  if (val.test(url)) {
    // If value empty and parameter exists, remove the parameter.
    if (!value.length) {
      return_url = url.replace(val, '');
    }
    else {
      return_url = url.replace(val, '$1' + param + '=' + value);
    }
  }
  // If there are query strings add the param to the end of it.
  else if (qstring.test(url)) {
    return_url = url + '&' + param + '=' + value;
  }
  // Add if there are no query strings.
  else {
    return_url = url + '?' + param + '=' + value;
  }
 
  // Add hash if it exists.
  if (hash) {
    return_url += '#' + hash;
  }
  return return_url;
}

