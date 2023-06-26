
export const parseJSON = (data): Record<string,any> | void => {
    try {
        return JSON.parse(data);
    }
    catch (e) {
        return;
    }
}
