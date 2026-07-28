const defaultConfig = {
  port: 3000,
  extensions: ["html", "css", "js", "json"],
  watch: ["src/**/*.html", "src/**/*.js"], // globs
  ignore: ["node_modules/**", ".git/**"], // ignore patterns
  ignoreCallback: "", // js file exporting ignore callback
  debounce: 50, // ms para agrupar eventos
  message: "",
  urlPrefix: "",
  execute: [],
  payloadFile: "",
  payload: "",
};

module.exports = function (userConfig = {}) {

  const fs = require("fs");
  const path = require("path");
  const express = require("express");
  const http = require("http");
  const chokidar = require("chokidar");
  const ejs = require("ejs");
  const child_process = require("child_process");
  const colors = require("./colors.js");
  const util = require("util");
  const execAsync = util.promisify(child_process.exec);
  const { Server } = require("socket.io");

  const color1 = text => console.log(colors.style("magenta,bold").text(text));
  const color2 = text => console.log(colors.style("green,bold").text(text));
  const color3 = text => console.log(colors.style("cyan,bold").text(text));
  const colorSuccess = text => console.log(colors.style("green,bold").text(text));
  const colorError = text => console.log(colors.style("red,bold").text(text));
  const colorWarn = text => console.log(colors.style("yellow,bold").text(text));
  const colorInform = text => console.log(colors.style("cyan,bold").text(text));

  const config = Object.assign({}, defaultConfig, userConfig);

  const listSeparator = "\n       - ";
  const staticDir = path.resolve(config.serve || process.cwd());
  const staticPath = config.staticPath || "";
  const printConfigurations = function () {
    color1(`🔧 Configuraciones del refrescador:`);
    color1(`   - port:            ${colors.endToken}${listSeparator}${config.port}`);
    color1(`   - watch:           ${colors.endToken}${listSeparator}${!config.watch.length ? "(none)" : config.watch.map(f => path.resolve(f)).join(listSeparator)}`);
    color1(`   - debounce:        ${colors.endToken}${listSeparator}${config.debounce}`);
    color1(`   - extensions:      ${colors.endToken}${listSeparator}${!config.extensions.length ? "(none)" : config.extensions.join(listSeparator)}`);
    color1(`   - ignore:          ${colors.endToken}${listSeparator}${!config.ignore.length ? "(none)" : config.ignore.map(f => path.resolve(f)).join(listSeparator)}`);
    color1(`   - ignoreCallback:  ${colors.endToken}${listSeparator}${!config.ignoreCallback.length ? "(none)" : config.ignoreCallback}`);
    color1(`   - urlPrefix:       ${colors.endToken}${listSeparator}${!config.urlPrefix ? "(none)" : config.urlPrefix}`);
    color1(`   - serve:           ${colors.endToken}${listSeparator}${staticDir}`);
    color1(`   - staticPath:      ${colors.endToken}${listSeparator}${!config.staticPath.length ? "(none)" : config.staticPath}`);
    color1(`   - payload:         ${colors.endToken}${listSeparator}${config.payload.length} characters`);
    color1(`   - payloadFile:     ${colors.endToken}${listSeparator}${config.payloadFile ? config.payloadFile : "(none)"}`);
    color1(`   - bulletproof:     ${colors.endToken}${listSeparator}${config.bulletproof ? "yes" : "no"}`);
    color1(`   - message:         ${colors.endToken}${listSeparator}${config.message}`);
    color1(`   - messageFile:     ${colors.endToken}${listSeparator}${config.messageFile}`);
    color1(`   - basedir:         ${colors.endToken}${listSeparator}${config.basedir}`);
    color1(`   - controllers:     ${colors.endToken}${listSeparator}${!config.controllers.length ? "(none)" : config.controllers.map(f => path.resolve(f)).join(listSeparator)}`);
    color1(`   - execute:         ${colors.endToken}${listSeparator}${!config.execute.length ? "(none)" : config.execute.join(listSeparator)}`);
    color1(`   - executeCallback: ${colors.endToken}${listSeparator}${!config.executeCallback.length ? "(none)" : config.executeCallback.join(listSeparator)}`);
  };

  // Corregir urlPrefix:
  config.urlPrefix = config.urlPrefix ? "/" + (config.urlPrefix.replace(/^\//g, "")) : config.urlPrefix;

  const shortenPath = (subpath) => {
    let s1 = require("path").resolve(config.basedir, subpath);
    if(s1.length > 1 && s1.startsWith(config.basedir)) {
      s1 = "." + s1.replace(config.basedir, "");
    }
    return s1;
  }

  // -------------------------
  // HTTP server (mínimo)
  // -------------------------
  const pkgPath = require.resolve("socket.io/package.json");
  const socketioDir = path.dirname(pkgPath);
  const socketIoClientPath = path.join(socketioDir, "client-dist/socket.io.js")
  const socketIoClientCode = fs.readFileSync(socketIoClientPath);
  const refrescadorClientPath = path.resolve(__dirname + "/template-for-socket.io-client-reloader.ejs");
  const refrescadorClientTemplate = fs.readFileSync(refrescadorClientPath).toString();
  const refrescadorClientCode = ejs.render(refrescadorClientTemplate, { require, config }, {});
  const indexHtmlPath = path.resolve(__dirname + "/index.ejs.html");
  const indexHtmlTemplate = fs.readFileSync(indexHtmlPath).toString();
  const indexHtmlCode = ejs.render(indexHtmlTemplate, { require, config }, {});
  if (refrescadorClientPath.endsWith(".ejs")) {
    const refrescadorFinalClientPath = refrescadorClientPath.replace(/\.ejs$/g, ".js");
    fs.writeFileSync(refrescadorFinalClientPath, `/* This file is only for debugging purposes. The served source is cached by the server */\n` + refrescadorClientCode, "utf8");
  }
  if (!fs.lstatSync(staticDir).isDirectory()) {
    throw new Error(`Parameter «--serve» must point to a valid directory and not «${staticDir}»`);
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
      // console.log(error);
      next();
    }
  });
  const prefixSlash = function(text) {
    return text.startsWith("/") ? text : `/${text}`;
  };
  if(config.staticPath.length) {
    router.use(prefixSlash(config.staticPath), express.static(staticDir));
  } else {
    router.use(express.static(staticDir));
  }
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
  if(config.urlPrefix.length) {
    app.use(config.urlPrefix, router);
  } else {
    app.use(router);
  }
  const server = http.createServer(app);

  // -------------------------
  // Socket.io
  // -------------------------
  const io = new Server(server, {
    cors: { origin: "*" }
  })

  io.on("connection", (socket) => {
    console.log("🟢 Cliente conectado:", socket.id)
    socket.on("disconnect", () => {
      console.log("🔴 Cliente desconectado:", socket.id)
    })
  });

  // -------------------------
  // Debounce helper
  // -------------------------
  let timeout = null
  let running = false;
  const triggerReload = function (path) {
    console.log(`[refrescador] [triggered] ${path}`);
    return new Promise((resolve, reject) => {
      if (running) return;
      if (timeout) clearTimeout(timeout);
      initEvent = new Date();
      timeout = setTimeout(async () => {
        const timings = [];
        try {
          console.clear();
          printUrls();
          // console.log("♻️");
          colorWarn(`♻️  Changes detected on: 📄=${shortenPath(path)}`);
          if (config.executeCallback.length) {
            Iterating_execution_callbacks:
            for(let index=0; index<config.executeCallback.length; index++) {
              const init = new Date();
              const fileInput = config.executeCallback[index];
              const callbackFileBrute = require("path").resolve(process.cwd(), fileInput.replace(/^\!/g, ""));
              const isFresh = /^\!/g.test(fileInput);
              const callbackFile = callbackFileBrute;
              if(isFresh) {
                delete require.cache[callbackFile];
              }
              colorWarn(`🟨 ⚡️ Started callback [📞=${shortenPath(callbackFile)}] [${(index + 1)}/${config.executeCallback.length}]`);
              let result = undefined;
              Running_callback_file:
              try {
                const callback = require(callbackFile);
                if(typeof callback !== "function") {
                  if(!isFresh) {
                    colorInform(`  ⚠️  Callback file not exporting a callback: ${shortenPath(callbackFile)}`);
                  }
                  break Running_callback_file;
                }
                result = await callback(callbackFileBrute);
                diff = (new Date()) - init;
                colorSuccess(`🟩 🎊 Done [⏳=${diff / 1000}s] [💻=${shortenPath(callbackFile)}] [${(index + 1)}/${config.execute.length}]`);
              } catch (error) {
                colorError(`🟥 ❗️ Error executing callback «${shortenPath(callbackFile)}»:`, error);
                throw error;
              }
              if(result instanceof AbortController) {
                colorError(`🟥 ❗️ Aborting filewatcher event by execution callback ⚠️`);
                return result;
              }
            }
          }
          if (config.execute.length) {
            Iterating_executions:
            for (let index = 0; index < config.execute.length; index++) {
              const command = config.execute[index].replace("@{refrescador.file}", JSON.stringify(path));
              colorWarn(`🟨 ⚡️ Started [💻=${command}] [${(index + 1)}/${config.execute.length}]`);
              const init = new Date();
              try {
                await new Promise((resolve, reject) => {
                  const child = child_process.spawn(command, {
                    stdio: "inherit",
                    shell: true,
                  });
                  child.on("close", (code) => {
                    if (code === 0) {
                      resolve(code);
                    } else {
                      reject(new Error(`Exit code: ${code}`));
                    }
                  });
                  child.on("error", reject);
                });
                const diff = (new Date()) - init;
                timings.push({ command, diff });
                colorSuccess(`🟩 🎊 Done [⏳=${diff / 1000}s] [💻=${command}] [${(index + 1)}/${config.execute.length}]`);
              } catch (error) {
                colorError(`🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥`);
                colorError(`│ ❗️ Executed with errors ${(index + 1)}/${config.execute.length}! ⚠️`);
                colorError(`│      - ${command}`);
                const diff = (new Date()) - init;
                timings.push({ command, diff });
                colorError(`│ ⏳ ${diff / 1000}s for the execution with errors ⚠️`);
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
          const diffEvent = (new Date()) - initEvent;
          colorInform(" 📊 Timings:");
          if (timings.length) {
            let atomicSummatory = 0;
            for (let index = 0; index < timings.length; index++) {
              const timing = timings[index];
              colorInform(`  ⌛️ ➕ ${timing.diff / 1000}s [💻=${timing.command.replace(/\n/g, " ")}]`);
              atomicSummatory += timing.diff;
            }
            colorInform(`  ⌛️ 🟰 ${atomicSummatory / 1000}s in summatory`);
          }
          colorInform(`  🌏 ⏳ ${(diffEvent - config.debounce) / 1000}s | ${diffEvent / 1000}s with debounce of ${config.debounce} milliseconds for the whole event`);
          if (config.message) console.log(`🟦 ${config.message}`);
          if (config.messageFile) {
            const text = await fs.promises.readFile(config.messageFile, "utf8");
            console.log(ejs.render(text, { config }));
          }
        }
      }, config.debounce);
    });
  };

  const matchesIgnoreCallback = function(filepath) {
    if(!config.ignoreCallback) {
      return false;
    }
    try {
      return require(config.ignoreCallback)(filepath);
    } catch (error) {
      console.error(`Error loading ignore callback file «${filepath}»:`, error);
    }
  };

  const matchesIgnore = function (filepath) {
    for (let index = 0; index < config.ignore.length; index++) {
      const ignoreExpression = config.ignore[index];
      const ignoreExpressionPath = path.resolve(ignoreExpression);
      // Usa el selector también si son strings diferentes como ruta resuelta, porque si usas .. en el ignore y te lo mira el picomatch, no te lo encuentra
      const ignoreSelector = ignoreExpression === ignoreExpressionPath ? ignoreExpression : [ignoreExpression, ignoreExpressionPath];
      const isMatch = require("picomatch")(ignoreSelector)(filepath);
      if (isMatch) return true;
    }
    return false;
  };

  const matchesExtension = function (filepath) {
    const exts = config.extensions;
    for (let index = 0; index < exts.length; index++) {
      const extid = exts[index];
      if (filepath.endsWith(extid)) return true;
    }
    return false;
  };

  // -------------------------
  // Chokidar watcher
  // -------------------------
  const watcher = chokidar.watch(config.watch, {
    // Esto es una mierda, porque solo te pilla el fichero, no acepta patrones:
    // ignored: config.ignore,
    ignoreInitial: true,
    persistent: true
  });

  let initEvent = false;

  watcher
    .on("add", async (path) => {
      if (matchesIgnore(path)) return;
      if (!matchesExtension(path)) return;
      if (matchesIgnoreCallback(path)) return;
      console.log("\n➕  Add event from:" + listSeparator + path);
      await triggerReload(path);
    })
    .on("change", async (path) => {
      if (matchesIgnore(path)) return;
      if (!matchesExtension(path)) return;
      if (matchesIgnoreCallback(path)) return;
      console.log("\n✏️  Change event from:" + listSeparator + path);
      await triggerReload(path);
    })
    .on("unlink", async (path) => {
      if (matchesIgnore(path)) return;
      if (!matchesExtension(path)) return;
      if (matchesIgnoreCallback(path)) return;
      console.log("\n❌  Unlink event from:" + listSeparator + path);
      await triggerReload(path);
    })
    .on("error", (err) => {
      console.error("Watcher error:", err)
    });

  console.clear();

  const printUrls = function () {
    const normalizeJoin = function(a,b) {
      const params = [];
      if((typeof a === "string") && a.length) params.push(a);
      if((typeof b === "string") && b.length) params.push(b);
      if(!params.length) return "";
      let result = path.join(...params);
      if(!result.startsWith("/")) {
        result = `/${result}`;
      }
      return result;
    };
    color2(`🟢 Puntos disponibles: 📂=${config.basedir}`);
    color2(` 🔹 [app]       http://localhost:${config.port}` + normalizeJoin(config.urlPrefix, "index.html"));
    color2(` 🔹 [server]    http://localhost:${config.port}` + normalizeJoin(config.urlPrefix));
    color2(` 🔹 [static]    http://localhost:${config.port}` + normalizeJoin(config.urlPrefix, config.staticPath));
    color2(` 🔹 [socket.io] http://localhost:${config.port}` + normalizeJoin(config.urlPrefix, "socket.io-client.js"));
    color2(` 🔹 [reloader]  http://localhost:${config.port}` + normalizeJoin(config.urlPrefix, "client.js"));
    if(config.controllers.length) color2(` 🔹 [controllers]  ${config.controllers.length}` + (config.controllers.length ? '\n' + config.controllers.join("\n + ") : ''));
  }

  if(config.controllers.length) {
    for(let indexController=0; indexController<config.controllers.length; indexController++) {
      const controllerPath = config.controllers[indexController];
      const controllerFile = path.resolve(controllerPath);
      console.log(`[*] Importing controllers (${indexController}) from: ${controllerFile}`);
      const controllerCallback = require(controllerFile);
      controllerCallback({ app, router, server, config, watcher, io, });
    }
  }

  // -------------------------
  // Start server
  // -------------------------
  server.listen(config.port, () => {
    printUrls();
    printConfigurations();
    console.log("");
    color3(`🚀 Servidor refrescador activo`);
    color3(`📟 Iniciado a ${(new Date()).toLocaleDateString("es-es", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    })}`);
  });

  return { app, router, server, config, watcher, io, };

};