// Standard Google Universal Analytics code
(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga'); // Note: https protocol here

let gaID = "UA-8246384-12";

ga('create', gaID, 'auto');
ga('set', 'checkProtocolTask', function () {
}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200

const version = chrome.runtime.getManifest().version;

const sampleGA = [ // 0 = never, 1 = always, others as the % for 1/X
    {category: 'general', action: 'style_load', sample: 1000},
    {category: 'general', action: 'stylish_load', sample: 1000},
    {category: 'installed_styles_menu', action: null, sample: 100},
    {category: 'library_menu', action: null, sample: 100},
    {category: 'manage_installed_styles', action: null, sample: 100}
];

function analyticsMainEventReport(category, action, label, value) {

    label = label + " & " + version;
    if (typeof ga !== "function")
        return;

    for (const event of sampleGA) {
        //should meet category, and action if having action, otherwise - all events.
        if (event.category == category.toLowerCase() && ((event.action && event.action == action.toLowerCase()) || !event.action)) {
            //should match the sampling rule: 1 of X.
            if (event.sample > 0 && (Math.floor(event.sample * Math.random()) + 1 ) == 1) {
                ga('send', 'event', category, action, label, value);
            }
            return; //won't call the event: not again and as a fallback, as below.
        }
    }

    //will send the event anyhow, as no sample rule was found.
    ga('send', 'event', category, action, label, value);

}

function analyticsReduce(category, action, label, value) {
    if (localStorage.hasOwnProperty("GA_send_events") && localStorage.GA_send_events == "true") {
        analyticsMainEventReport(category, action, label, value);
    }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.gacategory)
        analyticsReduce(request.gacategory, request.gaaction || null, request.galabel || null, request.gavalue || null);
});

if (undefined === localStorage.GA_send_events) {
    //sampling one of 1000 users.
    if (42 === Math.floor(Math.random() * 1000)) {

        localStorage.GA_send_events = true;
        analyticsMainEventReport("General", "enabled");

    } else {
        localStorage.GA_send_events = false;
    }
}

function activeUserEvent(type, timeSince) {
        analyticsMainEventReport("Main KPIs", type + " Active user", timeSince || 'N/A');
}

function getUserAge() {
    return Math.floor((new Date().getTime() - localStorage.getItem("itemrstrtnq")) / (1000 * 60 * 60 * 24));
}

function dailyActiveUser() {
    const userAge = getUserAge();
    let lastAge = localStorage.getItem("lastAge");
    if(lastAge === null) {
        lastAge = 0;
    }

    const timeSince = userAge - lastAge;
    if (userAge != lastAge) {
        localStorage.setItem("lastAge", userAge);
    }
    if (userAge == 1 && !localStorage.getItem("D1")) {
        localStorage.setItem("D1", timeSince);
        activeUserEvent("D1", timeSince);
    } else if (userAge == 7 && !localStorage.getItem("D7")) {
        localStorage.setItem("D7", timeSince);
        activeUserEvent("D7", timeSince);
    } else if (userAge == 14 && !localStorage.getItem("D14")) {
        localStorage.setItem("D14", timeSince);
        activeUserEvent("D14", timeSince);
    } else if (userAge == 28 && !localStorage.getItem("D28")) {
        localStorage.setItem("D28", timeSince);
        activeUserEvent("D28", timeSince);
    } else if (userAge == 90 && !localStorage.getItem("D90")) {
        localStorage.setItem("D90", timeSince);
        activeUserEvent("D90", timeSince);
    }
}

function setDailyTracking() {
    dailyActiveUser();
    setInterval(dailyActiveUser, 1000 * 60 * 60 * 24);
}
