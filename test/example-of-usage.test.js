const refrescador = require(__dirname + "/../dist/refrescador.api.dist.js");

Test_de_colors_print: {
  refrescador.colors.style("red").print("Hello");
}