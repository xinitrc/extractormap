import {jpv} from './extractorFunctions/jsonPathExtractor';

export type ExtractorFunction<T> = (input: object) => T;

export type ExtractorMap<T> = {
  [K in keyof T]: ExtractorFunction<T[K]> | ExtractorMap<T[K]> | string;
};

export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

export function extract<T>(map: ExtractorMap<T>, input: object): T;
export function extract<T>(map: ExtractorMap<T>): ExtractorFunction<T>;
export function extract<T>(map: ExtractorMap<T>, input?: object): T | ExtractorFunction<T> {
  if (typeof input === 'undefined') {
    return (inputObject: object): T => extractFromObject(inputObject, map);
  } else {
    return extractFromObject(input, map);
  }
}

export function extractFilteringEmpties<T>(map: ExtractorMap<T>, valuesInterpretedasEmpty?: any[]): ExtractorFunction<DeepPartial<T>>;
export function extractFilteringEmpties<T>(map: ExtractorMap<T>, valuesInterpretedasEmpty?: any[] | object, input?: object): DeepPartial<T>;
export function extractFilteringEmpties<T>(map: ExtractorMap<T>, first?: any[] | object, second?: object): DeepPartial<T> | ExtractorFunction<DeepPartial<T>> {
  const valuesInterpretedasEmpty = Array.isArray(first) ? first : [];
  const input = Array.isArray(first) ? second : first;

  if (typeof input === 'undefined') {
    return (inputObject: object): DeepPartial<T> => extractFromObjectFilteringEmpties(inputObject, valuesInterpretedasEmpty, map);
  } else {
    return extractFromObjectFilteringEmpties(input, valuesInterpretedasEmpty, map);
  }
}

function isExtractorFunction<T>(e: ExtractorFunction<T> | ExtractorMap<T>): e is ExtractorFunction<T> {
  return typeof e === 'function';
}

function isString<T>(e: ExtractorFunction<T> | ExtractorMap<T> | string): e is string {
  return typeof e === 'string';
}

function extractFromObject<T>(inputObject: object, extractionMap: ExtractorMap<T>): T {
  const resultObject: Partial<T> = {};
  const extractionKeys: Array<keyof T> = Object.keys(extractionMap) as Array<keyof T>;

  extractionKeys.forEach((extractionKey: keyof T): void => {
    resultObject[extractionKey] = _extractForKey(extractionMap, extractionKey, inputObject) as any; // screw this
  });

  return resultObject as T;
}

function extractFromObjectFilteringEmpties<T>(inputObject: object, valuesInterpretedasEmpty: any[], extractionMap: ExtractorMap<T>): DeepPartial<T> {
  const resultObject: DeepPartial<T> = {} as DeepPartial<T>;
  const extractionKeys: Array<keyof T> = Object.keys(extractionMap) as Array<keyof T>;

  extractionKeys.forEach((extractionKey: keyof T): void => {
    const value = _extractForKey(extractionMap, extractionKey, inputObject, (map: ExtractorMap<T[keyof T]>, input?: object): DeepPartial<T[keyof T]> => extractFilteringEmpties(map, valuesInterpretedasEmpty, input));

    // To to some advanced equivalency magic in javascript this is not equivalent to
    // (valuesInterpretedasEmpty.indexOf(value) < 0)
    // Trust me you don't want me to explain
    const containedInExcludes = valuesInterpretedasEmpty.reduce((a: boolean, b: any) => (!!a || b === value), false);

    if (!containedInExcludes) {
      resultObject[extractionKey] = value as any; // screw this
    }
  });

  return resultObject;
}

export function createExtractingProxy<T>(eMap: ExtractorMap<T>, input: object): T;
export function createExtractingProxy<T>(eMap: ExtractorMap<T>): ExtractorFunction<T>;
export function createExtractingProxy<T>(eMap: ExtractorMap<T>, input?: object): T | ExtractorFunction<T> {
  if (typeof input === 'undefined') {
    return (inputObject: object): T => createExtractingProxy(eMap, inputObject);
  } else {
    return new Proxy({}, {
      get(_: any, name: PropertyKey): any {
        if (_isKeyOfT(eMap, name)) {
          return _extractForKey<T>(eMap, name, input);
        } else {
          throw new ReferenceError(`Property "${name.toString()}" does not exist.`);
        }
      }
    }) as unknown as T;
  }
}

function _extractForKey<T>(extractionMap: ExtractorMap<T>, extractionKey: keyof T, inputObject: object, extractionFn: <PartialOrT>(map: ExtractorMap<T[keyof T]>, input?: object) => DeepPartial<T[keyof T]> | T[keyof T] = extract) {
  const extractorCandidate: ExtractorMap<T[keyof T]> | ExtractorFunction<T[keyof T]> | string = extractionMap[extractionKey];
  const extractor: ExtractorMap<T[keyof T]> | ExtractorFunction<T[keyof T]> = isString(extractorCandidate)
    ? jpv(extractorCandidate)
    : extractorCandidate;

  if (isExtractorFunction(extractor)) {
    return extractor(inputObject);
  } else {
    return extractionFn(extractor, inputObject);
  }
}

function _isKeyOfT<T>(eMap: ExtractorMap<T>, keyUnderTest: string | number | symbol): keyUnderTest is keyof T {
  return typeof eMap[keyUnderTest] !== 'undefined';
}
