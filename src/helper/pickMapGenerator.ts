import {ExtractorMap, jpv} from '..';

export function pickMapGenerator<T>(keys: Array<keyof T>): ExtractorMap<Partial<T>> {
    const extractorMap = {};

    keys.forEach((key: keyof T) => {
        extractorMap[key as string] = jpv(key as string);
    });

    return extractorMap as ExtractorMap<Partial<T>>;
}
