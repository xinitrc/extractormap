import {extract, pickMapGenerator} from '../../src';

interface Person {
    firstName: string;
    lastName: string;
    age: number;
}

describe('pickMapGenerator', () => {
    it('should generate an empty map for an empty Array', () => {
        const pickMap = pickMapGenerator<Person>([]);

        expect(pickMap).toEqual({});
    });
    it('should generate a full extractorMap for a complete array', () => {
        const pickMap = pickMapGenerator<Person>(['firstName', 'lastName', 'age']);

        expect(pickMap.firstName).toBeTruthy();
        expect(pickMap.lastName).toBeTruthy();
        expect(pickMap.age).toBeTruthy();
    });

    it('should generate an extractorMap with only one function for an array with only one key', () => {
        const pickMap = pickMapGenerator<Person>(['firstName']);

        expect(pickMap.firstName).toBeTruthy();
        expect(pickMap.lastName).toBeUndefined();
        expect(pickMap.age).toBeUndefined();
    });

    it('should generate an extractorMap with only one function for an array with only one (different) key', () => {
        const pickMap = pickMapGenerator<Person>(['age']);

        expect(pickMap.firstName).toBeUndefined();
        expect(pickMap.lastName).toBeUndefined();
        expect(pickMap.age).toBeTruthy();
    });

    it('should extract a partial Person', () => {
        const person = {
            firstName: 'Martin',
            lastName: 'Hilscher',
            age: 38
        };

        const pickMap = pickMapGenerator<Person>(['age']);

        const result = extract(pickMap)(person);

        expect(result).toEqual({age: 38});
    });

    it('should not extract anything from an empty object', () => {
        const pickMap = pickMapGenerator<Person>(['age']);

        const result = extract(pickMap)({});

        expect(result).toEqual({});
    });
});
