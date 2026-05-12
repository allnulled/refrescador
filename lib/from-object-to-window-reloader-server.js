module.exports = function (argv = process.argv.splice(2)) {

  const assertion = require(__dirname + "/from-condition-to-error.js");
  const trace = require(__dirname + "/trace.js");
  const getParameters = require(__dirname + "/from-cli-args-to-map.js");
  const validateParameters = require(__dirname + "/from-schema-to-type-assertions.js");
  const startServer = require(__dirname + "/from-glob-watcher-to-socketio-emit.js");

  assertion(typeof argv === "object", "Parameter «argv» must be object on «from-object-to-window-reloader-server.js»");

  const formalDefinition = {
    _: false, // deshabilitar los parámetros posicionales
    debounce: {
      alias: "d",
      default: 50,
      type: Number,
    },
    port: {
      alias: "p",
      default: 3003,
      type: Number,
    },
    watch: {
      alias: "w",
      default: [process.cwd()],
      type: Array,
    },
    extensions: {
      alias: "e",
      default: ["html", "css", "js"],
      type: Array,
    },
    ignore: {
      alias: "i",
      default: ["**/node_modules/**", "**/dist/**", "**/*.dist.*", "**/dist.*"],
      type: Array,
    },
    ignoreCallback: {
      alias: "ic",
      default: "",
      type: String,
    },
    message: {
      alias: "m",
      default: "📢 Hora de refrescar!",
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
      type: Boolean,
    },
    payloadFile: {
      alias: "pf",
      default: "",
      type: String,
    },
    payload: {
      alias: "pl",
      default: 'console.log("📟 Iniciada conexión con refrescador");',
      type: String,
    },
    serve: {
      alias: "s",
      default: process.cwd(),
      type: String,
    },
    urlPrefix: {
      alias: "up",
      default: "",
      type: String,
    },
    version: {
      alias: "v",
      default: false,
      type: Boolean,
    },
  };

  let input = !Array.isArray(argv) ? (function(settings) {
    return Object.keys(formalDefinition).reduce((out, key) => {
      if(key === "_") return out;
      if(key in settings) {
        out[key] = settings[key];
      } else {
        out[key] = ("default" in formalDefinition[key]) ? formalDefinition[key].default : (function(t) {
          if(t === String) {
            return "";
          }
          if(t === Number) {
            return 0;
          }
          if(t === Array) {
            return [];
          }
          if(t === Boolean) {
            return false;
          }
          return null;
        })(formalDefinition[key].type);
      }
      return out;
    }, {});
  })(argv) : getParameters(formalDefinition, argv);

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
    version: { type: Boolean },
  });

  return {
    settings: input,
    server: startServer(input),
  };

};