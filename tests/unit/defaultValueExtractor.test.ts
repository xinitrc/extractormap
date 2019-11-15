import {defaultTo} from '../../src';

describe('defaultValueExtractor', () => {
    it('should answer with defaultvalue for undefined', () => {
        const defaultValueFN = defaultTo('1');
       expect(defaultValueFN(undefined)).toEqual('1');
    });
    it('should answer with 1 for 1', () => {
        const defaultValueFN = defaultTo(0);
        expect(defaultValueFN(1)).toEqual(1);
    });
    it('should answer with defaultValue for null and [undefined, null]', () => {
        const defaultValueFN = defaultTo(1, [ undefined, null ]);
        expect(defaultValueFN(null)).toEqual(1);
    });
    it('should answer with defaultValue for null and [undefined, false]', () => {
        const defaultValueFN = defaultTo(1, [undefined, false]);
        expect(defaultValueFN(false)).toEqual(1);
    });
});
