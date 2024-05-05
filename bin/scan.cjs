const { Logger, LOG_LEVEL } = require("./logger.cjs");

/**
 * @param {Object} argv
 * @param {string} argv.projectRoot
 * @param {string} argv.srcDirPath
 * @param {string} argv.pkgJsonPath
 * @param {LOG_LEVEL} argv.logLevel
 */
const scan = ({ projectRoot, srcDirPath, pkgJsonPath, logLevel }) => {
  const logger = new Logger(logLevel);
  logger.info("Starting to scan");
};

module.exports = {
  scan,
};
