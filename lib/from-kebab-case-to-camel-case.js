module.exports = function(text) {
  return text.replace(/\-./g, (match) => match.substr(1).toUpperCase());
}