/**
 * Manages a single instance of the entire application.
 *
 * @author Mohamed Mansour 2011 (http://mohamedmansour.com)
 * @constructor
 */
BackgroundController = function() {
  this.onExtensionLoaded();
  this._embedCache = {};
};

/**
 * Triggered when the extension just loaded. Should be the first thing
 * that happens when chrome loads the extension.
 */
BackgroundController.prototype.onExtensionLoaded = function() {
  var currVersion = chrome.app.getDetails().version;
  var prevVersion = settings.version;
  if (currVersion != prevVersion) {
    // Check if we just installed this extension.
    if (typeof prevVersion == 'undefined') {
      this.onInstall();
    } else {
      this.onUpdate(prevVersion, currVersion);
    }
    settings.version = currVersion;
  }
};

/**
 * Triggered when the extension just installed.
 */
BackgroundController.prototype.onInstall = function() {
  // chrome.tabs.create({url: 'options.html'});
};

/**
 * Triggered when the extension just uploaded to a new version. DB Migrations
 * notifications, etc should go here.
 *
 * @param {string} previous The previous version.
 * @param {string} current  The new version updating to.
 */
BackgroundController.prototype.onUpdate = function(previous, current) {
  // chrome.tabs.create({url: 'updates.html'});
};

/**
 * Initialize the main Background Controller
 */
BackgroundController.prototype.init = function() {
  chrome.extension.onRequest.addListener(this.onMessage.bind(this));
};

/**
 * Message Passing Listener.
 */
BackgroundController.prototype.onMessage = function(request, sender, response) {
  if (request.method == 'GetEmbedHTML') {
    var url = request.data.url;
    var cachedHTML = this._embedCache[url];
    if (cachedHTML) {
      response({data: cachedHTML});
    }
    else {
      this.getEmbedHTML(request.data.domain, url, function(html) {
        this._embedCache[url] = html;
        response({data: html});
      }.bind(this));
    }
  }
};

/**
 * Fetch the embed html for the URL given. We only support the ones in
 * the object called EmbedData.
 *
 * @param {string} domain The domain we are embedding for.
 * @param {string} url The embed URL..
 * @param {Function} callback The callback URL when an embed was found.
 */
BackgroundController.prototype.getEmbedHTML = function(domain, url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function(e) {
    if (xhr.status == 200) {
      var response = JSON.parse(xhr.responseText);
      switch(response.type) {
        case 'link':
        case 'video':
        case 'rich':
          var html = response.html;
          // Nasty hack because soundcloud messes up with ssl support.
          if (domain == 'soundcloud') {
            html = html.replace(/http:\/\//g, 'https://');
          }
          callback(html);
          break;
        case 'photo':
          var html = '<p><strong>' + response.title + '</strong></p><a href="' +
                     response.author_url + '">' + '<img src="' + response.url +
                     '" alt="' + response.title + '" width="' + response.width + 
                     '" height="' + response.height + '"/></a>'
          callback(html);
          break;
      }
    }
    else {
      console.error('embed-extension: Cannot load ' + url);
    }
  };
  xhr.send(null);
};