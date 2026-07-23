const fs = require("fs");

try {
  fs.copyFileSync(__dirname + "/dist/refrescador.api.dist.js", "/home/carlos/Escritorio/Programas/moduler-v6/dist/refrescador/refrescador.api.dist.js");
  fs.copyFileSync(__dirname + "/dist/refrescador.cli.dist.js", "/home/carlos/Escritorio/Programas/moduler-v6/dist/refrescador/refrescador.cli.dist.js");
  console.log("Exportado a proyecto «moduler-v6»");
} catch (error) {
  // @OK
}