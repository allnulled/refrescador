var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// lib/colors.js
var require_colors = __commonJS({
  "lib/colors.js"(exports2, module2) {
    module2.exports = Object.assign({
      available: {
        // estilos
        bold: [1, 22],
        italic: [3, 23],
        underline: [4, 24],
        blink: [5, 25],
        inverse: [7, 27],
        strike: [9, 29],
        // colores
        black: [30, 39],
        red: [31, 39],
        green: [32, 39],
        yellow: [33, 39],
        blue: [34, 39],
        magenta: [35, 39],
        cyan: [36, 39],
        white: [37, 39],
        // fondo
        bgBlack: [40, 49],
        bgRed: [41, 49],
        bgGreen: [42, 49],
        bgYellow: [43, 49],
        bgBlue: [44, 49],
        bgMagenta: [45, 49],
        bgCyan: [46, 49],
        bgWhite: [47, 49],
        // brillantes
        blackBright: [90, 39],
        redBright: [91, 39],
        greenBright: [92, 39],
        yellowBright: [93, 39],
        blueBright: [94, 39],
        magentaBright: [95, 39],
        cyanBright: [96, 39],
        whiteBright: [97, 39],
        bgBlackBright: [100, 49],
        bgRedBright: [101, 49],
        bgGreenBright: [102, 49],
        bgYellowBright: [103, 49],
        bgBlueBright: [104, 49],
        bgMagentaBright: [105, 49],
        bgCyanBright: [106, 49],
        bgWhiteBright: [107, 49]
      },
      endToken: "\x1B[0m",
      squad: {
        tl: "\u250C",
        tr: "\u2510",
        bl: "\u2514",
        br: "\u2518"
      },
      line: {
        h: "\u2500",
        v: "\u2502"
      },
      style: function(config = "red,bold,underline") {
        const styles = config.split(",");
        return {
          text: (text) => {
            const begin = styles.reduce((out, it) => {
              if (!(it in this.available)) {
                return out;
              }
              const code = this.available[it];
              out += `\x1B[${code[0]}m`;
              return out;
            }, "");
            const end = this.endToken;
            return `${begin}${text}${end}`;
          }
        };
      },
      stripAnsi: function(str) {
        return str.replace(/\x1b\[[0-9;]*m/g, "");
      },
      wrapAnsi: function(str, maxWidth) {
        return require("wrap-ansi").default(str, maxWidth, {
          hard: true
        });
      },
      box: function(text, maxWidth = 110) {
        const lines = this.wrapAnsi(text, maxWidth).split("\n");
        const cleanLines = lines.map((l) => this.stripAnsi(l));
        const width = Math.max(...cleanLines.map((l) => l.length));
        const top = "\u250C" + "\u2500".repeat(width + 2) + "\u2510";
        const bottom = "\u2514" + "\u2500".repeat(width + 2) + "\u2518";
        const body = lines.map((line) => {
          const clean = this.stripAnsi(line);
          const pad = width - clean.length;
          return "\u2502 " + line + " ".repeat(pad) + " \u2502";
        }).join("\n");
        return `${top}
${body}
${bottom}`;
      }
    }, {
      table: function table(listOfColumns, options = {}) {
        const Table = require("cli-table3");
        const table2 = new Table(options);
        table2.push(...listOfColumns);
        return table2.toString();
      },
      borderlessTable: function borderlessTable(listOfColumns, optionsObject = {}) {
        return this.alignTable(listOfColumns, 2, optionsObject);
      },
      visibleLength(str) {
        return require("strip-ansi").default(str).length;
      },
      alignTable(rows, gap = 2, max = {}) {
        for (let indexRow = 0; indexRow < rows.length; indexRow++) {
          const row = rows[indexRow];
          for (let indexCol = 0; indexCol < row.length; indexCol++) {
            const cell = row[indexCol];
            const cellLen = this.visibleLength(cell);
            if (!(indexCol in max)) {
              max[indexCol] = 5;
            }
            if (max[indexCol] < cellLen) {
              max[indexCol] = cellLen;
            }
          }
        }
        let out = "";
        for (let indexRow = 0; indexRow < rows.length; indexRow++) {
          const row = rows[indexRow];
          for (let indexCol = 0; indexCol < row.length; indexCol++) {
            const cell = row[indexCol];
            const currCellLen = this.visibleLength(cell);
            const cellLen = max[indexCol];
            const col = cell + " ".repeat(cellLen - currCellLen);
            if (indexCol !== 0) {
              out += " \u2502 ";
            }
            out += col;
          }
          out += "\n";
        }
        return out.trimEnd();
      },
      padLinesToMax: function padLinesToMax(text) {
        const lines = text.split("\n");
        let out = "";
        let max = 0;
        for (let index = 0; index < lines.length; index++) {
          const line = lines[index];
          if (max < line.length) {
            max = line.length;
          }
        }
        for (let index = 0; index < lines.length; index++) {
          const line = lines[index];
          const padded = line.padEnd(max, " ");
          if (index !== 0) out += "\n";
          out += padded;
        }
        return out;
      }
    });
  }
});

// lib/from-condition-to-error.js
var require_from_condition_to_error = __commonJS({
  "lib/from-condition-to-error.js"(exports2, module2) {
    module2.exports = function(condition, message) {
      if (!condition) throw new Error(message);
    };
  }
});

// lib/trace.js
var require_trace = __commonJS({
  "lib/trace.js"(exports2, module2) {
    var trace = true;
    module2.exports = function(name, args = false) {
      if (trace) {
        console.log("[trace][refrescador][" + name + "]", !args ? "-" : Array.from(args).reduce((out, arg, index) => {
          return Object.assign(out, { [index]: arg });
        }, {}));
      }
    };
  }
});

// lib/from-kebab-case-to-camel-case.js
var require_from_kebab_case_to_camel_case = __commonJS({
  "lib/from-kebab-case-to-camel-case.js"(exports2, module2) {
    module2.exports = function(text) {
      return text.replace(/\-./g, (match) => match.substr(1).toUpperCase());
    };
  }
});

// lib/from-cli-args-to-map.js
var require_from_cli_args_to_map = __commonJS({
  "lib/from-cli-args-to-map.js"(exports2, module2) {
    var typeFormatters = {
      [Number]: function(val) {
        return !Array.isArray(val) ? val : Number(val[val.length - 1]);
      },
      [String]: function(val) {
        return !Array.isArray(val) ? val : val[val.length - 1];
      },
      [Array]: function(val) {
        return val;
      },
      [Boolean]: function(val) {
        if (Array.isArray(val)) {
          val = val[val.length - 1];
        }
        return val !== false && val !== "false";
      }
    };
    var trace = require_trace();
    var assertion = require_from_condition_to_error();
    var fromKebabCaseToCamelCase = require_from_kebab_case_to_camel_case();
    module2.exports = function(configurations = {}, args = process.argv.slice(2)) {
      const output = {};
      let current = "_";
      const aliases = {};
      const arePositionalsForbidden = "_" in configurations && configurations._ === false;
      delete configurations._;
      assertion(Array.isArray(args), "Parameter \xABargs\xBB must be array on \xABfrom-cli-args-to-map\xBB");
      for (const settingId in configurations) {
        const setting = configurations[settingId];
        const aliasOriginal = setting.alias || [];
        const alias = Array.isArray(aliasOriginal) ? aliasOriginal : [aliasOriginal];
        for (let indexAlias = 0; indexAlias < alias.length; indexAlias++) {
          const possibleAlias = alias[indexAlias];
          aliases[possibleAlias] = settingId;
        }
      }
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
            throw new Error(`Argument \xAB${arg}\xBB at position \xAB${counter}\xBB refers to a non-existing alias, valid alias are only \xAB${Object.keys(aliases).map((alias2) => alias2 + "=" + aliases[alias2]).join("\xBB, \xAB")}\xBB`);
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
      for (const settingId in configurations) {
        const setting = configurations[settingId];
        if (!(settingId in output)) {
          if ("default" in setting) {
            output[settingId] = setting.default;
          }
        }
        if ("type" in setting) {
          if (!(setting.type in typeFormatters)) {
            throw new Error(`Property \xABtype\xBB can only be class \xABString\xBB, \xABNumber\xBB, \xABBoolean\xBB or \xABArray\xBB but type of \xAB${typeof setting.type}\xBB was found instead`);
          }
          const result = typeFormatters[setting.type](output[settingId]);
          output[settingId] = result;
        }
        if ("format" in setting) {
          const result = setting.format(output[settingId]);
          output[settingId] = result;
        }
      }
      if (arePositionalsForbidden) {
        if (output._ && output._.length) {
          throw new Error(`Positional parameters are forbidden but \xAB${output._.length}\xBB positional arguments(s) were found instead with \xAB${output._.join("\xBB, \xAB")}\xBB`);
        }
        delete output._;
      }
      return output;
    };
  }
});

// lib/from-schema-to-type-assertions.js
var require_from_schema_to_type_assertions = __commonJS({
  "lib/from-schema-to-type-assertions.js"(exports2, module2) {
    module2.exports = function(data, schema) {
      if (typeof data !== "object") {
        throw new Error("Parameter \xABdata\xBB must be object on \xABfrom-schema-to-type-assertion\xBB");
      }
      if (typeof schema !== "object") {
        throw new Error("Parameter \xABschema\xBB must be object on \xABfrom-schema-to-type-assertion\xBB");
      }
      const dataKeys = Object.keys(data);
      const schemaKeys = Object.keys(schema);
      for (let index = 0; index < dataKeys.length; index++) {
        const dataKey = dataKeys[index];
        if (schemaKeys.indexOf(dataKey) === -1) {
          throw new Error(`Property \xAB${dataKey}\xBB is not accepted and it can only be one out of \xAB${schemaKeys.join("|")}\xBB on \xABfrom-schema-to-type-assertions\xBB`);
        }
      }
      for (let index = 0; index < schemaKeys.length; index++) {
        const schemaKey = schemaKeys[index];
        const schemaValue = schema[schemaKey];
        const schemaType = schemaValue.type;
        const hasDefault = "default" in schemaValue;
        const hasKey = schemaKey in data;
        if (!hasDefault && !hasKey) {
          throw new Error(`Property \xAB${schemaKey}\xBB must be explicitly set or provided with \xABdefault\xBB on \xABfrom-schema-to-type-assertions\xBB`);
        }
        const dataValue = hasKey ? data[schemaKey] : typeof schemaValue.default === "function" && schemaType !== Function ? schemaValue.default(data) : schemaValue.default;
        if (schemaType === Array) {
          if (!Array.isArray(dataValue)) {
            throw new Error(`Property \xAB${schemaKey}\xBB must be array but \xAB${typeof dataValue}\xBB was found instead on \xABfrom-schema-to-type-assertions\xBB`);
          }
        } else if (schemaType === String) {
          if (typeof dataValue !== "string") {
            throw new Error(`Property \xAB${schemaKey}\xBB must be string but \xAB${typeof dataValue}\xBB was found instead on \xABfrom-schema-to-type-assertions\xBB`);
          }
        } else if (schemaType === Boolean) {
          if (typeof dataValue !== "boolean") {
            throw new Error(`Property \xAB${schemaKey}\xBB must be boolean but \xAB${typeof dataValue}\xBB was found instead on \xABfrom-schema-to-type-assertions\xBB`);
          }
        } else if (schemaType === Object) {
          if (typeof dataValue !== "object") {
            throw new Error(`Property \xAB${schemaKey}\xBB must be object but \xAB${typeof dataValue}\xBB was found instead on \xABfrom-schema-to-type-assertions\xBB`);
          }
        } else if (schemaType === Number) {
          if (typeof dataValue !== "number") {
            throw new Error(`Property \xAB${schemaKey}\xBB must be number but \xAB${typeof dataValue}\xBB was found instead on \xABfrom-schema-to-type-assertions\xBB`);
          }
        } else if (typeof schemaType === "function") {
          if (dataValue instanceof schemaType) {
            throw new Error(`Property \xAB${schemaKey}\xBB must be instance of \xAB${schemaType.name}\xBB but \xAB${typeof dataValue}\xBB was found instead on \xABfrom-schema-to-type-assertions\xBB`);
          }
        } else if (schemaType === Function) {
          if (typeof dataValue !== "function") {
            throw new Error(`Property \xAB${schemaKey}\xBB must be function but \xAB${typeof dataValue}\xBB was found instead on \xABfrom-schema-to-type-assertions\xBB`);
          }
        }
      }
    };
  }
});

// lib/from-glob-watcher-to-socketio-emit.js
var require_from_glob_watcher_to_socketio_emit = __commonJS({
  "lib/from-glob-watcher-to-socketio-emit.js"(exports2, module2) {
    var defaultConfig = {
      port: 3e3,
      extensions: ["html", "css", "js", "json"],
      watch: ["src/**/*.html", "src/**/*.js"],
      // globs
      ignore: ["node_modules/**", ".git/**"],
      // ignore patterns
      ignoreCallback: "",
      // js file exporting ignore callback
      debounce: 50,
      // ms para agrupar eventos
      message: "",
      urlPrefix: "",
      execute: [],
      payloadFile: "",
      payload: ""
    };
    module2.exports = function(userConfig = {}) {
      const fs = require("fs");
      const path = require("path");
      const express = require("express");
      const http = require("http");
      const chokidar = require("chokidar");
      const ejs = require("ejs");
      const child_process = require("child_process");
      const colors = require_colors();
      const util = require("util");
      const execAsync = util.promisify(child_process.exec);
      const { Server } = require("socket.io");
      const color1 = (text) => console.log(colors.style("magenta,bold").text(text));
      const color2 = (text) => console.log(colors.style("green,bold").text(text));
      const color3 = (text) => console.log(colors.style("cyan,bold").text(text));
      const colorSuccess = (text) => console.log(colors.style("green,bold").text(text));
      const colorError = (text) => console.log(colors.style("red,bold").text(text));
      const colorWarn = (text) => console.log(colors.style("yellow,bold").text(text));
      const colorInform = (text) => console.log(colors.style("cyan,bold").text(text));
      const config = Object.assign({}, defaultConfig, userConfig);
      const listSeparator = "\n       - ";
      const staticDir = path.resolve(config.serve || process.cwd());
      const printConfigurations = function() {
        color1(`\u{1F527} Configuraciones del refrescador:`);
        color1(`   - port:            ${colors.endToken}${listSeparator}${config.port}`);
        color1(`   - watch:           ${colors.endToken}${listSeparator}${!config.watch.length ? "(none)" : config.watch.map((f) => path.resolve(f)).join(listSeparator)}`);
        color1(`   - debounce:        ${colors.endToken}${listSeparator}${config.debounce}`);
        color1(`   - message:         ${colors.endToken}${listSeparator}${config.message}`);
        color1(`   - messageFile:     ${colors.endToken}${listSeparator}${config.messageFile}`);
        color1(`   - extensions:      ${colors.endToken}${listSeparator}${!config.extensions.length ? "(none)" : config.extensions.join(listSeparator)}`);
        color1(`   - ignore:          ${colors.endToken}${listSeparator}${!config.ignore.length ? "(none)" : config.ignore.map((f) => path.resolve(f)).join(listSeparator)}`);
        color1(`   - ignoreCallback:  ${colors.endToken}${listSeparator}${!config.ignoreCallback.length ? "(none)" : config.ignoreCallback}`);
        color1(`   - payload:         ${colors.endToken}${listSeparator}${config.payload.length} characters`);
        color1(`   - payloadFile:     ${colors.endToken}${listSeparator}${config.payloadFile ? config.payloadFile : "(none)"}`);
        color1(`   - serve:           ${colors.endToken}${listSeparator}${staticDir}`);
        color1(`   - urlPrefix:       ${colors.endToken}${listSeparator}${!config.urlPrefix ? "(none)" : config.urlPrefix}`);
        color1(`   - execute:         ${colors.endToken}${listSeparator}${!config.execute.length ? "(none)" : config.execute.join(listSeparator)}`);
        color1(`   - executeCallback: ${colors.endToken}${listSeparator}${!config.executeCallback.length ? "(none)" : config.executeCallback.join(listSeparator)}`);
        color1(`   - bulletproof:     ${colors.endToken}${listSeparator}${config.bulletproof ? "yes" : "no"}`);
      };
      config.urlPrefix = config.urlPrefix ? "/" + config.urlPrefix.replace(/^\//g, "") : config.urlPrefix;
      const pkgPath = require.resolve("socket.io/package.json");
      const socketioDir = path.dirname(pkgPath);
      const socketIoClientPath = path.join(socketioDir, "client-dist/socket.io.js");
      const socketIoClientCode = fs.readFileSync(socketIoClientPath);
      const refrescadorClientPath = path.resolve(__dirname + "/template-for-socket.io-client-reloader.ejs");
      const refrescadorClientTemplate = fs.readFileSync(refrescadorClientPath).toString();
      const refrescadorClientCode = ejs.render(refrescadorClientTemplate, { require, config }, {});
      const indexHtmlPath = path.resolve(__dirname + "/index.ejs.html");
      const indexHtmlTemplate = fs.readFileSync(indexHtmlPath).toString();
      const indexHtmlCode = ejs.render(indexHtmlTemplate, { require, config }, {});
      if (refrescadorClientPath.endsWith(".ejs")) {
        const refrescadorFinalClientPath = refrescadorClientPath.replace(/\.ejs$/g, ".js");
        fs.writeFileSync(refrescadorFinalClientPath, `/* This file is only for debugging purposes. The served source is cached by the server */
` + refrescadorClientCode, "utf8");
      }
      if (!fs.lstatSync(staticDir).isDirectory()) {
        throw new Error(`Parameter \xAB--serve\xBB must point to a valid directory and not \xAB${staticDir}\xBB`);
      }
      const app = express();
      const router = express.Router();
      router.get("/index.html", async (req, res, next) => {
        try {
          const hypoIndexPath = path.resolve(config.serve, "index.ejs.html");
          const indexContent = await fs.promises.readFile(hypoIndexPath, "utf8");
          const indexSource = ejs.render(indexContent, { require, config }, {});
          res.type("text/html");
          res.send(indexSource);
        } catch (error) {
          next();
        }
      });
      router.use(express.static(staticDir));
      router.get("/socket.io-client.js", (req, res) => {
        res.type("application/javascript");
        res.send(socketIoClientCode);
      });
      router.get("/client.js", (req, res) => {
        res.type("application/javascript");
        res.send(refrescadorClientCode);
      });
      router.get("/index.html", (req, res) => {
        res.type("text/html");
        res.send(indexHtmlCode);
      });
      if (config.urlPrefix) {
        app.use(config.urlPrefix, router);
      } else {
        app.use(router);
      }
      const server = http.createServer(app);
      const io = new Server(server, {
        cors: { origin: "*" }
      });
      io.on("connection", (socket) => {
        console.log("\u{1F7E2} Cliente conectado:", socket.id);
        socket.on("disconnect", () => {
          console.log("\u{1F534} Cliente desconectado:", socket.id);
        });
      });
      let timeout = null;
      let running = false;
      const triggerReload = function(path2) {
        console.log(`[refrescador] [triggered] ${path2}`);
        return new Promise((resolve, reject) => {
          if (running) return;
          if (timeout) clearTimeout(timeout);
          initEvent = /* @__PURE__ */ new Date();
          timeout = setTimeout(async () => {
            const timings = [];
            try {
              console.clear();
              printUrls();
              colorWarn("\u267B\uFE0F  Changes detected by refrescador on file:");
              colorWarn(`  \u{1F4C4} ${path2}`);
              if (config.executeCallback.length) {
                Iterating_execution_callbacks:
                  for (let index = 0; index < config.executeCallback.length; index++) {
                    const init = /* @__PURE__ */ new Date();
                    const callbackFileBrute = require("path").resolve(process.cwd(), config.executeCallback[index]);
                    const isFresh = /^\!/g.test(callbackFileBrute);
                    const callbackFile = callbackFileBrute.replace(/^\!/g, "");
                    if (isFresh) {
                      delete require.cache[callbackFile];
                    }
                    colorWarn(`\u{1F7E8} \u26A1\uFE0F Started callback [\u{1F4DE}=${callbackFile}] [${index + 1}/${config.executeCallback.length}]`);
                    const callback = require(callbackFile);
                    let result = void 0;
                    try {
                      result = await callback(path2);
                      diff = /* @__PURE__ */ new Date() - init;
                      colorSuccess(`\u{1F7E9} \u{1F38A} Done [\u23F3=${diff / 1e3}s] [\u{1F4BB}=${callbackFile}] [${index + 1}/${config.execute.length}]`);
                    } catch (error) {
                      colorError(`\u{1F7E5} \u2757\uFE0F Error executing callback \xAB${callbackFile}\xBB:`, error);
                      throw error;
                    }
                    if (result instanceof AbortController) {
                      colorError(`\u{1F7E5} \u2757\uFE0F Aborting filewatcher event by execution callback \u26A0\uFE0F`);
                      return result;
                    }
                  }
              }
              if (config.execute.length) {
                Iterating_executions:
                  for (let index = 0; index < config.execute.length; index++) {
                    const command = config.execute[index].replace("@{refrescador.file}", JSON.stringify(path2));
                    colorWarn(`\u{1F7E8} \u26A1\uFE0F Started [\u{1F4BB}=${command}] [${index + 1}/${config.execute.length}]`);
                    const init = /* @__PURE__ */ new Date();
                    try {
                      await new Promise((resolve2, reject2) => {
                        const child = child_process.spawn(command, {
                          stdio: "inherit",
                          shell: true
                        });
                        child.on("close", (code) => {
                          if (code === 0) {
                            resolve2(code);
                          } else {
                            reject2(new Error(`Exit code: ${code}`));
                          }
                        });
                        child.on("error", reject2);
                      });
                      const diff2 = /* @__PURE__ */ new Date() - init;
                      timings.push({ command, diff: diff2 });
                      colorSuccess(`\u{1F7E9} \u{1F38A} Done [\u23F3=${diff2 / 1e3}s] [\u{1F4BB}=${command}] [${index + 1}/${config.execute.length}]`);
                    } catch (error) {
                      colorError(`\u{1F7E5}\u{1F7E5}\u{1F7E5}\u{1F7E5}\u{1F7E5}\u{1F7E5}\u{1F7E5}\u{1F7E5}\u{1F7E5}\u{1F7E5}\u{1F7E5}\u{1F7E5}\u{1F7E5}\u{1F7E5}\u{1F7E5}\u{1F7E5}\u{1F7E5}\u{1F7E5}\u{1F7E5}`);
                      colorError(`\u2502 \u2757\uFE0F Executed with errors ${index + 1}/${config.execute.length}! \u26A0\uFE0F`);
                      colorError(`\u2502      - ${command}`);
                      const diff2 = /* @__PURE__ */ new Date() - init;
                      timings.push({ command, diff: diff2 });
                      colorError(`\u2502 \u23F3 ${diff2 / 1e3}s for the execution with errors \u26A0\uFE0F`);
                      colorError(error);
                      if (!userConfig.bulletproof) {
                        break Iterating_executions;
                      }
                    }
                  }
              }
              io.emit("refresh-window");
              return resolve();
            } catch (error) {
              return reject(error);
            } finally {
              running = false;
              const diffEvent = /* @__PURE__ */ new Date() - initEvent;
              colorInform(" \u{1F4CA} Timings:");
              if (timings.length) {
                let atomicSummatory = 0;
                for (let index = 0; index < timings.length; index++) {
                  const timing = timings[index];
                  colorInform(`  \u231B\uFE0F \u2795 ${timing.diff / 1e3}s [\u{1F4BB}=${timing.command.replace(/\n/g, " ")}]`);
                  atomicSummatory += timing.diff;
                }
                colorInform(`  \u231B\uFE0F \u{1F7F0} ${atomicSummatory / 1e3}s in summatory`);
              }
              colorInform(`  \u{1F30F} \u23F3 ${(diffEvent - config.debounce) / 1e3}s | ${diffEvent / 1e3}s with debounce of ${config.debounce} milliseconds for the whole event`);
              if (config.message) console.log(`\u{1F7E6} ${config.message}`);
              if (config.messageFile) {
                const text = await fs.promises.readFile(config.messageFile, "utf8");
                console.log(ejs.render(text, { config }));
              }
            }
          }, config.debounce);
        });
      };
      const matchesIgnoreCallback = function(filepath) {
        if (!config.ignoreCallback) {
          return false;
        }
        try {
          return require(config.ignoreCallback)(filepath);
        } catch (error) {
          console.error(`Error loading ignore callback file \xAB${filepath}\xBB:`, error);
        }
      };
      const matchesIgnore = function(filepath) {
        for (let index = 0; index < config.ignore.length; index++) {
          const ignoreExpression = config.ignore[index];
          const ignoreExpressionPath = path.resolve(ignoreExpression);
          const ignoreSelector = ignoreExpression === ignoreExpressionPath ? ignoreExpression : [ignoreExpression, ignoreExpressionPath];
          const isMatch = require("picomatch")(ignoreSelector)(filepath);
          if (isMatch) return true;
        }
        return false;
      };
      const matchesExtension = function(filepath) {
        const exts = config.extensions;
        for (let index = 0; index < exts.length; index++) {
          const extid = exts[index];
          if (filepath.endsWith(extid)) return true;
        }
        return false;
      };
      const watcher = chokidar.watch(config.watch, {
        // Esto es una mierda, porque solo te pilla el fichero, no acepta patrones:
        // ignored: config.ignore,
        ignoreInitial: true,
        persistent: true
      });
      let initEvent = false;
      watcher.on("add", async (path2) => {
        if (matchesIgnore(path2)) return;
        if (!matchesExtension(path2)) return;
        if (matchesIgnoreCallback(path2)) return;
        console.log("\n\u2795  Add event from:" + listSeparator + path2);
        await triggerReload(path2);
      }).on("change", async (path2) => {
        if (matchesIgnore(path2)) return;
        if (!matchesExtension(path2)) return;
        if (matchesIgnoreCallback(path2)) return;
        console.log("\n\u270F\uFE0F  Change event from:" + listSeparator + path2);
        await triggerReload(path2);
      }).on("unlink", async (path2) => {
        if (matchesIgnore(path2)) return;
        if (!matchesExtension(path2)) return;
        if (matchesIgnoreCallback(path2)) return;
        console.log("\n\u274C  Unlink event from:" + listSeparator + path2);
        await triggerReload(path2);
      }).on("error", (err) => {
        console.error("Watcher error:", err);
      });
      console.clear();
      const printUrls = function() {
        color2(`\u{1F7E2} Puntos disponibles:`);
        color2(` \u{1F539} http://localhost:${config.port}${config.urlPrefix}/index.html           \u2502 (la entrada inicial de tu aplicaci\xF3n)`);
        color2(` \u{1F539} http://localhost:${config.port}${config.urlPrefix ? " ".repeat(config.urlPrefix.length) : ""}                      \u2502 (socket.io-server de refrescador)`);
        color2(` \u{1F539} http://localhost:${config.port}${config.urlPrefix}/socket.io-client.js  \u2502 (socket.io-client)`);
        color2(` \u{1F539} http://localhost:${config.port}${config.urlPrefix}/client.js            \u2502 (cliente de refrescador)`);
      };
      server.listen(config.port, () => {
        printUrls();
        printConfigurations();
        console.log("");
        color3(`\u{1F680} Servidor refrescador activo`);
        color3(`\u{1F4DF} Iniciado a ${(/* @__PURE__ */ new Date()).toLocaleDateString("es-es", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric"
        })}`);
      });
      return { server, watcher, config, io };
    };
  }
});

// lib/from-object-to-window-reloader-server.js
var require_from_object_to_window_reloader_server = __commonJS({
  "lib/from-object-to-window-reloader-server.js"(exports2, module2) {
    module2.exports = function(argv = process.argv.splice(2)) {
      const assertion = require_from_condition_to_error();
      const trace = require_trace();
      const getParameters = require_from_cli_args_to_map();
      const validateParameters = require_from_schema_to_type_assertions();
      const startServer = require_from_glob_watcher_to_socketio_emit();
      assertion(typeof argv === "object", "Parameter \xABargv\xBB must be object on \xABfrom-object-to-window-reloader-server.js\xBB");
      const formalDefinition = {
        _: false,
        // deshabilitar los parámetros posicionales
        debounce: {
          alias: "d",
          default: 50,
          type: Number
        },
        port: {
          alias: "p",
          default: 3003,
          type: Number
        },
        watch: {
          alias: "w",
          default: [process.cwd()],
          type: Array
        },
        extensions: {
          alias: "e",
          default: ["html", "css", "js"],
          type: Array
        },
        ignore: {
          alias: "i",
          default: ["**/node_modules/**", "**/dist/**", "**/*.dist.*", "**/dist.*"],
          type: Array
        },
        ignoreCallback: {
          alias: "ic",
          default: "",
          type: String
        },
        message: {
          alias: "m",
          default: "\u{1F4E2} Hora de refrescar!",
          type: String
        },
        messageFile: {
          alias: "mf",
          default: "",
          type: String
        },
        execute: {
          alias: "x",
          default: [],
          type: Array
        },
        executeCallback: {
          alias: "xc",
          default: [],
          type: Array
        },
        bulletproof: {
          alias: "bp",
          default: false,
          type: Boolean
        },
        help: {
          alias: "h",
          default: false,
          type: Boolean
        },
        payloadFile: {
          alias: "pf",
          default: "",
          type: String
        },
        payload: {
          alias: "pl",
          default: 'console.log("\u{1F4DF} Iniciada conexi\xF3n con refrescador");',
          type: String
        },
        serve: {
          alias: "s",
          default: process.cwd(),
          type: String
        },
        urlPrefix: {
          alias: "up",
          default: "",
          type: String
        },
        version: {
          alias: "v",
          default: false,
          type: Boolean
        }
      };
      let input = !Array.isArray(argv) ? function(settings) {
        return Object.keys(formalDefinition).reduce((out, key) => {
          if (key === "_") return out;
          if (key in settings) {
            out[key] = settings[key];
          } else {
            out[key] = "default" in formalDefinition[key] ? formalDefinition[key].default : function(t) {
              if (t === String) {
                return "";
              }
              if (t === Number) {
                return 0;
              }
              if (t === Array) {
                return [];
              }
              if (t === Boolean) {
                return false;
              }
              return null;
            }(formalDefinition[key].type);
          }
          return out;
        }, {});
      }(argv) : getParameters(formalDefinition, argv);
      trace("from-object-to-window-reloader-server:step-2(input)", input);
      validateParameters(input, {
        watch: { type: Array },
        ignore: { type: Array },
        ignoreCallback: { type: String },
        extensions: { type: Array },
        debounce: { type: Number },
        port: { type: Number },
        serve: { type: String },
        urlPrefix: { type: String },
        bulletproof: { type: Boolean },
        help: { type: Boolean },
        message: { type: String },
        messageFile: { type: String },
        payload: { type: String },
        payloadFile: { type: String },
        execute: { type: Array },
        executeCallback: { type: Array },
        version: { type: Boolean }
      });
      return {
        settings: input,
        server: startServer(input)
      };
    };
  }
});

// refrescador.api.js
module.exports = {
  colors: require_colors(),
  run: require_from_object_to_window_reloader_server()
};
