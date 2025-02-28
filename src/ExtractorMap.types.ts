/* Types */
type __PathImplementation<T, Key extends keyof T> =
    Key extends string
        ? T[Key] extends Record<string, any>
            ? | `${Key}.${__PathImplementation<T[Key], Exclude<keyof T[Key], keyof Array<any>>> & string}`
            | `${Key}.${Exclude<keyof T[Key], keyof Array<any>> & string}`
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

type _PathForType<T, IN> = _Collect<_PathValueTuple<IN>, T>;

export type Path_Type<T, S> = Record<string, any> extends S ? string : _PathForType<T, S> & string;

export type TypeExtractor<T, S extends Record<string, any>> =
    (T extends Record<string, any> ? ExtractorMap<T, S> : never)
    | ExtractorFunction<T, S>
    | Path_Type<T, S>

export type ExtractorFunction<T, S extends Record<string, any> = any> = (input: S) => T;

export type ExtractorMap<T, S extends Record<string, any> = any> = {
    [K in keyof T]: TypeExtractor<T[K], S>;
};

export type ConverterFunction<T, I = any> = (input: I) => T;

export type DeepPartial<T> = T extends Record<string, any> ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

/* Type Guards */
export function isExtractorFunction<T, S extends Record<string, any>>(e: any): e is ExtractorFunction<T, S> {
    return typeof e === 'function';
}

export function isPath(e: any): e is string {
    return typeof e === 'string';
}

export function isKeyOfT<T, S extends Record<string, any>>(map: ExtractorMap<T, S>, keyUnderTest: string | number | symbol): keyUnderTest is keyof T {
    return Object.hasOwn(map, keyUnderTest);
}
