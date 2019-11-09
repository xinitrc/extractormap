import {identity, jpv} from './helper';

export function body<T>(convert?: ((object: any) => T)): (input: object) => T;
export function body<T>(jsonPath?: string, convert?: ((object: any) => T)): (input: object) => T;
export function body<T>(first: string | ((object: any) => T) = identity, second: ((object: any) => T) = identity): (input: object) => T {
    if (typeof first === 'string') {
        return bodyS(first, second);
    } else {
        return bodyP(first);
    }
}

function bodyS<T>(jsonPath: string, convert: ((object: any) => T) = identity): (input: object) => T {
    return jpv('body.' + jsonPath, convert);
}

function bodyP<T>(convert: ((object: any) => T) = identity): (input: object) => T {
    return jpv('body', convert);
}

export function pathParameter<T>(input: string, convert: ((object: any) => T) = identity): (input: object) => T {
    return jpv('pathParameters.' + input, convert);
}

export function queryParameter<T>(input: string, convert: ((object: any) => T) = identity): (input: object) => T {
    return jpv('queryParameters.' + input, convert);
}
