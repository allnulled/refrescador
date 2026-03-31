/* This file is only for debugging purposes. The served source is cached by the server */
io("http://localhost:3003").on("refresh-window", async function() {
    console.log("[refrescador] La app ha sido llamada a refrescarse por el servidor");
    io("http://localhost:<%-config.port%>").on("refresh-window", async function() {
    console.log("[refrescador] La app ha sido llamada a refrescarse por el servidor");
    <%- !config.payloadFile ? "" : require("fs").readFileSync(config.payloadFile).toString()%>
    <%-config.payload%>
    location.reload();
});
    console.log("📟 Iniciada conexión con refrescador");
    location.reload();
});