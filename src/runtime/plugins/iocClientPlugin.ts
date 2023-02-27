import { defineNuxtPlugin } from '#app';
import { defineIOCContainer } from '../defines/defineIOCContainer';
import { $StateSerializer, StateSerializer } from '../service/StateSerializer';
import { initializeContainer } from '../utils/Decorators';

export default defineNuxtPlugin((nuxtApp) => {
  const container = defineIOCContainer();

  // Initialize container
  initializeContainer(container);

  nuxtApp.provide('iocContainer', container);

  const stateSerializer = container.get<StateSerializer>($StateSerializer);
  stateSerializer.unserialize(container, stateSerializer.getSerializedState());
});
