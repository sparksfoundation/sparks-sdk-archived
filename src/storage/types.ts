/**
 * Storage interface
 * responsible for storing, retrieving and deleting serialized identity
 * leverage Spark main class to get data to store
 * extend Storage class to implement other storage mechanisms
 */
export interface IStorage {
    /**
     * get the serialized identity from storage
     * @returns {Promise<string>} A promise that resolves to the serialized identity,
     * or rejects with an error.
     */
    get(): Promise<string> | never;

    /**
     * set the serialized identity to storage
     * @returns {Promise<void>} A promise that resolves when the delete operation is complete,
     * or rejects with an error.
     */
    set(): Promise<void> | never;

    /**
     * delete the serialized identity from storage
     * @returns {Promise<void>} A promise that resolves when the delete operation is complete,
     * or rejects with an error.
     */
    delete(): Promise<void> | never;
}