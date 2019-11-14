export type ExtractorFunction<T> = (input: object) => T;

export type ExtractorMap<T> = {
    [P in keyof T]: ExtractorFunction<T[P]> | ExtractorMap<T[P]>;
};

export function extract<T>(map: ExtractorMap<T>): ExtractorFunction<T>;
export function extract<T>(map: ExtractorMap<T>, input: object): T;
export function extract<T>(map: ExtractorMap<T>, input?: object): T | ExtractorFunction<T> {
    if (typeof input === 'undefined') {
        return (inputObject: object) => extractFromObject(inputObject, map);
    } else {
        return extractFromObject(input, map);
    }
}

function isExtractorFunction<T>(e: ExtractorFunction<T> | ExtractorMap<T>): e is ExtractorFunction<T> {
    return typeof e === 'function';
}

function extractFromObject<T>(inputObject: object, extractionMap: ExtractorMap<T>): T {
    const resultObject: Partial<T> = {};
    const extractionKeys: Array<keyof T> = Object.keys(extractionMap || {}) as Array<keyof T>;

    extractionKeys.forEach((extractionKey: keyof T) => {
        resultObject[extractionKey] = _extractForKey(extractionMap, extractionKey, inputObject);
    });

    return resultObject as T;
}

export function createExtractingProxy<T>(eMap: ExtractorMap<T>): ExtractorFunction<T>;
export function createExtractingProxy<T>(eMap: ExtractorMap<T>, input: object): T;
export function createExtractingProxy<T>(eMap: ExtractorMap<T>, input?: object): T | ExtractorFunction<T> {
    if (typeof input === 'undefined') {
        return (inputObject: object) => createExtractingProxy(eMap, inputObject);
    } else {
        return new Proxy({}, {
            get(target, name) {
                if (typeof name === 'string' && _isKeyOfT(eMap, name)) {
                    return _extractForKey<T>(eMap, name, input);
                }
            }
        }) as unknown as T;
    }
}

function _extractForKey<T>(extractionMap: ExtractorMap<T>, extractionKey: keyof T, inputObject: object) {
    const extractor: ExtractorMap<T[keyof T]> | ExtractorFunction<T[keyof T]> = extractionMap[extractionKey];

    if (isExtractorFunction(extractor)) {
        return extractor(inputObject);
    } else {
        return extract(extractor, inputObject);
    }
}

function _isKeyOfT<T>(eMap: ExtractorMap<T>, keyUnderTest: string | number | symbol): keyUnderTest is keyof T {
    return typeof eMap[keyUnderTest] !== 'undefined'
}
