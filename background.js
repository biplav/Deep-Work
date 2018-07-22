var isEnabled = false;
var tabCount = 0;
var maxTabs = 3;
var tabsCount;


var bkg = chrome.extension.getBackgroundPage();
bkg.console.log('Focus Mode Loaded');

function updateTabsCount() {
    chrome.tabs.query({
        windowType: 'normal',
        pinned: false
    }, function (tabs) {
        tabsCount = tabs.length;
        if(tabsCount != maxTabs) chrome.browserAction.setBadgeText({'text': "F"});
        else chrome.browserAction.setBadgeText({'text': "Max"});
    });
}


function handleTabCreated(tab) {
    if (tabsCount >= maxTabs) {
        chrome.tabs.remove(tab.id);
        chrome.browserAction.setBadgeText({'text': "Max"});
    }
    else {
        updateTabsCount();
    }
}

function handleTabRemoved(tab) {
    updateTabsCount();
}

function handleTabUpdated(tab) {
    updateTabsCount();
}


function enterFocusMode() {
    chrome.tabs.query({
        windowType: 'normal',
        pinned: false
    }, function (tabs) {
        activeTabsCount = tabs.length;
        var allUrls = [];
        var allTabIds = [];
        tabs.forEach(function(tab) {
        		/*bkg.console.log(tab.url);
        		bkg.console.log(tab.title);
        		bkg.console.log(tab.favIconUrl);*/
        		allUrls.push({
        			url : tab.url,
        			title : tab.title,
        			icon: tab.favIconUrl
        		})
        		allTabIds.push(tab.id);
        	});
        bkg.console.log(allUrls);
        chrome.storage.local.set({"opentabs" : allUrls }, function() {
      	console.log('All Urls Saved');
      	chrome.tabs.create({"url" : "https://www.google.com/?"+Date.now()});
      	chrome.tabs.remove(allTabIds);
    	});
    });
}

function init() {
	enterFocusMode();
	chrome.tabs.onCreated.addListener(handleTabCreated);
    chrome.tabs.onRemoved.addListener(handleTabRemoved);
    chrome.tabs.onUpdated.addListener(handleTabUpdated);
}

function leaveFocusMode() {
	chrome.storage.local.get(['opentabs'],function(items){
		bkg.console.log(items);
		items.opentabs.forEach(function(tab){
			chrome.tabs.create({
				url : tab.url,
				active : false,
				selected : false,
			});		
		});
	});
}

function destruct(){
	leaveFocusMode();
	chrome.tabs.onCreated.removeListener(handleTabCreated);
    chrome.tabs.onRemoved.removeListener(handleTabRemoved);
    chrome.tabs.onUpdated.removeListener(handleTabUpdated);
}

chrome.browserAction.onClicked.addListener(function (tab) {
    if (!isEnabled) {
        init();
        chrome.browserAction.setIcon({ path: { 19: "icons/enabled_19.png"  } });
        chrome.browserAction.setBadgeText({ 'text': 'F' });
    }
    else {
        destruct();
        chrome.browserAction.setIcon({ path: { 38 : "icons/disabled_38.png" } } );
        chrome.browserAction.setBadgeText({ 'text': '' });
    }

    isEnabled = !isEnabled;
});
