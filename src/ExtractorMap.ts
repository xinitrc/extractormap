import {jpv} from './extractorFunctions/jsonPathExtractor';
import {
    isExtractorFunction, isKeyOfT,
    isPath,
    DeepPartial,
    ExtractorFunction,
    ExtractorMap,
    TypeExtractor
} from './ExtractorMap.types';

/* Helper Functions */
function _convertTypeExtractorToExtractorFunction<T, S extends Record<string, any> = any, I = T>(typeExtractor: TypeExtractor<I, S>, valuesInterpretedAsEmpty?: unknown[]): ExtractorFunction<I, S> {
    if (isPath(typeExtractor)) {
        return jpv<I, S>(typeExtractor);
    } else if (isExtractorFunction<I, S>(typeExtractor)) {
        return typeExtractor;
    } else {
        return _convertExtractorMapToExtractorFunction<T, S, I>(typeExtractor, valuesInterpretedAsEmpty);
    }
}

function _convertExtractorMapToExtractorFunction<T, S extends Record<string, any>, I = T>(extractionMap: ExtractorMap<I, S>, valuesInterpretedAsEmpty?: unknown[]): ExtractorFunction<I, S> {
    return (input: S): I => {
        const resultObject: Partial<I> = {};
        const extractionKeys: Array<keyof I & keyof T> = Object.keys(extractionMap) as Array<keyof I & keyof T>;

        extractionKeys.forEach((extractionKey: keyof I & keyof T): void => {
            const extractor: ExtractorFunction<I[typeof extractionKey], S> = _convertTypeExtractorToExtractorFunction<I[typeof extractionKey], S>(extractionMap[extractionKey], valuesInterpretedAsEmpty);

            const value: I[typeof extractionKey] = extractor(input);

            if (typeof valuesInterpretedAsEmpty === 'undefined') {
                resultObject[extractionKey] = value
            } else {
                const containedInExcludes: boolean = valuesInterpretedAsEmpty.reduce((a: boolean, b: any) => (!!a || b === value), false);

                if (!containedInExcludes) {
                    resultObject[extractionKey] = value;
                }
            }
        });

        return resultObject as I;
    };
}

function _proxyFactory<T, S extends Record<string, any> = any>(eMap: ExtractorMap<T, S>): ExtractorFunction<T, S> {
    return (input: S): T => {
        return new Proxy({}, {
            get(_: any, name: PropertyKey): any {
                if (isKeyOfT(eMap, name)) {
                    return extract<T[typeof name], S>(eMap[name], input);
                } else {
                    throw new ReferenceError(`Property "${name.toString()}" does not exist.`);
                }
            }
        }) as unknown as T;
    };
}

function _extractorFactory<T, S extends Record<string, any> = any>(extractorFunction: ExtractorFunction<T, S>, input: S): T;
function _extractorFactory<T, S extends Record<string, any> = any>(extractorFunction: ExtractorFunction<T, S>): ExtractorFunction<T, S>;
function _extractorFactory<T, S extends Record<string, any> = any>(extractorFunction: ExtractorFunction<T, S>, input?: S): T | ExtractorFunction<T, S> {
    return typeof input === 'undefined' ? extractorFunction : extractorFunction(input);
}

/** Exported module functionality */
export function extractFilteringEmpties<T, S extends Record<string, any> = any>(map: ExtractorMap<DeepPartial<T>, S>, valuesInterpretedAsEmpty?: unknown[]): ExtractorFunction<DeepPartial<T>, S>;
export function extractFilteringEmpties<T, S extends Record<string, any> = any>(map: ExtractorMap<DeepPartial<T>, S>, valuesInterpretedAsEmpty?: unknown[] | S, input?: S): DeepPartial<T>;
export function extractFilteringEmpties<T, S extends Record<string, any> = any>(map: ExtractorMap<DeepPartial<T>, S>, first?: unknown[] | S, second?: S): DeepPartial<T> | ExtractorFunction<DeepPartial<T>, S> {
    const valuesInterpretedAsEmpty: unknown[] = Array.isArray(first) ? first : [];
    const input: S = Array.isArray(first) ? second : first;

    return _extractorFactory(_convertExtractorMapToExtractorFunction<T, S, DeepPartial<T>>(map, valuesInterpretedAsEmpty), input);
}

export function extract<T, S extends Record<string, any> = any>(typeExtractor: TypeExtractor<T, S>, input: S): T;
export function extract<T, S extends Record<string, any> = any>(typeExtractor: TypeExtractor<T, S>): ExtractorFunction<T, S>;
export function extract<T, S extends Record<string, any>>(typeExtractor: TypeExtractor<T, S>, input?: S): T | ExtractorFunction<T, S> {
    return _extractorFactory(_convertTypeExtractorToExtractorFunction<T, S, T>(typeExtractor), input);
}

export function createExtractingProxy<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>, input: S): T;
export function createExtractingProxy<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>): ExtractorFunction<T, S>;
export function createExtractingProxy<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>, input?: S): T | ExtractorFunction<T, S> {
    return _extractorFactory(_proxyFactory(map), input);
}