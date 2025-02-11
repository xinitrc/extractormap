## About 

ExtractorMap is a utility library to extract the properties of an input object 
and map those to a given new structure, allowing for transformation of those properties
in the process.

## Installation

```bash
$ npm install --save @jungehaie/extractormap
```

## Usage

An  Extractor map ```ExtractorMap<T, S extends Record<string, any> = any>``` of a type ```T``` has the same ```keys``` as
```T``` but for every value provides a function extracting the corresponding value of 
```T``` from a given input of type ```S```.

An ```ExtractorMap<T, S>``` is therefore specific to the ```source``` of the data as well as
to the type of the resulting object ```T```.

From the type defintion you can see you can omit the type of the input ```S``` can be omitted, which will result in less typesafety.

### ExtractorMap by example

Given a target type ```T```:

```typescript
{
  "foo": number,
  "bar": string
}
```

and an input (```S```)

```json
{
  "qux": 1,
  "quux": "2",
}
```

An ```ExractorMap<T, S>``` could be

```typescript
{
  "foo": (input: S) => input['qux'],
  "bar": (input: S) => input['quux']
}
```

### Extract

The library provides two ways to extract the target object from the structure:

#### ```extract<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>, input: S): T```
Returns an eagerly constructed object of type ```T``` that is returnded from ```extract```.

#### ```createExtractingProxy<T, S extends Record<string, any> = any>(map: ExtractorMap<T>, input: S): T```
Returns a proxy object of type ```T``` which allows for accessing the properties of ```T`` via getter. The proxy
extracts the values on demand therefore will appear as an empty object when access as whole.

Given the three objects given above one could do the following:

```typescript
const target: T = extract<T, S>(extractorMap, input);
```

**Hint:** ```extract``` and ```createExtractingProxy``` can also be called in curried form. 


In addition there is a version of extract that allows for filtering values that are defined as empty:
#### ```extractFilteringEmptys<T, S extends Record<string, any> = any>(map: ExtractorMap<T, S>, input: S): T```
Returns an eagerly constructed object of type ```T``` that is returnded from ```extractFilteringEmptys```. Any value
contained in  ```valuesInterpretedasEmpty``` will result in the corresponding key not being present in the resulting
object.

### Helper functions

To simplify the construction of ExtractorMaps the library also provides some helper functions:

#### ```jpv<T, S extends Record<string, any> = any, I = T>(jsonPath: string, converterFunction?: (object: I) => T): (input: S => T)```  
Given a ```json path``` and an optional result transformer which defaults to the identity function, returns a function that returns the first (transformed) matching properites value.
#### ```jpq<T>(jsonPath: string, converterFunction?: (object: any) => T): (input: object => T)```  
Given a ```json path``` 
and an optional result transformer which defaults to the identity function, returns a function that returns an
array of all (transformed) properties value that match.
#### ```jpa<T>(jsonPath: string, converterFunction?: (object: any[]) => T): (input: object => T)```:  
Given a ```json path``` 
and an optional result transformer which defaults to the identity function, returns a function that returns a
(transformed) array of all properties value that match.
#### ```constant<T>(value: T): (input: unknown => T)```:   
Will return a function returning the given constant disregarding the input object completely.
#### ```pickMapGenerator<T, S extends Record<string, any> = any>(keys: ReadonlyArray<keyof T & keyof S>): ExtractorMap<Pick<T, typeof keys[number]>>``` 
Will return an ExtractorMap that extracts the untransformed value of any key contained in the keys array and puts this  value under the key by the same name in the output object.


Given those helper functions the ExtractorMap from above could have been written as:

```typescript
{
  "foo": jpv('qux'),
  "bar": jpv('quux')
}
```

another ```ExtractorMap<T, S>``` could be. 

```typescript
{
  "foo": jpv('quux', x => parseInt(x, 10)),
  "bar": constant('Quux')
}
```

In addition to the given functions above there are the followinn converter functions

#### ```identity<T>(x: T): T```:
Returning the input as output. Ususally only necessary as the default value for the convert function in ```jpv```, 
```jpq```, ```jpa```, but might be of use to construct your own ExtractorFunction helper.
#### ```defaultTo<T>(x: T, forVals?: any[]):T```
Returning T if the previous result is a value provided in the ```forVals```. If no ```forVals``` are provided
only ```undefind``` will be used.


### Shortcuts and additional functionality

Since using ```jpv("jsonpath")``` is by far the most used function there is a shortcut. As long as you don't need a conversion function you can just write the given jsonpath as a string. 

So this ```ExtractorMap```

```typescript
{
  "foo": jpv('qux'),
  "bar": jpv('quux')
}
```

is equivalent to this ```ExtractorMap```

```typescript
{
  "foo": 'qux',
  "bar": 'quux'
}
```

If you provide a definition of your source type all functions where this is possible (e.g. ```jpv``` and directly providing a ```jsonpath```) will provide type ahead and type checking for the jsonpath such that only pathes to correct type of your source object are allowed.


### Embeded Structures
Since most source and target data strucutes differ in their structure. The above construction would not be very helpful for complex times. For these structures ExtractorMaps can be nested into each other. For a target object like the following:

```typescript
{
  foo: number,
  bar:  {
    first: string,
    second: number 
  }
}
```

We don't necessarily need to write the following ```ExtractorMap``` like this:

```typescript
{
  foo: jpv('qux'),
  bar:  jpv('quux')
}
```

but could use the following nested structure. 

```typescript
{
  foo: jpv('qux'),
  bar:  {
    first: jpv('quux.first'),
    second: jpv('quux.second') 
  }
}
```

This ist obviously more helpful should the source need to be transformed. 