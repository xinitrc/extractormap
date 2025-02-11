import {ExtractorFunction} from '..';

export function constant<T>(constantValue: T): ExtractorFunction<T> {
    return (_: unknown): T => constantValue;
}
