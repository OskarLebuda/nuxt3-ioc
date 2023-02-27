import { useNuxtApp } from '#app';
import { IOC } from '../ioc/IOCTypes';

export const useIOC = <T>(key: IOC.ServiceType<T>): T => {
  const nuxt = useNuxtApp();

  return nuxt.$iocContainer.get(key);
};