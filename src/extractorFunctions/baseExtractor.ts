import {ExtractorFunction} from '../ExtractorMap';

export function constant<T>(constantValue: T): ExtractorFunction<T> {
    return (_: any): T => constantValue;
}
