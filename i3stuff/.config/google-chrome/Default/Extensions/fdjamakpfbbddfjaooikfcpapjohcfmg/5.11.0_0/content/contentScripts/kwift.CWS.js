(function() {
    var comPort = chrome.extension.connect({
        name : "fromInjectedTo"
    });

    document.getElementById("uninstall-extension").addEventListener('click', function(event) {
        comPort.postMessage("action=uninstallExtension");
    });
})();