import {JSONPath} from 'jsonpath-plus';
import {identity} from '../converterFunctions/baseConverter';
import {ConverterFunction} from '../converterFunctions/definitions';
import {ExtractorFunction, Path_Type} from '..';

export function jpa<T>(jsonPath: string, convert: ConverterFunction<T> = identity): ExtractorFunction<T, Record<string, any>> {
    return (inputObject: Record<string, any>): T => {
        return convert(JSONPath({json: inputObject, path: jsonPath}));
    };
}

export function jpq<T>(jsonPath: string, convert: ConverterFunction<T> = identity): ExtractorFunction<T[], Record<string, any>> {
    return (inputObject: Record<string, any>): T[] => {
        return JSONPath({json: inputObject, path: jsonPath}).map(convert);
    };
}

export function jpv<T, S extends Record<string, any> = any, I = T>(jsonPath: Path_Type<I, S>, _convert?: ConverterFunction<T, I>): ExtractorFunction<T, S> {
    if (_convert === undefined) {
        return (inputObject: S): T => JSONPath({json: inputObject, path: jsonPath})[0] as T;
    } else {
        return (inputObject: S): T => {
            const intermediatResult: I = JSONPath({json: inputObject, path: jsonPath})[0] as I;

            return _convert(intermediatResult) as T;
        };
    }
}