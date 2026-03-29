let trace = true;
module.exports = function(name, args = false) {
  if(trace) {
    console.log("[trace][refrescador][" + name + "]", !args ? "-" : Array.from(args).reduce((out, arg, index) => {
      return Object.assign(out, { [index]: arg });
    }, {}));
  }
}