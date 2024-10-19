import fs from "fs";
import dayjs from "dayjs";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  DISABLED = 4,
}

export class Logger {
  private level: LogLevel = LogLevel.ERROR;
  private destination: string | undefined = undefined;

  constructor({
    level,
    destination,
  }: {
    level: LogLevel;
    destination?: string;
  }) {
    this.level = level;
    this.destination = destination;
  }

  private getDate() {
    const date = new Date();
    const formatted = dayjs(date).format("YYYY/MM/DD HH:mm:ss")
    return formatted;
  }

  private log(message: string, severity: string) {
    const formatted = `[${severity.toUpperCase()}] [${this.getDate()}] ${message}`;

    if (this.destination) {
      fs.appendFileSync(this.destination, formatted);
    } else {
      console.log(formatted);
    }
  }

  error(message: string) {
    if (this.level <= LogLevel.ERROR) {
      this.log(message, "ERROR");
    }
  }

  warn(message: string) {
    if (this.level <= LogLevel.WARN) {
      this.log(message, "WARNING");
    }
  }

  info(message: string) {
    if (this.level <= LogLevel.INFO) {
      this.log(message, "INFO");
    }
  }

  debug(message: string) {
    if (this.level <= LogLevel.DEBUG) {
      this.log(message, "DEBUG");
    }
  }
}
