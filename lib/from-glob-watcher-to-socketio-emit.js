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

  const listSeparator = "\n    - ";
  console.log(`🔧 Configuraciones del refrescador:`);
  console.log(` - debounce:    ${listSeparator}${config.debounce}`);
  console.log(` - message:     ${listSeparator}${config.message}`);
  console.log(` - execute:     ${listSeparator}${!config.execute.length ? "(none)" : config.execute.join(listSeparator)}`);
  console.log(` - extensions:  ${listSeparator}${!config.extensions.length ? "(none)" : config.extensions.join(listSeparator)}`);
  console.log(` - ignore:      ${listSeparator}${!config.ignore.length ? "(none)" : config.ignore.join(listSeparator)}`);
  console.log(` - watch:       ${listSeparator}${!config.watch.length ? "(none)" : config.watch.join(listSeparator)}`);
  console.log(` - port:        ${listSeparator}${config.port}`);
  console.log(` - payloadFile: ${listSeparator}${config.payloadFile}`);
  console.log(` - payload:     ${listSeparator}${config.payload.length} characters`);

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
            stream.on("error", function(error) {
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
  })

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
        try {
          // console.log("");
          // console.log("♻️");
          // console.log("♻️  Changes detected [by refrescador]");
          if (config.execute.length) {
            for (let index = 0; index < config.execute.length; index++) {
              const command = config.execute[index];
              console.log(`⚡️ Executing ${(index + 1)}/${config.execute.length}: ${listSeparator}${command}`);
              const init = new Date();
              try {
                await new Promise((resolve, reject) => {
                  const child = child_process.spawn(command, { shell: true, stdio: "inherit" });
                  child.on("close", (code) => (code === 0) ? resolve() : reject(new Error(`Command failed with code ${code}`)));
                  child.on("error", (err) => reject(err));
                });
              } catch (error) {
                console.error(error);
              }
              const diff = (new Date()) - init;
              console.log(`  ⏳ ${diff / 1000} seconds for the execution`);
            }
          }
          io.emit("refresh-window");
          return resolve();
        } catch (error) {
          return reject(error);
        } finally {
          running = false;
          const diffEvent = (new Date()) - initEvent;
          console.log(`🌏⏳ ${(diffEvent - config.debounce) / 1000} seconds | ${diffEvent / 1000} seconds with debounce of ${config.debounce} milliseconds for the whole event`);
          if (config.message) console.log(`📢 ${config.message}`);
          console.log("");
        }
      }, config.debounce);
    });
  };

  // -------------------------
  // Chokidar watcher
  // -------------------------
  const watcher = chokidar.watch(config.watch, {
    ignored: config.ignore,
    ignoreInitial: true,
    persistent: true
  });

  let initEvent = false;

  watcher
    .on("add", async (path) => {
      console.log("\n➕  Add event from:" + listSeparator + path);
      await triggerReload(path);
    })
    .on("change", async (path) => {
      console.log("\n✏️  Change event from:" + listSeparator + path);
      await triggerReload(path);
    })
    .on("unlink", async (path) => {
      console.log("\n❌  Unlink event from:" + listSeparator + path);
      await triggerReload(path);
    })
    .on("error", (err) => {
      console.error("Watcher error:", err)
    });

  // -------------------------
  // Start server
  // -------------------------
  server.listen(config.port, () => {
    console.log("");
    console.log(`🟢 Puntos disponibles:`)
    console.log(`  - http://localhost:${config.port}                      (socket.io-server de refrescador)`);
    console.log(`  - http://localhost:${config.port}/socket.io-client.js  (socket.io-client)`);
    console.log(`  - http://localhost:${config.port}/client.js            (cliente de refrescador)`);
    console.log("");
    console.log(`🚀 Servidor refrescador activo`);
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