import * as jsonpath from 'jsonpath';

export function identity<T>(x: any): T {
    return x as unknown as T;
}

export function jpa<T>(jsonPath: string, convert: ((object: any) => T) = identity): (input: object) => T {
    return (input: object | string) => {
        let toProcess = input;

        if (typeof input === 'string') {
            toProcess = JSON.parse(input);
        }

        return convert(jsonpath.query(toProcess, jsonPath));
    }
}

export function jpq<T>(jsonPath: string, convert: ((object: any) => T) = identity): (input: object) => T[] {
    return (input: object | string) => {
        let toProcess = input;

        if (typeof input === 'string') {
            toProcess = JSON.parse(input);
        }

        return jsonpath.query(toProcess, jsonPath).map(convert);
    }
}

export function jpv<T>(jsonPath: string, convert: ((object: any) => T) = identity): (input: object) => T {
    return (input: object | string): T => {
        let toProcess = input;

        if (typeof input === 'string') {
            toProcess = JSON.parse(input);
        }

        return convert(jsonpath.value(toProcess, jsonPath));
    }
}

export function constant<T>(constantValue: T): (input: any) => T {
    return (input: any) => constantValue;
}
