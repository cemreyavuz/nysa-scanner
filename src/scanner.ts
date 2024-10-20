import scanner from "react-scanner";
import path from "path";
import fs from "fs";
import { uniqBy } from "lodash-es";

import { Logger, LogLevel } from "./log";
import { isPathOptionsWithKnownDependencies, PathOptions } from "./path";

type RunProps = {
  /**
   * An array of path options. Each item in the array should be set for a
   * unique project.
   */
  paths: PathOptions[];

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

type ScanResultItem = {
  library: string;
  bindings: {
    name: string;
    instanceCount: number;
    props: Record<string, number>;
  }[];
};

type ReportItem = {
  startedAt: number;
  completedAt: number;
  projectName: string;
  results: ScanResultItem[];
};

export const scan = async ({
  paths,
  logLevel = LogLevel.INFO,
  logDestination,
  outputDestination,
}: RunProps) => {
  const logger = new Logger({ level: logLevel, destination: logDestination });

  logger.info("Reading paths");
  if (paths.length === 0) {
    throw new Error("Paths array is empty");
  } else if (uniqBy(paths, "projectName").length !== paths.length) {
    throw new Error("Multiple path entries for the same project is detected");
  }

  const reports: ReportItem[] = [];

  const promises = paths.map(async (options) => {
    const startedAt = new Date().getTime();

    logger.info(`[${options.projectName}] Started to scan`);

    let dependencies: string[] = [];
    if (isPathOptionsWithKnownDependencies(options)) {
      logger.info(
        `[${options.projectName}] Found options with known dependencies`
      );

      dependencies = options.dependencies;
      logger.info(
        `[${options.projectName}] Found ${options.dependencies.length} dependencies`
      );
    } else {
      logger.info(
        `[${options.projectName}] Found options with dynamic dependencies`
      );

      logger.info(`[${options.projectName}] Parsing package.json`);
      const packageJson = JSON.parse(
        fs.readFileSync(
          path.resolve(
            options.packageJsonPath ??
              path.resolve(options.rootPath, "package.json")
          ),
          { encoding: "utf-8" }
        )
      ) as {
        dependencies: Record<string, string>;
        devDependencies: Record<string, string>;
      };

      dependencies = [
        ...Object.keys(packageJson.dependencies ?? {}),
        ...Object.keys(packageJson.devDependencies ?? {}),
      ].sort();
      logger.info(
        `[${options.projectName}] Found ${dependencies.length} dependencies`
      );
    }

    const scanResults = await scanner.run({
      crawlFrom: path.resolve(
        options.srcPath ?? path.resolve(options.rootPath, "src")
      ),
      processors: ["raw-report"],
      rootDir: path.resolve(options.rootPath),
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

    logger.info(`[${options.projectName}] Formatting scan results`);
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

    const completedAt = new Date().getTime();
    reports.push({
      startedAt,
      completedAt,
      projectName: options.projectName,
      results: combined,
    });
  });

  await Promise.all(promises);

  logger.info("Completed the scan");

  if (outputDestination) {
    logger.info(`Writing the results into "${outputDestination}"`);
    fs.writeFileSync(outputDestination, JSON.stringify(reports, undefined, 2));
  }

  return reports;
};
