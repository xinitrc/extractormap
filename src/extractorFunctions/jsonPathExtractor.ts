import {JSONPath} from 'jsonpath-plus';
import {ExtractorFunction, Path_Type, ConverterFunction, identity, fmap, compose} from '..';

const first: (input: any[]) => any = (input: any[]): any => input[0];

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
const asT: <T>(input: any) => T = <T>(input: any): T => input as T;

function jsonPathExtraction(jsonPath: string): ExtractorFunction<any[], Record<string, any>> {
    return (input: Record<string, any>): any => JSONPath({json: input, path: jsonPath});
}

function jsonPathExtractionFirst<T, S extends Record<string, any>>(jsonPath: string): ExtractorFunction<T, S> {
    return compose(asT<T>, first, jsonPathExtraction(jsonPath));
}

export function jpa<T>(jsonPath: string, convert: ConverterFunction<T, any[]> = identity): ExtractorFunction<T, Record<string, any>> {
    return compose(convert, jsonPathExtraction(jsonPath))
}

export function jpq<T>(jsonPath: string, convert: ConverterFunction<T> = identity): ExtractorFunction<Array<T>, Record<string, any>> {
    return compose(fmap(convert), jsonPathExtraction(jsonPath));
}

export function jpv<T, S extends Record<string, any> = any>(jsonPath: Path_Type<T, S>): ExtractorFunction<T, S>
export function jpv<T, I, S extends Record<string, any> = any>(jsonPath: Path_Type<I, S>, _convert: ConverterFunction<T, I>): ExtractorFunction<T, S>
export function jpv<T, I, S extends Record<string, any> = any>(jsonPath: string, _convert?: ConverterFunction<T, I>): unknown {
    return typeof _convert === 'undefined' ? jsonPathExtractionFirst(jsonPath) : compose(_convert, jsonPathExtractionFirst<I, S>(jsonPath));
}
