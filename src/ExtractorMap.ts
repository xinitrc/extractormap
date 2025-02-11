import {jpv} from './extractorFunctions/jsonPathExtractor';

/* Types */
type __PathImplementation<T, Key extends keyof T> =
    Key extends string
        ? T[Key] extends Record<string, any>
            ? | `${Key}.${__PathImplementation<T[Key], Exclude<keyof T[Key], keyof any[]>> & string}`
            | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
            : never
        : never;

type _PathImplementation<T> = __PathImplementation<T, keyof T> | keyof T;

type _Path<T> = _PathImplementation<T> extends string | keyof T ? _PathImplementation<T> : keyof T;

type _PathValue<T, P extends _Path<T>> =
    P extends `${infer Key}.${infer Rest}`
        ? Key extends keyof T
            ? Rest extends _Path<T[Key]>
                ? _PathValue<T[Key], Rest>
                : never
            : never
        : P extends keyof T
            ? T[P]
            : never;

type _PathValueTuple<T> = { [PT in _Path<T>]: _PathValue<T, PT> };

type _Collect<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];

type _PathForType<IN, T> = _Collect<_PathValueTuple<IN>, T>;

export type Path_Type<T, S> = Record<string, any> extends S ? string : _PathForType<S, T> & string;

export type TypeExtractor<T, S extends Record<string, any>> =
    (T extends Record<string, any> ? ExtractorMap<T, S> : never)
    | ExtractorFunction<T, S>
    | Path_Type<T, S>

export type ExtractorFunction<T, S extends Record<string, any> = any> = (input: S) => T;

export type ExtractorMap<T, S extends Record<string, any> = any> = {
    [K in keyof T]: TypeExtractor<T[K], S>;
};

export type DeepPartial<T> = T extends Record<string, any> ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

/* Type Guards */
function _isExtractorFunction<T, S extends Record<string, any>>(e: any): e is ExtractorFunction<T, S> {
    return typeof e === 'function';
}

function _isPath(e: any): e is string {
    return typeof e === 'string';
}

function _isKeyOfT<T, S extends Record<string, any>>(eMap: ExtractorMap<T, S>, keyUnderTest: string | number | symbol): keyUnderTest is keyof T {
    return typeof eMap[keyUnderTest] !== 'undefined';
}

/* Helper Functions */
function _convertExtractorMapToExtractorFunctionFilteringEmpties<T, S extends Record<string, any>>(extractionMap: ExtractorMap<T, S>, valuesInterpretedAsEmpty: unknown[]): ExtractorFunction<DeepPartial<T>, S> {
    return (input: S): DeepPartial<T> => {
        const resultObject: DeepPartial<T> = {} as DeepPartial<T>;
        const extractionKeys: Array<keyof T> = Object.keys(extractionMap) as Array<keyof T>;

        extractionKeys.forEach((extractionKey: keyof T): void => {
            const extractor: ExtractorFunction<DeepPartial<T[typeof extractionKey]>, S> = _convertTypeExtractorToExtractorFunctionFilteringEmpties<T[typeof extractionKey], S>(extractionMap[extractionKey], valuesInterpretedAsEmpty);

            const value: DeepPartial<T[typeof extractionKey]> = extractor(input);

            // To some advanced equivalency magic in javascript this is not equivalent to
            // (valuesInterpretedAsEmpty.indexOf(value) < 0)
            // Trust me you don't want me to explain
            const containedInExcludes = valuesInterpretedAsEmpty.reduce((a: boolean, b: any) => (!!a || b === value), false);

            if (!containedInExcludes) {
                resultObject[extractionKey] = value as any; // screw this
            }
        });

        return resultObject;
    };
}

function _convertTypeExtractorToExtractorFunctionFilteringEmpties<T, S extends Record<string, any> = any>(typeExtractor: TypeExtractor<T, S>, valuesInterpretedAsEmpty: unknown[]): ExtractorFunction<DeepPartial<T>, S> {
    if (_isPath(typeExtractor)) {
        return jpv(typeExtractor);
    } else if (_isExtractorFunction<T, S>(typeExtractor)) {
        return typeExtractor as ExtractorFunction<DeepPartial<T>, S>;
    } else {
        return _convertExtractorMapToExtractorFunctionFilteringEmpties<T, S>(typeExtractor, valuesInterpretedAsEmpty);
    }
}

function _convertExtractorMapToExtractorFunction<T, S extends Record<string, any>>(extractionMap: ExtractorMap<T, S>): ExtractorFunction<T, S> {
    return (input: S): T => {
        const resultObject: Partial<T> = {};
        const extractionKeys: Array<keyof T> = Object.keys(extractionMap) as Array<keyof T>;

        extractionKeys.forEach((extractionKey: keyof T): void => {
            const extractor: ExtractorFunction<T[typeof extractionKey], S> = extract<T[typeof extractionKey], S>(extractionMap[extractionKey]);

            resultObject[extractionKey] = extractor(input);
        });

        return resultObject as T;
    };
}

function _convertTypeExtractorToExtractorFunction<T, S extends Record<string, any> = any>(typeExtractor: TypeExtractor<T, S>): ExtractorFunction<T, S> {
    if (_isPath(typeExtractor)) {
        return jpv<T, S>(typeExtractor);
    } else if (_isExtractorFunction<T, S>(typeExtractor)) {
        return typeExtractor;
    } else {
        return _convertExtractorMapToExtractorFunction<T, S>(typeExtractor);
    }
}

function _proxyFactory<T, S extends Record<string, any> = any>(eMap: ExtractorMap<T, S>): ExtractorFunction<T, S> {
    return (input: S) => {
        return new Proxy({}, {
            get(_: any, name: PropertyKey): any {
                if (_isKeyOfT(eMap, name)) {
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
export function extractFilteringEmpties<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>, valuesInterpretedAsEmpty?: unknown[]): ExtractorFunction<DeepPartial<T>, S>;
export function extractFilteringEmpties<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>, valuesInterpretedAsEmpty?: unknown[] | S, input?: S): DeepPartial<T>;
export function extractFilteringEmpties<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>, first?: unknown[] | S, second?: S): DeepPartial<T> | ExtractorFunction<DeepPartial<T>, S> {
    const valuesInterpretedAsEmpty: unknown[] = Array.isArray(first) ? first : [];
    const input: S = Array.isArray(first) ? second : first;

    const extractorFunction: ExtractorFunction<DeepPartial<T>, S> = _convertExtractorMapToExtractorFunctionFilteringEmpties(map, valuesInterpretedAsEmpty);

    return _extractorFactory(extractorFunction, input);
}

export function extract<T, S extends Record<string, any> = any>(typeExtractor: TypeExtractor<T, S>, input: S): T;
export function extract<T, S extends Record<string, any> = any>(typeExtractor: TypeExtractor<T, S>): ExtractorFunction<T, S>;
export function extract<T, S extends Record<string, any>>(typeExtractor: TypeExtractor<T, S>, input?: S): T | ExtractorFunction<T, S> {
    return _extractorFactory(_convertTypeExtractorToExtractorFunction<T, S>(typeExtractor), input);
}

export function createExtractingProxy<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>, input: S): T;
export function createExtractingProxy<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>): ExtractorFunction<T, S>;
export function createExtractingProxy<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>, input?: S): T | ExtractorFunction<T, S> {
    return _extractorFactory(_proxyFactory(map), input);
}
