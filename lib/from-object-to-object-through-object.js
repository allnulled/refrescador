module.exports = function(source, mapperMap) {
  const output = {};
  Object.keys(source).forEach(key => {
    const mapper = key in mapperMap ? mapperMap[key] : (k,v) => [k,v];
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