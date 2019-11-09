export type ExtractorFunction<T> = (input: object) => T[keyof T];

export type ExtractorMap<T> = {
    [P in keyof T]: ExtractorMap<T[P]> | ExtractorFunction<T[P]>;
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
    const keys: string[] = Object.keys(map);

    keys.forEach((key: string) => {
        const extractorEntry = map[key];

        if (isExtractionFn(extractorEntry)) {
            tmp[key] = extractorEntry(input);
        } else {
            tmp[key] = extract(input, extractorEntry);
        }
    });

    return tmp as T;
}

