const DEFAULT_POCKETNOTIFICATIONCOUNT = 1;
const MIN_DEFAULT_VIEWS = 10;
const cf_ppStrings = [
  "Get a better Pocket",
  "Shortcut to a better Pocket",
  "High Perfomance Pocket",
  "Get better with Pocket",
  // "Improve your Pocket",
  "Target: Pocket Zero!",
  "Supercharge your Pocket",
  "Supercharged Pocket reading",
  "Accelerate your Pocket experience!",
  "Power user tool for Pocket",
];

const debug = false;

var cf_ppStringsIndex = Math.round(Math.random()*(cf_ppStrings.length-1));
var cf_ppViewCount = 0;

$(document).ready(_ => {
  
  if(debug)
    console.log(cf_ppStringsIndex);
  
  setTimeout(showAcceleReaderPrompt, 5000);
  
  $("body").on("click", "#cf_ppAdvertCloseButton", e => {
    
    e.preventDefault();
    
    $("#cf_ppinstall").hide();
    
    chrome.storage.sync.set({
      "pocketNotificationCount": false
    });
    
  });
  
  
  $("body").on("click", "#cf_ppinstall", e => {
    
    if(e.target.id === "cf_ppAdvertCloseButton")
      return;
    
    e.preventDefault();
    
    window.open(`https://chrome.google.com/webstore/detail/accelereader-power-up-you/ndaldjfflhocdageglcnflfanmdhgfbi?utm_source=ClutterFreePromoBanner&utm_medium=ext&utm_campaign=InAppPromoBanners&utm_content=s_${cf_ppStringsIndex}`, "_blank");
    
    // Allow close button to appear
    chrome.storage.sync.set({
      "pocketNotificationCount": Math.max(MIN_DEFAULT_VIEWS, cf_ppViewCount)
    });
    
  });
  
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
    if(message.type === "urlchange"){
      
      cf_ppStringsIndex = Math.round(Math.random()*(cf_ppStrings.length-1));
      $("#cf_ppinstall .cfteaser").text(cf_ppStrings[cf_ppStringsIndex]);
      
    }
    
  });
  
});


function showAcceleReaderPrompt(){
  
  if($("#totalEstimateNode").length === 0 && $("#timeEstimateNode").length === 0){
  // On getPocket, but pocket extension not installed
    
    chrome.storage.sync.get({
      "pocketNotificationCount": DEFAULT_POCKETNOTIFICATIONCOUNT
    }, st => {
      
      if(st.pocketNotificationCount){
        
        cf_ppViewCount = st.pocketNotificationCount;
        
        // Show popup in bottom right corner
        $("body").append(
          `<a id="cf_ppinstall" target="_blank" title="Install AcceleReader - Power up your Pocket experience!" 
            href="https://chrome.google.com/webstore/detail/accelereader-power-up-you/ndaldjfflhocdageglcnflfanmdhgfbi'?utm_source=ClutterFreePromoBanner&utm_medium=ext&utm_campaign=InAppPromoBanners&utm_content=s_${cf_ppStringsIndex}" 
            class="">
              <span class='show-minimised cfblock cfteaser'>${cf_ppStrings[cf_ppStringsIndex]}</span>
              <img src="${chrome.runtime.getURL("img/close-64.png")}" id="cf_ppAdvertCloseButton" ${(cf_ppViewCount >= MIN_DEFAULT_VIEWS ? "" : "class='cfhidden'")}>
          </a>`
        );
        
        $("#cf_ppinstall").fadeIn(1500);
        
        chrome.storage.sync.set({
          "pocketNotificationCount": cf_ppViewCount + 1
        });
        
      }
      
    });
    
  } 
  
  else if(debug) 
    console.log("already installed, or not pocket");
}
