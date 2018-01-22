var bgPage = chrome.extension.getBackgroundPage();
var tabList = [];
var lastFilter = "";
var filterTimeout = null;
var helpVisible = false;

const DIRECTION_UP = -1;
const DIRECTION_DOWN = 1;

const IS_EXTENSION_URL = /^chrome\-extension/;

$(document).ready(() => {
  
  bgPage.trackButton(GA_EXTENSION_PAGE_TRACK, ACTION_POPUP_PAGE_OPEN);
  
  showHelp(helpVisible);
  
  // Set initial Enable/Disable text
  $("#toggleStateLink").text((bgPage.extensionEnabled ? "Disable" : "Enable") + " ClutterFree");
  
  // Set version number
  $("#versionSpan").text("v"+chrome.runtime.getManifest().version);
  
  // Set state of donated button and text
  chrome.storage.sync.get({"donated": DEFAULT_DONATED}, st => showDonate(!!st.donated));
  
  // Add any keyboard shortcuts to actions
  chrome.commands.getAll(commands => {
    
    let err = chrome.runtime.lastError;
    if(err)
      console.warn("Error getting commands", err);
    
    else if(commands && commands.length > 0){
      
      commands.forEach(command => {
        if(command.shortcut){
          let commandNode = $(`#${command.name}Link`);
          commandNode.html(`${commandNode.text()} (<code style='font-size:smaller'>${command.shortcut}</code>)`);
        }
      });
      
    }
    
  });
  
  
  // Handler for webpage links
  $("body").on("click", "a.external_link, a.internal_link", e => {
    bgPage.trackButton(GA_POPUP_PAGE_LINKS_TRACK, e.currentTarget.id === "versionSpan" ? C306_APP_UPDATES : e.currentTarget.id);
    return true;
  });
  
  
  // Handler for donation button
  $(".btnDonate").on("click", e => {
    chrome.storage.sync.set({"donated": true});
    bgPage.trackButton(GA_POPUP_TRACK, ACTION_DONATED, true);
    bgPage.trackButton(GA_DONATED_TRACK, true, e.currentTarget.id);
    showDonate(true);
    return true;
  });
  
  
  $("#tabSearch").keyup(e => {
    
    let filterText = $("#tabSearch").val();
    
    if(filterText !== lastFilter){
      
      lastFilter = filterText;
      
      if(filterTimeout)
        clearTimeout(filterTimeout);
      
      filterTimeout = setTimeout(filterList, 300, filterText);
    }    
  });
  
  // Add keyboard shortcuts
  $(document).keydown(e => {
    
    let isActions = $("#actions").hasClass("is-active");
    
    // If special keys are pressed, do nothing.
    if(e.ctrlKey || e.altKey || e.metaKey)
      return;
    
    // Hide help if visible
    if(helpVisible){
      e.preventDefault();
      showHelp(false);
      return;
    }
    
    // Handle up, down, enter, escape, delete and F1 keys
    switch(e.which){
      
      // Traverse up the list.
      case KEYCODE.UP:
        e.preventDefault();
        if(isActions)
          navigateActionList(DIRECTION_UP);
        else
          navigateTabList(DIRECTION_UP);
        break;
      
      
      // Traverse down the list.
      case KEYCODE.DOWN:
        e.preventDefault();
        if(isActions)
          navigateActionList(DIRECTION_DOWN);
        else
          navigateTabList(DIRECTION_DOWN);
        break;
      
      
      // Switch to tab
      case KEYCODE.ENTER:
        e.preventDefault();
        if(isActions)
          triggerHighlightedAction();
        else
          switchToHighlighted(SOURCE_KEYBOARD);
        break;
      
      
      // Clear highlight, then clear filter list
      case KEYCODE.ESCAPE:
        e.preventDefault();
        
        if(isActions){
          if($(".tools.highlightedAction").length > 0)
            $(".tools.highlightedAction").removeClass("highlightedAction mdl-button--accent").addClass("mdl-button--primary");
          else
            window.close();
        }
        
        else {
          
          if($("li.highlighted").length > 0){
            $("li.highlighted").removeClass("highlighted");
            $("#tabSearch")[0].scrollIntoViewIfNeeded();
          }
          else if($("#tabSearch").val() !== ""){
            $("#tabSearch").val("");
            filterList("");
          }
          
          else
            window.close();
        }
        break;
        
      
      // Close tab
      case KEYCODE.DELETE:
        if(!isActions){
          e.preventDefault();
          closeTab(SOURCE_KEYBOARD);
        }
        break;
      
      
      // Show help modal
      case KEYCODE.F1:
        if(!isActions){
          e.preventDefault();
          showHelp(true);
        }
        break;
        
    }
  });
  
  
  // Highlight tab on mouse hover, switch-to on click
  $("#resultsCard ul.mdl-list").on({
    "mouseenter": () => {
      //stuff to do on mouse enter
      $(".highlighted").removeClass("highlighted");
      
      let selectedTabIndex = $("#resultsCard ul.mdl-list li:visible").index($("li:hover"));
      
      $(`#resultsCard ul.mdl-list li:visible`).filter(`:eq(${selectedTabIndex})`).addClass("highlighted");
      
      $(".highlighted")[0].scrollIntoViewIfNeeded();
    },
    "click": e => {
      if(e.target.classList.contains("ic_close"))
        closeTab(SOURCE_TOUCH);
      else
        switchToHighlighted(SOURCE_TOUCH);
    }
  }, "li");
  
  
  // Highlight tab on mouse hover, switch-to on click
  $(".tools").on({
    "mouseenter": () => {
      
      $(".highlightedAction").removeClass("highlightedAction mdl-button--accent").addClass("mdl-button--primary");
      
      let selectedActionIndex = $(".tools:visible").index($(".tools:hover"));
      
      $(".tools:visible").filter(`:eq(${selectedActionIndex})`).addClass("highlightedAction mdl-button--accent").removeClass("mdl-button--primary");
      
      $(".highlightedAction")[0].scrollIntoViewIfNeeded();
    },
    "click": e => {
      
      switch(e.currentTarget.id){
        
        case "toggleStateLink":{
          
          let state = bgPage.toggleState();
          
          bgPage.trackButton(GA_POPUP_TRACK, ACTION_TOGGLE_EXTENSION_STATE, state);
          
          $(e.currentTarget).text((state ? "Disable" : "Enable") + " ClutterFree");
          
          break;
        }
        
        case "showOptionsLink":
          bgPage.trackButton(GA_POPUP_TRACK, ACTION_OPEN_SETTINGS);
          chrome.runtime.openOptionsPage();
          break;
          
        case "duplicateLink":
          bgPage.trackButton(GA_POPUP_TRACK, ACTION_DUPLICATE_TAB);
          bgPage.duplicateThisTab();
          break;
          
        case "whitelistLink":
          bgPage.trackButton(GA_POPUP_TRACK, ACTION_ADD_TO_WHITELIST);
          bgPage.whitelistThisLink();
          window.close();
          break;
          
        case "whitelist_domainLink":
          bgPage.trackButton(GA_POPUP_TRACK, ACTION_ADD_TO_WHITELIST_DOMAIN);
          bgPage.whitelistThisDomain();
          window.close();
          break;
          
        case "closeDuplicatesLink":
          bgPage.trackButton(GA_POPUP_TRACK, ACTION_CLOSE_PRE_EXISTING_DUPLICATES);
          bgPage.removePreExistingDuplicateTabs();
          window.close();
          break;
          
        case "recoverLostLink":
          bgPage.trackButton(GA_POPUP_TRACK, ACTION_RESTORE_LOST_TABS);
          bgPage.restoreLost();
          break;
          
        default:
          console.warn("Unhandled action", e.currentTarget.id);
      }
      
      e.preventDefault();
    }
  });
  
  
  setup();
});


function showHelp(show){
  if(show)
    $("#helpModal").show();
  else
    $("#helpModal").hide();
  helpVisible = show;
}


function setup(){
  
  chrome.storage.sync.get({
    "syncStorage": DEFAULT_SYNCSTORAGE,
  }, sst => setLS(sst.syncStorage, () => {
    
    // Set popup to saved state (actions/search)
    ls.get({
      "popup_state": DEFAULT_POPUP_STATE,
    }, st => st.popup_state === "actions" && !$("#header_link_actions").hasClass("is-active") && $("#header_link_actions span").click());
    
    // Add handler for saving state on changes (movement between actions & search tabs)
    $(document).on("click", "a.mdl-layout__tab", event => {
      
      let popupState = event.currentTarget.id.replace("header_link_", "");
      
      ls.set({"popup_state": popupState});
      
      if(popupState === "search")
        $("#tabSearch").focus();
      
      bgPage.trackButton(GA_POPUP_TRACK, ACTION_POPUP_STATE_CHANGE, popupState);
      
    });
    
    getList();
  }));
}


function switchToHighlighted(source){
  
  // Get highlighted tab
  let tabId = $(".highlighted").data("id");
  
  // If no highlighted tab, and only one filtered tab, get filtered tab's id
  if (!tabId && $("#resultsCard ul.mdl-list li:visible").length == 1) {
    tabId = $("#resultsCard ul.mdl-list li:visible:first").data("id")
  }
  
  // If tab id available, switch to it
  if(tabId){
    bgPage.popup_switchToTab(tabId);
    
    bgPage.trackButton(GA_POPUP_TRACK, ACTION_SWITCH_TO_TAB, source);
    
    window.close();
  }
}


function navigateTabList(direction){
  
  let highlightedTabIndex = $("#resultsCard ul.mdl-list li:visible").index($(".highlighted"));
  
  $(".highlighted").removeClass("highlighted");
  
  // No highlights, highlight first/last
  if(highlightedTabIndex == -1)
    $("#resultsCard ul.mdl-list li:visible").filter(direction === DIRECTION_UP ? ":last" : ":first").addClass("highlighted");
  
  
  // Last highlighted, going down - highlight first
  else if($("#resultsCard ul.mdl-list li:visible").length - 1  === highlightedTabIndex && direction === DIRECTION_DOWN)
    $("#resultsCard ul.mdl-list li:visible").filter(":first").addClass("highlighted");
  
  
  // First highlighted, going up - highlight last
  else if(highlightedTabIndex === 0 && direction === DIRECTION_UP)
    $("#resultsCard ul.mdl-list li:visible").filter(":last").addClass("highlighted");    
  
  
  // Highlight next/previous
  else
    $(`#resultsCard ul.mdl-list li:visible`).filter(`:eq(${highlightedTabIndex + direction})`).addClass("highlighted");
  
  
  $(".highlighted")[0].scrollIntoViewIfNeeded();
}


function navigateActionList(direction){
  
  let highlightedActionIndex = $(".tools:visible").index($(".highlightedAction"));
  
  $(".highlightedAction").removeClass("highlightedAction mdl-button--accent").addClass("mdl-button--primary");
  
  // No highlights, highlight first/last
  if(highlightedActionIndex == -1)
    $(".tools:visible").filter(direction === DIRECTION_UP ? ":last" : ":first").addClass("highlightedAction mdl-button--accent").removeClass("mdl-button--primary");
  
  
  // Last highlighted, going down - highlight first
  else if($(".tools:visible").length - 1  === highlightedActionIndex && direction === DIRECTION_DOWN)
    $(".tools:visible").filter(":first").addClass("highlightedAction mdl-button--accent").removeClass("mdl-button--primary");
  
  
  // First highlighted, going up - highlight last
  else if(highlightedActionIndex === 0 && direction === DIRECTION_UP)
    $(".tools:visible").filter(":last").addClass("highlightedAction mdl-button--accent").removeClass("mdl-button--primary");    
  
  
  // Highlight next/previous
  else
    $(".tools:visible").filter(`:eq(${highlightedActionIndex + direction})`).addClass("highlightedAction mdl-button--accent").removeClass("mdl-button--primary");
  
  
  $(".highlightedAction")[0].scrollIntoViewIfNeeded();
}


function triggerHighlightedAction(){
  $(".highlightedAction").click();
}


function getList(){
  
  tabList = [];
  
  ls.get({
    "searchAllWindows": DEFAULT_SEARCHALLWINDOWS,
  }, st => {
    if(st.searchAllWindows){
      
      chrome.windows.getAll({"populate": true}, windows => {
        windows.forEach(thisWindow =>
          thisWindow.tabs.forEach(tab => {
            tabList.push({
              "icon": tab.favIconUrl,
              "url": tab.url.replace(SUSPENDERPREFIX, ""),
              "title": tab.title,
              "id": tab.id,
              "windowId": thisWindow.id,
              "index": tab.index,
              "suspended": SUSPENDERPREFIX.test(tab.url),
            });
          })
        );
        
        // Sort tabList so that tabs from current window are listed first
        chrome.windows.getCurrent(currWindow => {
          tabList = tabList.sort((i,j) => {
            if(i.windowId == j.windowId)
              return i.index - j.index;
            else if(i.windowId === currWindow.id)
              return -1;
            else if(j.windowId === currWindow.id)
              return 1;
            else return i.windowId - j.windowId;
          });
          updateListView();
        });
      });
      
    }
    
    else {
      
      chrome.windows.getCurrent({"populate": true}, thisWindow => {
        thisWindow.tabs.forEach(tab => {
          tabList.push({
            "icon": tab.favIconUrl,
            "url": tab.url.replace(SUSPENDERPREFIX, ""),
            "title": tab.title,
            "id": tab.id,
            "windowId": thisWindow.id,
            "index": tab.index,
            "suspended": SUSPENDERPREFIX.test(tab.url),
          });
        });
        
        updateListView();
      });
      
    }
    
  });
}


function updateListView(){
  
  let listNodeString = "";
  
  // Add default icons for extension and internal chrome pages
  tabList = tabList.map(t => {
    if(!t.icon)
      t.icon = IS_EXTENSION_URL.test(t.url) ? "/img/cws_extension_icon.png" : "/img/google_chrome.svg"
    
    return t;
  })
  
  tabList.forEach(tab => {
    listNodeString += 
      `<li class="mdl-list__item mdl-list__item--two-line tabListItem ${tab.suspended ? "suspended" : ""}" data-id="${tab.id}"">
        <span class="mdl-list__item-primary-content tab_description">
          <img class="mdl-list__item-avatar tab_icon" src="${tab.icon}"/>
          <span class="tab_title">${tab.title}</span>
          <span class="mdl-list__item-sub-title tab_url">${tab.url}</span>
        </span>
        <span class="mdl-list__item-secondary-content tab_action_close" title="Close Tab" data-id="${tab.id}">
          <a class="mdl-list__item-secondary-action mdl-color-text--primary" href="#"><i class="material-icons ic_close">close</i></a>
        </span>
      </li>`;
  });
  
  $("#resultsCard ul.mdl-list").html(listNodeString);
  
  if($("#search").hasClass("is-active"))
    $("#tabSearch").focus();
  
  chrome.tabs.query({
    "active": true,
    "currentWindow": true
  }, tabs => {
    
    if(tabs && tabs[0] && tabs[0].id){
      
      let currentTab = $(`.tabListItem[data-id="${tabs[0].id}"]`);
      
      if(currentTab.length > 0 && currentTab.is(":visible")){
        $(".highlighted").removeClass("highlighted");
        currentTab.addClass("highlighted");
      }
      
    }
  });
}


function filterList(filterText){
  
  const FILTER_REGEX = new RegExp(filterText.split(" ").map(e => `(?=.*${e})`).join(""), "i");
  
  let filterList = tabList
    .filter(tab => FILTER_REGEX.test(tab.title) || FILTER_REGEX.test(tab.url))
    .map(tab => tab.id);
  
  $(".tabListItem").each((i, element) => {
    
    if(filterList.includes($(element).data("id")))
      $(element).show();
    else
      $(element).hide();
      
  });
  
  $(".highlighted").removeClass("highlighted");
}


function closeTab(source){
  
  let tabId = $(".highlighted").data("id");
  
  if(tabId){
    chrome.tabs.get(tabId, tab => {
      if(!chrome.runtime.lastError && tab)
        chrome.tabs.remove(tabId, _=> {
          // Remove tab from list
          $(`li[data-id="${tabId}"]`).removeClass("highlighted").remove();
        });
    });
    
    bgPage.trackButton(GA_POPUP_TRACK, ACTION_CLOSE_TAB, source);
  }
}


function showDonate(donated){
  if(donated){
    $(".preDonate").hide();
    $(".postDonate").show();
    $("#donate_footer").removeClass("mdl-color-text--accent");//.addClass("mdl-color-text--primary");
  } else {
    $(".postDonate").hide();
    $(".preDonate").show();
    $("#donate_footer").addClass("mdl-color-text--accent");//.removeClass("mdl-color-text--primary");
  }
}
