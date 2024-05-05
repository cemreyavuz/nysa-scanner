/**
 * Enum for log levels
 * @readonly
 * @enum {number}
 */
const LOG_LEVEL = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
};

class Logger {
  /**
   * log level set by consumer
   */
  #logLevel;

  /**
   * @param {LOG_LEVEL} logLevel
   */
  constructor(logLevel) {
    this.#logLevel = logLevel;
  }

  /**
   * @param {string} message
   * @param {LOG_LEVEL} level
   */
  #log(message, level) {
    if (this.#logLevel <= level) {
      const levelName = Object.entries(LOG_LEVEL).find(
        ([_, value]) => value === level
      )[0];
      console.log(`[${levelName}] ${message}`);
    }
  }

  debug(message) {
    return this.#log(message, LOG_LEVEL.DEBUG);
  }

  info(message) {
    return this.#log(message, LOG_LEVEL.INFO);
  }

  warning(message) {
    return this.#log(message, LOG_LEVEL.WARNING);
  }

  error(message) {
    return this.#log(message, LOG_LEVEL.ERROR);
  }
}

module.exports = {
  Logger,
  LOG_LEVEL,
};
