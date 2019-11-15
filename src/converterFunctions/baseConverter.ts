import {ConverterFunction} from './definitions';

function _answerWithDefault(inputValues: any, forVals: any[]): boolean {
    return forVals.filter((forVal: any) => inputValues === forVal).length > 0;
}

export function identity<T>(x: T): T {
    return x;
}

export function defaultTo<T>(defaultValue: T, forVals: any[] = [undefined]): ConverterFunction<T> {
    return (inputValue: any): T => {
        const answerWithDefault: boolean = _answerWithDefault(inputValue, forVals);

        return answerWithDefault ? defaultValue : inputValue;
    };
}
