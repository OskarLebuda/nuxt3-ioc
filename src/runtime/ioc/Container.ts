/**
 * IOCContainer.ts
 * This class is a service container wrapper for Inversify.js.
 * It provides most common functions, is less verbosy to use and
 * requires less boilerplate.
 */

import 'reflect-metadata';
import { Container as InversifyContainer, interfaces as InversifyInterfaces } from 'inversify';
import { IOC } from './IOCTypes';

/**
 * IOC container implementation on livedata.
 */
export class Container {
  // internal inversify instance that is wrapped
  private fInternalContainer: InversifyContainer;

  // container configuration
  private fParams: IOC.IContainerParams = {
    createLocked: false,
  };

  // wheneever container is unlocked (ready to use) or still preparing
  private fIsLocked = false;

  // array of services for later lookup
  private fServiceKeys: IOC.ServiceKey[] = [];

  // container onConstruct event handlers
  private fOnConstructHandlers: IOC.OnConstructEventHandler[] = [];

  /**
   * Container constructor.
   * @param params container configuration params
   */
  constructor(params?: Partial<IOC.IContainerParams>) {
    this.fInternalContainer = new InversifyContainer();
    this.fInternalContainer.applyMiddleware((resolveInfo) => this.onResolve(resolveInfo));
    this.fIsLocked = params?.createLocked ?? false;
    this.fParams = Object.assign(this.fParams, params);
  }

  /**
   * get services keys
   * @returns {Array} keys
   */
  public get servicesKeys(): IOC.ServiceKey[] {
    return this.fServiceKeys;
  }

  /**
   * Binds particular key (an implementation class or abstract class) into particular
   * implementation class. As a key you can pass either direct implementation or an abstract
   * class. If second argument is not passed, class passed as first argument will be
   * both key and implementation.
   *
   * Examples:
   *
   * class BaseClass {}
   * class ExtClass extends BaseClass {}
   *
   * container.bind(BaseClass); // @Inject(() => BaseClass)
   * will inject instance of BaseClass
   *
   * container.bind(BaseClass, ExtClass); // @Inject(() => BaseClass)
   * will inject instance of ExtClass
   *
   * @param key key of service, preferably class or abstract class
   * @param implementation (optional) extended implementation
   */
  public bind<T>(key: IOC.ServiceType, implementation?: IOC.ServiceValue<T>): void {
    // check if the key definition is symbol and there are no implementation of it
    if (typeof key === 'symbol' && !implementation) {
      throw new Error('Container.bind() - trying to provide implementation for binds with symbols.');
    }

    // if it was created as locked but its now not, throw error
    if (!this.fIsLocked && this.fParams.createLocked) {
      throw new Error('Container.bind() - trying to modify container after unlocking.');
    }

    this.checkIfServiceIsBound(key);

    if (implementation === undefined) {
      // if user did not pass implementation, we assume that key is implementation
      this.fInternalContainer.bind(key).toSelf().inSingletonScope();
    } else {
      // else we are binding key into custom implementation
      this.fInternalContainer
        .bind(key)
        .to(implementation as IOC.Newable<T>)
        .inSingletonScope();
    }

    // save key
    this.fServiceKeys.push(key);
  }

  /**
   * Binds particular key class to an existing class instance. If you use this method,
   * class wont be instantiated automatically by inversify. The common use case is to
   * share single class instance between two or more containers.
   *
   * @param key key of service, preferably class or abstract class
   * @param instance instance of class to be used as resolution
   */
  public bindInstance<T>(key: IOC.ServiceType<T>, instance: T): void {
    // if it was created as locked but its now not, throw error
    if (!this.fIsLocked && this.fParams.createLocked) {
      throw new Error('Container.bind() - trying to modify container after unlocking.');
    }

    this.checkIfServiceIsBound(key);

    // bind key to constant value (of class instance)
    this.fInternalContainer.bind(key).toConstantValue(instance);

    // save key
    this.fServiceKeys.push(key);
  }

  /**
   * Binds mocked instance to a particular service ID. Its designed to be used in unit tests, where you can quickly
   * replace real IOC implementation with a partial stub.
   *
   * Example:
   *
   * container.bind(HttpServer, {
   *   listen: jest.fn(),
   * });
   *
   * @param key service to be replaced
   * @param implementation mocked implementation, its not required to implement all methods from real service
   */
  public bindMock<T>(key: IOC.ServiceType<T>, implementation: Partial<T>): void {
    // if it was created as locked but its now not, throw error
    if (!this.fIsLocked && this.fParams.createLocked) {
      throw new Error('Container.bind() - trying to modify container after unlocking.');
    }

    this.checkIfServiceIsBound(key);

    // bind to constant value
    this.fInternalContainer.bind(key).toConstantValue(implementation as T);

    // save key
    this.fServiceKeys.push(key);
  }

  /**
   * Returns implementation for a particular key class. This is the same as @Inject,
   * but triggered programitically.
   * @param key key used in .bind() function to bind key class to implementation class
   * @returns service for identifier
   */
  public get<T>(key: IOC.ServiceType<T>): T {
    if (this.fIsLocked) {
      throw new Error('Container.get() - trying to get item from locked container.');
    }

    return this.fInternalContainer.get(key);
  }

  /**
   * Returns implementation for a particular key class. This is the same as @InjectOptional,
   * but triggered programitically.
   * If the container has not bounded dependencie then method returns null
   * @param key key used in .bind() function to bind key class to implementation class
   * @returns service for identifier
   */
  public getOptional<T>(key: IOC.ServiceType): T | null {
    if (this.fIsLocked) {
      throw new Error('Container.get() - trying to get item from locked container.');
    }

    if (!this.fInternalContainer.isBound(key)) {
      return null;
    }

    return this.fInternalContainer.get(key);
  }

  public expand(providers: IOC.ProviderFunc | IOC.ProviderFunc[]): void {
    const preLockState = this.fIsLocked;
    const allProviders = Array.isArray(providers) ? providers : [providers];

    try {
      this.fIsLocked = false;
      this.unlock();
      allProviders.forEach((provider) => this.use(provider));
    } finally {
      this.fIsLocked = preLockState;
    }
  }

  /**
   * Uses the container provider to register multiple things in IOC container at once.
   * @param provider provider that will register new services into IOC container
   */
  public use(provider: IOC.ProviderFunc): void {
    provider(this);
  }

  /**
   * Creates instance of particular class using inversify, ensuring all dependencies will
   * be injected.
   * @param classType type of class to instantiate
   * @returns instance of that class build with IOC container
   */
  public resolve<T>(classType: IOC.Newable<T>): T {
    if (this.fIsLocked) {
      throw new Error('Container.resolve() - trying to construct item with locked container.');
    }

    return this.fInternalContainer.resolve(classType);
  }

  /**
   * Returns all IOC services registered in container.
   * @returns array with all registered services
   */
  public getAllServices(): IOC.Instance[] {
    return this.fServiceKeys.map((key) => this.get(key));
  }

  /**
   * Unlocks the container, allowing things to be retrieved and used.
   */
  public unlock(): void {
    this.fIsLocked = false;
  }

  /**
   * Called when service is created.
   *
   * @param planAndResolve middleware next function
   * @return middleware next function
   */
  private onResolve(planAndResolve: InversifyInterfaces.Next): InversifyInterfaces.Next {
    return (args: InversifyInterfaces.NextArgs) => {
      if (this.fIsLocked) {
        throw new Error('Container.onResolve() - trying to resolve dependency on locked container.');
      }

      const service = planAndResolve(args);
      this.fOnConstructHandlers.forEach((handler) => handler(service));
      return service;
    };
  }

  private checkIfServiceIsBound<T>(key: IOC.ServiceType<T>): void {
    // if service key was already registered, unbind it, so overwriting by packages is possible
    const serviceIndex = this.fServiceKeys.indexOf(key);

    if (serviceIndex > -1) {
      this.fServiceKeys.splice(serviceIndex, 1);
      this.fInternalContainer.unbind(key);
    }
  }
}