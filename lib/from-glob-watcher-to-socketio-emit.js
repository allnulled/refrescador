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
  const colors = require(__dirname + "/colors.js");
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
  const printConfigurations = function () {
    color1(`🔧 Configuraciones del refrescador:`);
    color1(`   - port:            ${colors.endToken}${listSeparator}${config.port}`);
    color1(`   - watch:           ${colors.endToken}${listSeparator}${!config.watch.length ? "(none)" : config.watch.map(f => path.resolve(f)).join(listSeparator)}`);
    color1(`   - debounce:        ${colors.endToken}${listSeparator}${config.debounce}`);
    color1(`   - message:         ${colors.endToken}${listSeparator}${config.message}`);
    color1(`   - extensions:      ${colors.endToken}${listSeparator}${!config.extensions.length ? "(none)" : config.extensions.join(listSeparator)}`);
    color1(`   - ignore:          ${colors.endToken}${listSeparator}${!config.ignore.length ? "(none)" : config.ignore.map(f => path.resolve(f)).join(listSeparator)}`);
    color1(`   - ignoreCallback:  ${colors.endToken}${listSeparator}${!config.ignoreCallback.length ? "(none)" : config.ignoreCallback}`);
    color1(`   - payload:         ${colors.endToken}${listSeparator}${config.payload.length} characters`);
    color1(`   - payloadFile:     ${colors.endToken}${listSeparator}${config.payloadFile ? config.payloadFile : "(none)"}`);
    color1(`   - serve:           ${colors.endToken}${listSeparator}${staticDir}`);
    color1(`   - urlPrefix:       ${colors.endToken}${listSeparator}${!config.urlPrefix ? "(none)" : config.urlPrefix}`);
    color1(`   - execute:         ${colors.endToken}${listSeparator}${!config.execute.length ? "(none)" : config.execute.join(listSeparator)}`);
    color1(`   - executeCallback: ${colors.endToken}${listSeparator}${!config.executeCallback.length ? "(none)" : config.executeCallback.join(listSeparator)}`);
    color1(`   - bulletproof:     ${colors.endToken}${listSeparator}${config.bulletproof ? "yes" : "no"}`);
  };

  // Corregir urlPrefix:
  config.urlPrefix = config.urlPrefix ? "/" + (config.urlPrefix.replace(/^\//g, "")) : config.urlPrefix;

  // -------------------------
  // HTTP server (mínimo)
  // -------------------------
  const pkgPath = require.resolve("socket.io/package.json");
  const socketioDir = path.dirname(pkgPath);
  const socketIoClientPath = path.join(socketioDir, "client-dist/socket.io.js")
  const socketIoClientCode = fs.readFileSync(socketIoClientPath);
  const refrescadorClientPath = path.resolve(__dirname, "template-for-socket.io-client-reloader.ejs");
  const refrescadorClientTemplate = fs.readFileSync(refrescadorClientPath).toString();
  const refrescadorClientCode = ejs.render(refrescadorClientTemplate, { require, config }, {});
  const indexHtmlPath = path.resolve(__dirname, "../index.ejs.html");
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
  if(config.urlPrefix) {
    app.use(config.urlPrefix, router);
  } else {
    app.use(router);
  }
  const server = http.createServer(app);
  /*
  const server = http.createServer(function (request, response) {
    try {
      console.log(`[${request.method.toUpperCase()}]\t${request.url}`);
      if (request.url === "/socket.io-client.js") {
        // fs.createReadStream(socketIoClientPath).pipe(response);
        response.writeHead(200, {
          "Content-Type": "application/javascript"
        });
        return response.end(socketIoClientCode);
      } else if (request.url === "/client.js") {
        response.writeHead(200, {
          "Content-Type": "application/javascript"
        });
        return response.end(refrescadorClientCode);
      } else {
        const file = path.resolve(staticDir, request.url.replace(/^\//g, ""));
        const safePath = path.normalize(file);
        if (!safePath.startsWith(staticDir)) {
          response.writeHead(403);
          return response.end("Forbidden");
        }
        fs.stat(file, (err, stats) => {
          if (!err && stats.isFile()) {
            const stream = fs.createReadStream(file);
            stream.on("error", function (error) {
              response.writeHead(501);
              return response.end("Error while streaming file: " + error.name + " " + error.message);
            })
            stream.pipe(response);
          } else {
            response.writeHead(501);
            return response.end("File does not exist: " + file);
          }
        });
      }
    } catch (error) {
      console.error(error);
      response.writeHead(501);
      response.end(error.name + ": " + error.message);
    }
  });
  //*/

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
          colorWarn("♻️  Changes detected by refrescador on file:");
          colorWarn(`  📄 ${path}`);
          if (config.executeCallback.length) {
            Iterating_execution_callbacks:
            for(let index=0; index<config.executeCallback.length; index++) {
              const init = new Date();
              const callbackFileBrute = require("path").resolve(process.cwd(), config.executeCallback[index]);
              const isFresh = /^\!/g.test(callbackFileBrute);
              const callbackFile = callbackFileBrute.replace(/^\!/g, "");
              if(isFresh) {
                delete require.cache[callbackFile];
              }
              colorWarn(`🟨 ⚡️ Started callback [📞=${callbackFile}] [${(index + 1)}/${config.executeCallback.length}]`);
              const callback = require(callbackFile);
              let result = undefined;
              try {
                result = await callback(path);
                diff = (new Date()) - init;
                colorSuccess(`🟩 🎊 Done [⏳=${diff / 1000}s] [💻=${callbackFile}] [${(index + 1)}/${config.execute.length}]`);
              } catch (error) {
                colorError(`🟥 ❗️ Error executing callback «${callbackFile}»:`, error);
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
                colorError(`┌──────────────────────────────────────#`);
                colorError(`│ ❗️ Executed with errors ${(index + 1)}/${config.execute.length}! ⚠️`);
                colorError(`│      - ${command}`);
                colorError(error);
                const diff = (new Date()) - init;
                timings.push({ command, diff });
                colorError(`│ ⏳ ${diff / 1000}s for the execution with errors ⚠️`);
                colorError(`└──────────────────────────────────────#`);
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
    color2(`🟢 Puntos disponibles:`);
    color2(` 🔹 http://localhost:${config.port}${config.urlPrefix}/index.html           │ (la entrada inicial de tu aplicación)`);
    color2(` 🔹 http://localhost:${config.port}${config.urlPrefix ? " ".repeat(config.urlPrefix.length) : ''}                      │ (socket.io-server de refrescador)`);
    color2(` 🔹 http://localhost:${config.port}${config.urlPrefix}/socket.io-client.js  │ (socket.io-client)`);
    color2(` 🔹 http://localhost:${config.port}${config.urlPrefix}/client.js            │ (cliente de refrescador)`);
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

  return { server, watcher, config, io };

};