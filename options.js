
document.title = chrome.i18n.getMessage('appName');
document.getElementById('pageTitle').innerHTML = chrome.i18n.getMessage('pageTitle');
document.getElementById('sites').innerHTML = chrome.i18n.getMessage('sites');
document.getElementById('save').innerHTML = chrome.i18n.getMessage('save');
document.getElementById('addSite').innerHTML = chrome.i18n.getMessage('addSite');

// Saves options to chrome.storage
function save_options() {
    var forms = document.getElementsByTagName('form');
    // turn forms into an array for easier manipulation
    var data = extractForm(Array.from(forms));
    chrome.storage.sync.set({data:data}, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = chrome.i18n.getMessage('statusText');
        setTimeout(function() {
            status.textContent = '';
        }, 1000);
    });
}

// get value from form elements and return an array of objects to store each form
function extractForm(elements) {
    var data = [];

    elements.forEach((form, i) => {
        var tmpForm = {}; // store the object to hold values for each loop
        tmpForm['name'] = form.elements.name.value;
        tmpForm['url'] = form.elements.url.value;
        if (form.elements.parms)
        {
            tmpForm['parms'] = [];
            for (var i = 0; i < form.elements.parms.length; i++) {
                var parm = form.elements.parms[i].value;
                var value = form.elements.values[i].value;
                tmpForm['parms'].push({parm:parm, value:value});
            }
        }
        data.push(tmpForm);
    });

    return data;
}

// Restores forms and their states using the preferences
// stored in chrome.storage.
function restore_options() {
    chrome.storage.sync.get('data', function(items) {
        // skip if no options
        if (!items.data)
            return;
        items.data.forEach((form, i) => {
            buildForm(form);
        });

    });
}

// insert inputs for parameters before elem in elem's form
function createParameter(elem, values) {
    var br = document.createElement('br');
    var form = elem.parentElement; // form to add elements to

    // container for the parameter set for easy removal from form
    var setDiv = document.createElement('div');

    // input field for a paramerters key
    var parm = document.createElement('input');
    parm.setAttribute('type', 'text');
    parm.setAttribute('name', 'parms');
    parm.setAttribute('id', 'parms');

    // div to hold a label and input field pair for a parameter's key and value
    var parmDiv = document.createElement('div');
    parmDiv.setAttribute('class', 'topLabel');

    // label for parm key input field
    var parmLabel = document.createElement('label');
    parmLabel.setAttribute('for', 'parms');
    parmLabel.textContent = chrome.i18n.getMessage('parmLabel');

    parmDiv.append(parmLabel);
    parmDiv.append(parm);

    // input field for parameter value
    var value = document.createElement('input');
    value.setAttribute('type', 'text');
    value.setAttribute('name', 'values[]');
    value.setAttribute('id', 'values');

    // div to hold a label and input field pair for a parameter's key and value
    var valueDiv = document.createElement('div');
    valueDiv.setAttribute('class', 'topLabel');

    // label for parm value input field
    var valueLabel = document.createElement('label');
    valueLabel.setAttribute('for', 'values');
    valueLabel.textContent = chrome.i18n.getMessage('valueLabel');
    valueDiv.append(valueLabel);
    valueDiv.append(value);

    // button to delete a parameter input set
    var delPrm = document.createElement('button');
    delPrm.setAttribute('id', 'delPrm');
    delPrm.textContent = chrome.i18n.getMessage('delPrm');
    delPrm.addEventListener('click', delParameter);

    setDiv.append(parmDiv);
    setDiv.append(valueDiv);
    setDiv.append(delPrm);

    // insert above the create element button that was clicked
    form.insertBefore(setDiv, elem);
    form.insertBefore(br, elem);

    // fill the parameters into the form if there are values
    if (values)
    {
        parm.value = values.parm;
        value.value = values.value;
    }
}

// simple function to process button click event
function addParameter(event) {
    event.preventDefault();
    createParameter(this, null);
}

// delete the parameter set
function delParameter(event) {
    event.preventDefault();
    this.parentElement.remove();
}

// create the form to hold the search site settings with optional pre-filled values
function buildForm(formValues) {
    // div to hold each form for easy styling
    let siteDiv = document.getElementById('siteList');
    var form = document.createElement('form');
    var br = document.createElement('br');

    // div to hold the label and input box for the site name
    var nameDiv = document.createElement('div');
    nameDiv.setAttribute('class', 'topLabel');

    // label for site name input
    var nameLabel = document.createElement('label');
    nameLabel.setAttribute('for', 'name');
    nameLabel.textContent = chrome.i18n.getMessage('siteName');

    // input box for site name
    var name = document.createElement('input');
    name.setAttribute('type', 'text');
    name.setAttribute('id', 'name');
    name.setAttribute('name', 'name');
    name.setAttribute('size', '25');

    nameDiv.append(nameLabel);
    nameDiv.append(name);

    // div to hold label and input box for the site url
    var urlDiv = document.createElement('div');
    urlDiv.setAttribute('class', 'topLabel');

    // label for site url input
    var urlLabel = document.createElement('label');
    urlLabel.setAttribute('for', 'url');
    urlLabel.textContent = chrome.i18n.getMessage('siteURL');

    // input box for site url
    var url = document.createElement('input');
    url.setAttribute('type', 'text');
    url.setAttribute('id', 'url');
    url.setAttribute('name', 'url');
    url.setAttribute('size', '75');

    urlDiv.append(urlLabel);
    urlDiv.append(url);

    // header for the parameters section of the form
    var parmSection = document.createElement('h3');
    parmSection.textContent = chrome.i18n.getMessage('parmSection');

    // button to add parameters to the form
    var addPrm = document.createElement('button');
    addPrm.setAttribute('id', 'addPrm');
    addPrm.textContent = chrome.i18n.getMessage('addPrm');
    addPrm.addEventListener('click', addParameter);

    // button to add another site form
    var delForm = document.createElement('button');
    delForm.setAttribute('id', 'delForm');
    delForm.textContent = chrome.i18n.getMessage('delForm');
    delForm.addEventListener('click', removeForm);

    form.append(nameDiv);
    form.append(urlDiv);
    form.append(br);
    form.append(parmSection);
    form.append(br);
    form.append(addPrm);
    form.append(br);
    form.append(delForm);

    siteDiv.appendChild(form);

    // fill the form with values from the saved options
    if (formValues)
    {
        name.value = formValues.name
        url.value = formValues.url
        if (formValues.parms)
        {
            formValues.parms.forEach((parm, i) => {
                createParameter(addPrm, parm);
            });
        }
    }
}

// handle the remove button event and remove the site form
function removeForm(event) {
    event.preventDefault();

    var form = this.parentElement;
    form.remove();
}

// process click event for add form button
// used to discard event parameters
function addForm() {
    buildForm();
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('addSite').addEventListener('click', addForm);
