import { Container } from './Container';

export namespace IOC {
  export type ServiceKey = any;

  export type ServiceType<T = unknown> = symbol | Newable<T> | Abstract<T>;

  export type ServiceValue<T> = Newable<T> | T;

  /**
   * Standard class.
   */
  export interface Newable<T> {
    new (...args: unknown[]): T;
  }

  /**
   * Abstract class.
   */
  export interface Abstract<T> {
    prototype: T;
  }

  /**
   * Service instance
   */
  export type Instance = any;

  export type OnConstructEventHandler = (service: object) => void;

  /**
   * Container provider function.
   */
  export type ProviderFunc = (container: Container) => void;

  // holds configuration params
  export interface IContainerParams {
    createLocked: boolean;
  }
}