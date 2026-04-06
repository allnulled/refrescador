const defaultConfig = {
  port: 3000,
  extensions: ["html", "css", "js", "json"],
  watch: ["src/**/*.html", "src/**/*.js"], // globs
  ignore: ["node_modules/**", ".git/**"], // ignore patterns
  debounce: 50, // ms para agrupar eventos
  message: "",
  execute: [],
  payloadFile: "",
  payload: "",
};

module.exports = function (userConfig = {}) {

  const fs = require("fs");
  const path = require("path");
  const http = require("http");
  const chokidar = require("chokidar");
  const ejs = require("ejs");
  const child_process = require("child_process");
  const util = require('util');
  const execAsync = util.promisify(child_process.exec);
  const { Server } = require("socket.io");

  const config = Object.assign({}, defaultConfig, userConfig);

  const listSeparator = "\n       - ";
  console.log("");
  console.log(`🔧 Configuraciones del refrescador:`);
  console.log(`   - debounce:    ${listSeparator}${config.debounce}`);
  console.log(`   - message:     ${listSeparator}${config.message}`);
  console.log(`   - execute:     ${listSeparator}${!config.execute.length ? "(none)" : config.execute.join(listSeparator)}`);
  console.log(`   - extensions:  ${listSeparator}${!config.extensions.length ? "(none)" : config.extensions.join(listSeparator)}`);
  console.log(`   - ignore:      ${listSeparator}${!config.ignore.length ? "(none)" : config.ignore.map(f => path.resolve(f)).join(listSeparator)}`);
  console.log(`   - watch:       ${listSeparator}${!config.watch.length ? "(none)" : config.watch.map(f => path.resolve(f)).join(listSeparator)}`);
  console.log(`   - port:        ${listSeparator}${config.port}`);
  console.log(`   - payloadFile: ${config.payloadFile ? listSeparator + config.payloadFile : '(none)'}`);
  console.log(`   - payload:     ${listSeparator}${config.payload.length} characters`);

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
  if (refrescadorClientPath.endsWith(".ejs")) {
    const refrescadorFinalClientPath = refrescadorClientPath.replace(/\.ejs$/g, ".js");
    fs.writeFileSync(refrescadorFinalClientPath, `/* This file is only for debugging purposes. The served source is cached by the server */\n` + refrescadorClientCode, "utf8");
  }
  const server = http.createServer(function (request, response) {
    try {
      console.log(request.url);
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
        const file = path.resolve(process.cwd(), request.url.replace(/^\//g, ""));
        const safePath = path.normalize(file);
        if (!safePath.startsWith(process.cwd())) {
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
    return new Promise((resolve, reject) => {
      if (running) return;
      if (timeout) clearTimeout(timeout);
      initEvent = new Date();
      timeout = setTimeout(async () => {
        const timings = [];
        try {
          // console.log("");
          // console.log("♻️");
          // console.log("♻️  Changes detected [by refrescador]");
          if (config.execute.length) {
            for (let index = 0; index < config.execute.length; index++) {
              const command = config.execute[index];
              console.log("");
              console.log(`⚡️ Executing ${(index + 1)}/${config.execute.length}: ${listSeparator}${command}`);
              console.log("");
              console.log("-----------------------------------------------");
              console.log("");
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
                console.log("");
                console.log("-----------------------------------------------");
                console.log("");
                console.log(`💫 Executed successfully ${(index + 1)}/${config.execute.length}! 🎊`);
                console.log(`       - ${command}`);
                const diff = (new Date()) - init;
                timings.push({ command, diff });
                console.log("");
                console.log(`  ⏳ ${diff / 1000} seconds for the execution 💫`);
                console.log("");
                console.log("=============================[end of execution]");
              } catch (error) {
                console.log("");
                console.log("-----------------------------------------------");
                console.log("");
                console.log(`❗️ Executed with errors ${(index + 1)}/${config.execute.length}! ⚠️`);
                console.log("");
                console.log(error);
                console.log("");
                const diff = (new Date()) - init;
                timings.push({ command, diff });
                console.log(`  ⏳ ${diff / 1000} seconds for the execution with errors ⚠️`);
                console.log("");
                console.log("=============================[end of execution]");
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
          if (timings.length) {
            let atomicSummatory = 0;
            console.log("\n📊 Timings:\n");
            for (let index = 0; index < timings.length; index++) {
              const timing = timings[index];
              console.log(`    ⌛️ ➕ ${timing.diff / 1000} seconds = command[${index}] = ${timing.command.substr(0, 40).replace(/\n/g, " ")}`);
              atomicSummatory += timing.diff;
            }
            console.log(`    ⌛️ 🟰 ${atomicSummatory / 1000} seconds in summatory`);
            console.log("\n=============================\n");
          }
          console.log(`🌏⏳ ${(diffEvent - config.debounce) / 1000} seconds | ${diffEvent / 1000} seconds with debounce of ${config.debounce} milliseconds for the whole event`);
          printUrls();
          if (config.message) console.log(`📢 ${config.message}`);
          console.log("");
          console.log("");
          console.log("");
        }
      }, config.debounce);
    });
  };

  const matchesIgnore = function (filepath) {
    for (let index = 0; index < config.ignore.length; index++) {
      const ignoreExpression = config.ignore[index];
      const isMatch = require("picomatch")(ignoreExpression)(filepath);
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
      console.log("\n➕  Add event from:" + listSeparator + path);
      await triggerReload(path);
    })
    .on("change", async (path) => {
      if (matchesIgnore(path)) return;
      if (!matchesExtension(path)) return;
      console.log("\n✏️  Change event from:" + listSeparator + path);
      await triggerReload(path);
    })
    .on("unlink", async (path) => {
      if (matchesIgnore(path)) return;
      if (!matchesExtension(path)) return;
      console.log("\n❌  Unlink event from:" + listSeparator + path);
      await triggerReload(path);
    })
    .on("error", (err) => {
      console.error("Watcher error:", err)
    });

  const printUrls = function () {
    console.log("");
    console.log(`🟢 Puntos disponibles:`)
    console.log(`  - http://localhost:${config.port}/index.html           (la entrada inicial de tu aplicación)`);
    console.log(`  - http://localhost:${config.port}                      (socket.io-server de refrescador)`);
    console.log(`  - http://localhost:${config.port}/socket.io-client.js  (socket.io-client)`);
    console.log(`  - http://localhost:${config.port}/client.js            (cliente de refrescador)`);
    console.log("");
  }

  // -------------------------
  // Start server
  // -------------------------
  server.listen(config.port, () => {
    printUrls();
    console.log(`🚀 Servidor refrescador activo`);
    console.log("");
    console.log(`📟 Iniciado a ${(new Date()).toLocaleDateString("es-es", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    })}`);
    console.log("");
  });

  return { server, watcher, config, io };

};