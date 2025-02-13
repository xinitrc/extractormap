import {ConverterFunction} from '..';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
function _answerWithDefault<T>(inputValue: unknown, forVals: Array<unknown>): inputValue is T {
    return forVals.filter((forVal: unknown): boolean => inputValue === forVal).length > 0;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function identity<T, I>(x: I): T {
    return x as unknown as T;
}

export function defaultTo<T>(defaultValue: T, forVals: Array<unknown> = [undefined]): ConverterFunction<T, unknown> {
    return (inputValue: unknown): T => {
        const answerWithDefault = _answerWithDefault(inputValue, forVals);

        return answerWithDefault ? defaultValue : inputValue;
    };
}
