import winston from "winston";
import path from "node:path";

const { combine, timestamp, printf, errors } = winston.format;

const RESET = "\x1b[0m";
const DIM = "\x1b[2m";

const LEVEL_COLORS = {
  error: "\x1b[38;5;196m",
  warn: "\x1b[38;5;214m",
  info: "\x1b[38;5;39m",
};

const fmt = printf(({ level, message, timestamp: ts, filename, stack }) => {
  const color = LEVEL_COLORS[level] || RESET;

  return `${DIM}[${ts}]${RESET} ${color}[${level.toUpperCase()}]${RESET} ${DIM}[${filename}]${RESET} ${color}${stack || message}${RESET}`;
});

const serialize = (message) => 
    typeof message === 'object' ? JSON.stringify(message, null, 2) : message;


const winstonLogger = winston.createLogger({
  level: "info",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "HH:mm:ss" }),
    fmt
  ),
  transports: [new winston.transports.Console()],
});

export class Logger {
  constructor(filepath) {
    try{
        const filename = path.basename(filepath);
        console.log(`Creating a logger for ${filename}`);
        this.filename = filename;
    }catch(err){
        console.log(`[ERROR] Cannot create Logger`);
        console.log(`Filename must be of type string`);
        console.log(err);
    }
   
  }

  info(message) {
    winstonLogger.info(serialize(message), { filename: this.filename });
  }

  warn(message) {
    winstonLogger.warn(serialize(message), { filename: this.filename });
  }

  error(message, err) {
    winstonLogger.error(serialize(message), {
      filename: this.filename,
      ...(err instanceof Error && { stack: err.stack }),
    });
  }

  log(message) {
    winstonLogger.info(message, { filename: this.filename });
  }
}