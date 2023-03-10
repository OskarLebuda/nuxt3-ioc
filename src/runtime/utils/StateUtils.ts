/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

// Single observable entry
export interface IObservableEntry {
  serviceKey: string;
  propertyName: string;
}

// Service class casted to observables
export interface IObservedClass extends Object {
  __observables: IObservableEntry[];
}

/**
 * Adds interactive property to observable list for SSR purposes later on.
 * @param target class that will contain observable
 * @param serviceKey unique service key
 * @param propertyName name of property that should be serialized
 */
function addToObservableList(target: IObservedClass, serviceKey: string, propertyName: string): void {
  // create __observables magic-array if it does not exists
  if (!target.__observables) {
    target.__observables = [];
  }

  // add information
  target.__observables.push({
    serviceKey,
    propertyName,
  });
}

/**
 * Makes property fully reactive by Vue so UI will respond properly to changes
 * of this property.
 *
 * @param serviceKey unique string identifier for service, for SSR purposes
 * @param params params object
 * @returns decorator function
 */
export function Serializable(serviceKey: string): Function {
  return function decorator(target: any, propertyName: string) {
    // add to observable list
    addToObservableList(target, serviceKey, propertyName);
  };
}