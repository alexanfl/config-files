var whitelist;
var bgPage = chrome.extension.getBackgroundPage();


// @checked
$(document).ready(_ => {
  
  bgPage.trackButton(GA_EXTENSION_PAGE_TRACK, ACTION_OPTIONS_PAGE_OPEN);
  
  setupPageState();
  
  setupHandlers();
  
  setupKeyboardShortcuts();
  
});


// @checked
function setupKeyboardShortcuts(){
  
  chrome.commands.getAll(commands => 
    commands.forEach(command => {
      $(`#${command.name}_command`)
        .text(command.shortcut || "None")
        .addClass(command.shortcut ? "macAlt" : "");
    })
  );
}


// @checked
function setupPageState(){
  
  let appName = chrome.i18n.getMessage("appName");
  $("#extName").text(appName);
  $("title").text("Options - " + appName);
  $("#extShortName").text(chrome.i18n.getMessage("shortName"));
  
  chrome.storage.sync.get({
    "syncStorage": DEFAULT_SYNCSTORAGE,
    "donated": DEFAULT_DONATED
  }, sSt => {
    
    $("#syncStorage").prop("checked", sSt["syncStorage"]);
    
    showDonate(sSt.donated);
    
    setLS(sSt.syncStorage, _ => {
      
      ls.get({
        "allowDuplicatesAcrossWindows"  : DEFAULT_ALLOWDUPLICATESACROSSWINDOWS,
        "browserAction"                 : DEFAULT_BROWSERACTION,         // Show popup
        "ignoreHash"                    : DEFAULT_IGNOREHASH,
        "showCount"                     : DEFAULT_SHOWCOUNT,
        "moveOriginalTab"               : DEFAULT_MOVEORIGINALTAB,
        "refreshOriginal"               : DEFAULT_REFRESHORIGINAL,
        "showContextMenu"               : DEFAULT_SHOWCONTEXTMENU, // Show context menu with duplicate option
        "showNotifications"             : DEFAULT_SHOWNOTIFICATIONS,  
        "startState"                    : DEFAULT_STARTSTATE,                  // Start with default off to prevent all tabs closing when they are redirected to the same wifi sign-in page on guest/public wifis
        "whitelist"                     : DEFAULT_WHITELIST,
        "showWeeklyStatsNotifications"  : DEFAULT_SHOWWEEKLYSTATSNOTIFICATIONS,
        "linkMarkers"                   : DEFAULT_LINKMARKERS,
        "searchAllWindows"              : DEFAULT_SEARCHALLWINDOWS,
      }, st => {
        
        $("#allowDuplicatesAcrossWindows").prop("checked", st.allowDuplicatesAcrossWindows);
        $("#ignoreHash").prop("checked", st.ignoreHash);
        $("#showCount").prop("checked", st.showCount);
        $("#searchAllWindows").prop("checked", st.searchAllWindows);
        $("#refreshOriginal").prop("checked", st.refreshOriginal);
        $("#showNotifications").prop("checked", st.showNotifications);
        $("#linkMarkers").prop("checked", st.linkMarkers);
        $("#showWeeklyStatsNotifications").prop("checked", st.showWeeklyStatsNotifications);
        $("#startState").val(st.startState);
        $("#moveOriginalTab").val(st.moveOriginalTab);
        
        $("#browserAction").val(st.browserAction);
        
        if(st.browserAction === DEFAULT_BROWSERACTION)
          $("#_execute_browser_action_command_li").show();
        else
          $("#_execute_browser_action_command_li").hide();
        
        if(!st.ignoreHash)
          $("#ignoreHashDiv").hide();
        
        st.showContextMenu.split(",").forEach(item => 
          $(".showContextCheckbox[value='"+ item +"']").prop("checked", true)
        );
        
        
        whitelist = st.whitelist;
        
        loadHelpMessages();
        positionHelps();
        loadWhitelist();
        
      });

    });
  });
    
  localSt.get({"closedDuplicates": DEFAULT_CLOSED_DUPLICATES}, lSt => {
    
    if(lSt.closedDuplicates.length > MIN_SHOW_STATS_PAGE)
      $("#statsLink").show();
    else
      $("#statsLink").hide();
    
  });
}


// @checked
function setupHandlers(){
  
  /** 
   ** 
   ** Layout Handlers
   ** 
   **/
  
  $("#cx-edit-help-content div").hover(function(){
    $(this).css("display", "inherit");
  },function(){
    $(this).css("display", "none");
  });

  $("section").hover(function(){
    $("#"+this.id+"Help").css("visibility", "visible");
  },function(){
    $("#"+this.id+"Help").css("visibility", "hidden");
  });

  $("section *").focusin(function(){
    $("#"+$(this).parents("section").attr("id")+"Help").css("visibility", "visible");
  });
  $("section *").focusout(function(){
    $("#"+$(this).parents("section").attr("id")+"Help").css("visibility", "hidden");
  });
  
  $(document).resize(positionHelps);
  
  $("body").on("click", "a.external_link, a.internal_link", function(e){
    
    bgPage.trackButton(GA_OPTION_PAGE_LINKS_TRACK, this.id);
    
    if(this.id === ACTION_OPEN_CONFIGURECOMMANDS){
      chrome.tabs.create({url: "chrome://extensions/configureCommands"});
      return false;
    }
    
    return true;
  });
  
  /** 
   ** 
   ** Settings Handlers
   ** 
   **/
  
  $("#whitelistAddForm").on("submit", addToWhitelist);
  $("#whitelistRemoveForm").on("submit", removeFromWhitelist);
  
  
  $("#startState").change(function(e){
    bgPage.trackButton(GA_SETTINGS_CHANGED_TRACK, SETTING_START_STATE, this.value);
    ls.set({"startState": this.value});
  });
  
  
  $(".showContextCheckbox").change(function(e){
    
    let contextMenuArr = [];
    
    $(".showContextCheckbox:checked").each(function(){
      contextMenuArr.push(this.value);
    });
    
    let contextMenuValue = contextMenuArr.join(",");
    
    ls.set({"showContextMenu": contextMenuValue});
    
    bgPage.trackButton(GA_SETTINGS_CHANGED_TRACK, SETTING_SHOW_CONTEXT_MENU, contextMenuValue);
    bgPage.setContextMenu();
  });
  
  
  $("#browserAction").change(function(e){
    bgPage.trackButton(GA_SETTINGS_CHANGED_TRACK, SETTING_BROWSER_ACTION, this.value);
    ls.set({"browserAction": this.value});
    
    if(this.value === DEFAULT_BROWSERACTION)
      $("#_execute_browser_action_command_li").show();
    else
      $("#_execute_browser_action_command_li").hide();
    
    bgPage.setBadgeAction(this.value);
  });
  
  
  $("#ignoreHash").change(function(e){
    bgPage.trackButton(GA_SETTINGS_CHANGED_TRACK, SETTING_IGNORE_HASH, this.checked);
    ls.set({"ignoreHash": this.checked});
  });
  
  
  $("#showCount").change(function(e){
    bgPage.trackButton(GA_SETTINGS_CHANGED_TRACK, SETTING_SHOW_COUNT, this.checked);
    
    ls.set({"showCount": this.checked}, _=> 
      bgPage.setBadgeText(this.checked ? bgPage.tabList.length : "")
    );
  });
  
  
  $("#searchAllWindows").change(function(e){
    bgPage.trackButton(GA_SETTINGS_CHANGED_TRACK, SETTING_SEARCH_ALL_WINDOWS, this.checked);
    
    ls.set({"searchAllWindows": this.checked});
  });
  
  
  $("#allowDuplicatesAcrossWindows").change(function(e){
    bgPage.trackButton(GA_SETTINGS_CHANGED_TRACK, SETTING_ALLOW_DUPLICATES_ACROSS_WINDOWS, this.checked);
    ls.set({"allowDuplicatesAcrossWindows": this.checked});
  });
  
  
  $("#linkMarkers").change(function(e){
    bgPage.trackButton(GA_SETTINGS_CHANGED_TRACK, SETTING_SHOW_LINK_MARKERS, this.checked);
    ls.set({"linkMarkers": this.checked});
  });
  
  
  $("#showNotifications").change(function(e){
    bgPage.trackButton(GA_SETTINGS_CHANGED_TRACK, SETTING_SHOW_NOTIFICATIONS, this.checked);
    ls.set({"showNotifications": this.checked});
  });
  
  
  $("#showWeeklyStatsNotifications").change(function(e){
    bgPage.trackButton(GA_SETTINGS_CHANGED_TRACK, SETTING_SHOW_STATS_NOTIFICATIONS, this.checked);
    
    ls.set({"showWeeklyStatsNotifications": this.checked}, _=> bgPage.setupWeeklyStatsAlarm(this.checked));
  });
  
  
  $("#refreshOriginal").change(function(e){
    bgPage.trackButton(GA_SETTINGS_CHANGED_TRACK, SETTING_REFRESH_ORIGINAL, this.checked);
    ls.set({"refreshOriginal": this.checked});
  });
  
  
  $("#moveOriginalTab").change(function(e){
    bgPage.trackButton(GA_SETTINGS_CHANGED_TRACK, SETTING_MOVE_ORIGINAL_TAB, this.value);
    ls.set({"moveOriginalTab": this.value});
  });
  
  
  $("#syncStorage").change(function(e){
    bgPage.trackButton(GA_SETTINGS_CHANGED_TRACK, SETTING_SYNC_STORAGE, this.checked);
    swapStorage(this.checked);
  });
  
  
  $(".btnDonate").on("click", function(){
    chrome.storage.sync.set({"donated": true});
    
    let source = $(this).hasClass("topButton") ? "OptionsTitle" : "OptionsContent";
    bgPage.trackButton(GA_OPTION_PAGE_LINKS_TRACK, ACTION_DONATED, source);
    bgPage.trackButton(GA_DONATED_TRACK, true, source);
    
    showDonate(true);
    return true;
  });
}


// @checked
function loadHelpMessages(){
  $("#cx-edit-help-content div").each(function(){
    $("#"+this.id).html(chrome.i18n.getMessage(this.id));
  });
}


// @checked
function positionHelps(){
  $("section").each(function(){
    $("#"+this.id+"Help").css({
      top: $(this).position().top-37,
    });
  });
}


// @checked
function loadWhitelist(){
  $("#whitelistSelect").append(
    whitelist.reduce(
      (acc, whitelistItem, i) => `${acc} <option value="${i}">${whitelistItem}</option>`, ""
    )
  );
}


// @checked
function showDonate(donated){
  if(donated){
    $(".preDonate").hide();
    $(".postDonate").show();
    $(".btnDonate").removeClass("btn-red").addClass("btn-green");
    $("#showWeeklyStatsNotificationsDiv").show();
  } else {
    $(".postDonate").hide();
    $(".preDonate").show();
    $(".btnDonate").removeClass("btn-green").addClass("btn-red");
    $("#showWeeklyStatsNotificationsDiv").hide();
  }
}


// @checked
function addToWhitelist(){
  
  let newWhitelistURL = $("#whitelistInput").val().trim();
  
  if(newWhitelistURL != ""){
    
    // remove trailing `/`
    newWhitelistURL = newWhitelistURL.replace(TRAILING_SLASH_REGEX,"$1$3");
    
    if(!whitelist.includes(newWhitelistURL)){
      
      whitelist.push(newWhitelistURL);
      ls.set({"whitelist": whitelist});
      
      bgPage.trackButton(GA_SETTINGS_CHANGED_TRACK, SETTING_WHITELIST_MODIFIED, ACTION_WHITELIST_ADD);
      
      $("#whitelistSelect").append(`<option value="${whitelist.length-1}">${newWhitelistURL}</option>`);
    }
    
    $("#whitelistInput").val("");
    
  }
  
  return false;
}
  

// @checked
function removeFromWhitelist(){
  
  // Get ids of selected item(s), remove from storage & select-options
  if($("#whitelistSelect option:selected").length > 0){
    
    let removedArr = [];
    
    $("#whitelistSelect option:selected").each(function(){
      removedArr.push(whitelist[this.value]);
    });
    
    // Clear whitelist select element
    $("#whitelistSelect").html("");
    
    whitelist = whitelist.filter(whitelistURL => !removedArr.includes(whitelistURL));
    
    // Refill whitelist select element with updated whitelist
    loadWhitelist();
    
    bgPage.trackButton(GA_SETTINGS_CHANGED_TRACK, SETTING_WHITELIST_MODIFIED, ACTION_WHITELIST_REMOVE);
    ls.set({"whitelist": whitelist});
  }
  
  return false;
}


// @checked
/**
 * swapStorage
 * Reset value of ls, copy data from old storage to new, add ls.fetch
 * @param {boolean} syncStorage Flag describing whether to save in sync or local
 * @return {void} Nothing
 */
function swapStorage(syncStorage){
  // Set syncStorage value
  chrome.storage.sync.set({"syncStorage": syncStorage});
  
  setLS(syncStorage);
  
  // Data swap between sync and local happens in storage change listener in background script
}
