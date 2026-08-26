const fs = require("fs");

try {
  const src = "/home/carlos/Escritorio/Programas/moduler-v6/dist/refrescador/refrescador.api.dist.js";
  const cli = "/home/carlos/Escritorio/Programas/moduler-v6/dist/refrescador/refrescador.cli.dist.js";
  fs.copyFileSync(__dirname + "/dist/refrescador.api.dist.js", src);
  fs.copyFileSync(__dirname + "/dist/refrescador.cli.dist.js", cli);
  console.log("[*] Exportado código fuente a proyecto «moduler-v6»");
  console.log(`    - ${src}`);
  console.log(`    - ${cli}`);
} catch (error) {
  // @OK
}