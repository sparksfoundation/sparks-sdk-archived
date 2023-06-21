import { AAgent } from "../Agent/types";
import { IUser } from "./types";

/**
 * User agent
 * Provides user specific functionality
 */
export class User extends AAgent implements IUser {
  public handle: string;
  public avatar: string;
}
