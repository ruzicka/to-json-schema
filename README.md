[![npm version](https://badge.fury.io/js/to-json-schema.svg)](https://badge.fury.io/js/to-json-schema)
[![Build Status](https://travis-ci.org/ruzicka/to-json-schema.svg?branch=master)](https://travis-ci.org/ruzicka/to-json-schema)
[![Coverage Status](https://coveralls.io/repos/github/ruzicka/to-json-schema/badge.svg?branch=master)](https://coveralls.io/github/ruzicka/to-json-schema?branch=master)

# to-json-schema

Converts javascript objects (and other types) to corresponding JSON schema

## Install

```
npm install to-json-schema
```

## Example usage
```javascript
const toJsonSchema = require('to-json-schema');

const objToBeConverted = {
  name: 'David',
  rank: 7,
  born: '1990-04-05T15:09:56.704Z',
  luckyNumbers: [7, 77, 5]
};

const schema = toJsonSchema(objToBeConverted);
```

`schema` generated from above code will look like this:

```javascript
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "rank": {
      "type": "integer"
    },
    "born": {
      "type": "string",
      "format": "date-time"
    },
    "luckyNumbers": {
      "type": "array",
      "items": {
        "type": "integer"
      }
    }
  }
}
```

## `toJsonSchema(value, options)`

`to-json-schema` exports function that converts most javascript values to JSON schema. Such a schema can be used to
further validation of similar objects/values

* `value`: **required** Any javascript value
* `options`: optional options object   

## Options

### Common options

Possible option values

**required**
(`true|false` default is `false`)
specify `true` to make all properties required.

```javascript
const schema = toJsonSchema(33, {required: false});
/*
{
  "type": "integer"
}
*/
```

```javascript
const schema = toJsonSchema(33, {required: true});
/*
{
  "type": "integer",
  "required": true
}
*/
```

**postProcessFnc** (`function`)

parameters:
- type (string) - JSON schema type of the `value`
- schema (object) - Generated JSON schema
- value - (any) - input value 
- defaultFunc (function) - standard function that is used to post-process generated schema. Takes the `type`, `schema`, `value` params.

By providing `postProcessFnc`, you can modify or replace generated schema. This function
will be called recursively for all the properties and sub-properties and array items from leaves to the root.
If you want to preserve default functionality, don't forget to call defaultFunc which is currently responsible for setting
`required` for the schema items if there is common option `required` set tu true.   


Following example is showing configuration options leading to all integer values to be automatically required

```javascript
const options = {
  postProcessFnc: (type, schema, value, defaultFunc) =>
    (type === 'integer') ? {...schema, required: true} : defaultFunc(type, schema, value),
}

const instance = {
  a: 1,
  b: 'str',
}

const schema = toJsonSchema(instance, options);
/*
{
  type: 'object',
  properties: {
    a: {type: 'integer', required: true},
    b: {type: 'string'},
  },
}*/
```

 
### Arrays options

**arrays.mode** (`all|first|uniform|tuple` default is `all`)
  
`all` option causes parser to go through all array items, finding the most compatible yet most descriptive schema possible. 

Array items are all of compatible type:

```javascript
const arr = [33, 44, 55];
const schema = toJsonSchema(arr, {arrays: {mode: 'all'}});
/*
{
  "type": "array",
  "items": {
    "type": "integer"
  }
}
*/
```

Items' types are incompatible. Type is omitted in schema to be able to validate input object:

```javascript
const arr = [33, 'str', 55];
const schema = toJsonSchema(arr, {arrays: {mode: 'all'}});
/* 
{
  "type": "array"
}
*/
```

Incompatible in sub-item. Schema still describes object properties

```javascript
const arr = [
  {name: 'john', grades: [1, 2, 3]},
  {name: 'david', grades: ['a', 'b', 'c']}
];
const schema = toJsonSchema(arr, {arrays: {mode: 'all'}});
/*
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string"
      },
      "grades": {
        "type": "array" // due to incompatible array items' types, `items` field is omitted
      }
    }
  }
}
*/
```

`first` option takes only first item in the array into account. If performance
 is a concern, you may consider this option. 

```javascript
const arr = ['str', 11, 30];
const schema = toJsonSchema(arr, {arrays: {mode: 'first'}});
/* Other than first array item is ignored
{
  "type": "array",
  "items": {
    "type": "string"
  }
}
*/
```

`uniform` option requires all items in array to have same structure (to convert to the same schema).
If not, error is thrown. 

```javascript
const arr = ['str', 11, 30];
const schema = toJsonSchema(arr, {arrays: {mode: 'uniform'}});
/*
 Above code will throw 'Error: Invalid schema, incompatible array items'
*/
```

`tuple` option generates a [tuple array](https://json-schema.org/understanding-json-schema/reference/array.html#tuple-validation)
 (array of objects) from arrays.

```javascript
const arr = ['str', 11, 30];
const schema = toJsonSchema(arr, {arrays: {mode: 'tuple'}});
/*
{
  "type": "array",
  "items": [
    {
      "type": "string"
    },
    {
      "type": "integer"
    },
    {
      "type": "integer"
    }
  ]
}
*/
```
### Objects options


**objects.additionalProperties** (`boolean`, default `true`)

if set to `false`, all object schemas will include JSON schema property `additionalProperties: false` which makes generated schema
to perevent any extra properties.

```javascript
const options = {
  objects: {additionalProperties: false},
}
const obj = {
  a: {
    c: 1,
    d: 1,
  },
  b: 'str',
}
const schema = toJsonSchema(obj, options);
/*
{
  type: 'object',
  properties: {
    a: {
      type: 'object',
      properties: {
        c: {type: 'integer'},
        d: {type: 'integer'},
      },
      additionalProperties: false,
    },
    b: {type: 'string'},
  },
  additionalProperties: false,
}
*/
```

**objects.preProcessFnc** (`function`)

parameters:
- obj - (object) - input object value that is supposed to be converted into JSON schema
- defaultFunc (function) - standard function that is used to generate schema from object. Takes just the `obj` param.

By providing custom function you will be able to modify any object value (including nested ones) and pre-process
it before it gets converted into schema or modify generated schema or do the schema conversion entirely by yourself.

Custom function from example bellow ignores all properties other than `a` and `b` from input object:
```javascript
const options = {
  objects: {
    preProcessFnc: (obj, defaultFnc) => defaultFnc({a: obj.a, b: obj.b})
  }
};
const obj = {a: 1, b: 2, c: 3};
const schema = toJsonSchema(obj, options);
/*
{
  "type": "object",
  "properties": {
    "a": {
      "type": "integer"
    },
    "b": {
      "type": "integer",
    }
  }
}
*/
```


**objects.postProcessFnc** (`function`)

parameters:
- schema (object) - Generated JSON schema
- obj - (object) - input value 
- defaultFunc (function) - standard function that is used to post-process generated schema. Takes the `schema`, `obj` params.

By providing `postProcessFnc`, you can modify or replace generated schema. This function
will be called recursively for all the properties and sub-properties and array items from leaves to the root of the `obj` object. 

Custom objects.postProcessFnc makes properties required on parent type level:

```javascript
const options = {
  objects: {
    postProcessFnc: (schema, obj, defaultFnc) => ({...defaultFnc(schema, obj), required: Object.getOwnPropertyNames(obj)})
  }
};
const obj = {a: 1, b: 'str'};
const schema = toJsonSchema(obj, options);
/*
{
  type: 'object',
  properties: {
    a: {type: 'integer'},
    b: {type: 'string'},
  }
  required: ['a', 'b']
}
*/
```


### strings options

**strings.preProcessFnc** (`function`)

By providing custom function you will be able to modify any string value (including nested ones) and pre-process
it before it gets converted to schema, modify generated schema or do the schema conversion entirely by yourself.

Provided function will receive two parameters:
- `string` to be converted into JSON schema
- default `function` that normally generates the schema. This function receives only `string` to be converted to JSON schema 

Custom function from example bellow converts any string of object containing string to JSON schema and if string's content is 'date' than sets the format property to 'date':
```javascript
const options = {
  strings: {
    preProcessFnc: (value, defaultFnc) => {
      const schema = defaultFnc(value);
      if (value === 'date') {
        schema.format = 'date';
      }
      return schema;
    },
  },
}
const schema = toJsonSchema('date', options);
/*
{
  "type": "string",
  "format": "date"
}
*/
```
**strings.detectFormat** (`true|false` default id `true`)

When set to true format of the strings values may be detected based on it's content.

These JSON schema string formats can be detected:
* date-time
* date
* time
* utc-millisec
* color
* style
* phone
* uri
* email
* ip-address
* ipv6

```javascript
const obj = {
  a: '2012-07-08T16:41:41.532Z',
  b: '+31 42 123 4567',
  c: 'http://www.google.com/',
  d: 'obama@whitehouse.gov'
};
const schema = toJsonSchema(obj, {strings: {detectFormat: true}});
/*
{
  "type": "object",
  "properties": {
    "a": {
      "type": "string",
      "format": "date-time"
    },
    "b": {
      "type": "string",
      "format": "phone"
    },
    "c": {
      "type": "string",
      "format": "uri"
    },
    "d": {
      "type": "string",
      "format": "email"
    }
  }
}
*/
```
