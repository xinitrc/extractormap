import {jpv} from './extractorFunctions/jsonPathExtractor';
import {identity} from './converterFunctions/baseConverter';
import {ExtractorFunction} from './ExtractorMap';
import {ConverterFunction} from './converterFunctions/definitions';

export function body<T>(convert?: ((object: any) => T)): ExtractorFunction<T>;
export function body<T>(jsonPath?: string, convert?: ConverterFunction<T>): ExtractorFunction<T>;
export function body<T>(first: string | ConverterFunction<T> = identity, second: ConverterFunction<T> = identity): ExtractorFunction<T> {
    if (typeof first === 'string') {
        return bodyS(first, second);
    } else {
        return bodyP(first);
    }
}

function bodyS<T>(jsonPath: string, convert: ConverterFunction<T> = identity): ExtractorFunction<T> {
    return jpv('body.' + jsonPath, convert);
}

function bodyP<T>(convert: ConverterFunction<T> = identity): ExtractorFunction<T> {
    return jpv('body', convert);
}

export function pathParameter<T>(input: string, convert: ConverterFunction<T> = identity): ExtractorFunction<T> {
    return jpv('pathParameters.' + input, convert);
}

export function queryParameter<T>(input: string, convert: ConverterFunction<T> = identity): ExtractorFunction<T> {
    return jpv('queryParameters.' + input, convert);
}
