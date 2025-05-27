import {ExtractorMap, jpv} from '..';

export function pickMapGenerator<T, S extends Record<string, any> = any>(keys: ReadonlyArray<keyof T & keyof S>): ExtractorMap<Pick<T, (typeof keys)[number]>, S> {
    const extractorMap: Partial<ExtractorMap<Pick<T, (typeof keys)[number]>, S>> = keys.reduce((acc: Partial<ExtractorMap<Pick<T, (typeof keys)[number]>, S>>
        , key: keyof T & keyof S): Partial<ExtractorMap<Pick<T, (typeof keys)[number]>, S>> => {
        return {...acc, ...{[key]: jpv(key as string)}};
    }, {});

    return extractorMap as ExtractorMap<Pick<T, (typeof keys)[number]>, S>;
}
