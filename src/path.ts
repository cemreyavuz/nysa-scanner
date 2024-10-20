export type PathOptions =
  | PathOptionsWithDynamicDependencies
  | PathOptionsWithKnownDependencies;

/**
 * @internal
 * Type definition for base path options. Intended for only internal use.
 */
type BasePathOptions = {
  /**
   * Path for project root. `srcPath` and `packageJsonPath` will be resolved
   * relative to `rootPath`. Defaults to current working directory.
   */
  rootPath: string;

  /**
   * Path for src folder.
   */
  srcPath?: string;

  /**
   * Name of the project that will be scanned. It should match the name in the
   * application.
   */
  projectName: string;
};

export type PathOptionsWithKnownDependencies = BasePathOptions & {
  /**
   * List of dependencies to track during the scan.
   */
  dependencies: string[];
};

export type PathOptionsWithDynamicDependencies = BasePathOptions & {
  /**
   * Path for `package.json`. It will be read to parse the dependencies to
   * track during the scan. If no path is provided, it will default to
   * `{root}/package.json`. It will be resolved relative to `root` path.
   */
  packageJsonPath?: string;
};

export const isPathOptionsWithKnownDependencies = (
  options: PathOptions
): options is PathOptionsWithKnownDependencies => {
  return (
    !!options &&
    typeof options === "object" &&
    Array.isArray((options as PathOptionsWithKnownDependencies).dependencies)
  );
};
