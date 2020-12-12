
'use strict';
// Add a listener to create the initial context menu items,
chrome.runtime.onInstalled.addListener(function() {
    // Grab options from sunced Chrome storage
    chrome.storage.sync.get('data', function(items) {
        // if there are no options saved, do nothing
        if (!items.data)
            return;

        // create the menu items
        items.data.forEach((form, i) => {
            chrome.contextMenus.create({
                id: form.name,
                title: form.name,
                type: 'normal',
                contexts: ['selection'],
            });
        });
    });
});

// perform the search on the chosen site
chrome.contextMenus.onClicked.addListener(function(item, tab) {
    var data = []; // holds the options from storage
    var menuItem = {}; // selected menu item options
    var parameters = ""; // stores the url encoded parameter string

    chrome.storage.sync.get('data', function(items) {
        data = items.data;
        // get settings for clicked menu item from chrome storage
        data.forEach((form, i) => {
            if (form.name == item.menuItemId)
            {
                menuItem = form;
            }
        });
        // build parameter string
        if (menuItem.parms)
        {
            menuItem.parms.forEach((parm, i) => {
                parameters += "&" + encodeURIComponent(parm.parm) + "=" + encodeURIComponent(parm.value);
            });
        }
        // create and open url
        let url = menuItem.url + encodeURIComponent(item.selectionText) + parameters;
        chrome.tabs.create({url: url, index: tab.index + 1});
    });
});

// add or remove context menu items when they change in the options
chrome.storage.onChanged.addListener(function(list, sync) {
    let newlyDisabled = [];
    let newlyEnabled = [];
    var menu = [];
    let newMenu = list.data.newValue || [];
    let oldMenu = list.data.oldValue || [];
    chrome.storage.sync.get('data', function(items) {
        if (!items.data)
            return;

        // determine if menu itmes were added or removed
        menu = (oldMenu.length > newMenu.length) ? oldMenu : newMenu;


        for (let key of menu) {
            if (newMenu.some(e => e.name == key.name) && !oldMenu.some(e => e.name == key.name)) {
                newlyEnabled.push({
                    id: key.name,
                    title: key.name
                });
            } else if (oldMenu.some(e => e.name == key.name) && !newMenu.some(e => e.name == key.name)) {
                newlyDisabled.push(key.name);
            }
        }
        // add new menu items
        for (let item of newlyEnabled) {
            chrome.contextMenus.create({
                id: item.id,
                title: item.title,
                type: 'normal',
                contexts: ['selection'],
            });
        }
        // remove old menu itmes
        for (let item of newlyDisabled) {
            chrome.contextMenus.remove(item);
        }
    });
});
