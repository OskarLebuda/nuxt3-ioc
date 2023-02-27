import { useNuxtApp } from '#app';
import { IOC } from '../ioc/IOCTypes';

export const useIOCOptional = <T>(key: IOC.ServiceType<T>): T | null => {
  const nuxt = useNuxtApp();

  return nuxt.$iocContainer.getOptional(key);
};