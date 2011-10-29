/**
 * EmbedInjection Content Script.
 *
 * @author Mohamed Mansour 2011 (http://mohamedmansour.com)
 * @constructor
 */
EmbedInjection = function() {
};

EmbedInjection.CONTENT_PANE_ID = '#contentPane';
EmbedInjection.CONTENT_ITEM_SELECTOR = 'div[id^="update"]';
EmbedInjection.ITEM_NAME_SELECTOR = 'span > a';


/**
 * Initialize the events that will be listening within this DOM.
 */
EmbedInjection.prototype.init = function() {
  var googlePlusContentPane = document.querySelector(EmbedInjection.CONTENT_PANE_ID);
  if (googlePlusContentPane) {
    googlePlusContentPane.addEventListener('DOMNodeInserted',
                                           this.onGooglePlusContentModified.bind(this), false);
    setTimeout(this.renderAllItems.bind(this), 100);
  }
};

/**
 * Render the "Share on ..." Link on each post.
 */
EmbedInjection.prototype.onGooglePlusContentModified = function(e) {
  // This happens when a new stream is selected
  if (e.relatedNode && e.relatedNode.parentNode && e.relatedNode.parentNode.id == 'contentPane') {
    // We're only interested in the insertion of entire content pane
    this.renderAllItems(e.target);
  } else if (e.target.nodeType == Node.ELEMENT_NODE && e.target.id.indexOf('update') == 0) {
    this.renderItem(e.target);
  }
};

/**
 * Render on all the items of the documents, or within the specified subtree
 * if applicable
 */
EmbedInjection.prototype.renderAllItems = function(subtreeDOM) {
  var queryDOM = typeof subtreeDOM == 'undefined' ? document : subtreeDOM;
  var items = queryDOM.querySelectorAll(EmbedInjection.CONTENT_ITEM_SELECTOR);
  for (var i = 0; i < items.length; i++) {
    this.renderItem(items[i]);
  }
};

/**
 * Render item to filter text. This is a quick index of search remove.
 */
EmbedInjection.prototype.renderItem = function(itemDOM) {
  if (!itemDOM || !itemDOM.parentNode || itemDOM.innerText == '') {
    return;
  }
  var embedDOM = itemDOM.querySelector('div[data-content-url]');
  if (embedDOM) {
    var embedContainer = embedDOM.parentNode;
    var dataURL = embedDOM.getAttribute('data-content-url');
    
    // We get the domain so we can quickly figure out what embed data it is for.
    // We do this instead of iterating the map.
    var domain = this.getDomain(dataURL);
    if (domain) {
      var embedAvailable = EmbedData[domain];
      if (embedAvailable) {
        if (dataURL.search(embedAvailable.regex) != -1) {
          var oEmbedURL = embedAvailable.oembed + dataURL;
          // TODO: Would be nice to cache this.
          this.getEmbedHTML(domain, oEmbedURL, function(html) {
            embedContainer.innerHTML  = html;
          });
        }
      }
    }
  }
};

/**
 * Parse out the domain from the extension. This is a quick hack. We need that
 * to improve performance by treating the embed data as a Map, so we don't need
 * to scan the entire shares.
 *
 * @param {string} url The complete url.
 */
EmbedInjection.prototype.getDomain = function(url) {
  var matches = url.match('https?://(?:\\w+\\.)?(.+)(?:\\.(?:com|net)){1}(?:.+)');
  if (matches) {
    return matches[1];
  }
  return null;
};

/**
 * Fetch the embed html for the URL given. We only support the ones in
 * the object called EmbedData/
 *
 * @param {string} domain The domain we are embedding for.
 * @param {string} url The embed URL..
 * @param {Function} callback The callback URL when an embed was found.
 */
EmbedInjection.prototype.getEmbedHTML = function(domain, url, callback) {
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
            html = html.replace('http://', 'https://');
          }
          callback(html);
          break;
        case 'photo':
          callback('<p><strong>' + response.title + '</strong></p><a href="' +
                    response.author_url + '">' + '<img src="' + response.url +
                   '" alt="' + response.title + '" width="' + response.width + 
                   '" height="' + response.height + '"/></a>');
          break;
      }
    }
    else {
      console.error('embed-extension: Cannot load ' + url);
    }
  };
  xhr.send(null);
};

// Main
var injection = new EmbedInjection();
injection.init();
