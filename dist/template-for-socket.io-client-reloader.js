/* This file is only for debugging purposes. The served source is cached by the server */
io("http://localhost:3004").on("refresh-window", async function() {
    console.log("[refrescador] La app ha sido llamada a refrescarse por el servidor");
    
    console.log("📟 Iniciada conexión con refrescador");
    location.reload();
});