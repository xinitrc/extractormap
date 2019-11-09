import * as jsonpath from 'jsonpath';

export function identity<T>(x: any): T {
    return x as unknown as T;
}

export function jpa<T>(jsonPath: string, convert: ((object: any) => T) = identity): (input: object) => T {
    return (input: object) => {
        return convert(jsonpath.query(input, jsonPath));
    }
}

export function jpq<T>(jsonPath: string, convert: ((object: any) => T) = identity): (input: object) => T[] {
    return (input: object) => {
        return jsonpath.query(input, jsonPath).map(convert);
    }
}

export function jpv<T>(jsonPath: string, convert?: ((object: any) => T)): (input: object) => T {
    return (input: object): T => {
        if (convert) {
            return convert(jsonpath.value(input, jsonPath));
        } else {
            return jsonpath.value(input, jsonPath)
        }
    }
}

export function constant<T>(constantValue: T): (input: any) => T {
    return (input: any) => constantValue;
}
