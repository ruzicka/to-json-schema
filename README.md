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

`schema` from above code will look like this:

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
* `options`: documentation will be updated later   
