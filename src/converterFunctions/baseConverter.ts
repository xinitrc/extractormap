import {ConverterFunction} from './definitions';
import {ExtractorFunction} from '../ExtractorMap';

export function identity<T>(x: T): T {
    return x;
}

export function retypingIdentity<T>(x: any): T {
    return x as T;
}

export function defaultTo<T>(defaultValue: any, fn: ExtractorFunction<T> = retypingIdentity): ConverterFunction<T> {
    return (inputObject: any): T => {
        const inputValue = typeof inputObject === 'undefined' ? defaultValue : inputObject;

        return fn(inputValue);
    };
}
