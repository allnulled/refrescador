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

Puedes poner un `index.html` y acceder a él (ruta completa, incluye `index.html`):

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport"
        content="width=device-width, initial-scale=1.0">
    <title>Refrescador | Test</title>
</head>

<body>
    <script src="socket.io-client.js"></script>
    <script src="client.js"></script>
    Aquí empiezas
</body>

</html>
```

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
| `ignore` | `-i` | Array | `["**/node_modules/**", "**/dist/**", "**/*.dist.*", "**/dist.*"]` | Ficheros a ignorar (glob). Usa 'dist' en la ruta para que deje de escucharlos automático. |
| `ignore-callback` | `-ic` | String | `""` | Ficheros que exporta función con `module.exports` y discrimina si se ignora (`true`) un fichero o no (`false`). |
| `debounce` | `-d` | Number | `50` | Milisegundos de espera entre evento y re-trigger (porque se acumulan) |
| `message` | `-m` | String | `"Hora de refrescar!"` | Mesaje de interludio si quieres |
| `payload` | `-pl` | String | `""` | Inyección js al refrescar |
| `payload-file` | `-pf` | String | `""` | Inyección js al refrescar pero vía fichero. Si es `*.ejs` se usará como plantilla (superior), no como inyeción js simple. |
| `execute` | `-x` | Array | `[]` | Comandos de consola intermedios. Inyecta el string del fichero que encendió los cambios poniendo `@{refrescador.file}` para usarlo como parámetro de tus scripts. |
| `execute-callback` | `-xc` | Array | `[]` | Ficheros js a importar con `require` que exportan una función que espera ser llamada en cada evento. Usa el prefijo `!` para refrescar la `require.cache` automáticamente en cada evento. |
| `serve` | `-s` | String | `process.cwd()` | Directorio que el servidor estático expone. |
| `url-prefix` | `-up` | String | `""` | Ruta que sirve la aplicación estática del servidor. |
| `version` | `-v` | Boolean | `false` | Saber la versión |
| `help` | `-h` | Boolean | `false` | Ver la ayuda |

Todas las opciones son coexistentes, excepto cuando se activan `--help|-h` o `--version|-v`.

## Línea de comandos

Este es un ejemplo con todas las opciones, las obligatorias las irá pidiendo con errores:

```sh
refrescador
  --watch . .. source.sh -w /home/whatever # se acumulan
  --ignore "**/*.{compiled,dist}.*" -i "dist.{css,js}" # se acumulan
  --ignore-callback "" -ic "ignorer.js" # solo 1 string a fichero
  --port 3001 -p 3002 # 3002
  --message "Hola, que tal" -m "Hola, como estas" # Hola como estas
  --debounce 200 -d 201 # 201
  --version -v false #false
  --help -h # true
  --extensions ".js" -e ".css" ".html" # se acumula
  --execute "echo hola1" -x "node programa.js @{refrescador.file}" # se acumula + se puede inyectar el fichero que ha cambiado
  --execute-callback "some-file.js" -xc "some-other-file.js @{refrescador.file}" # se acumula + se puede inyectar el fichero que ha cambiado
  --payload-file "payload1.js" -pf "payload2.js" # payload2.js
  --payload "console.log('Inline payload too!')" -pl "console.log('Yes!!')" # Yes!!
  --serve "src/public/www" -s "src/private/www" # solo 1 string, private aquí
  --url-prefix "dir/app" -up "some-app" # solo 1 string, some-app aquí
```

## API

En la API, todas son opcionales:

```sh
require("refrescador")({
  watch: [__dirname],
  ignore: ["**node_modules**"],
  ignoreCallback: __dirname + "/ignorer.js",
  execute: ["echo 'hello from the trigger'", "node program.js @{refrescador.file}"],
  executeCallback: ["file/from/cwd/target.js"],
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
   - patrones glob para entrada: `watch`
   - patrones glob para ignorar: `ignore`
   - función para ignorar ficheros selectivamente al principio del evento: `ignoreCallback`
   - puerto del servidor: `port` 
   - fichero de payload para el navegador: `payloadFile`
   - código de payload para el navegador: `payload`
   - tiempo de demora entre eventos: `debounce`
   - inyecta el fichero de cambios en la ejecución:
      - con `--execute 'node program.js @{refrescador.file}'`
      - para poder hacer hot-reloading o compilación selectiva
      - no compilar todo el proyecto, sino las partes que te interesen
   - función para executar un callback en lugar de un comando de consola: `executeCallback`
      - es más rápido que una llamada a consola
      - permite interrumpir el evento si devuelves un `AbortController`
   - ruta a exponer en servidor estático: `serve`
      - con servidor con `express` para manejar *mimetypes*
   - mensaje adjunto opcional: `message`
   - ruta del servidor que expone la aplicación estática: `urlPrefix`
      - las rutas en el `index.html` servido cambiarán con esto
         - por eso en el proyecto hay solamente un `index.ejs.html`
         - y el `index.html` solo existe en la caché del servidor
      - la ruta del servidor `socket.io` en cambio se mantiene en la raíz
      - esto te permite separar lo que es **socket.io y desarrollo** de lo que ya es **navegador y producción**:
         - en el subpath que digas
         - compatible con Github Pages (si ignoras la parte de `socket.io`)
   - si en un error en cualquiera de los comandos hay que interrumpìr el evento de cambios detectados o no: `bulletproof`
   - las extensiones de fichero que se están observando: `extensions`