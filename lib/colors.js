module.exports = Object.assign({
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
          if (!(it in this.available)) {
            return out;
          }
          const code = this.available[it];
          out += `\x1b[${code[0]}m`;
          return out;
        }, "");
        const end = this.endToken;
        return `${begin}${text}${end}`;
      },
      print(text) {
        console.log(this.text(text));
      }
    }
  },
  stripAnsi: function (str) {
    return str.replace(/\x1b\[[0-9;]*m/g, "");
  },
  wrapAnsi: function (str, maxWidth) {
    return require("wrap-ansi").default(str, maxWidth, {
      hard: true
    });
  },
  box: function (text, maxWidth = 110) {
    const lines = this.wrapAnsi(text, maxWidth).split("\n");
    const cleanLines = lines.map(l => this.stripAnsi(l));
    const width = Math.max(...cleanLines.map(l => l.length));
    const top = "┌" + "─".repeat(width + 2) + "┐";
    const bottom = "└" + "─".repeat(width + 2) + "┘";
    const body = lines
      .map(line => {
        const clean = this.stripAnsi(line);
        const pad = width - clean.length;
        return "│ " + line + " ".repeat(pad) + " │";
      })
      .join("\n");
    return `${top}\n${body}\n${bottom}`;
  }
}, {
  table: function table(listOfColumns, options = {}) {
    const Table = require("cli-table3");
    const table = new Table(options);
    table.push(...listOfColumns);
    return table.toString();
  },
  borderlessTable: function borderlessTable(listOfColumns, optionsObject = {}) {
    return this.alignTable(listOfColumns, 2, optionsObject);
  },
  visibleLength(str) {
    return require('strip-ansi').default(str).length;
  },
  alignTable(rows, gap = 2, max = {}) {
    for (let indexRow = 0; indexRow < rows.length; indexRow++) {
      const row = rows[indexRow];
      for (let indexCol = 0; indexCol < row.length; indexCol++) {
        const cell = row[indexCol];
        const cellLen = this.visibleLength(cell);
        if (!(indexCol in max)) {
          max[indexCol] = 5;
        }
        if (max[indexCol] < cellLen) {
          max[indexCol] = cellLen;
        }
      }
    }
    let out = "";
    for (let indexRow = 0; indexRow < rows.length; indexRow++) {
      const row = rows[indexRow];
      for (let indexCol = 0; indexCol < row.length; indexCol++) {
        const cell = row[indexCol];
        const currCellLen = this.visibleLength(cell);
        const cellLen = max[indexCol];
        const col = cell + " ".repeat(cellLen - currCellLen);
        if (indexCol !== 0) {
          out += " │ ";
        }
        out += col;
      }
      out += "\n";
    }
    return out.trimEnd();
  },
  padLinesToMax: function padLinesToMax(text) {
    const lines = text.split("\n");
    let out = "";
    let max = 0;
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (max < line.length) {
        max = line.length;
      }
    }
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const padded = line.padEnd(max, " ");
      if (index !== 0) out += "\n";
      out += padded;
    }
    return out;
  },
});