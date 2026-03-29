module.exports = function(source, mapper) {
  const output = {};
  Object.keys(source).forEach(key => {
    const result = mapper(key, source[key]);
    if((!Array.isArray(result)) || (result.length !== 2)) {
      output[key] = result;
      return;
    }
    const [key2,value2] = result;
    output[key2] = value2;
  });
  return output;
}