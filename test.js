require(__dirname + "/refrescador.api.js")({
  payloadFile: __dirname + "/test/payload-example.js",
  urlPrefix: "aplicacion-tal",
  messageFile: "package.json",
  port: 4003,
});