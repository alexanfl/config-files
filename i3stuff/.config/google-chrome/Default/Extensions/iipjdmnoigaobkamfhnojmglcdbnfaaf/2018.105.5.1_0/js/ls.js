var ls;

var localSt = chrome.storage.local;
localSt.fetch = param => localSt.get(param, console.log);


var syncSt = chrome.storage.sync;
syncSt.fetch = param => syncSt.get(param, console.log);


function setLS(syncStorage, callback){
  
  ls = syncStorage ? syncSt : localSt;
  
  if(callback) callback();
}
