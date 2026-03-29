module.exports = function (aliases = {}, argv = [...process.argv].splice(2)) {
  return argv.reduce((out, arg) => {
    if (arg.startsWith("--")) {
      const name = arg.substr(2);
      out.current = name;
      if (typeof out.args[name] === "undefined") {
        out.args[name] = true;
      }
      return out;
    } else if (arg.startsWith("-")) {
      const abbrName = arg.substr(1);
      if (abbrName in aliases) {
        const name = aliases[abbrName];
        out.current = name;
        if (typeof out.args[name] === "undefined") {
          out.args[name] = true;
        }
        return out;
      }
    }
    if (typeof out.args[out.current] === "undefined") {
      out.args[out.current] = arg;
    } else if (typeof out.args[out.current] === "boolean") {
      out.args[out.current] = [arg];
    } else if (Array.isArray(out.args[out.current])) {
      out.args[out.current].push(arg);
    }
    return out;
  }, { args: { _: [] }, current: '_' }).args;
};