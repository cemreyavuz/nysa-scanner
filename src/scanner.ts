import scanner from "react-scanner";
import path from "path";
import fs from "fs";

import { Logger, LogLevel } from "./log";

type RunProps = {
  projectRoot: string;
  srcDirPath?: string;
  pkgJsonPath?: string;

  /**
   * Minimum level of severity for logging messages to console. If no level is
   * provided, will not log.
   * @default LogLevel.ERROR
   */
  logLevel?: LogLevel;

  /**
   * File path to write the logs into. If no destination is provided, will log
   * to console instead.
   */
  logDestination?: string;

  /**
   * File path to write the output. If no destination is provided, will not
   * write the output.
   */
  outputDestination?: string;
};

export const scan = async ({
  projectRoot,
  srcDirPath,
  pkgJsonPath,
  logLevel = LogLevel.INFO,
  logDestination,
  outputDestination,
}: RunProps) => {
  const logger = new Logger({ level: logLevel, destination: logDestination });

  logger.info("Parsing package.json");
  const packageJson = JSON.parse(
    fs.readFileSync(
      path.resolve(pkgJsonPath ?? path.resolve(projectRoot, "package.json")),
      { encoding: "utf-8" }
    )
  ) as {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };

  const dependencies = [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
  ].sort();
  logger.info(`Found dependencies: "${dependencies.join(",")}"`)

  const scanResults = await scanner.run({
    crawlFrom: path.resolve(srcDirPath ?? path.resolve(projectRoot, "src")),
    processors: ["raw-report"],
    rootDir: path.resolve(projectRoot),
  });

  const formatted: Record<
    string,
    {
      bindings: Record<
        string,
        {
          instanceCount: number;
          props: Record<string, number>;
        }
      >;
    }
  > = {};

  logger.info("Formatting scan results");
  Object.entries(scanResults).forEach(([componentName, { instances }]) => {
    instances.forEach(({ importInfo, props }) => {
      // pass if importInfo doesn't exist
      if (!importInfo) {
        return;
      }
      const { moduleName } = importInfo;

      // pass if module is not a dependency
      if (!dependencies.includes(moduleName)) {
        return;
      }

      // create library entry if it doesn't exist
      if (!formatted[moduleName]) {
        formatted[moduleName] = { bindings: {} };
      }

      // create binding entry if it doesn't exist
      if (!formatted[moduleName].bindings[componentName]) {
        formatted[moduleName].bindings[componentName] = {
          instanceCount: 0,
          props: {},
        };
      }

      // increment instance count
      formatted[moduleName].bindings[componentName].instanceCount += 1;

      // add prop entries if they don't exist
      Object.keys(props).forEach((propName) => {
        if (!formatted[moduleName].bindings[componentName].props[propName]) {
          formatted[moduleName].bindings[componentName].props[propName] = 0;
        }
      });

      // increment prop counts
      Object.keys(props).forEach((propName) => {
        formatted[moduleName].bindings[componentName].props[propName] += 1;
      });
    });
  });
  const combined = Object.entries(formatted).map(
    ([libraryName, { bindings }]) => ({
      library: libraryName,
      bindings: Object.entries(bindings).map(([componentName, info]) => ({
        name: componentName,
        ...info,
      })),
    })
  );

  logger.info("Completed the scan");

  if (outputDestination) {
    logger.info(`Writing the results into "${outputDestination}"`);
    fs.writeFileSync(outputDestination, JSON.stringify(combined, undefined, 2));
  }

  return combined;
};
