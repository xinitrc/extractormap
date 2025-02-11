import {ConverterFunction} from '..';

function _answerWithDefault<T>(inputValue: unknown, forVals: unknown[]): inputValue is T {
    return forVals.filter((forVal: unknown) => inputValue === forVal).length > 0;
}

export function identity<T, I>(x: I): T {
    return x as unknown as T;
}

export function defaultTo<T>(defaultValue: T, forVals: unknown[] = [undefined]): ConverterFunction<T, unknown> {
    return (inputValue: unknown): T => {
        const answerWithDefault = _answerWithDefault(inputValue, forVals);

        return answerWithDefault ? defaultValue : inputValue;
    };
}
