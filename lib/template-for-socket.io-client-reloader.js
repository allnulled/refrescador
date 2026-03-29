/* This file is only for debugging purposes. The served source is cached by the server */
io("http://localhost:3003").on("refresh-window", async function() {
    console.log("[refrescador] La app ha sido llamada a refrescarse por el servidor");
    console.log("Example of refreshing injection");
    console.log("📟 Iniciada conexión con refrescador");
    location.reload();
});