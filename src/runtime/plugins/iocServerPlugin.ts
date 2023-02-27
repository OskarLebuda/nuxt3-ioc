import { defineNuxtPlugin } from '#app';
import { defineIOCContainer } from '../defines/defineIOCContainer';
import { Container } from '../ioc/Container';
import { $StateSerializer, StateSerializer } from '../service/StateSerializer';
import { destroyContainer, initializeContainer } from '../utils/Decorators';

declare module '#app' {
  interface NuxtApp {
    $iocContainer: Container;
  }
}

export default defineNuxtPlugin((nuxtApp) => {

  let container: Container;

  // on start create new container and provide it
  nuxtApp.hook('app:created', () => {
    container = defineIOCContainer();
    nuxtApp.provide('iocContainer', container);

    initializeContainer(container);
  })

  // on finish or error - destroy container
  nuxtApp.hook('app:rendered', async () => {
    if (nuxtApp.payload) {
      const stateSerializer = container.get<StateSerializer>($StateSerializer);
      const initialState = stateSerializer.serialize(container);
      nuxtApp.payload.__IOC_STATE__ = initialState;
    }

    destroyContainer(container);
  });

  nuxtApp.hook('app:error', async () => {
    destroyContainer(container);
  });
});
