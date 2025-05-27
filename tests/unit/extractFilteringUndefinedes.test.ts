import {constant, jpa, jpq, jpv, extractFilteringEmpties} from '../../src';
import * as util from 'util';

function s2n(input: any): number {
    if (typeof input !== 'string') {
        throw new Error('Input is not a string');
    }

    return parseInt(input, 10);
}

function isNumber(input: any): input is number {
    return typeof input === 'number';
}

function reduceGenerator(fn: (a: number, b:number) => number, initialValue: number): (input: any[]) => number {
    return (input: any[]) => {
        if (!input.every(isNumber)) {
            throw Error('Input is not purely an array of numbers')
        }

        return input.reduce(fn, initialValue);
    }
}

describe('nested objects are filtered for empties', () => {
    test('simple nested object should be empty', () => {
        // JSON.stringify({foo: undefined}) (which is used by .toEqual) results to '{}'. So util.inspect has to be used to identify that bar undefined object properties for this test
        expect(util.inspect(extractFilteringEmpties<{ foo: { bar?: number, avail: string } }>({
            foo: {
                bar: jpv('foo'),
                avail: jpv('avail')
            }
        }, [null, undefined], {avail: 'v'})))
            .toEqual('{ foo: { avail: \'v\' } }');
    });
});

describe('fullExtractorMap', () => {
    it('should return { foo: 1 } for { foo: 1 }, { foo: jpv("foo") }', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('foo')}, [undefined], {foo: 1})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { bar: 1 }, { foo: jpv("bar") }', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('bar')}, [undefined], {bar: 1})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: 1 }, { foo: jpv("body") }', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('body')}, [undefined], {body: 1})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: "1" }, { foo: jpv("body", x => parseInt(x, 10) }', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpv('body', (x: string) => parseInt(x, 10))}, [undefined], {body: '1'})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: 1 }, {foo: jpv("body""foo")}', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpv('body.foo')}, [undefined], {body: {foo: 1}})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: 1 }, {foo: 1 }', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: constant(1)}, [undefined], {body: {foo: 5}})).toEqual({foo: 1});
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpv("body") }, { body: [1, 2, 3] }', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpv('body')}, [undefined], {body: [1, 2, 3]})).toEqual({foo: [1, 2, 3]});
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpq("$..key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}}', () => {
        expect(extractFilteringEmpties<{ foo: number[] }>({foo: jpq('$..key0')}, [undefined], {
            body: {
                key0: 1,
                key1: {key0: 2},
                key2: {key0: 3}
            }
        })).toEqual({foo: [1, 2, 3]});
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpv("body.key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}}', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('body.key0')}, [undefined], {
            body: {
                key0: 1,
                key1: {key0: 2},
                key2: {key0: 3}
            }
        })).toEqual({foo: 1});
    });
    it('should return { foo: 2 } for { foo: jpv("body"".[?(@.key0 > 1)].key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}}', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('body.[?(@.key0 > 1)].key0')}, [undefined], {
            body: {
                key0: 1,
                key1: {key0: 2},
                key2: {key0: 3}
            }
        })).toEqual({foo: 2});
    });
    it('should return { foo: 6 } for { foo: jpc("$..[?(@.key0 > 1)].key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}}', () => {
        expect(extractFilteringEmpties<{ foo: number[] }>({foo: jpq('$..[?(@.key0 > 1)].key0')}, [undefined], {
            body: {
                key0: 1,
                key1: {key0: 2},
                key2: {key0: 3}
            }
        })).toEqual({foo: [2, 3]});
    });
    it('should return { foo: 6 } for { foo: jpq("$..key0", x => parseInt(x, 10)) }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}}', () => {
        expect(extractFilteringEmpties<{ foo: number[] }>({foo: jpq('$..key0', s2n)}, [undefined], {
            body: {
                key0: '1',
                key1: {key0: '2'},
                key2: {key0: '3'}
            }
        })).toEqual({foo: [1, 2, 3]});
    });
    it('should return { foo: 6 } for { foo: jpa("$..key0", x => x.reduce((a, b) => a + b, 0)) }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}}', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpa('$..key0', reduceGenerator((a: number, b: number): number => a + b, 0))}, [undefined], {
            body: {
                key0: 1,
                key1: {key0: 2},
                key2: {key0: 3}
            }
        })).toEqual({foo: 6});
    });
    it('should return { foo: 6 } for { foo: jpa("$..key0", x => x.reduce((a, b) => a * b, 1)) }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}}', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpa('$..key0', reduceGenerator((a: number, b: number): number => a * b, 1))}, [undefined], {
            body: {
                key0: 1,
                key1: {key0: 2},
                key2: {key0: 3}
            }
        })).toEqual({foo: 6});
    });

    it('should return { foo: { bar: 5 } for { foo: { bar: jpv("body") }}, { body: 5 }', () => {
        expect(extractFilteringEmpties<{
            foo: { bar: number }
        }>({foo: {bar: jpv('body')}}, [undefined], {body: 5})).toEqual({foo: {bar: 5}});
    });
    it('should return { foo: { bar: 5 } for { foo: { bar: "body" }}, { body: 5 }', () => {
        expect(extractFilteringEmpties<{
            foo: { bar: number }
        }>({foo: {bar: 'body'}}, [undefined], {body: 5})).toEqual({foo: {bar: 5}});
    });
    it('should return { foo: { bar: 1 } for { foo: { bar: jpv("body") }}, { body: 1, pathParameters: "7" }', () => {
        expect(extractFilteringEmpties<{ foo: { bar: number } }>({foo: {bar: jpv('body')}}, [undefined], {
            body: 1,
            pathParameters: '7'
        })).toEqual({foo: {bar: 1}});
    });
    it('should return { } for { foo: { bar: jpv("body") }}, { key0: 1, pathParameters: "7" }', () => {
        expect(extractFilteringEmpties<{ foo: { bar: number } }>({foo: {bar: jpv('body')}}, [undefined], {
            key0: 1,
            pathParameters: '7'
        })).toEqual({foo: {bar: undefined}});
    });
    it('should return { } for { foo: { bar: "body" }}, { key0: 1, pathParameters: "7" }', () => {
        expect(extractFilteringEmpties<{ foo: { bar: number } }>({foo: {bar: 'body'}}, [undefined], {
            key0: 1,
            pathParameters: '7'
        })).toEqual({foo: {bar: undefined}});
    });

    it('should return { foo: 1 } for { foo: 1 }, { foo: jpv("foo") } in curried form', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('foo')}, [undefined])({foo: 1})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { bar: 1 }, { foo: jpv("bar") } in curried form', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('bar')}, [undefined])({bar: 1})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: 1 }, { foo: jpv("body") } in curried form', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('body')}, [undefined])({body: 1})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: "1" }, { foo: jpv("body", x => parseInt(x, 10) } in curried form', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpv('body', (x: string): number => parseInt(x, 10))}, [undefined])({body: '1'})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: 1 }, {foo: jpv("body""foo")} in curried form', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpv('body.foo')}, [undefined])({body: {foo: 1}})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: 1 }, {foo: 1 } in curried form', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: constant(1)}, [undefined])({body: {foo: 5}})).toEqual({foo: 1});
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpv("body") }, { body: [1, 2, 3] } in curried form', () => {
        expect(extractFilteringEmpties<{
            foo: number[]
        }>({foo: jpv('body')}, [undefined])({body: [1, 2, 3]})).toEqual({foo: [1, 2, 3]});
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpq("$..key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}} in curried form', () => {
        expect(extractFilteringEmpties<{ foo: number[] }>({foo: jpq('$..key0')}, [undefined])({
            body: {
                key0: 1,
                key1: {key0: 2},
                key2: {key0: 3}
            }
        })).toEqual({foo: [1, 2, 3]});
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpv("body"".key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}} in curried form', () => {
        expect(extractFilteringEmpties<{ foo: number[] }>({foo: jpv('body.key0')}, [undefined])({
            body: {
                key0: 1,
                key1: {key0: 2},
                key2: {key0: 3}
            }
        })).toEqual({foo: 1});
    });
    it('should return { foo: 2 } for { foo: jpv("body"".[?(@.key0 > 1)].key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}} in curried form', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('body.[?(@.key0 > 1)].key0')}, [undefined])({
            body: {
                key0: 1,
                key1: {key0: 2},
                key2: {key0: 3}
            }
        })).toEqual({foo: 2});
    });
    it('should return { foo: 6 } for { foo: jpc("$..[?(@.key0 > 1)].key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}} in curried form', () => {
        expect(extractFilteringEmpties<{ foo: number[] }>({foo: jpq('$..[?(@.key0 > 1)].key0')}, [undefined])({
            body: {
                key0: 1,
                key1: {key0: 2},
                key2: {key0: 3}
            }
        })).toEqual({foo: [2, 3]});
    });
    it('should return { foo: 6 } for { foo: jpq("$..key0", x => parseInt(x, 10)) }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}} in curried form', () => {
        expect(extractFilteringEmpties<{ foo: number[] }>({foo: jpq('$..key0', s2n)}, [undefined])({
            body: {
                key0: '1',
                key1: {key0: '2'},
                key2: {key0: '3'}
            }
        })).toEqual({foo: [1, 2, 3]});
    });

    it('should return { foo: 6 } for { foo: jpa("$..key0", x => x.reduce((a, b) => a + b, 0)) }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}} in curried form', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpa('$..key0', reduceGenerator((a: number, b: number): number => a + b, 0))}, [undefined])({
            body: {
                key0: 1,
                key1: {key0: 2},
                key2: {key0: 3}
            }
        })).toEqual({foo: 6});
    });
    it('should return { foo: 6 } for { foo: jpa("$..key0", x => x.reduce((a, b) => a * b, 1)) }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}} in curried form', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpa('$..key0', (x: any[]): number => x.reduce((a: number, b: any): number => a * b, 1))}, [undefined])({
            body: {
                key0: 1,
                key1: {key0: 2},
                key2: {key0: 3}
            }
        })).toEqual({foo: 6});
    });

    it('should return { } for { foo: null }, { foo: jpv("foo") } relying on defaults', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('foo')}, {})).toEqual({});
    });
    it('should return { } for { foo: jpv("bar") }, { bar: undefined } relying on defaults', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('bar')}, {bar: undefined})).toEqual({});
    });
    it('should return { } for { foo: jpv("bar"), bar: jpv("foo") }, { foo: 1, bar: undefined } relying on defaults', () => {
        expect(extractFilteringEmpties<{ foo: number, bar?: any }>({foo: jpv('bar'), bar: jpv('foo')}, {
            foo: 1,
            bar: undefined
        })).toEqual({bar: 1});
    });
    it('should return { foo: 1 } for { body: {bar: 1} }, {foo: jpv("body.foo")} relying on defaults', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('body.foo')}, {body: {bar: 1}})).toEqual({});
    });

    it('should return { } for { }, { foo: jpv("foo") } relying on defaults', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('foo')}, {})).toEqual({});
    });
    it('should return { } for { foo: jpv("bar") }, { bar: undefined } relying on defaults', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('bar')}, {bar: null})).toEqual({foo: null});
    });
    it('should return { foo: 1 } for { body: {bar: 1} }, {foo: jpv("body.foo")} relying on defaults', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('body.foo')}, {body: {bar: 1}})).toEqual({});
    });

    it('should return { } for { foo: "Stryker was here" }, { foo: jpv("foo") } relying on defaults', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpv('foo')}, {foo: 'Stryker was here'})).toEqual({foo: 'Stryker was here'});
    });

    it('should return { } for { foo: undefined }, { foo: jpv("foo") } relying on defaults', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('foo')}, {foo: undefined})).toEqual({});
    });
    it('should return { } for { foo: jpv("bar") }, { bar: undefined } relying on defaults', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('bar')}, {bar: undefined})).toEqual({});
    });
    it('should return { foo: 1 } for { body: {foo: undefined} }, {foo: jpv("body.foo")} relying on defaults', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('body.foo')}, {body: {foo: undefined}})).toEqual({});
    });

    it('should return { } for { foo: null }, { foo: jpv("foo") } relying on defaults', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('foo')}, {foo: null})).toEqual({foo: null});
    });
    it('should return { } for { foo: jpv("bar") }, { bar: undefined } relying on defaults', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('bar')}, {bar: null})).toEqual({foo: null});
    });
    it('should return { foo: 1 } for { body: {foo: null} }, {foo: jpv("body.foo")} relying on defaults', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpv('body.foo')}, {body: {foo: null}})).toEqual({foo: null});
    });

    it('should return { } for { foo: "empty" }, { foo: jpv("foo") } with strange empties', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('foo')}, ['empty'], {})).toEqual({});
    });
    it('should return { } for { foo: jpv("bar") }, { bar: "empty" } with strange empties', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('bar')}, ['empty'], {bar: 'empty'})).toEqual({});
    });
    it('should return { foo: 1 } for { body: {foo: empty} }, {foo: jpv("body.foo")} with strange empties', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpv('body.foo')}, ['empty'], {body: {foo: 'empty'}})).toEqual({});
    });

    it('should return { } for { foo: null }, { foo: jpv("foo") } with strange empties', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('foo')}, {})).toEqual({});
    });
    it('should return { } for { foo: jpv("bar") }, { bar: undefined } with strange empties', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('bar')}, {bar: undefined})).toEqual({});
    });
    it('should return { foo: 1 } for { body: {bar: 1} }, {foo: jpv("body.foo")} with strange empties', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('body.foo')}, {body: {bar: 1}})).toEqual({});
    });

    it('should return { } for { foo: null }, { foo: jpv("foo") }', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('foo')}, [undefined, null], {foo: null})).toEqual({});
    });
    it('should return { } for { foo: jpv("bar") }, { bar: null }', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('bar')}, [undefined, null], {bar: null})).toEqual({});
    });
    it('should return { foo: 1 } for { body: {foo: null} }, {foo: jpv("body.foo")}', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpv('body.foo')}, [undefined, null], {body: {foo: null}})).toEqual({});
    });

    it('should return { } for { foo: null }, { foo: jpv("foo") }', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('foo')}, [null], {foo: null})).toEqual({});
    });
    it('should return { } for { foo: jpv("bar") }, { bar: null }', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('bar')}, [null], {bar: null})).toEqual({});
    });
    it('should return { foo: 1 } for { body: {foo: null} }, {foo: jpv("body.foo")}', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpv('body.foo')}, [null], {body: {foo: null}})).toEqual({});
    });

    it('should return { } for { foo: null }, { foo: jpv("foo") }', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpv('foo')}, [null], {foo: undefined})).toEqual({foo: undefined});
    });
    it('should return { } for { foo: jpv("bar"), bar: jpv("foo") }, { bar: null, foo: undefined }', () => {
        expect(extractFilteringEmpties<{ foo?: number, bar?: string }>({foo: jpv('bar'), bar: jpv('foo')}, [null], {
            bar: null,
            foo: undefined
        })).toEqual({bar: undefined});
    });
    it('should return { } for { foo: jpv("bar") }, { bar: undefined }', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpv('bar')}, [null], {bar: undefined})).toEqual({foo: undefined});
    });
    it('should return { foo: 1 } for { body: {foo: null} }, {foo: jpv("body.foo")}', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpv('body.foo')}, [null], {body: {foo: undefined}})).toEqual({foo: undefined});
    });

    it('should return { } for { foo: undefined }, { foo: jpv("foo") }', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpv('foo')}, [undefined, null], {foo: undefined})).toEqual({});
    });
    it('should return { } for { foo: jpv("bar") }, { bar: undefined }', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpv('bar')}, [undefined, null], {bar: undefined})).toEqual({});
    });
    it('should return { foo: 1 } for { body: {foo: undefined} }, {foo: jpv("body.foo")}', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpv('body.foo')}, [undefined, null], {body: {foo: undefined}})).toEqual({});
    });

    it('should return { foo: { bar: 5 } for { foo: { bar: jpv("body") }}, { body: 5 } in curried form relying on defaults', () => {
        expect(extractFilteringEmpties<{
            foo: { bar: number }
        }>({foo: {bar: jpv('body')}})({body: 5})).toEqual({foo: {bar: 5}});
    });
    it('should return { foo: { bar: 1 } for { foo: { bar: jpv("body") }}, { body: 1, pathParameters: "7" } in curried form relying on defaults', () => {
        expect(extractFilteringEmpties<{ foo: { bar: number } }>({foo: {bar: jpv('body')}})({
            body: 1,
            pathParameters: '7'
        })).toEqual({foo: {bar: 1}});
    });
    it('should return { } for { foo: { bar: jpv("body") }}, { key0: 1, pathParameters: "7" } in curried form relying on defaults', () => {
        expect(extractFilteringEmpties<{ foo: { bar: number } }>({foo: {bar: jpv('body')}})({
            key0: 1,
            pathParameters: '7'
        })).toEqual({foo: {bar: undefined}});
    });

    it('should return { } for { foo: null }, { foo: jpv("foo") }', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('foo')}, [undefined, null], {foo: null})).toEqual({});
    });
    it('should return { } for { foo: jpv("bar") }, { bar: null }', () => {
        expect(extractFilteringEmpties<{ foo: number }>({foo: jpv('bar')}, [undefined, null], {bar: null})).toEqual({});
    });
    it('should return { foo: 1 } for { body: {foo: null} }, {foo: jpv("body.foo")}', () => {
        expect(extractFilteringEmpties<{
            foo: number
        }>({foo: jpv('body.foo')}, [undefined, null], {body: {foo: null}})).toEqual({});
    });

    it('should return { foo: { bar: 5 } for { foo: { bar: jpv("body") }}, { body: 5 } in curried form', () => {
        expect(extractFilteringEmpties<{
            foo: { bar: number }
        }>({foo: {bar: jpv('body')}}, [undefined, null])({body: 5})).toEqual({foo: {bar: 5}});
    });
    it('should return { foo: { bar: 1 } for { foo: { bar: jpv("body") }}, { body: 1, pathParameters: "7" } in curried form', () => {
        expect(extractFilteringEmpties<{ foo: { bar: number } }>({foo: {bar: jpv('body')}}, [undefined, null])({
            body: 1,
            pathParameters: '7'
        })).toEqual({foo: {bar: 1}});
    });
    it('should return { } for { foo: { bar: jpv("body") }}, { key0: 1, pathParameters: "7" } in curried form', () => {
        expect(extractFilteringEmpties<{ foo: { bar: number } }>({foo: {bar: jpv('body')}}, [undefined, null])({
            key0: 1,
            pathParameters: '7'
        })).toEqual({foo: {bar: undefined}});
    });
});
