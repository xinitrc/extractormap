export type ExtractorFunction<T> = (input: object) => T;

export type ExtractorMap<T> = {
    [P in keyof T]: ExtractorFunction<T[P]> | ExtractorMap<T[P]> ;
}

export function extract<T>(input: string, map: ExtractorMap<T>): T;
export function extract<T>(input: object, map: ExtractorMap<T>): T;
export function extract<T>(input: object | string, map: ExtractorMap<T>): T {
    if (typeof input === 'string') {
        return extractFromString(input, map);
    } else {
        return extractFromObject(input, map);
    }
}

function extractFromString<T>(input: string, map: ExtractorMap<T>): T {
    return extractFromObject(JSON.parse(input), map);
}

function isExtractionFn(e) {
    return typeof e === 'function';
}

function extractFromObject<T>(input: object, map: ExtractorMap<T>): T {
    const tmp = {};
    const keys: string[] = Object.keys(map || {});

    keys.forEach((key: string) => {
        tmp[key] = extractForKey(key, input, map);
    });

    return tmp as T;
}

function extractForKey<T>(key: string, input: object, map: ExtractorMap<T>) {
    const extractor = map[key];

    if (isExtractionFn(extractor)) {
        return extractor(input);
    } else {
        return extract(input, extractor);
    }
    return undefined;
}

export function makeExtractingProxy<T>(input: object, map: ExtractorMap<T>): T {
    return new Proxy({}, {
        get(target, name, receiver) {
            if (typeof name === 'string' && map[name])
                return extractForKey<T>(name, input, map);
            else
                return undefined;
        }
    }) as unknown as T;
}
