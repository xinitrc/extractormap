import {ExtractorFunction} from '..';

export function constant<T>(constantValue: T): ExtractorFunction<T> {
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (_: any): T => constantValue;
}
