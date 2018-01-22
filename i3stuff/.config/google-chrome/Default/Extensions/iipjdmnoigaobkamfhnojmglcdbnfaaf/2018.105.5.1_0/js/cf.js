var ignoreHash = DEFAULT_IGNOREHASH;
var allowDuplicatesAcrossWindows = DEFAULT_ALLOWDUPLICATESACROSSWINDOWS;
var linkMarkers = DEFAULT_LINKMARKERS;
var state = DEFAULT_EXTENSION_ENABLED;

var myWindowId = null;

$(document).ready(() => {
  
  $("body").on("click", "a.clutterFree_existingDuplicate", function(e){
    
    if(!$(this).data("clutterfree_tabid") || (allowDuplicatesAcrossWindows && e.shiftKey))
      return true;
    
    e.preventDefault();
    
    chrome.extension.sendMessage({
      type: MESSAGE_SWITCH_TO_TAB, 
      tabId: $(this).data("clutterfree_tabid"),
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey
    }, function(switched){
      
      if(!switched){
        $(this)
          .removeClass(".clutterFree_existingDuplicate")
          .removeData("clutterfree_tabid")
          .click();
      }
    });
    
    return false;
  });
  
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    if(request && request.windowId)
      myWindowId = request.windowId;
    
    if(request && request.type){
      
      if(request.type === MESSAGE_STATE_UPDATED){
        
        state = request.change.state;
        
        if(state)
          getAllTabs();
        else
          $("a.clutterFree_existingDuplicate")
            .removeClass("clutterFree_existingDuplicate clutterFree_noIcon")
            .removeData("clutterfree_tabid");
        
      }
      
      else if(state){
        
        switch(request.type){
          case MESSAGE_TAB_ADDED:
            parseLinks([request.change]);
            break;
            
          case MESSAGE_TAB_UPDATED:
            $("a.clutterFree_existingDuplicate")
              .filter(function(){ return $(this).data("clutterfree_tabid") == request.change.tabId})
              .removeClass("clutterFree_existingDuplicate clutterFree_noIcon")
              .removeData("clutterfree_tabid");
            parseLinks([request.change]);
            break;
            
          case MESSAGE_TAB_REMOVED:
            $("a.clutterFree_existingDuplicate")
              .filter(function(){ return $(this).data("clutterfree_tabid") == request.change.tabId})
              .removeClass("clutterFree_existingDuplicate clutterFree_noIcon")
              .removeData("clutterfree_tabid");
            break;
            
          default:
            console.warn("Unhandled message", request);
        }
        
      }
      
    }
  });
  
  chrome.storage.sync.get({
    "syncStorage": DEFAULT_SYNCSTORAGE
  }, sst => 
    setLS(sst.syncStorage, _ => 
      ls.get({
        "ignore": DEFAULT_IGNOREHASH,
        "allowDuplicatesAcrossWindows": DEFAULT_ALLOWDUPLICATESACROSSWINDOWS,
        "linkMarkers": DEFAULT_LINKMARKERS,
      }, st => {
        
        ignoreHash = st.ignoreHash;
        allowDuplicatesAcrossWindows = st.allowDuplicatesAcrossWindows;
        linkMarkers = st.linkMarkers;
        
        getAllTabs();
        
      })
    )
  );
  
  chrome.storage.onChanged.addListener((changes, areaName) => {
    
    if(changes.hasOwnProperty("ignoreHash") && changes["ignoreHash"].hasOwnProperty("newValue"))
      ignoreHash = changes["ignoreHash"].newValue;
    
    if(changes.hasOwnProperty("allowDuplicatesAcrossWindows") && changes["allowDuplicatesAcrossWindows"].hasOwnProperty("newValue"))
      allowDuplicatesAcrossWindows = changes["allowDuplicatesAcrossWindows"].newValue;
    
    if(changes.hasOwnProperty("linkMarkers") && changes["linkMarkers"].hasOwnProperty("newValue")){
      linkMarkers = changes["linkMarkers"].newValue;
      
      if(linkMarkers)
        $(".clutterFree_existingDuplicate").removeClass("clutterFree_noIcon");
      else
        $(".clutterFree_existingDuplicate").addClass("clutterFree_noIcon");
        
    }
    
    if(areaName === SYNC_STORAGE_NAME && changes.hasOwnProperty("syncStorage") && changes["syncStorage"].hasOwnProperty("newValue"))
      setLS(changes["syncStorage"].hasOwnProperty("newValue"));
    
    if(changes.hasOwnProperty("ignoreHash") || changes.hasOwnProperty("allowDuplicatesAcrossWindows"))
      getAllTabs();
  });
});


function getAllTabs(){
  chrome.extension.sendMessage({type: MESSAGE_GET_TAB_LIST}, response => {
    
    myWindowId = response.windowId;
    state = response.state;
    if(state)
      parseLinks(response.tabList);
    
  });
}


function parseLinks(tabList){
  
  tabList = tabList.filter(tab => !!tab.url);
  
  if(allowDuplicatesAcrossWindows)
    tabList = tabList.filter(tab => tab.windowId == myWindowId);
  
  if(tabList.length === 0)
    console.warn("Received empty tab list");
  
  // Convert urls to unsuspended state, remove trailing slashes
  let urlList = tabList.map(tab => tab.url.replace(SUSPENDERPREFIX, "").replace(TRAILING_SLASH_REGEX, "$1$3"));
  
  if(ignoreHash)
    urlList = urlList.map(url => url.replace(REMOVE_HASH_REGEX, ""));
  
  $("a").each((i, linkElement) => {
    
    // Don't mark links to self
    if(linkElement.href === location.href)
      return;
    
    let href = linkElement.href.replace(TRAILING_SLASH_REGEX, "$1$3");
    if(ignoreHash)
      href = href.replace(REMOVE_HASH_REGEX, "");
    
    let index = urlList.indexOf(href);
    
    if(index > -1)
      $(linkElement)
        .addClass(`clutterFree_existingDuplicate ${linkMarkers ? "" : "clutterFree_noIcon"}`)
        .data("clutterfree_tabid", tabList[index].tabId)
    
  });
}
