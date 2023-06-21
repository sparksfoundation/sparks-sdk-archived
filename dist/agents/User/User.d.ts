import { AAgent } from "../Agent/types";
import { IUser } from "./types";
/**
 * User agent
 * Provides user specific functionality
 */
export declare class User extends AAgent implements IUser {
    handle: string;
    avatar: string;
}
