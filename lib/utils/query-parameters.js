/*jshint esversion: 6 */
const url = require('url');

module.exports = function(request) {
  let url_parts = url.parse(request.url, true);
  return url_parts.query;
};
