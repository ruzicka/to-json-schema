[![Build Status](https://travis-ci.org/ruzicka/to-json-schema.svg?branch=master)](https://travis-ci.org/ruzicka/to-json-schema)
[![Coverage Status](https://coveralls.io/repos/github/ruzicka/to-json-schema/badge.svg?branch=master)](https://coveralls.io/github/ruzicka/to-json-schema?branch=master)
# to-json-schema

Converts javascript objects (and other types) to corresponding JSON schema

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

`immutable-custom-merge` exports just one function. It performs deep merge of `val1` into `val2`, using provided `schema` to determine how to
merge specific keys if there's a collision.

* `value`: **required** Any javascript value
* `options`: documentation will be updated later   
