import {JSONPath} from 'jsonpath-plus';
import {identity} from '../converterFunctions/baseConverter';
import {ConverterFunction} from '../converterFunctions/definitions';
import {ExtractorFunction} from '../ExtractorMap';

export function jpa<T>(jsonPath: string, convert: ConverterFunction<T> = identity): ExtractorFunction<T>{
    return (inputObject: object): T => {
        return convert(JSONPath({json: inputObject, path: jsonPath}));
    };
}

export function jpq<T>(jsonPath: string, convert: ConverterFunction<T> = identity): ExtractorFunction<T> {
    return (inputObject: object): T => {
        return JSONPath({json: inputObject, path: jsonPath}).map(convert);
    };
}

export function jpv<T>(jsonPath: string, convert: ConverterFunction<T> = identity): ExtractorFunction<T> {
    return (inputObject: object): T => {
        return convert(JSONPath({json: inputObject, path: jsonPath})[0]);
    };
}
