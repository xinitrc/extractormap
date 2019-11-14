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
    it('should answer with 1 for undefined and inc-Function', () => {
        const defaultValueFN = defaultTo(0, x => x + 1);
        expect(defaultValueFN(undefined)).toEqual(1);
    });
    it('should answer with 2 for 1 and inc-Function', () => {
        const defaultValueFN = defaultTo(0, x => x + 1);
        expect(defaultValueFN(1)).toEqual(2);
    });
});
