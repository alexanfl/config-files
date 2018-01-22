const GA_CODE = "UA-29280613-6";

// Disable GA if using local extension
chrome.management.getSelf(function(e){
  console.log("installType", e.installType);
  if(e.installType === "development")
    window["ga-disable-" + GA_CODE] = true;
});

//Setup analytics to background page and browser button 
var _gaq = _gaq || [];
_gaq.push(["_setAccount", GA_CODE]);
_gaq.push(['_gat._forceSSL']);

// Track page view before sending events
_gaq.push(['_trackPageview']);

// Load GA Code script
(function() {
  var ga = document.createElement("script"); ga.type = "text/javascript"; ga.async = true;
  ga.src = "https://ssl.google-analytics.com/ga.js";
  var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ga, s);
})();



/**
 * trackButton
 * Track specfied parameters as event in Google Analytics
 * @param  btn  Name of the element on (or about) which the event is being triggered
 * @param  status  Updated status of the btn
 * @param  action  3rd argument with additional information
 */
function trackButton(btn, status, action) {
  // values can't have spaces, else GA logging fails without warning
  status = String(status).trim().split(" ").join("_");
  btn = btn.trim().split(" ").join("_");
  
  if(action){
    _gaq.push(['_trackEvent', btn, status, String(action).trim().split(" ").join("_")]);
  } else {
    _gaq.push(['_trackEvent', btn, status]);
  }  
}

