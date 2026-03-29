
const fromCliArgsToMap = function (userSettings = {}, argv = [...process.argv].splice(2)) {
  // Con este condicional soportamos los 2 formatos: [alias]=destination:String & [destination]=options:Object
  const aliases = {};
  const defaultValues = {};
  const settings = Object.keys(userSettings).reduce((out, key) => {
    const val = userSettings[key];
    let id = key;
    if(typeof val === "string") {
      id = val;
      if(!(val in out)) {
        out[id] = { alias: [] };
      }
      out[id].alias.push(key);
    } else if(typeof val === "object") {
      out[id] = val;
    } else throw new Error(`Parameter «${key}» must be either string or object on «from-cli-args-to-map»`);
    if(typeof out[id].alias === "string") {
      out[id].alias = [out[id].alias];
    }
    if(out[id].alias) {
      out[id].alias.forEach(oneAlias => {
        aliases[oneAlias] = id;
      });
    }
    if("default" in out[id]) {
      defaultValues[id] = Array.isArray(out[id].default) ? out[id].default : [out[id].default];
    }
    return out;
  }, {});
  let output = Object.assign(defaultValues, argv.reduce((out, arg) => {
    if (arg.startsWith("--")) {
      const name = arg.substr(2);
      out.current = name;
      if (typeof out.args[out.current] === "undefined") {
        out.args[out.current] = true;
      }
      return out;
    } else if (arg.startsWith("-")) {
      const abbrName = arg.substr(1);
      if (abbrName in aliases) {
        const name = aliases[abbrName];
        out.current = name;
        if (typeof out.args[out.current] === "undefined") {
          out.args[out.current] = true;
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
  }, { args: { _: [] }, current: '_' }).args);
  Object.keys(settings).forEach(key => {
    if(!(key in output)) return;
    if(!("format" in settings[key])) return;
    output[key] = settings[key].format(output[key]);
  });
  return output;
};

module.exports = fromCliArgsToMap;

//*

// Ejemplo de uso:

const { watch, ignore, extensions, version, help } = fromCliArgsToMap({
  watch: {
    alias: "w",
    type: Array,
  },
  ignore: {
    alias: "i",
    type: Array,
  },
  extensions: {
    alias: "e",
    type: Array,
  },
  version: {
    alias: ["v","vv"],
    type: Boolean,
  },
  help: {
    alias: "h",
    type: Boolean,
    default: false,
  },
}, [ "--watch", "dir1", "dir2", "-i", "node_modules", "-e", "js,css,html", "-v"]);

console.log({ watch, ignore, extensions, version, help });

// 



//*/