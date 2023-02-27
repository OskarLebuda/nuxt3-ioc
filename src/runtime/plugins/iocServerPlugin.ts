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

	const container = defineIOCContainer();
	nuxtApp.provide('iocContainer', container);

	if (nuxtApp.payload) {
    const stateSerializer = container.get<StateSerializer>($StateSerializer);
    const initialState = stateSerializer.serialize(container);
    nuxtApp.payload.__IOC_STATE__ = initialState;
  }

  initializeContainer(container);

	// on finish or error - destroy container
	nuxtApp.hook('app:rendered', async () => {
		destroyContainer(container);
	});

	nuxtApp.hook('app:error', async () => {
		destroyContainer(container);
	});
});
