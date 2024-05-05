import scanner from "react-scanner";
import path from "path";
import fs from "fs";

type RunProps = {
  projectRoot: string;
  srcDirPath?: string;
  pkgJsonPath?: string;
};

export const scan = async ({ projectRoot, srcDirPath, pkgJsonPath }: RunProps) => {
  const packageJson = JSON.parse(
    fs.readFileSync(
      path.resolve(pkgJsonPath ?? path.resolve(projectRoot, "package.json")),
      { encoding: "utf-8" }
    )
  ) as { dependencies: Record<string, string> };
  const dependencies = Object.keys(packageJson.dependencies ?? {});

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

  return combined;
};
