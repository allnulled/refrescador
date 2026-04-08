module.exports = {
  available: {

    // estilos
    bold: [1, 22],
    italic: [3, 23],
    underline: [4, 24],
    blink: [5, 25],
    inverse: [7, 27],
    strike: [9, 29],

    // colores
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],

    // fondo
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],

    // brillantes
    blackBright: [90, 39],
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39],

    bgBlackBright: [100, 49],
    bgRedBright: [101, 49],
    bgGreenBright: [102, 49],
    bgYellowBright: [103, 49],
    bgBlueBright: [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49],

  },
  endToken: "\x1b[0m",
  squad: {
    tl: "┌",
    tr: "┐",
    bl: "└",
    br: "┘",
  },
  line: {
    h: "─",
    v: "│",
  },
  style: function (config = "red,bold,underline") {
    const styles = config.split(",");
    return {
      text: (text) => {
        const begin = styles.reduce((out, it) => {
          if(!(it in this.available)) {
            return out;
          }
          const code = this.available[it];
          out += `\x1b[${code[0]}m`;
          return out;
        }, "");
        const end = this.endToken;
        return `${begin}${text}${end}`;
      }
    }
  }
};