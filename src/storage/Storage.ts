import { IStorage } from './types.js';

export class Storage implements IStorage {
    async get() {
        throw new Error('Not implemented');
        return '';
    }

    async set() {
        throw new Error('Not implemented');
    }

    async delete() {
        throw new Error('Not implemented');
    }
}