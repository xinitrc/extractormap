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
function _convertTypeExtractorToExtractorFunction<T, S extends Record<string, any>>(typeExtractor: TypeExtractor<T, S>, valuesInterpretedAsEmpty?: unknown[]): ExtractorFunction<T, S> {
    if (isPath(typeExtractor)) {
        return jpv(typeExtractor);
    } else if (isExtractorFunction<T, S>(typeExtractor)) {
        return typeExtractor;
    } else {
        return _convertExtractorMapToExtractorFunction(typeExtractor, valuesInterpretedAsEmpty);
    }
}

function _convertExtractorMapToExtractorFunction<T, S extends Record<string, any>>(extractionMap: ExtractorMap<T, S>, valuesInterpretedAsEmpty?: unknown[]): ExtractorFunction<T, S> {
    return (input: S): T => {
        const resultObject: Partial<T> = {};
        const extractionKeys: Array<keyof T> = Object.keys(extractionMap) as Array<keyof T>;

        extractionKeys.forEach((extractionKey: keyof T): void => {
            const extractor: ExtractorFunction<T[typeof extractionKey], S> = _convertTypeExtractorToExtractorFunction<T[typeof extractionKey], S>(extractionMap[extractionKey], valuesInterpretedAsEmpty);

            const value: T[typeof extractionKey] = extractor(input);

            if (typeof valuesInterpretedAsEmpty === 'undefined') {
                resultObject[extractionKey] = value
            } else {
                const containedInExcludes: boolean = valuesInterpretedAsEmpty.reduce((a: boolean, b: any): boolean => (!!a || b === value), false);

                if (!containedInExcludes) {
                    resultObject[extractionKey] = value;
                }
            }
        });

        return resultObject as T;
    };
}

function _proxyFactory<T, S extends Record<string, any>>(eMap: ExtractorMap<T, S>): ExtractorFunction<T, S> {
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

    return _extractorFactory(_convertExtractorMapToExtractorFunction<DeepPartial<T>, S>(map, valuesInterpretedAsEmpty), input);
}

export function extract<T, S extends Record<string, any> = any>(typeExtractor: TypeExtractor<T, S>, input: S): T;
export function extract<T, S extends Record<string, any> = any>(typeExtractor: TypeExtractor<T, S>): ExtractorFunction<T, S>;
export function extract<T, S extends Record<string, any>>(typeExtractor: TypeExtractor<T, S>, input?: S): T | ExtractorFunction<T, S> {
    return _extractorFactory(_convertTypeExtractorToExtractorFunction<T, S>(typeExtractor), input);
}

export function createExtractingProxy<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>, input: S): T;
export function createExtractingProxy<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>): ExtractorFunction<T, S>;
export function createExtractingProxy<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>, input?: S): T | ExtractorFunction<T, S> {
    return _extractorFactory(_proxyFactory<T, S>(map), input);
}