import { Identity } from './Identity.js';
import '../forge/types.js';

declare class Verifier extends Identity {
    constructor();
    requestUri(): void;
    verifyRequest(): void;
}

export { Verifier };
