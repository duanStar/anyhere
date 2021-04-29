const { cache } = require("../config/defaultConfig");

function refreshRes(stats, res) {
  const { maxAge, expires, cacheControl, eTag, lastModified } = cache;
  if (expires) {
    res.setHeader(
      "Expires",
      new Date(Date.now() + maxAge * 1000).toUTCString()
    );
  }
  if (cacheControl) {
    res.setHeader("cache-control", `max-age=${maxAge}`);
  }
  if (lastModified) {
    res.setHeader("last-modified", stats.mtime.toUTCString());
  }
  if (eTag) {
    res.setHeader('ETag', `${stats.size}-${stats.mtime.toUTCString().substr(0, 3)}`);
  }
}


module.exports = function isFresh(stats, req, res) {
    refreshRes(stats, res);

    const lastModified = req.headers['if-modified-since'];
    const eTag = req.headers['if-none-match'];
    if (!lastModified && !eTag) {
        return false;
    }
    if(lastModified && lastModified !==res.getHeader('last-modified')){
        return false;
    }
    if(eTag && eTag !== res.getHeader('ETag')){
        return false;
    }
    return true;
}