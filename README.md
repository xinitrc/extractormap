## About 

ExtractorMap is a utility library to extract the properties of an input object 
and map those to a given new structure, allowing for transformation of those properties
in the process.

## Installation

```bash
$ npm install --save @jungehaie/extractormap
```

## Usage

An  Extractor map ```ExtractorMap<T>``` of a type ```T``` has the same ```keys``` as
```T``` but for every value provides a function extracting the corresponding value of 
```T``` from a given input.

An ```ExtractorMap<T>``` is therefore specific to the ```source``` of the data as well as
to the type of the resulting object ```T```.

### ExtractorMap by example

Given type target type ```T```:

```typescrip
{
  "foo": number,
  "bar": string
}
```

and an input 

```json
{
  "qux": 1,
  "quux": "2",
}
```

An ```ExractorMap<T>``` could be

```typescript
{
  "foo": (input: object) => input['qux'],
  "bar": (input: object) => input['quux']
}
```

### Extract

The library provides two ways to extract the target object from the structure:

#### ```extract<T>(map: ExtractorMap<T>, input: data): T```
Returns a eagerly constructed object of type ```T``` that is returnded from ```extract```.

#### ```createExtractingProxy<T>(map: ExtractorMap<T>, input: data): T```
Returns a proxy object of type ```T``` which allows for accessing the properies of ```T`` via getter. The proxy
extracts the values on demand therefore will appear as an empty object when access as whole.

Given the three objects given above one could do the following:

```typescript
const target: T = extract<T>(extractorMap, input);
```

**Hint:** ```extract``` and ```createExtractingProxy``` can also be called in curried form. 


In addition there is a version of extract that allows for filtering values that are defined as empty:
#### ```extractFilteringEmptys<T>(map: ExtractorMap<T>, input: data): T```
Returns a eagerly constructed object of type ```T``` that is returnded from ```extractFilteringEmptys```. Any value
contained in  ```valuesInterpretedasEmpty``` will result in the corresponding key not being present in the resulting
object.

### Helper functions

To simplify the construction of ExtractorMaps the library also provides some helper functions:

#### ```jpv<T>(jsonPath: string, converterFunction?: (object: any) => T): (input: object => T)```  
Given a ```json path``` and an optional result transformer which defaults to the identity function, returns a function that returns the first
(transformed) matching properites value.
#### ```jpq<T>(jsonPath: string, converterFunction?: (object: any) => T): (input: object => T)```  
Given a ```json path``` 
and an optional result transformer which defaults to the identity function, returns a function that returns a
array of all (transformed) properties value that match.
#### ```jpa<T>(jsonPath: string, converterFunction?: (object: any) => T): (input: object => T)```:  
Given a ```json path``` 
and an optional result transformer which defaults to the identity function, returns a function that returns a
(transformed) array of all properties value that match.
#### ```constant<T>(value: T): (input: object => T)```:   
Will return a function returning the given constant discregarding the input object completely.
#### ```pickMapGenerator<T>(keys: Array<keyof T>): ExtractorMap<Partial<T>>``` 
Will return an ExtractorMap that extracts the untransformed value of any key contained in the keys array and puts this
value under the key by the same name in the output object.


Given those helper functions the ExtractorMap from above could have been written as:

```typescript
{
  "foo": jpv('qux'),
  "bar": jpv('quux')
}
```

another ```ExtractorMap<T>``` could be. 

```typescript
{
  "foo": jpv('quux', x => parseInt(x, 10)),
  "bar": constant('Quux')
}
```

In addition to the given functions abouve there are the followinn converter functions

#### ```identity<T>(x: T): T```:
Returning the input as output. Ususally only necessary as the default value for the convert function in ```jpv```, 
```jpq```, ```jpa```, but might be of use to construct your own ExtractorFunction helper.
#### ```defaultTo<T>(x: T, forVals?: any[]):T```
Returning T if the previous result is a value provided in the ```forVals```. If no ```forVals``` are provided
only ```undefind``` will be used.

### Embeded Structures
More complex target data structures allow for two distinct ways of providing an ```ExtractorMap```

```typescript
{
  foo: number,
  bar:  {
    first: string,
    second: number 
  }
}
```

Can be extracted with an ```ExtractorMap``` like this:

```typescript
{
  foo: jpv('qux'),
  bar:  jpv('quux')
}
```

or 

```typescript
{
  foo: jpv('qux'),
  bar:  {
    first: jpv('quux.first'),
    second: jpv('quux.second') 
  }
}
```
