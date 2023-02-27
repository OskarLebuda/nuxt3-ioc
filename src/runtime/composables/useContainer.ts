import { useNuxtApp } from '#app';
import { Container } from '../ioc/Container';

export const useContainer = (): Container => {
  const nuxt = useNuxtApp();
  return nuxt.$iocContainer;
};