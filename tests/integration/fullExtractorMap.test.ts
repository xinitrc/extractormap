import {extract} from '../../src/ExtractorMap';
import {constant, jpa, jpq, jpv} from '../../src/helper';
import {body} from '../../src/awsAPIGatewayHelper';

describe('fullExtractorMap', () => {
    it('should return { foo: 1 } for { foo: 1 }, { foo: jpv("foo") }', () => {
        expect(extract({foo: 1}, {foo: jpv('foo')})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { bar: 1 }, { foo: jpv("bar") }', () => {
        expect(extract({bar: 1}, {foo: jpv('bar')})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: 1 }, { foo: body() }', () => {
        expect(extract({body: 1}, {foo: body()})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: "1" }, { foo: body(x => parseInt(x, 10) }', () => {
        expect(extract({body: '1'}, {foo: body(x => parseInt(x, 10))})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: 1 }, {foo: body("foo")}', () => {
        expect(extract({body: {foo: 1}}, {foo: body('foo')})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: 1 }, {foo: 1 }', () => {
        expect(extract({body: {foo: 1}}, {foo: constant(1)})).toEqual({foo: 1});
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpv("body") }, { body: [1, 2, 3] }', () => {
        expect(extract({body: [1, 2, 3]}, {foo: jpv('body')})).toEqual({foo: [1, 2, 3]});
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpq("$..blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}}', () => {
        expect(extract({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }, {foo: jpq('$..blub')})).toEqual({foo: [1, 2, 3]});
    });
    it('should return { foo: [1, 2, 3] } for { foo: body(".blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}}', () => {
        expect(extract({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }, {foo: body('.blub')})).toEqual({foo: 1});
    });
    it('should return { foo: 2 } for { foo: body(".[?(@.blub > 1)].blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}}', () => {
        expect(extract({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }, {foo: body('.[?(@.blub > 1)].blub')})).toEqual({foo: 2});
    });
    it('should return { foo: 6 } for { foo: jpc("$..[?(@.blub > 1)].blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}}', () => {
        expect(extract({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }, {foo: jpq('$..[?(@.blub > 1)].blub')})).toEqual({foo: [2, 3]});
    });
    it('should return { foo: 6 } for { foo: jpq("$..blub", x => parseInt(x, 10)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}}', () => {
        expect(extract({
            body: {
                blub: '1',
                key1: {blub: '2'},
                key2: {blub: '3'}
            }
        }, {foo: jpq('$..blub', x => parseInt(x, 10))})).toEqual({foo: [1, 2, 3]});
    });
    it('should return { foo: 6 } for { foo: jpa("$..blub", x => x.reduce((a, b) => a + b, 0)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}}', () => {
        expect(extract({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }, {foo: jpa('$..blub', x => x.reduce((a, b) => a + b, 0))})).toEqual({foo: 6});
    });
    it('should return { foo: 6 } for { foo: jpa("$..blub", x => x.reduce((a, b) => a * b, 1)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}}', () => {
        expect(extract({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }, {foo: jpa('$..blub', x => x.reduce((a, b) => a * b, 1))})).toEqual({foo: 6});
    });
    it('should return { foo: 6 } for { foo: jpa("$..blub", x => x.reduce((a, b) => a * b, 1)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}}', () => {
        expect(extract(JSON.stringify({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }), {foo: jpa('$..blub', x => x.reduce((a, b) => a * b, 1))})).toEqual({foo: 6});
    });
    it('should return { foo: 3 } for { foo: jpa("$..blub", x => x.length) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}}', () => {
        expect(extract(JSON.stringify({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }), {foo: jpa('$..blub', x => x.length)})).toEqual({foo: 3});
    });
    it('should return { foo: { bar: 5 } for { foo: { bar: body() }}, { body: 5 }', () => {
        expect(extract({ body: 5 }, {foo: { bar: body()}})).toEqual({foo: {bar: 5}});
    });
    it('should return { foo: { bar: 1 } for { foo: { bar: body() }}, { body: 1, pathParamters: "7" }', () => {
        expect(extract({ body: 1, pathParamters: "7" }, {foo: { bar: body()}})).toEqual({foo: {bar: 1}});
    });
    it('should return { } for { foo: { bar: body() }}, { blub: 1, pathParamters: "7" }', () => {
        expect(extract({ blub: 1, pathParamters: "7" }, {foo: { bar: body()}})).toEqual({ foo: { bar: undefined }});
    });
});
