const typeFormatters = {
  [Number]: function (val) {
    return !Array.isArray(val) ? val : Number(val[val.length - 1]);
  },
  [String]: function (val) {
    return !Array.isArray(val) ? val : val[val.length - 1];
  },
  [Array]: function (val) {
    return val;
  },
  [Boolean]: function (val) {
    if (Array.isArray(val)) {
      val = val[val.length - 1];
    }
    return val !== false && val !== "false";
  },
};

const fromKebabCaseToCamelCase = require(__dirname + "/from-kebab-case-to-camel-case.js");

module.exports = function parse(configurations = {}, args = process.argv.slice(2)) {
  const output = {};
  let current = "_";
  const aliases = {};
  const arePositionalsForbidden = ("_" in configurations) && (configurations._ === false);
  delete configurations._;
  // -------------------------
  // Extraer aliases
  // -------------------------
  for (const settingId in configurations) {
    const setting = configurations[settingId];
    const aliasOriginal = setting.alias || [];
    const alias = Array.isArray(aliasOriginal) ? aliasOriginal : [aliasOriginal];
    for (let indexAlias = 0; indexAlias < alias.length; indexAlias++) {
      const possibleAlias = alias[indexAlias];
      aliases[possibleAlias] = settingId;
    }
  }
  // -------------------------
  // Parse argumentos
  // -------------------------
  let counter = 0;
  for (const arg of args) {
    counter++;
    if (arg.startsWith("--")) {
      const id = fromKebabCaseToCamelCase(arg.substring(2));
      if (!output[id]) {
        output[id] = [];
      }
      current = id;
    } else if (arg.startsWith("-")) {
      const alias = fromKebabCaseToCamelCase(arg.substring(1));
      if (!(alias in aliases)) {
        throw new Error(`Argument «${arg}» at position «${counter}» refers to a non-existing alias, valid alias are only «${Object.keys(aliases).map(alias => alias + "=" + aliases[alias]).join("», «")}»`);
      }
      const id = aliases[alias];
      if (!output[id]) {
        output[id] = [];
      }
      current = id;
    } else {
      if (!output[current]) {
        output[current] = [];
      }
      output[current].push(arg);
    }
  }
  // -------------------------
  // Aplicar configurations
  // -------------------------
  for (const settingId in configurations) {
    const setting = configurations[settingId];
    // default
    if (!(settingId in output)) {
      if ("default" in setting) {
        output[settingId] = setting.default;
      }
    }
    // type
    if ("type" in setting) {
      if (!(setting.type in typeFormatters)) {
        throw new Error(`Property «type» can only be class «String», «Number», «Boolean» or «Array» but type of «${typeof setting.type}» was found instead`);
      }
      const result = typeFormatters[setting.type](output[settingId]);
      output[settingId] = result;
    }
    // format
    if ("format" in setting) {
      const result = setting.format(output[settingId]);
      output[settingId] = result;
    }
  }
  if (arePositionalsForbidden) {
    if (output._ && output._.length) {
      throw new Error(`Positional parameters are forbidden but «${output._.length}» positional arguments(s) were found instead with «${output._.join("», «")}»`);
    }
    delete output._;
  }

  return output;

};