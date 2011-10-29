/**
 * Embed List.
 *
 * The format to add an embedd is as follows:
 *   key: {
 *     regex: ...
 *     oembed: ...
 *   }
 *
 * Where:
 *   - key: the "domain" without the protocol, subdomain, and tld (some).
 *   - regex: the regular expression to do a match on the URL if found.
 *   - oembed: the oEmbed URL service. The URL will be appended to it.
 *
 */
EmbedData = {
  'flickr': {
    regex: 'http[s]?://[\\w-]+.flickr.com/photos/[\\w-]+',
    oembed: 'https://secure.flickr.com/services/oembed/?format=json&url='
  },
  'soundcloud': {
    regex: 'http[s]?://soundcloud.com/[\\w-]+/[\\w-]+',
    oembed: 'https://soundcloud.com/oembed?format=json&url='
  },
  'revision3': {
    regex: 'http://[\\w-]+.revision3.com/[\\w-/]+',
    oembed: 'http://revision3.com/api/oembed/?format=json&url='
  },
  'hulu': {
    regex: 'http://www.hulu.com/watch/\\d+/[\\w-]+',
    oembed: 'http://www.hulu.com/api/oembed.json?url='
  },
  'smugmug': {
    regex: 'http[s]?://smugmug.com/[\\w-]+/[\\w-]+',
    oembed: 'https://api.smugmug.com/services/oembed/?format=json&url='
  },
  'slideshare': {
    regex: 'http[s]?://www.slideshare.net/[\\w-]+/[\\w-]+',
    oembed: 'http://www.slideshare.net/api/oembed/2?format=json&url='
  }
};
