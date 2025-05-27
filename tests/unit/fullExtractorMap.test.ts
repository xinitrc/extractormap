import {constant, jpa, jpq, jpv, extract, createExtractingProxy} from '../../src';

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

it('should return { foo: 1 } for { foo: 1 }, { foo: jpv("foo") }', () => {
  expect(extract<{foo: number }>({foo: jpv('foo')}, {foo: 1})).toEqual({foo: 1});
});
it('should return { foo: 1 } for { bar: 1 }, { foo: jpv("bar") }', () => {
  expect(extract<{foo: number }>({foo: jpv('bar')}, {bar: 1})).toEqual({foo: 1});
});
it('should return { foo: 1 } for { body: 1 }, { foo: jpv("body") }', () => {
  expect(extract<{foo: number }>({foo: jpv('body')}, {body: 1})).toEqual({foo: 1});
});
it('should return { foo: 1 } for { body: "1" }, { foo: jpv("body", x => parseInt(x, 10) }', () => {
  expect(extract<{foo: number}>({foo: jpv('body', (x: string) => parseInt(x, 10))}, {body: '1', bar: 1})).toEqual({foo: 1});
});
it('should return { foo: 1 } for { body: 1 }, {foo: jpv("body""foo")}', () => {
  expect(extract<{foo: number }>({foo: jpv('body.foo')}, {body: {foo: 1}})).toEqual({foo: 1});
});
it('should return { foo: 1 } for { body: 1 }, {foo: 1 }', () => {
  expect(extract<{foo: number }>({foo: constant(1)}, {body: {foo: 5}})).toEqual({foo: 1});
});
it('should return { foo: [1, 2, 3] } for { foo: jpv("body") }, { body: [1, 2, 3] }', () => {
  expect(extract<{foo: number }>({foo: jpv('body')}, {body: [1, 2, 3]})).toEqual({foo: [1, 2, 3]});
});
it('should return { foo: "Stryker was here" } for { foo: jpv("body") }, { body: "Stryker was here" }', () => {
  expect(extract<{foo: string }>({foo: jpv('body')}, {body: 'Stryker was here'})).toEqual({foo: 'Stryker was here'});
});

it('should return { foo: [1, 2, 3] } for { foo: jpq("$..key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}}', () => {
  expect(extract<{foo: number[] }>({foo: jpq('$..key0')}, {
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  })).toEqual({foo: [1, 2, 3]});
});
it('should return { foo: [1, 2, 3] } for { foo: jpv("body.key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}}', () => {
  expect(extract<{foo: number }>({foo: jpv('body.key0')}, {
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  })).toEqual({foo: 1});
});
it('should return { foo: 2 } for { foo: jpv("body"".[?(@.key0 > 1)].key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}}', () => {
  expect(extract<{foo: any}>({foo: jpv('body.[?(@.key0 > 1)].key0')}, {
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  })).toEqual({foo: 2});
});
it('should return { foo: 6 } for { foo: jpc("$..[?(@.key0 > 1)].key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}}', () => {
  expect(extract<{foo: number[] }>({foo: jpq('$..[?(@.key0 > 1)].key0')}, {
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  })).toEqual({foo: [2, 3]});
});
it('should return { foo: 6 } for { foo: jpq("$..key0", x => parseInt(x, 10)) }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}}', () => {
  expect(extract<{foo: number[] }>({foo: jpq('$..key0', s2n)}, {
    body: {
      key0: '1',
      key1: {key0: '2'},
      key2: {key0: '3'}
    }
  })).toEqual({foo: [1, 2, 3]});
});
it('should return { foo: 6 } for { foo: jpa("$..key0", x => x.reduce((a, b) => a + b, 0)) }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}}', () => {
  expect(extract<{foo: number }>({foo: jpa('$..key0', reduceGenerator((a: number, b: number): number => a + b, 0))}, {
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  })).toEqual({foo: 6});
});
it('should return { foo: 6 } for { foo: jpa("$..key0", x => x.reduce((a, b) => a * b, 1)) }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}}', () => {
  expect(extract<{foo: number }>({foo: jpa('$..key0', reduceGenerator((a: number, b: number): number => a * b, 1))}, {
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  })).toEqual({foo: 6});
});

it('should return { foo: { bar: 5 } for { foo: { bar: jpv("body") }}, { body: 5 }', () => {
  expect(extract<{foo: { bar: number }}>({foo: {bar: jpv('body')}}, {body: 5})).toEqual({foo: {bar: 5}});
});
it('should return { foo: { bar: 1 } for { foo: { bar: jpv("body") }}, { body: 1, pathParameters: "7" }', () => {
  expect(extract<{foo: {bar: number }}>({foo: {bar: jpv('body')}}, {body: 1, pathParameters: '7'})).toEqual({foo: {bar: 1}});
});
it('should return { } for { foo: { bar: jpv("body") }}, { key0: 1, pathParameters: "7" }', () => {
  expect(extract<{foo: { bar: any }}>({foo: {bar: jpv('body')}}, {key0: 1, pathParameters: '7'})).toEqual({foo: {bar: undefined}});
});

it('should return { foo: { bar: 5 } for { foo: jpv("bar") }, { bar: { bar: 5 } }', () => {
  expect(extract<{foo: { bar: number }}, {bar: { bar: number }}>({foo: jpv('bar')}, {bar: { bar: 5} })).toEqual({foo: {bar: 5}});
});
it('should return { foo: { bar: 5 } for { foo: "bar" }, { bar: { bar: 5 } }', () => {
  expect(extract<{foo: { bar: number }}, {bar: {bar: number}}>({foo: 'bar'}, {bar: { bar: 5} })).toEqual({foo: {bar: 5}});
});


it('should return { foo: 1 } for { foo: 1 }, { foo: jpv("foo") } in curried form', () => {
  expect(extract<{foo: { bar: any }}>({foo: jpv('foo')})({foo: 1})).toEqual({foo: 1});
});
it('should return { foo: 1 } for { bar: 1 }, { foo: jpv("bar") } in curried form', () => {
  expect(extract<{foo: {bar: number }}>({foo: jpv('bar')})({bar: 1})).toEqual({foo: 1});
});
it('should return { foo: 1 } for { body: 1 }, { foo: jpv("body") } in curried form', () => {
  expect(extract<{foo: {bar: number }}>({foo: jpv('body')})({body: 1})).toEqual({foo: 1});
});
it('should return { foo: 1 } for { body: "1" }, { foo: jpv("body", x => parseInt(x, 10) } in curried form', () => {
  expect(extract<{foo: number}, {body: string}>({foo: jpv('body', (x: string): number => parseInt(x, 10))})({body: '1'})).toEqual({foo: 1});
});
it('should return { foo: 1 } for { body: 1 }, {foo: jpv("body""foo")} in curried form', () => {
  expect(extract<{foo: number}, {body: {foo: number }}>({foo: jpv('body.foo')})({body: {foo: 1}})).toEqual({foo: 1});
});
it('should return { foo: 1 } for { body: 1 }, {foo: 1 } in curried form', () => {
  expect(extract<{foo: number}>({foo: constant(1)})({body: {foo: 5}})).toEqual({foo: 1});
});
it('should return { foo: [1, 2, 3] } for { foo: jpv("body") }, { body: [1, 2, 3] } in curried form', () => {
  expect(extract<{foo: any[]}>({foo: jpv('body')})({body: [1, 2, 3]})).toEqual({foo: [1, 2, 3]});
});
it('should return { foo: [1, 2, 3] } for { foo: jpq("$..key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}} in curried form', () => {
  expect(extract<{foo: number[]}>({foo: jpq('$..key0')})({
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  })).toEqual({foo: [1, 2, 3]});
});
it('should return { foo: [1, 2, 3] } for { foo: jpv("body"".key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}} in curried form', () => {
  expect(extract<{foo: number[]}>({foo: jpv('body.key0')})({
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  })).toEqual({foo: 1});
});
it('should return { foo: 2 } for { foo: jpv("body"".[?(@.key0 > 1)].key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}} in curried form', () => {
  expect(extract<{foo: number[]}>({foo: jpv('body.[?(@.key0 > 1)].key0')})({
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  })).toEqual({foo: 2});
});
it('should return { foo: 6 } for { foo: jpq("$..[?(@.key0 > 1)].key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}} in curried form', () => {
  expect(extract<{foo: number[]}>({foo: jpq('$..[?(@.key0 > 1)].key0')})({
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  })).toEqual({foo: [2, 3]});
});
it('should return { foo: 6 } for { foo: jpq("$..key0", x => parseInt(x, 10)) }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}} in curried form', () => {
  expect(extract<{ foo: number[] }>({ foo: jpq('$..key0', s2n) })({
    body: {
      key0: '1',
      key1: {key0: '2'},
      key2: {key0: '3'}
    }
  })).toEqual({foo: [1, 2, 3]});
});

it('should return { foo: 6 } for { foo: jpa("$..key0", x => x.reduce((a, b) => a + b, 0)) }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}} in curried form', () => {
  expect(extract<{foo: number}>({foo: jpa('$..key0', reduceGenerator((a: number, b: number): number => a + b, 0))})({
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  })).toEqual({foo: 6});
});
it('should return { foo: 6 } for { foo: jpa("$..key0", x => x.reduce((a, b) => a * b, 1)) }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}} in curried form', () => {
  expect(extract<{foo: number}>({foo: jpa('$..key0', (x: any[]): number => x.reduce((a: number, b: any): number => a * b, 1))})({
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  })).toEqual({foo: 6});
});

it('should return { foo: { bar: 5 } for { foo: { bar: jpv("body") }}, { body: 5 } in curried form', () => {
  expect(extract<{foo: { bar: number }}>({foo: {bar: jpv('body')}})({body: 5})).toEqual({foo: {bar: 5}});
});
it('should return { foo: { bar: 1 } for { foo: { bar: jpv("body") }}, { body: 1, pathParameters: "7" } in curried form', () => {
  expect(extract<{foo: { bar: number }}>({foo: {bar: jpv('body')}})({body: 1, pathParameters: '7'})).toEqual({foo: {bar: 1}});
});
it('should return { } for { foo: { bar: jpv("body") }}, { key0: 1, pathParameters: "7" } in curried form', () => {
  expect(extract<{foo: { bar: number }}>({foo: {bar: jpv('body')}})({key0: 1, pathParameters: '7'})).toEqual({foo: {bar: undefined}});
});
it('should return { foo: 1 } for { foo: 1 }, { foo: jpv("foo") }', () => {
  expect(createExtractingProxy({foo: jpv('foo')}, {foo: 1}).foo).toEqual(1);
});
it('should return { foo: 1 } for { bar: 1 }, { foo: jpv("bar") }', () => {
  expect(createExtractingProxy({foo: jpv('bar')}, {bar: 1}).foo).toEqual(1);
});
it('should return { foo: 1 } for { body: 1 }, { foo: jpv("body") }', () => {
  expect(createExtractingProxy({foo: jpv('body')}, {body: 1}).foo).toEqual(1);
});
it('should return { foo: 1 } for { body: "1" }, { foo: jpv("body", x => parseInt(x, 10) }', () => {
  expect(createExtractingProxy({foo: jpv('body', (x: string) => parseInt(x, 10))}, {body: '1'}).foo).toEqual(1);
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
it('should return { foo: [1, 2, 3] } for { foo: jpq("$..key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}}', () => {
  expect(createExtractingProxy({foo: jpq('$..key0')}, {
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  }).foo).toEqual([1, 2, 3]);
});
it('should return { foo: [1, 2, 3] } for { foo: jpv("body"".key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}}', () => {
  expect(createExtractingProxy({foo: jpv('body.key0')}, {
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  }).foo).toEqual(1);
});
it('should return { foo: 2 } for { foo: jpv("body"".[?(@.key0 > 1)].key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}}', () => {
  expect(createExtractingProxy<{foo: number[]}>({foo: jpv('body.[?(@.key0 > 1)].key0')}, {
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  }).foo).toEqual(2);
});
it('should return { foo: 6 } for { foo: jpc("$..[?(@.key0 > 1)].key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}}', () => {
  expect(createExtractingProxy<{foo: number[]}>({foo: jpq('$..[?(@.key0 > 1)].key0')}, {
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  }).foo).toEqual([2, 3]);
});
it('should return { foo: 6 } for { foo: jpq("$..key0", x => parseInt(x, 10)) }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}}', () => {
  expect(createExtractingProxy<{foo: number[]}>({foo: jpq('$..key0', s2n)}, {
    body: {
      key0: '1',
      key1: {key0: '2'},
      key2: {key0: '3'}
    }
  }).foo).toEqual([1, 2, 3]);
});
it('should return { foo: 6 } for { foo: jpa("$..key0", x => x.reduce((a, b) => a + b, 0)) }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}}', () => {
  expect(createExtractingProxy<{foo: number}>({foo: jpa('$..key0', reduceGenerator((a: number, b: number): number => a + b, 0))}, {
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  }).foo).toEqual(6);
});
it('should return { foo: 6 } for { foo: jpa("$..key0", x => x.reduce((a, b) => a * b, 1)) }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}}', () => {
  expect(createExtractingProxy<{foo: number}>({foo: jpa('$..key0', reduceGenerator((a: number, b: any): number => a * b, 1))}, {
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  }).foo).toEqual(6);
});

it('should return { foo: { bar: 5 } for { foo: { bar: jpv("body") }}, { body: 5 }', () => {
  expect(createExtractingProxy<{foo: { bar: number }}>({foo: {bar: jpv('body')}}, {body: 5}).foo).toEqual({bar: 5});
});
it('should return { foo: { bar: 1 } for { foo: { bar: jpv("body") }}, { body: 1, pathParameters: "7" }', () => {
  expect(createExtractingProxy<{foo: { bar: number }}>({foo: {bar: jpv('body')}}, {body: 1, pathParameters: '7'}).foo).toEqual({bar: 1});
});
it('should return { } for { foo: { bar: jpv("body") }}, { key0: 1, pathParameters: "7" }', () => {
  expect(createExtractingProxy<{foo: { bar: number }}>({foo: {bar: jpv('body')}}, {key0: 1, pathParameters: '7'}).foo).toEqual({bar: undefined});
});
it('should return { } for { foo: { bar: jpv("body") }}, { key0: 1, pathParameters: "7" }', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
  expect(() => (createExtractingProxy<{foo: { bar: number }}>({foo: {bar: jpv('body')}}, {key0: 1, pathParameters: '7'}) as any).key0).toThrow();
});
it('should return { } for { foo: { bar: jpv("body") }}, { key0: 1, pathParameters: "7" }', () => {
  /* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return */
  expect(() => (createExtractingProxy<{foo: { bar: number }}>({foo: {bar: jpv('body')}}, {
    key0: 1,
    pathParameters: '7'
  }) as any).key0).toThrow('Property "key0" does not exist.');
  /* eslint-enable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return */
});

it('should return { foo: 1 } for { foo: 1 }, { foo: jpv("foo") } in curried form', () => {
  expect(createExtractingProxy<{foo: number}>({foo: jpv('foo')})({foo: 1}).foo).toEqual(1);
});
it('should return { foo: 1 } for { bar: 1 }, { foo: jpv("bar") } in curried form', () => {
  expect(createExtractingProxy<{foo: number }>({foo: jpv('bar')})({bar: 1}).foo).toEqual(1);
});
it('should return { foo: 1 } for { body: 1 }, { foo: jpv("body") } in curried form', () => {
  expect(createExtractingProxy<{foo: number }>({foo: jpv('body')})({body: 1}).foo).toEqual(1);
});
it('should return { foo: 1 } for { body: "1" }, { foo: jpv("body", x => parseInt(x, 10) } in curried form', () => {
  expect(createExtractingProxy<{foo: number }>({foo: jpv('body', (x: string) => parseInt(x, 10))})({body: '1'}).foo).toEqual(1);
});
it('should return { foo: 1 } for { body: 1 }, {foo: jpv("body""foo")} in curried form', () => {
  expect(createExtractingProxy<{foo: number }>({foo: jpv('body.foo')})({body: {foo: 1}}).foo).toEqual(1);
});
it('should return { foo: 1 } for { body: 1 }, {foo: 1 } in curried form', () => {
  expect(createExtractingProxy<{foo: number }>({foo: constant(1)})({body: {foo: 5}}).foo).toEqual(1);
});
it('should return { foo: [1, 2, 3] } for { foo: jpv("body") }, { body: [1, 2, 3] } in curried form', () => {
  expect(createExtractingProxy<{foo: number }>({foo: jpv('body')})({body: [1, 2, 3]}).foo).toEqual([1, 2, 3]);
});
it('should return { foo: [1, 2, 3] } for { foo: jpq("$..key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}} in curried form', () => {
  expect(createExtractingProxy<{foo: number[] }>({foo: jpq('$..key0')})({
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  }).foo).toEqual([1, 2, 3]);
});
it('should return { foo: [1, 2, 3] } for { foo: jpv("body"".key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}} in curried form', () => {
  expect(createExtractingProxy<{foo: number }>({foo: jpv('body.key0')})({
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  }).foo).toEqual(1);
});
it('should return { foo: 2 } for { foo: jpv("body"".[?(@.key0 > 1)].key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}} in curried form', () => {
  expect(createExtractingProxy<{foo: number }>({foo: jpv('body.[?(@.key0 > 1)].key0')})({
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  }).foo).toEqual(2);
});
it('should return { foo: 6 } for { foo: jpc("$..[?(@.key0 > 1)].key0") }, { body: { key0: 1, key1: {key0: 2}, key2: {key0: 3}}}} in curried form', () => {
  expect(createExtractingProxy<{foo: number[] }>({foo: jpq('$..[?(@.key0 > 1)].key0')})({
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  }).foo).toEqual([2, 3]);
});
it('should return { foo: 6 } for { foo: jpq("$..key0", x => parseInt(x, 10)) }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}} in curried form', () => {
  expect(createExtractingProxy<{foo: number[] }>({foo: jpq('$..key0', s2n)})({
    body: {
      key0: '1',
      key1: {key0: '2'},
      key2: {key0: '3'}
    }
  }).foo).toEqual([1, 2, 3]);
});

it('should return { foo: 6 } for { foo: jpa("$..key0") }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}} in curried form', () => {
  expect(createExtractingProxy<{foo: number }>({foo: jpa('$..key0')})({
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  }).foo).toEqual([1, 2, 3]);
});
it('should return { foo: 6 } for { foo: jpa("$..key0", x => x.reduce((a, b) => a + b, 0)) }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}} in curried form', () => {
  expect(createExtractingProxy<{foo: number }>({foo: jpa('$..key0', reduceGenerator((a: number, b: number): number => a + b, 0))})({
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  }).foo).toEqual(6);
});
it('should return { foo: 6 } for { foo: jpa("$..key0", x => x.reduce((a, b) => a * b, 1)) }, { body: { key0: "1", key1: {key0: "2"}, key2: {key0: "3"}}}} in curried form', () => {
  expect(createExtractingProxy<{foo: number }>({foo: jpa('$..key0', reduceGenerator((a: number, b: any): number => a * b, 1))})({
    body: {
      key0: 1,
      key1: {key0: 2},
      key2: {key0: 3}
    }
  }).foo).toEqual(6);
});

it('should return { foo: { bar: 5 } for { foo: { bar: jpv("body") }}, { body: 5 } in curried form', () => {
  expect(createExtractingProxy<{foo: {bar: number } }>({foo: {bar: jpv('body')}})({body: 5}).foo).toEqual({bar: 5});
});
it('should return { foo: { bar: 1 } for { foo: { bar: jpv("body") }}, { body: 1, pathParameters: "7" } in curried form', () => {
  expect(createExtractingProxy<{foo: {bar: number } }>({foo: {bar: jpv('body')}})({body: 1, pathParameters: '7'}).foo).toEqual({bar: 1});
});
it('should return { } for { foo: { bar: jpv("body") }}, { key0: 1, pathParameters: "7" } in curried form', () => {
  expect(createExtractingProxy<{foo: {bar: number } }>({foo: {bar: jpv('body')}})({key0: 1, pathParameters: '7'}).foo).toEqual({bar: undefined});
});
it('should return throw for { foo: { bar: jpv("body") }}, { key0: 1, pathParameters: "7" } in curried form accessing nonExisting key', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
  expect(() => (createExtractingProxy<{foo: {bar: number } }>({foo: {bar: jpv('body')}})({key0: 1, pathParameters: '7'}) as any).key0).toThrow();
});
it('should return throw for { foo: { bar: jpv("body") }}, { key0: 1, pathParameters: "7" } in curried form accessing nonExisting key', () => {
  /* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return */
  expect(() => (createExtractingProxy<{foo: {bar: number } }>({foo: {bar: jpv('body')}})({
    key0: 1,
    pathParameters: '7'
  }) as any).key0).toThrow('Property "key0" does not exist.');
  /* eslint-enable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return */
});

describe('with string as defaultValue for jpv', () => {
  const payload = {
    existingValue: 1
  };

  test('a string as value yields the same result as jpv when the queried jsonpath value is not undefined', () => {
    expect(extract<{foo: number}, {existingValue: number}>({ foo: 'existingValue' })(payload)).toEqual(extract<{foo: number}, typeof payload>({foo: jpv('existingValue')})(payload));
  });

  test('a string as value yields the same result as jpv when the queried jsonpath value is undefined', () => {
    expect(extract<{foo: number}>({foo: 'notExistingValue'})(payload)).toEqual(extract<{foo: number}>({foo: jpv('notExistingValue')})(payload));
  });
});
