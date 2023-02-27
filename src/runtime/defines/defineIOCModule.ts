import { useNuxtApp } from '#app';
import { IOC } from '../ioc/IOCTypes';
import { Container } from '../ioc/Container';

export const defineIOCModule = (expandProvider?: IOC.ProviderFunc): Container => {
  const nuxt = useNuxtApp();
  const container = nuxt.$iocContainer;

  if (expandProvider && typeof expandProvider === 'function') {
    container.expand(expandProvider);
  }

  return container;
};