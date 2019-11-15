import {constant, jpa, jpq, jpv, extract} from '../../src';
import {createExtractingProxy} from '../../src/ExtractorMap';

describe('fullExtractorMap', () => {
    it('should return { foo: 1 } for { foo: 1 }, { foo: jpv("foo") }', () => {
        expect(extract({foo: jpv('foo')}, {foo: 1})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { bar: 1 }, { foo: jpv("bar") }', () => {
        expect(extract({foo: jpv('bar')}, {bar: 1})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: 1 }, { foo: jpv("body") }', () => {
        expect(extract({foo: jpv("body")}, {body: 1})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: "1" }, { foo: jpv("body", x => parseInt(x, 10) }', () => {
        expect(extract({foo: jpv("body", x => parseInt(x, 10))}, {body: '1'})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: 1 }, {foo: jpv("body""foo")}', () => {
        expect(extract({foo: jpv('body.foo')}, {body: {foo: 1}})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: 1 }, {foo: 1 }', () => {
        expect(extract({foo: constant(1)}, {body: {foo: 5}})).toEqual({foo: 1});
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpv("body") }, { body: [1, 2, 3] }', () => {
        expect(extract({foo: jpv('body')}, {body: [1, 2, 3]})).toEqual({foo: [1, 2, 3]});
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpq("$..blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}}', () => {
        expect(extract({foo: jpq('$..blub')}, {
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        })).toEqual({foo: [1, 2, 3]});
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpv("bodyblub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}}', () => {
        expect(extract({foo: jpv('body.blub')}, {
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        })).toEqual({foo: 1});
    });
    it('should return { foo: 2 } for { foo: jpv("body"".[?(@.blub > 1)].blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}}', () => {
        expect(extract({foo: jpv('body.[?(@.blub > 1)].blub')}, {
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        })).toEqual({foo: 2});
    });
    it('should return { foo: 6 } for { foo: jpc("$..[?(@.blub > 1)].blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}}', () => {
        expect(extract({foo: jpq('$..[?(@.blub > 1)].blub')}, {
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        })).toEqual({foo: [2, 3]});
    });
    it('should return { foo: 6 } for { foo: jpq("$..blub", x => parseInt(x, 10)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}}', () => {
        expect(extract({foo: jpq('$..blub', x => parseInt(x, 10))}, {
            body: {
                blub: '1',
                key1: {blub: '2'},
                key2: {blub: '3'}
            }
        })).toEqual({foo: [1, 2, 3]});
    });
    it('should return { foo: 6 } for { foo: jpa("$..blub", x => x.reduce((a, b) => a + b, 0)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}}', () => {
        expect(extract({foo: jpa('$..blub', x => x.reduce((a, b) => a + b, 0))}, {
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        })).toEqual({foo: 6});
    });
    it('should return { foo: 6 } for { foo: jpa("$..blub", x => x.reduce((a, b) => a * b, 1)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}}', () => {
        expect(extract({foo: jpa('$..blub', x => x.reduce((a, b) => a * b, 1))}, {
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        })).toEqual({foo: 6});
    });

    it('should return { foo: { bar: 5 } for { foo: { bar: jpv("body") }}, { body: 5 }', () => {
        expect(extract({foo: {bar: jpv("body")}}, {body: 5})).toEqual({foo: {bar: 5}});
    });
    it('should return { foo: { bar: 1 } for { foo: { bar: jpv("body") }}, { body: 1, pathParamters: "7" }', () => {
        expect(extract({foo: {bar: jpv("body")}}, {body: 1, pathParamters: '7'})).toEqual({foo: {bar: 1}});
    });
    it('should return { } for { foo: { bar: jpv("body") }}, { blub: 1, pathParamters: "7" }', () => {
        expect(extract({foo: {bar: jpv("body")}}, {blub: 1, pathParamters: '7'})).toEqual({ foo: { bar: undefined }});
    });


    it('should return { foo: 1 } for { foo: 1 }, { foo: jpv("foo") } in curried form', () => {
        expect(extract({foo: jpv('foo')})({foo: 1})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { bar: 1 }, { foo: jpv("bar") } in curried form', () => {
        expect(extract({foo: jpv('bar')})({bar: 1})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: 1 }, { foo: jpv("body") } in curried form', () => {
        expect(extract({foo: jpv("body")})({body: 1})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: "1" }, { foo: jpv("body", x => parseInt(x, 10) } in curried form', () => {
        expect(extract({foo: jpv("body", x => parseInt(x, 10))})({body: '1'})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: 1 }, {foo: jpv("body""foo")} in curried form', () => {
        expect(extract({foo: jpv('body.foo')})({body: {foo: 1}})).toEqual({foo: 1});
    });
    it('should return { foo: 1 } for { body: 1 }, {foo: 1 } in curried form', () => {
        expect(extract({foo: constant(1)})({body: {foo: 5}})).toEqual({foo: 1});
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpv("body") }, { body: [1, 2, 3] } in curried form', () => {
        expect(extract({foo: jpv('body')})({body: [1, 2, 3]})).toEqual({foo: [1, 2, 3]});
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpq("$..blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}} in curried form', () => {
        expect(extract({foo: jpq('$..blub')})({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        })).toEqual({foo: [1, 2, 3]});
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpv("body"".blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}} in curried form', () => {
        expect(extract({foo: jpv('body.blub')})({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        })).toEqual({foo: 1});
    });
    it('should return { foo: 2 } for { foo: jpv("body"".[?(@.blub > 1)].blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}} in curried form', () => {
        expect(extract({foo: jpv('body.[?(@.blub > 1)].blub')})({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        })).toEqual({foo: 2});
    });
    it('should return { foo: 6 } for { foo: jpc("$..[?(@.blub > 1)].blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}} in curried form', () => {
        expect(extract({foo: jpq('$..[?(@.blub > 1)].blub')})({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        })).toEqual({foo: [2, 3]});
    });
    it('should return { foo: 6 } for { foo: jpq("$..blub", x => parseInt(x, 10)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}} in curried form', () => {
        expect(extract({foo: jpq('$..blub', x => parseInt(x, 10))})({
            body: {
                blub: '1',
                key1: {blub: '2'},
                key2: {blub: '3'}
            }
        })).toEqual({foo: [1, 2, 3]});
    });

    it('should return { foo: 6 } for { foo: jpa("$..blub", x => x.reduce((a, b) => a + b, 0)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}} in curried form', () => {
        expect(extract({foo: jpa('$..blub', x => x.reduce((a, b) => a + b, 0))})({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        })).toEqual({foo: 6});
    });
    it('should return { foo: 6 } for { foo: jpa("$..blub", x => x.reduce((a, b) => a * b, 1)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}} in curried form', () => {
        expect(extract({foo: jpa('$..blub', x => x.reduce((a, b) => a * b, 1))})({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        })).toEqual({foo: 6});
    });

    it('should return { foo: { bar: 5 } for { foo: { bar: jpv("body") }}, { body: 5 } in curried form', () => {
        expect(extract({foo: {bar: jpv("body")}})({body: 5})).toEqual({foo: {bar: 5}});
    });
    it('should return { foo: { bar: 1 } for { foo: { bar: jpv("body") }}, { body: 1, pathParamters: "7" } in curried form', () => {
        expect(extract({foo: {bar: jpv("body")}})({body: 1, pathParamters: '7'})).toEqual({foo: {bar: 1}});
    });
    it('should return { } for { foo: { bar: jpv("body") }}, { blub: 1, pathParamters: "7" } in curried form', () => {
        expect(extract({foo: {bar: jpv("body")}})({blub: 1, pathParamters: '7'})).toEqual({ foo: { bar: undefined }});
    });












    it('should return { foo: 1 } for { foo: 1 }, { foo: jpv("foo") }', () => {
        expect(createExtractingProxy({foo: jpv('foo')}, {foo: 1}).foo).toEqual(1);
    });
    it('should return { foo: 1 } for { bar: 1 }, { foo: jpv("bar") }', () => {
        expect(createExtractingProxy({foo: jpv('bar')}, {bar: 1}).foo).toEqual(1);
    });
    it('should return { foo: 1 } for { body: 1 }, { foo: jpv("body") }', () => {
        expect(createExtractingProxy({foo: jpv("body")}, {body: 1}).foo).toEqual(1);
    });
    it('should return { foo: 1 } for { body: "1" }, { foo: jpv("body", x => parseInt(x, 10) }', () => {
        expect(createExtractingProxy({foo: jpv("body", x => parseInt(x, 10))}, {body: '1'}).foo).toEqual(1);
    });
    it('should return { foo: 1 } for { body: 1 }, {foo: jpv("body""foo")}', () => {
        expect(createExtractingProxy({foo: jpv('body.foo')}, {body: {foo: 1}}).foo).toEqual(1);
    });
    it('should return { foo: 1 } for { body: 1 }, {foo: 1 }', () => {
        expect(createExtractingProxy({foo: constant(1)}, {body: {foo: 5}}).foo).toEqual(1);
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpv("body") }, { body: [1, 2, 3] }', () => {
        expect(createExtractingProxy({foo: jpv('body')}, {body: [1, 2, 3]}).foo).toEqual([1, 2, 3]);
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpq("$..blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}}', () => {
        expect(createExtractingProxy({foo: jpq('$..blub')}, {
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }).foo).toEqual([1, 2, 3]);
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpv("body"".blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}}', () => {
        expect(createExtractingProxy({foo: jpv('body.blub')}, {
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }).foo).toEqual(1);
    });
    it('should return { foo: 2 } for { foo: jpv("body"".[?(@.blub > 1)].blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}}', () => {
        expect(createExtractingProxy({foo: jpv('body.[?(@.blub > 1)].blub')}, {
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }).foo).toEqual(2);
    });
    it('should return { foo: 6 } for { foo: jpc("$..[?(@.blub > 1)].blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}}', () => {
        expect(createExtractingProxy({foo: jpq('$..[?(@.blub > 1)].blub')}, {
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }).foo).toEqual([2, 3]);
    });
    it('should return { foo: 6 } for { foo: jpq("$..blub", x => parseInt(x, 10)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}}', () => {
        expect(createExtractingProxy({foo: jpq('$..blub', x => parseInt(x, 10))}, {
            body: {
                blub: '1',
                key1: {blub: '2'},
                key2: {blub: '3'}
            }
        }).foo).toEqual([1, 2, 3]);
    });
    it('should return { foo: 6 } for { foo: jpa("$..blub", x => x.reduce((a, b) => a + b, 0)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}}', () => {
        expect(createExtractingProxy({foo: jpa('$..blub', x => x.reduce((a, b) => a + b, 0))}, {
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }).foo).toEqual(6);
    });
    it('should return { foo: 6 } for { foo: jpa("$..blub", x => x.reduce((a, b) => a * b, 1)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}}', () => {
        expect(createExtractingProxy({foo: jpa('$..blub', x => x.reduce((a, b) => a * b, 1))}, {
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }).foo).toEqual(6);
    });

    it('should return { foo: { bar: 5 } for { foo: { bar: jpv("body") }}, { body: 5 }', () => {
        expect(createExtractingProxy({foo: {bar: jpv("body")}}, {body: 5}).foo).toEqual({bar: 5});
    });
    it('should return { foo: { bar: 1 } for { foo: { bar: jpv("body") }}, { body: 1, pathParamters: "7" }', () => {
        expect(createExtractingProxy({foo: {bar: jpv("body")}}, {body: 1, pathParamters: '7'}).foo).toEqual({bar: 1});
    });
    it('should return { } for { foo: { bar: jpv("body") }}, { blub: 1, pathParamters: "7" }', () => {
        expect(createExtractingProxy({foo: {bar: jpv("body")}}, {blub: 1, pathParamters: '7'}).foo).toEqual({ bar: undefined });
    });


    it('should return { foo: 1 } for { foo: 1 }, { foo: jpv("foo") } in curried form', () => {
        expect(createExtractingProxy({foo: jpv('foo')})({foo: 1}).foo).toEqual(1);
    });
    it('should return { foo: 1 } for { bar: 1 }, { foo: jpv("bar") } in curried form', () => {
        expect(createExtractingProxy({foo: jpv('bar')})({bar: 1}).foo).toEqual(1);
    });
    it('should return { foo: 1 } for { body: 1 }, { foo: jpv("body") } in curried form', () => {
        expect(createExtractingProxy({foo: jpv("body")})({body: 1}).foo).toEqual(1);
    });
    it('should return { foo: 1 } for { body: "1" }, { foo: jpv("body", x => parseInt(x, 10) } in curried form', () => {
        expect(createExtractingProxy({foo: jpv("body", x => parseInt(x, 10))})({body: '1'}).foo).toEqual(1);
    });
    it('should return { foo: 1 } for { body: 1 }, {foo: jpv("body""foo")} in curried form', () => {
        expect(createExtractingProxy({foo: jpv('body.foo')})({body: {foo: 1}}).foo).toEqual(1);
    });
    it('should return { foo: 1 } for { body: 1 }, {foo: 1 } in curried form', () => {
        expect(createExtractingProxy({foo: constant(1)})({body: {foo: 5}}).foo).toEqual(1);
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpv("body") }, { body: [1, 2, 3] } in curried form', () => {
        expect(createExtractingProxy({foo: jpv('body')})({body: [1, 2, 3]}).foo).toEqual([1, 2, 3]);
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpq("$..blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}} in curried form', () => {
        expect(createExtractingProxy({foo: jpq('$..blub')})({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }).foo).toEqual([1, 2, 3]);
    });
    it('should return { foo: [1, 2, 3] } for { foo: jpv("body"".blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}} in curried form', () => {
        expect(createExtractingProxy({foo: jpv('body.blub')})({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }).foo).toEqual(1);
    });
    it('should return { foo: 2 } for { foo: jpv("body"".[?(@.blub > 1)].blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}} in curried form', () => {
        expect(createExtractingProxy({foo: jpv('body.[?(@.blub > 1)].blub')})({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }).foo).toEqual(2);
    });
    it('should return { foo: 6 } for { foo: jpc("$..[?(@.blub > 1)].blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}} in curried form', () => {
        expect(createExtractingProxy({foo: jpq('$..[?(@.blub > 1)].blub')})({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }).foo).toEqual([2, 3]);
    });
    it('should return { foo: 6 } for { foo: jpq("$..blub", x => parseInt(x, 10)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}} in curried form', () => {
        expect(createExtractingProxy({foo: jpq('$..blub', x => parseInt(x, 10))})({
            body: {
                blub: '1',
                key1: {blub: '2'},
                key2: {blub: '3'}
            }
        }).foo).toEqual([1, 2, 3]);
    });

    it('should return { foo: 6 } for { foo: jpa("$..blub", x => x.reduce((a, b) => a + b, 0)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}} in curried form', () => {
        expect(createExtractingProxy({foo: jpa('$..blub', x => x.reduce((a, b) => a + b, 0))})({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }).foo).toEqual(6);
    });
    it('should return { foo: 6 } for { foo: jpa("$..blub", x => x.reduce((a, b) => a * b, 1)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}} in curried form', () => {
        expect(createExtractingProxy({foo: jpa('$..blub', x => x.reduce((a, b) => a * b, 1))})({
            body: {
                blub: 1,
                key1: {blub: 2},
                key2: {blub: 3}
            }
        }).foo).toEqual(6);
    });

    it('should return { foo: { bar: 5 } for { foo: { bar: jpv("body") }}, { body: 5 } in curried form', () => {
        expect(createExtractingProxy({foo: {bar: jpv("body")}})({body: 5}).foo).toEqual({bar: 5});
    });
    it('should return { foo: { bar: 1 } for { foo: { bar: jpv("body") }}, { body: 1, pathParamters: "7" } in curried form', () => {
        expect(createExtractingProxy({foo: {bar: jpv("body")}})({body: 1, pathParamters: '7'}).foo).toEqual({bar: 1});
    });
    it('should return { } for { foo: { bar: jpv("body") }}, { blub: 1, pathParamters: "7" } in curried form', () => {
        expect(createExtractingProxy({foo: {bar: jpv("body")}})({blub: 1, pathParamters: '7'}).foo).toEqual( { bar: undefined });
    });

});
