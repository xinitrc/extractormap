import {constant, jpa, jpq, jpv, extractFilteringEmpties} from '../../src'

describe('nested objects are filtered for empties', () => {
  test('simple nested object should be empty', () => {
    // JSON.stringify({foo: undefined}) (which is used by .toEqual) results to '{}'. So util.inspect has to be used to identify that bar undefined object properties for this test
    const util = require('util');
    expect(util.inspect(extractFilteringEmpties({foo: {bar: jpv('foo')}}, [null, undefined], {})))
      .toEqual('{ foo: {} }');
  })
})

describe('fullExtractorMap', () => {
  it('should return { foo: 1 } for { foo: 1 }, { foo: jpv("foo") }', () => {
    expect(extractFilteringEmpties({foo: jpv('foo')}, [undefined], {foo: 1})).toEqual({foo: 1})
  })
  it('should return { foo: 1 } for { bar: 1 }, { foo: jpv("bar") }', () => {
    expect(extractFilteringEmpties({foo: jpv('bar')}, [undefined], {bar: 1})).toEqual({foo: 1})
  })
  it('should return { foo: 1 } for { body: 1 }, { foo: jpv("body") }', () => {
    expect(extractFilteringEmpties({foo: jpv('body')}, [undefined], {body: 1})).toEqual({foo: 1})
  })
  it('should return { foo: 1 } for { body: "1" }, { foo: jpv("body", x => parseInt(x, 10) }', () => {
    expect(extractFilteringEmpties({foo: jpv('body', (x) => parseInt(x, 10))}, [undefined], {body: '1'})).toEqual({foo: 1})
  })
  it('should return { foo: 1 } for { body: 1 }, {foo: jpv("body""foo")}', () => {
    expect(extractFilteringEmpties({foo: jpv('body.foo')}, [undefined], {body: {foo: 1}})).toEqual({foo: 1})
  })
  it('should return { foo: 1 } for { body: 1 }, {foo: 1 }', () => {
    expect(extractFilteringEmpties({foo: constant(1)}, [undefined], {body: {foo: 5}})).toEqual({foo: 1})
  })
  it('should return { foo: [1, 2, 3] } for { foo: jpv("body") }, { body: [1, 2, 3] }', () => {
    expect(extractFilteringEmpties({foo: jpv('body')}, [undefined], {body: [1, 2, 3]})).toEqual({foo: [1, 2, 3]})
  })
  it('should return { foo: [1, 2, 3] } for { foo: jpq("$..blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}}', () => {
    expect(extractFilteringEmpties({foo: jpq('$..blub')}, [undefined], {
      body: {
        blub: 1,
        key1: {blub: 2},
        key2: {blub: 3}
      }
    })).toEqual({foo: [1, 2, 3]})
  })
  it('should return { foo: [1, 2, 3] } for { foo: jpv("bodyblub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}}', () => {
    expect(extractFilteringEmpties({foo: jpv('body.blub')}, [undefined], {
      body: {
        blub: 1,
        key1: {blub: 2},
        key2: {blub: 3}
      }
    })).toEqual({foo: 1})
  })
  it('should return { foo: 2 } for { foo: jpv("body"".[?(@.blub > 1)].blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}}', () => {
    expect(extractFilteringEmpties({foo: jpv('body.[?(@.blub > 1)].blub')}, [undefined], {
      body: {
        blub: 1,
        key1: {blub: 2},
        key2: {blub: 3}
      }
    })).toEqual({foo: 2})
  })
  it('should return { foo: 6 } for { foo: jpc("$..[?(@.blub > 1)].blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}}', () => {
    expect(extractFilteringEmpties({foo: jpq('$..[?(@.blub > 1)].blub')}, [undefined], {
      body: {
        blub: 1,
        key1: {blub: 2},
        key2: {blub: 3}
      }
    })).toEqual({foo: [2, 3]})
  })
  it('should return { foo: 6 } for { foo: jpq("$..blub", x => parseInt(x, 10)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}}', () => {
    expect(extractFilteringEmpties({foo: jpq('$..blub', (x) => parseInt(x, 10))}, [undefined], {
      body: {
        blub: '1',
        key1: {blub: '2'},
        key2: {blub: '3'}
      }
    })).toEqual({foo: [1, 2, 3]})
  })
  it('should return { foo: 6 } for { foo: jpa("$..blub", x => x.reduce((a, b) => a + b, 0)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}}', () => {
    expect(extractFilteringEmpties({foo: jpa('$..blub', (x) => x.reduce((a, b) => a + b, 0))}, [undefined], {
      body: {
        blub: 1,
        key1: {blub: 2},
        key2: {blub: 3}
      }
    })).toEqual({foo: 6})
  })
  it('should return { foo: 6 } for { foo: jpa("$..blub", x => x.reduce((a, b) => a * b, 1)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}}', () => {
    expect(extractFilteringEmpties({foo: jpa('$..blub', (x) => x.reduce((a, b) => a * b, 1))}, [undefined], {
      body: {
        blub: 1,
        key1: {blub: 2},
        key2: {blub: 3}
      }
    })).toEqual({foo: 6})
  })

  it('should return { foo: { bar: 5 } for { foo: { bar: jpv("body") }}, { body: 5 }', () => {
    expect(extractFilteringEmpties({foo: {bar: jpv('body')}}, [undefined], {body: 5})).toEqual({foo: {bar: 5}})
  })
  it('should return { foo: { bar: 1 } for { foo: { bar: jpv("body") }}, { body: 1, pathParamters: "7" }', () => {
    expect(extractFilteringEmpties({foo: {bar: jpv('body')}}, [undefined], {
      body: 1,
      pathParamters: '7'
    })).toEqual({foo: {bar: 1}})
  })
  it('should return { } for { foo: { bar: jpv("body") }}, { blub: 1, pathParamters: "7" }', () => {
    expect(extractFilteringEmpties({foo: {bar: jpv('body')}}, [undefined], {
      blub: 1,
      pathParamters: '7'
    })).toEqual({foo: {bar: undefined}})
  })

  it('should return { foo: 1 } for { foo: 1 }, { foo: jpv("foo") } in curried form', () => {
    expect(extractFilteringEmpties({foo: jpv('foo')}, [undefined])({foo: 1})).toEqual({foo: 1})
  })
  it('should return { foo: 1 } for { bar: 1 }, { foo: jpv("bar") } in curried form', () => {
    expect(extractFilteringEmpties({foo: jpv('bar')}, [undefined])({bar: 1})).toEqual({foo: 1})
  })
  it('should return { foo: 1 } for { body: 1 }, { foo: jpv("body") } in curried form', () => {
    expect(extractFilteringEmpties({foo: jpv('body')}, [undefined])({body: 1})).toEqual({foo: 1})
  })
  it('should return { foo: 1 } for { body: "1" }, { foo: jpv("body", x => parseInt(x, 10) } in curried form', () => {
    expect(extractFilteringEmpties({foo: jpv('body', (x) => parseInt(x, 10))}, [undefined])({body: '1'})).toEqual({foo: 1})
  })
  it('should return { foo: 1 } for { body: 1 }, {foo: jpv("body""foo")} in curried form', () => {
    expect(extractFilteringEmpties({foo: jpv('body.foo')}, [undefined])({body: {foo: 1}})).toEqual({foo: 1})
  })
  it('should return { foo: 1 } for { body: 1 }, {foo: 1 } in curried form', () => {
    expect(extractFilteringEmpties({foo: constant(1)}, [undefined])({body: {foo: 5}})).toEqual({foo: 1})
  })
  it('should return { foo: [1, 2, 3] } for { foo: jpv("body") }, { body: [1, 2, 3] } in curried form', () => {
    expect(extractFilteringEmpties({foo: jpv('body')}, [undefined])({body: [1, 2, 3]})).toEqual({foo: [1, 2, 3]})
  })
  it('should return { foo: [1, 2, 3] } for { foo: jpq("$..blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}} in curried form', () => {
    expect(extractFilteringEmpties({foo: jpq('$..blub')}, [undefined])({
      body: {
        blub: 1,
        key1: {blub: 2},
        key2: {blub: 3}
      }
    })).toEqual({foo: [1, 2, 3]})
  })
  it('should return { foo: [1, 2, 3] } for { foo: jpv("body"".blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}} in curried form', () => {
    expect(extractFilteringEmpties({foo: jpv('body.blub')}, [undefined])({
      body: {
        blub: 1,
        key1: {blub: 2},
        key2: {blub: 3}
      }
    })).toEqual({foo: 1})
  })
  it('should return { foo: 2 } for { foo: jpv("body"".[?(@.blub > 1)].blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}} in curried form', () => {
    expect(extractFilteringEmpties({foo: jpv('body.[?(@.blub > 1)].blub')}, [undefined])({
      body: {
        blub: 1,
        key1: {blub: 2},
        key2: {blub: 3}
      }
    })).toEqual({foo: 2})
  })
  it('should return { foo: 6 } for { foo: jpc("$..[?(@.blub > 1)].blub") }, { body: { blub: 1, key1: {blub: 2}, key2: {blub: 3}}}} in curried form', () => {
    expect(extractFilteringEmpties({foo: jpq('$..[?(@.blub > 1)].blub')}, [undefined])({
      body: {
        blub: 1,
        key1: {blub: 2},
        key2: {blub: 3}
      }
    })).toEqual({foo: [2, 3]})
  })
  it('should return { foo: 6 } for { foo: jpq("$..blub", x => parseInt(x, 10)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}} in curried form', () => {
    expect(extractFilteringEmpties({foo: jpq('$..blub', (x) => parseInt(x, 10))}, [undefined])({
      body: {
        blub: '1',
        key1: {blub: '2'},
        key2: {blub: '3'}
      }
    })).toEqual({foo: [1, 2, 3]})
  })

  it('should return { foo: 6 } for { foo: jpa("$..blub", x => x.reduce((a, b) => a + b, 0)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}} in curried form', () => {
    expect(extractFilteringEmpties({foo: jpa('$..blub', (x) => x.reduce((a, b) => a + b, 0))}, [undefined])({
      body: {
        blub: 1,
        key1: {blub: 2},
        key2: {blub: 3}
      }
    })).toEqual({foo: 6})
  })
  it('should return { foo: 6 } for { foo: jpa("$..blub", x => x.reduce((a, b) => a * b, 1)) }, { body: { blub: "1", key1: {blub: "2"}, key2: {blub: "3"}}}} in curried form', () => {
    expect(extractFilteringEmpties({foo: jpa('$..blub', (x) => x.reduce((a, b) => a * b, 1))}, [undefined])({
      body: {
        blub: 1,
        key1: {blub: 2},
        key2: {blub: 3}
      }
    })).toEqual({foo: 6})
  })

  it('should return { } for { foo: null }, { foo: jpv("foo") } relying on defaults', () => {
    expect(extractFilteringEmpties({foo: jpv('foo')}, {})).toEqual({})
  })
  it('should return { } for { foo: jpv("bar") }, { bar: undefined } relying on defaults', () => {
    expect(extractFilteringEmpties({foo: jpv('bar')}, {bar: undefined})).toEqual({})
  })
  it('should return { } for { foo: jpv("bar"), bar: jpv("foo") }, { foo: 1, bar: undefined } relying on defaults', () => {
    expect(extractFilteringEmpties({foo: jpv('bar'), bar: jpv('foo')}, {foo: 1, bar: undefined})).toEqual({bar: 1})
  })
  it('should return { foo: 1 } for { body: {bar: 1} }, {foo: jpv("body.foo")} relying on defaults', () => {
    expect(extractFilteringEmpties({foo: jpv('body.foo')}, {body: {bar: 1}})).toEqual({})
  })

  it('should return { } for { }, { foo: jpv("foo") } relying on defaults', () => {
    expect(extractFilteringEmpties({foo: jpv('foo')}, {})).toEqual({})
  })
  it('should return { } for { foo: jpv("bar") }, { bar: undefined } relying on defaults', () => {
    expect(extractFilteringEmpties({foo: jpv('bar')}, {bar: null})).toEqual({foo: null})
  })
  it('should return { foo: 1 } for { body: {bar: 1} }, {foo: jpv("body.foo")} relying on defaults', () => {
    expect(extractFilteringEmpties({foo: jpv('body.foo')}, {body: {bar: 1}})).toEqual({})
  })

  it('should return { } for { foo: "Stryker was here" }, { foo: jpv("foo") } relying on defaults', () => {
    expect(extractFilteringEmpties({foo: jpv('foo')}, {foo: 'Stryker was here'})).toEqual({foo: 'Stryker was here'})
  })

  it('should return { } for { foo: undefined }, { foo: jpv("foo") } relying on defaults', () => {
    expect(extractFilteringEmpties({foo: jpv('foo')}, {foo: undefined})).toEqual({})
  })
  it('should return { } for { foo: jpv("bar") }, { bar: undefined } relying on defaults', () => {
    expect(extractFilteringEmpties({foo: jpv('bar')}, {bar: undefined})).toEqual({})
  })
  it('should return { foo: 1 } for { body: {foo: undefined} }, {foo: jpv("body.foo")} relying on defaults', () => {
    expect(extractFilteringEmpties({foo: jpv('body.foo')}, {body: {foo: undefined}})).toEqual({})
  })

  it('should return { } for { foo: null }, { foo: jpv("foo") } relying on defaults', () => {
    expect(extractFilteringEmpties({foo: jpv('foo')}, {foo: null})).toEqual({foo: null})
  })
  it('should return { } for { foo: jpv("bar") }, { bar: undefined } relying on defaults', () => {
    expect(extractFilteringEmpties({foo: jpv('bar')}, {bar: null})).toEqual({foo: null})
  })
  it('should return { foo: 1 } for { body: {foo: null} }, {foo: jpv("body.foo")} relying on defaults', () => {
    expect(extractFilteringEmpties({foo: jpv('body.foo')}, {body: {foo: null}})).toEqual({foo: null})
  })

  it('should return { } for { foo: "empty" }, { foo: jpv("foo") } with strange empties', () => {
    expect(extractFilteringEmpties({foo: jpv('foo')}, ['empty'], {})).toEqual({})
  })
  it('should return { } for { foo: jpv("bar") }, { bar: "empty" } with strange empties', () => {
    expect(extractFilteringEmpties({foo: jpv('bar')}, ['empty'], {bar: 'empty'})).toEqual({})
  })
  it('should return { foo: 1 } for { body: {foo: empty} }, {foo: jpv("body.foo")} with strange empties', () => {
    expect(extractFilteringEmpties({foo: jpv('body.foo')}, ['empty'], {body: {foo: 'empty'}})).toEqual({})
  })

  it('should return { } for { foo: null }, { foo: jpv("foo") } with strange empties', () => {
    expect(extractFilteringEmpties({foo: jpv('foo')}, {})).toEqual({})
  })
  it('should return { } for { foo: jpv("bar") }, { bar: undefined } with strange empties', () => {
    expect(extractFilteringEmpties({foo: jpv('bar')}, {bar: undefined})).toEqual({})
  })
  it('should return { foo: 1 } for { body: {bar: 1} }, {foo: jpv("body.foo")} with strange empties', () => {
    expect(extractFilteringEmpties({foo: jpv('body.foo')}, {body: {bar: 1}})).toEqual({})
  })

  it('should return { } for { foo: null }, { foo: jpv("foo") }', () => {
    expect(extractFilteringEmpties({foo: jpv('foo')}, [undefined, null], {foo: null})).toEqual({})
  })
  it('should return { } for { foo: jpv("bar") }, { bar: null }', () => {
    expect(extractFilteringEmpties({foo: jpv('bar')}, [undefined, null], {bar: null})).toEqual({})
  })
  it('should return { foo: 1 } for { body: {foo: null} }, {foo: jpv("body.foo")}', () => {
    expect(extractFilteringEmpties({foo: jpv('body.foo')}, [undefined, null], {body: {foo: null}})).toEqual({})
  })

  it('should return { } for { foo: null }, { foo: jpv("foo") }', () => {
    expect(extractFilteringEmpties({foo: jpv('foo')}, [null], {foo: null})).toEqual({})
  })
  it('should return { } for { foo: jpv("bar") }, { bar: null }', () => {
    expect(extractFilteringEmpties({foo: jpv('bar')}, [null], {bar: null})).toEqual({})
  })
  it('should return { foo: 1 } for { body: {foo: null} }, {foo: jpv("body.foo")}', () => {
    expect(extractFilteringEmpties({foo: jpv('body.foo')}, [null], {body: {foo: null}})).toEqual({})
  })

  it('should return { } for { foo: null }, { foo: jpv("foo") }', () => {
    expect(extractFilteringEmpties({foo: jpv('foo')}, [null], {foo: undefined})).toEqual({foo: undefined})
  })
  it('should return { } for { foo: jpv("bar"), bar: jpv("foo") }, { bar: null, foo: undefined }', () => {
    expect(extractFilteringEmpties({foo: jpv('bar'), bar: jpv('foo')}, [null], {
      bar: null,
      foo: undefined
    })).toEqual({bar: undefined})
  })
  it('should return { } for { foo: jpv("bar") }, { bar: undefined }', () => {
    expect(extractFilteringEmpties({foo: jpv('bar')}, [null], {bar: undefined})).toEqual({foo: undefined})
  })
  it('should return { foo: 1 } for { body: {foo: null} }, {foo: jpv("body.foo")}', () => {
    expect(extractFilteringEmpties({foo: jpv('body.foo')}, [null], {body: {foo: undefined}})).toEqual({foo: undefined})
  })

  it('should return { } for { foo: undefined }, { foo: jpv("foo") }', () => {
    expect(extractFilteringEmpties({foo: jpv('foo')}, [undefined, null], {foo: undefined})).toEqual({})
  })
  it('should return { } for { foo: jpv("bar") }, { bar: undefined }', () => {
    expect(extractFilteringEmpties({foo: jpv('bar')}, [undefined, null], {bar: undefined})).toEqual({})
  })
  it('should return { foo: 1 } for { body: {foo: undefined} }, {foo: jpv("body.foo")}', () => {
    expect(extractFilteringEmpties({foo: jpv('body.foo')}, [undefined, null], {body: {foo: undefined}})).toEqual({})
  })

  it('should return { foo: { bar: 5 } for { foo: { bar: jpv("body") }}, { body: 5 } in curried form relying on defaults', () => {
    expect(extractFilteringEmpties({foo: {bar: jpv('body')}})({body: 5})).toEqual({foo: {bar: 5}})
  })
  it('should return { foo: { bar: 1 } for { foo: { bar: jpv("body") }}, { body: 1, pathParamters: "7" } in curried form relying on defaults', () => {
    expect(extractFilteringEmpties({foo: {bar: jpv('body')}})({
      body: 1,
      pathParamters: '7'
    })).toEqual({foo: {bar: 1}})
  })
  it('should return { } for { foo: { bar: jpv("body") }}, { blub: 1, pathParamters: "7" } in curried form relying on defaults', () => {
    expect(extractFilteringEmpties({foo: {bar: jpv('body')}})({
      blub: 1,
      pathParamters: '7'
    })).toEqual({foo: {bar: undefined}})
  })

  it('should return { } for { foo: null }, { foo: jpv("foo") }', () => {
    expect(extractFilteringEmpties({foo: jpv('foo')}, [undefined, null], {foo: null})).toEqual({})
  })
  it('should return { } for { foo: jpv("bar") }, { bar: null }', () => {
    expect(extractFilteringEmpties({foo: jpv('bar')}, [undefined, null], {bar: null})).toEqual({})
  })
  it('should return { foo: 1 } for { body: {foo: null} }, {foo: jpv("body.foo")}', () => {
    expect(extractFilteringEmpties({foo: jpv('body.foo')}, [undefined, null], {body: {foo: null}})).toEqual({})
  })

  it('should return { foo: { bar: 5 } for { foo: { bar: jpv("body") }}, { body: 5 } in curried form', () => {
    expect(extractFilteringEmpties({foo: {bar: jpv('body')}}, [undefined, null])({body: 5})).toEqual({foo: {bar: 5}})
  })
  it('should return { foo: { bar: 1 } for { foo: { bar: jpv("body") }}, { body: 1, pathParamters: "7" } in curried form', () => {
    expect(extractFilteringEmpties({foo: {bar: jpv('body')}}, [undefined, null])({
      body: 1,
      pathParamters: '7'
    })).toEqual({foo: {bar: 1}})
  })
  it('should return { } for { foo: { bar: jpv("body") }}, { blub: 1, pathParamters: "7" } in curried form', () => {
    expect(extractFilteringEmpties({foo: {bar: jpv('body')}}, [undefined, null])({
      blub: 1,
      pathParamters: '7'
    })).toEqual({foo: {bar: undefined}})
  })
})
