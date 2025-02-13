import {extract, jpv} from '../../src';

it('should return 1 for { foo: 1 }, jpv("foo")', () => {
    expect(extract<number>(jpv('foo'), {foo: 1})).toEqual(1);
});
it('should return "1" for { foo: "1" }, jpv("foo")', () => {
    expect(extract<string>(jpv('foo'), {foo: '1'})).toEqual('1');
});
it('should return 1 for { foo: 1 }, "foo"', () => {
    expect(extract<number>('foo', {foo: 1})).toEqual(1);
});
it('should return "1" for { foo: "1" }, "foo"', () => {
    expect(extract<string>('foo', {foo: '1'})).toEqual('1');
});
it('should return "1" for { foo: 1 }, jpv("foo", n2s)', () => {
    const n2s = (input: number): string => String(input);

    expect(extract<string>(jpv('foo', n2s), {foo: '1'})).toEqual('1');
});
it('should return "1" for { foo: 1 }, jpv("foo", n2s)', () => {
    const n2s = (input: number): string => String(input);

    expect(extract<string>(jpv('foo', n2s), {foo: '1'})).toEqual('1');
});
