const fs = require("fs");

try {
  fs.copyFileSync(__dirname + "/dist/refrescador.api.dist.js", "/home/carlos/Escritorio/Programas/moduler-v5-and-dev-toolkit-starter/src/lib/dev-toolkit/refrescador.api.dist.js");
  fs.copyFileSync(__dirname + "/dist/refrescador.cli.dist.js", "/home/carlos/Escritorio/Programas/moduler-v5-and-dev-toolkit-starter/src/lib/dev-toolkit/refrescador.cli.dist.js");
  console.log("Exportado a proyecto «moduler-v5-and-dev-toolkit-starter»");
} catch (error) {
  // @OK
}