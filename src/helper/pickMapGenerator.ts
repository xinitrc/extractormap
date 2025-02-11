import {ExtractorMap, jpv} from '..';

export function pickMapGenerator<T, S extends Record<string, any> = any>(keys: ReadonlyArray<keyof T & keyof S>): ExtractorMap<Pick<T, typeof keys[number]>, S> {
    const extractorMap = {};

    keys.forEach((key: keyof T) => {
        extractorMap[key as string] = jpv(key as string);
    });

    return extractorMap as ExtractorMap<Pick<T, typeof keys[number]>, S>;
}
