#!/usr/bin/env node
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { scan } = require("./scan.cjs");

yargs(hideBin(process.argv))
  .command(
    "scan [projectRoot] [srcDirPath] [pkgJsonPath]",
    "scan the repository",
    (yargs) => {
      return yargs
        .positional("projectRoot", {
          describe: "project root",
          default: "./",
        })
        .positional("srcDirPath", {
          describe: "path to src directory",
          default: "./src",
        })
        .positional("pkgJsonPath", {
          describe: "path to package.json",
          default: "./package.json",
        });
    },
    (argv) => {
      scan({
        projectRoot: argv.projectRoot,
        srcDirPath: argv.srcDirPath,
        pkgJsonPath: argv.pkgJsonPath,
        logLevel: argv.logLevel,
      });
    }
  )
  .option("logLevel", {
    type: "number",
    description: "log level",
    default: 1,
  })
  .parse();
