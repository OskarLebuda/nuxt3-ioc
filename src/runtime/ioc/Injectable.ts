/**
 * This module exports @Injectable() annotation without any modifications.
 *
 * Its for simplier use and VSCode auto-import reasons.
 */
import 'reflect-metadata';
import * as Inversify from 'inversify';

export const Injectable = Inversify.injectable;