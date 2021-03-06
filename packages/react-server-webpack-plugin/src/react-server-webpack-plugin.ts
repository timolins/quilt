import {join, resolve} from 'path';
import {Compiler} from 'webpack';
import VirtualModulesPlugin from 'webpack-virtual-modules';

interface Options {
  basePath: string;
  assetPrefix?: string;
  host?: string;
  port?: number;
}

enum Entrypoint {
  Client = 'client',
  Server = 'server',
}

export const HEADER = `
  // Generated by @shopify/react-server-webpack-plugin
`;

/**
 * A webpack plugin that generates default server and client entrypoints if none are present.
 * @param config
 * @returns a customized webpack plugin
 */
export class ReactServerPlugin {
  private options: Options;

  constructor({
    host,
    port,
    assetPrefix,
    basePath = '.',
  }: Partial<Options> = {}) {
    this.options = {
      basePath,
      host,
      port,
      assetPrefix,
    };
  }

  apply(compiler: Compiler) {
    const modules = this.modules(compiler);
    const virtualModules = new VirtualModulesPlugin(modules);
    (virtualModules as any).apply(compiler);
  }

  private modules(compiler: Compiler) {
    const {basePath} = this.options;
    const modules: Record<string, string> = {};

    if (noSourceExists(Entrypoint.Client, this.options, compiler)) {
      const file = join(basePath, `${Entrypoint.Client}.js`);
      modules[file] = clientSource();
    }

    if (noSourceExists(Entrypoint.Server, this.options, compiler)) {
      const file = join(basePath, `${Entrypoint.Server}.js`);
      modules[file] = serverSource(this.options);
    }

    return modules;
  }
}

function serverSource(options: Options) {
  const {port, host, assetPrefix} = options;
  const serverPort = port ? port : 'process.env.REACT_SERVER_PORT || 8081';

  const serverIp = host
    ? JSON.stringify(host)
    : 'process.env.REACT_SERVER_IP || "localhost"';

  const serverAssetPrefix = assetPrefix
    ? JSON.stringify(assetPrefix)
    : 'process.env.CDN_URL || "localhost:8080/assets/webpack"';

  return `
    ${HEADER}
    import React from 'react';
    import {createServer} from '@shopify/react-server';
    import App from 'index';
    process.on('uncaughtException', logError);
    process.on('unhandledRejection', logError);
    function logError(error) {
      const errorLog = \`\${error.stack || error.message || 'No stack trace was present'}\`;
      console.log(\`React Server failed to start.\n\${errorLog}\`);
      process.exit(1);
    }
    const render = (ctx) =>
    React.createElement(App, {
      server: true,
      location: ctx.request.url,
    });
    const app = createServer({
      port: ${serverPort},
      ip: ${serverIp},
      assetPrefix: ${serverAssetPrefix},
      render,
    });
    export default app;
  `;
}

function clientSource() {
  return `
    ${HEADER}
    import React from 'react';
    import ReactDOM from 'react-dom';
    import {showPage} from '@shopify/react-html';
    import App from 'index';
    const appContainer = document.getElementById('app');
    ReactDOM.hydrate(React.createElement(App), appContainer);
    showPage();
  `;
}

function noSourceExists(
  entry: Entrypoint,
  options: Options,
  {inputFileSystem, options: {context = ''}}: Compiler,
) {
  const {basePath: path} = options;
  const basePath = resolve(context, path);

  // readdirSync is not on the type for this
  const dirFiles = (inputFileSystem as any).readdirSync(basePath);

  // We assume the user knows what they're doing if the folder exists
  const isEntryFolder = path => path.includes(`${basePath}/${entry}/`);
  if (dirFiles.find(isEntryFolder)) {
    return false;
  }

  const filenameRegex = new RegExp(`^${entry}.[jt]sx?$`);
  return dirFiles.find(file => filenameRegex.test(file)) == null;
}
