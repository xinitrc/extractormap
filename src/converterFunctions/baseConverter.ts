import {ConverterFunction} from '..';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
function _answerWithDefault<T, Unknonws extends ReadonlyArray<unknown>>(inputValue: unknown, forVals: Unknonws): inputValue is T {
    return forVals.filter((forVal: unknown): boolean => inputValue === forVal).length > 0;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function identity<T, I>(x: I): T {
    return x as unknown as T;
}

export function defaultTo<T>(defaultValue: T): ConverterFunction<T, T | undefined>
export function defaultTo<T, UKNS extends readonly unknown[]>(defaultValue: T, forVals: UKNS): ConverterFunction<T, T | UKNS[number]>
export function defaultTo<T, UKNS extends readonly unknown[]>(defaultValue: T, forVals?: UKNS): unknown {
    if (typeof forVals === 'undefined') {
        return (inputValue: T | undefined): T => {
            const answerWithDefault = _answerWithDefault(inputValue, [undefined]);

            return answerWithDefault ? defaultValue : inputValue;
        }
    } else {
        return (inputValue: T | UKNS[number]): T => {
            const answerWithDefault = _answerWithDefault(inputValue, forVals);

            return answerWithDefault ? defaultValue : inputValue;
        };
    }
}
