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

`to-json-schema` exports function that is able to convert most javascript values to JSON schema. Such a schema can be used to
further validation of similar objects/values

* `value`: **required** Any javascript value
* `options`: optional options object   

## options

### common options

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

 
### arrays options

Configuration parameters for arrays are located in object under key `arrays` 

**mode** (`all|first|uniform` default is `merge`)
  
`all` option causes parser to go through all array items finding most compatible yet most descriptive schema possible. 

```javascript
const arr = [33, 44, 55];
const schema = toJsonSchema(arr, {arrays: {mode: 'all'}});
/* Items are compatible type is detected
{
  "type": "array",
  "items": {
    "type": "integer"
  }
}
*/
```

```javascript
const arr = [33, 'str', 55];
const schema = toJsonSchema(arr, {arrays: {mode: 'all'}});
/* Items' types are incompatible. Type is omitted in schema to be able to validate input object
{
  "type": "array"
}
*/
```

```javascript
const arr = [
  {name: 'john', grades: [1, 2, 3]},
  {name: 'david', grades: ['a', 'b', 'c']}
];
const schema = toJsonSchema(arr, {arrays: {mode: 'all'}});
/* Incompatible in sub-item. Schema still describes object properties
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
 is a concern, use this option. 

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

`uniform` option requires all items in array to have same structure (to convert to same schema).
If not, error is thrown. 

```javascript
const arr = ['str', 11, 30];
const schema = toJsonSchema(arr, {arrays: {mode: 'uniform'}});
/*
 Above code will throw 'Error: Invalid schema, incompatible array items'
*/
```

### objects options

Configuration parameters for objects are located in object under key `objects` 

**customFnc** (`function`)

By providing custom function you will be able to modify any object value (including nested ones) and pre-process
it before it gets converted to schema, modify generated schema or do the schema conversion entirely by yourself.

Provided function will receive two parameters:
- `object` to be converted into JSON schema
- default `function` that normally generates the schema. This function receives `object` to be converted to JSON schema and optional array of properties that should be considered `required` in resulting schema 

Custom function from example bellow extracts only `a` and `b` properties from input object and makes `b` property required:
```javascript
const options = {
  objects: {
    customFnc: (obj, defaultFnc) => defaultFnc({a: obj.a, b: obj.b}, ['b'])
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
      "required": true
    }
  }
}
*/
```


**requireOverrideFnc** (`function`)

Allows to define custom logic for assigning require filed value. This may override default
behavior.

Provided function will receive these parameters:
- `schema` JSON schema
- `value` original value from which the JSON schema was generated
- default `function` that normally sets the require field for given schema. 
This function receives `schema` and returns new schema where `required` fields may have been overriden 

Custom function from example bellow extracts only `a` and `b` properties from input object and makes `b` property required:
```javascript
const options = {
  objects: {
    requireOverrideFnc: (schema, obj, defaultFunc) =>
      (typeof obj === 'number') ? {...schema, required: true} : defaultFunc(schema),
  },
};
const obj = {a: 1, b: 'str'};
const schema = toJsonSchema(obj, options);
/*
{
  type: 'object',
  properties: {
    a: {type: 'integer', required: true},
    b: {type: 'string'},
  }
}
*/
```


### strings options

Configuration parameters for strings are located in object under key `strings` 

**customFnc** (`function`)

By providing custom function you will be able to modify any string value (including nested ones) and pre-process
it before it gets converted to schema, modify generated schema or do the schema conversion entirely by yourself.

Provided function will receive two parameters:
- `string` to be converted into JSON schema
- default `function` that normally generates the schema. This function receives only `string` to be converted to JSON schema 

Custom function from example bellow converts any string of object containing string to JSON schema and if string's content is 'date' than sets the format property to 'date':
```javascript
const options = {
  strings: {
    customFnc: (value, defaultFnc) => {
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
**detectFormat** (`true|false` default id `true`)

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
