
declare module 'react-scanner' {
  type ReactScannerProcessor = 'count-components' | 'count-components-and-props' | 'raw-report'
  
  type ReactScannerConfig = {
    rootDir?: string;
    crawlFrom?: string;
    exclude?: string[] | ((path: string) => boolean);
    globs?: string[];
    includeSubComponents?: boolean;
    importedFrom?: string;
    processors?: ReactScannerProcessor[];
  };

  type ReactScannerResultItemRawReportInstance = {
    importInfo?: {
      imported: string;
      local: string;
      moduleName: string;
      importType: "ImportSpecifier"; // TODO: more?
    };
    props: Record<string, string>;
    propsSpread: boolean;
    location: {
      file: string;
      start: {
        line: number;
        column: number;
      };
    };
  };

  type ReactScannerResultItemRawReport = {
    instances: ReactScannerResultItemRawReportInstance[];
  };

  type ReactScannerResultItem = ReactScannerResultItemRawReport;

  type ReactScannerResults = Record<string, ReactScannerResultItem>
  
  function run(config: ReactScannerConfig, configDir?: string): ReactScannerResults;
} 