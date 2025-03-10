import {ConverterFunction} from '..';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
function _answerWithInput<T, Unknonws extends readonly unknown[]>(inputValue: unknown, forVals: Unknonws): inputValue is T {
    return forVals.filter((forVal: unknown): boolean => inputValue === forVal).length <= 0;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function identity<T, I>(x: I): T {
    return x as unknown as T;
}

function _defaultTo<T, UKNS extends readonly unknown[]>(defaultValue: T, forVals: UKNS): ConverterFunction<T, T | UKNS[number]> {
    return (inputValue: T | UKNS[number]): T => _answerWithInput<T, UKNS>(inputValue, forVals) ? inputValue : defaultValue;
}

export function defaultTo<T>(defaultValue: T): ConverterFunction<T, T | undefined>
export function defaultTo<T, UKNS extends readonly unknown[]>(defaultValue: T, forVals: UKNS): ConverterFunction<T, T | UKNS[number]>
export function defaultTo<T, UKNS extends readonly unknown[]>(defaultValue: T, forVals?: UKNS): unknown {
    return _defaultTo(defaultValue, forVals ?? [undefined]);
}
