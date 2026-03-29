# refrescador

Refrescar y/o ejecutar automático al cambiar ficheros o directorios para acelerar desarrollo desde línea de comandos o API y 100% configurable.

## Instalar

Para instalar mejor linkar y luego puedes iniciar instancias desde línea de comandos directamente:

```sh
mkdir refrescador
cd refrescador
git clone https://github.com/allnulled/refrescador.git .
npm install
npm link
```

## Conectar el cliente

**Nota:** este programa sirve igual `chokidar` y `nodemon` para ejecución automática, pero además puede conectarse por `socket.io` para refrescar al cliente como `live-reload`.

Solo hay versión html.

### Versión html (única)

Tienes que importar 2, o 1 si ya incluyes a `socket.io-client.js` en tu desarrollo:

```html
<!-- Socket.io-client -->
<script src="http://127.0.0.1:3003/socket.io-client.js"></script>
<!-- El refrescador/cliente, que usa socket.io para conectarse al refrescador/servidor -->
<script src="http://127.0.0.1:3003/client.js"></script>
```

La plantilla dice así, ahí puedes ver el evento `refresh-window` que se activa para otras apis fuera de html:

```ejs
io("http://localhost:<%-config.port%>").on("refresh-window", async function() {
    console.log("[refrescador] La app ha sido llamada a refrescarse por el servidor");
    <%- !config.payloadFile ? "" : require("fs").readFileSync(config.payloadFile).toString()%>
    <%-config.payload%>
    location.reload();
});
```

## Opciones y valores por defecto

| opción | abreviación | tipo | por defecto | explicación |
|----|----|----|----|----|
| `watch` | `-w` | Array | `[process.cwd()]` | Ficheros a escuchar (glob), por defecto el actual |
| `port` | `-p` | Number | 3003 | Puerto del servidor socket.io |
| `ignore` | `-i` | Array | `["**node_modules**"]` | Ficheros a ignorar (glob) |
| `debounce` | `-d` | Number | `50` | Milisegundos de espera entre evento y re-trigger (porque se acumulan) |
| `message` | `-m` | String | `"Hora de refrescar!"` | Mesaje de interludio si quieres |
| `payload` | `-pl` | String | `""` | Inyección js al refrescar |
| `payload-file` | `-pf` | String | `""` | Inyección js al refrescar pero vía fichero |
| `execute` | `-x` | Array | `[]` | Comandos de consola intermedios |
| `version` | `-v` | Boolean | `false` | Saber la versión |
| `help` | `-h` | Boolean | `false` | Ver la ayuda |

Todas las opciones son coexistentes, excepto cuando se activan `--help|-h` o `--version|-v`.

## Línea de comandos

Este es un ejemplo con todas las opciones, las obligatorias las irá pidiendo con errores:

```sh
refrescador
  --watch . .. source.sh -w /home/whatever # se acumulan
  --ignore "**/*.{compiled,dist}.*" -i "dist.{css,js}" # se acumulan
  --port 3001 -p 3002 # 3002
  --message "Hola, que tal" -m "Hola, como estas" # Hola como estas
  --debounce 200 -d 201 # 201
  --version -v false #false
  --help -h # trye
  --execute "echo hola1" -x "echo hola2" # se acumula
  --payload-file "payload1.js" -pf "payload2.js" # payload2.js
  --payload "console.log('Inline payload too!')" -pl "console.log('Yes!!')" # Yes!!
```

## API

En la API, todas son opcionales:

```sh
require("refrescador")({
  watch: [__dirname],
  ignore: ["**node_modules**"],
  execute: ["echo 'hello from the trigger'"],
  message: "El tiempo de refrescar ha llegado",
  port: 5005,
})
```

En principio, comprobará que los tipos sean conformes a la especificación automáticamente, e irá pidiendo las correcciones.

# Features

- escucha ficheros con `chokidar`
- acepta patrones glob con `glob`
- envía autorrefresco a sus clientes de `socket.io`
- permite bajarse socket.io-cliente y refrescador.cliente
- configurables:
   - patrones glob para entrada
   - patrones glob para ignorar
   - puerto del servidor
   - fichero de payload
   - fichero de payload
   - código de payload
