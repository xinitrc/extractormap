import {JSONPath} from 'jsonpath-plus';
import {ExtractorFunction, Path_Type, ConverterFunction, identity} from '..';

export function jpa<T>(jsonPath: string, convert: ConverterFunction<T> = identity): ExtractorFunction<T, Record<string, any>> {
    return (inputObject: Record<string, any>): T => {
        return convert(JSONPath({json: inputObject, path: jsonPath}));
    };
}

export function jpq<T>(jsonPath: string, convert: ConverterFunction<T> = identity): ExtractorFunction<Array<T>, Record<string, any>> {
    return (inputObject: Record<string, any>): Array<T> => {
        const vals: Array<any> = JSONPath({json: inputObject, path: jsonPath});
        return vals.map(convert);
    };
}

export function jpv<T, S extends Record<string, any> = any, I = T>(jsonPath: Path_Type<I, S>, _convert?: ConverterFunction<T, I>): ExtractorFunction<T, S> {
    if (typeof _convert === 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return (inputObject: S): T => JSONPath({json: inputObject, path: jsonPath})[0] as T;
    } else {
        return (inputObject: S): T => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const intermediateResult: I = JSONPath({json: inputObject, path: jsonPath})[0] as I;

            return _convert(intermediateResult);
        };
    }
}
