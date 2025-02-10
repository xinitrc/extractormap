import {jpv} from './extractorFunctions/jsonPathExtractor';

type _PathImplementation<T, Key extends keyof T> =
    Key extends string
        ? T[Key] extends Record<string, any>
            ? | `${Key}.${_PathImplementation<T[Key], Exclude<keyof T[Key], keyof any[]>> & string}`
            | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
            : never
        : never;

type _PathImplementation_2<T> = _PathImplementation<T, keyof T> | keyof T;

type _Path<T> = _PathImplementation_2<T> extends string | keyof T ? _PathImplementation_2<T> : keyof T;

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

type _TypeExtractor<T, S extends Record<string, any>> = (T extends Record<string, any> ? ExtractorMap<T, S> : never) | ExtractorFunction<T, S> | Path_Type<T, S>

export type ExtractorFunction<T, S extends Record<string, any> = any> = (input: S) => T;

export type ExtractorMap<T, S extends Record<string, any> = any> = {
  [K in keyof T]: _TypeExtractor<T[K], S>;
};

export type DeepPartial<T> = T extends Record<string, any> ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

export function extract<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>, input: S): T;
export function extract<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>): ExtractorFunction<T, S>;
export function extract<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>, input?: S): T | ExtractorFunction<T, S> {
  const calcFunction: ExtractorFunction<T, S> = extractorFunctionFromExtractorMap(map);

  if (typeof input === 'undefined') {
    return calcFunction;
  } else {
    return calcFunction(input)
  }
}

export function extractFilteringEmpties<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>, valuesInterpretedAsEmpty?: any[]): ExtractorFunction<DeepPartial<T>, S>;
export function extractFilteringEmpties<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>, valuesInterpretedAsEmpty?: any[] | S, input?: S): DeepPartial<T>;
export function extractFilteringEmpties<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>, first?: any[] | S, second?: S): DeepPartial<T> | ExtractorFunction<DeepPartial<T>, S> {
  const valuesInterpretedAsEmpty = Array.isArray(first) ? first : [];
  const input: S = Array.isArray(first) ? second : first;

  const extractFunction: ExtractorFunction<DeepPartial<T>, S> = (inputObject: S): DeepPartial<T> => extractFromObjectFilteringEmpties(inputObject, valuesInterpretedAsEmpty, map);

  if (typeof input === 'undefined') {
    return extractFunction;
  } else {
    return extractFunction(input);
  }
}

function isExtractorFunction<T, S extends Record<string, any>>(e: any): e is ExtractorFunction<T, S> {
  return typeof e === 'function';
}

function isPath(e: any): e is string {
  return typeof e === 'string';
}

function extractorFunctionFromExtractorMap<T, S extends Record<string, any>>(extractionMap: ExtractorMap<T, S>): ExtractorFunction<T, S> {
  return (input: S): T => {
    const resultObject: Partial<T> = {};
    const extractionKeys: Array<keyof T> = Object.keys(extractionMap) as Array<keyof T>;

    extractionKeys.forEach((extractionKey: keyof T): void => {
      resultObject[extractionKey] = _extractForKey(extractionMap, extractionKey, input) as any; // typescript compiler is unable to determine type
    });

    return resultObject as T;
  }
}

function extractFromObjectFilteringEmpties<T, S extends Record<string, any>>(inputObject: S, valuesInterpretedAsEmpty: unknown[], extractionMap: ExtractorMap<T, S>): DeepPartial<T> {
  const resultObject: DeepPartial<T> = {} as DeepPartial<T>;
  const extractionKeys: Array<keyof T> = Object.keys(extractionMap) as Array<keyof T>;

  extractionKeys.forEach((extractionKey: keyof T): void => {
    const value = _extractForKeyPartial(valuesInterpretedAsEmpty, extractionMap, extractionKey, inputObject);

    // To some advanced equivalency magic in javascript this is not equivalent to
    // (valuesInterpretedAsEmpty.indexOf(value) < 0)
    // Trust me you don't want me to explain
    const containedInExcludes = valuesInterpretedAsEmpty.reduce((a: boolean, b: any) => (!!a || b === value), false);

    if (!containedInExcludes) {
      resultObject[extractionKey] = value as any; // screw this
    }
  });

  return resultObject;
}

export function createExtractingProxy<T, S extends Record<string, any> = any>(eMap: ExtractorMap<T, S>, input: S): T;
export function createExtractingProxy<T, S extends Record<string, any> = any>(eMap: ExtractorMap<T, S>): ExtractorFunction<T, S>;
export function createExtractingProxy<T, S extends Record<string, any> = any>(eMap: ExtractorMap<T, S>, input?: S): T | ExtractorFunction<T, S> {
  if (typeof input === 'undefined') {
    return (inputObject: S): T => createExtractingProxy(eMap, inputObject);
  } else {
    return new Proxy({}, {
      get(_: any, name: PropertyKey): any {
        if (_isKeyOfT(eMap, name)) {
          return _extractForKey(eMap, name, input);
        } else {
          throw new ReferenceError(`Property "${name.toString()}" does not exist.`);
        }
      }
    }) as unknown as T;
  }
}

function _extractForKey<T, S extends Record<string, any>>(extractionMap: ExtractorMap<T, S>, extractionKey: keyof T, inputObject: S): T[typeof extractionKey] {
  const extractorCandidate: _TypeExtractor<T[typeof extractionKey], S> = extractionMap[extractionKey];

  const generateExtractor: (input: _TypeExtractor<T[keyof T], S>) => ExtractorFunction<T[typeof extractionKey], S> =
      (input: _TypeExtractor<T[typeof extractionKey], S>): ExtractorFunction<T[typeof extractionKey], S> => {
        if (isPath(input)) {
          return jpv(input);
        } else if (isExtractorFunction(input)) {
          return input as ExtractorFunction<T[typeof extractionKey], S>;
        } else {
          return extractorFunctionFromExtractorMap(input as ExtractorMap<T[typeof extractionKey], S>);
        }
      }

  const extractor: ExtractorFunction<T[typeof extractionKey], S> = generateExtractor(extractorCandidate)

  return extractor(inputObject);
}

function _extractForKeyPartial<T, S extends Record<string, any>>(valuesInterpretedAsEmpty: unknown[], extractionMap: ExtractorMap<T, S>, extractionKey: keyof T, inputObject: S): DeepPartial<T[keyof T]> {
  const extractorCandidate: _TypeExtractor<T[typeof extractionKey], S> = extractionMap[extractionKey];

  const generateExtractor: (input: _TypeExtractor<T[typeof extractionKey], S>) => ExtractorFunction<DeepPartial<T[typeof extractionKey]>, S> =
      (input: _TypeExtractor<T[typeof extractionKey], S>): ExtractorFunction<DeepPartial<T[typeof extractionKey]>, S> => {
        if (isPath(input)) {
          return jpv(input) as ExtractorFunction<DeepPartial<T[typeof extractionKey]>, S>;
        } else if (isExtractorFunction(input)) {
          return input as ExtractorFunction<DeepPartial<T[typeof extractionKey]>, S>;
        } else {
          return extractFilteringEmpties(input as ExtractorMap<T[typeof extractionKey], S>, valuesInterpretedAsEmpty);
        }
      }

  const extractor: ExtractorFunction<DeepPartial<T[typeof extractionKey]>, S> = generateExtractor(extractorCandidate)

  return extractor(inputObject);
}

function _isKeyOfT<T>(eMap: ExtractorMap<T>, keyUnderTest: string | number | symbol): keyUnderTest is keyof T {
  return typeof eMap[keyUnderTest] !== 'undefined';
}
