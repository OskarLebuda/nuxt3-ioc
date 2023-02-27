import { defineNuxtModule, addPlugin, createResolver, addImports, isNuxt2 } from '@nuxt/kit';
import { name, version } from '../package.json';

// Module options TypeScript inteface definition
export interface ModuleOptions {
};

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'ioc',
    compatibility: {
      nuxt: '^3.2.0',
      bridge: false,
    }
  },
  defaults: {
  },
  setup (options, nuxt) {

    if (isNuxt2()) {
      throw new Error('IOC::Module. This module cannot be used on Nuxt2. Use https://github.com/mateuszgachowski/nuxt-ioc instead');
    }

    const resolver = createResolver(import.meta.url);
    nuxt.options.build.transpile.push('inversify');

    // define plugins
    addPlugin({
      src: resolver.resolve('./runtime/plugins/iocClientPlugin'),
      mode: 'client',
    });

    addPlugin({
      src: resolver.resolve('./runtime/plugins/iocServerPlugin'),
      mode: 'server',
    });

    // add auto-import composables
    // useContainer
    addImports({
      name: 'useContainer',
      as: 'useContainer', 
      from: resolver.resolve('runtime/composables/useContainer'),
    });

    // useIOC 
    addImports({
      name: 'useIOC',
      as: 'useIOC', 
      from: resolver.resolve('runtime/composables/useIOC'),
    });

    // useIOC
    addImports({
      name: 'useIOCOptional',
      as: 'useIOCOptional', 
      from: resolver.resolve('runtime/composables/useIOCOptional'),
    });

  },
});
