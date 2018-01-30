'use strict'

const should = require('chai').should()
const omit = require('lodash.omit')

const testSchemaWithAndWithoutMerge = require('../helpers/testSchema').tesSchemaWithAndWithoutArrayMerge
const testSchemaNormal = require('../helpers/testSchema').testSchemaWithoutArrayMerge
const testSchemaMerge = require('../helpers/testSchema').testSchemaWithArrayMerge
const testSchemaUniform = require('../helpers/testSchema').testSchemaArrayUniform
const toJsonSchema = require('../../src/index')

const expect = require('chai').expect

describe('Objects', () => {

  describe('Invalid not-schema', () => {

    it('should throw error for undefined value', () => {
      expect(() => toJsonSchema()).to.throw(Error, "Type of value couldn't be determined")
    })

  })


  describe('Simple objects', () => {

    it('should get schema for empty object', () => {
      testSchemaWithAndWithoutMerge({}, {type: 'object'})
    })

    it('should get schema for object with properties (no nested objects)', () => {
      testSchemaWithAndWithoutMerge({
        id: 11,
        name: 'john',
        labels: ['short', 'fat'],
      }, {
        type: 'object',
        properties: {
          id: {type: 'integer'},
          name: {type: 'string'},
          labels: {
            type: 'array',
            items: {type: 'string'},
          },
        },
      })
    })

    it('should get schema for object with nested objects', () => {
      testSchemaWithAndWithoutMerge({
        id: 11,
        name: 'john',
        friend: {
          first_name: 'Joe',
          last_name: 'Doe',
        },
      }, {
        type: 'object',
        properties: {
          id: {type: 'integer'},
          name: {type: 'string'},
          friend: {
            type: 'object',
            properties: {
              first_name: {type: 'string'},
              last_name: {type: 'string'},
            },
          },
        },
      })
    })

    it('should get schema for object with nested array of compatible objects', () => {
      const instance = {
        id: 12,
        a: [
          {test: 1},
          {test: 2},
        ],
      }
      const schema = {
        type: 'object',
        properties: {
          id: {type: 'integer'},
          a: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                test: {type: 'integer'},
              },
            },
          },
        },
      }
      testSchemaWithAndWithoutMerge(instance, schema)
    })


    it('should get schema for object with nested array of incompatible objects (all)', () => {
      const instance = {
        id: 12,
        a: [
					{test: 1},
					{differentKeyName: 2},
        ],
      }
      const schema = {
        type: 'object',
        properties: {
          id: {type: 'integer'},
          a: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
        },
      }
      testSchemaMerge(instance, schema)
    })

    it('should get schema for object with nested array of incompatible objects (first)', () => {
      const instance = {
        id: 12,
        a: [
					{test: 1},
					{differentKeyName: 2},
        ],
      }
      const schema = {
        type: 'object',
        properties: {
          id: {type: 'integer'},
          a: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                test: {type: 'integer'},
              },
            },
          },
        },
      }
      testSchemaNormal(instance, schema)
    })

    it('should throw error for object with nested array of incompatible objects', () => {
      const instance = {
        id: 12,
        a: [
					{test: 1},
					{differentKeyName: 2},
        ],
      }
      const schema = {
        type: 'object',
        properties: {
          id: {type: 'integer'},
          a: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
        },
      }
      should.throw(() => testSchemaUniform(instance, schema), Error, 'Invalid schema')
    })

  })

  describe('Custom object func', () => {

    const options = {
      objects: {
        customFnc: (obj, defaultFnc) => defaultFnc(omit(obj, ['a']), ['b']),
      },
    }

    it('should remove a and make b required', () => {
      testSchemaWithAndWithoutMerge({a: 1, b: 2, c: 3}, {
        type: 'object',
        properties: {
          b: {type: 'integer', required: true},
          c: {type: 'integer'},
        },
      }, options)
    })

    it('should remove a and make b required also for nested', () => {
      testSchemaWithAndWithoutMerge({a: 1, b: 2, c: {a: 1, b: 2, c: 3}}, {
        type: 'object',
        properties: {
          b: {type: 'integer', required: true},
          c: {
            type: 'object',
            properties: {
              b: {type: 'integer', required: true},
              c: {type: 'integer'},
            },
          },
        },
      }, options)
    })
  })

  describe('Custom object func and require override func', () => {

    it('should return proper schema 1', () => {
      const options = {
        objects: {
          requireOverrideFnc: (schema, obj, defaultFunc) =>
            (typeof obj === 'number') ? {...schema, required: true} : defaultFunc(schema),
        },
      }

      const instance = {
        a: 1,
        b: 'str',
      }
      const expectedSchema = {
        type: 'object',
        properties: {
          a: {type: 'integer', required: true},
          b: {type: 'string'},
        }
      }
      testSchemaNormal(instance, expectedSchema, options)
    })

    it('should return proper schema 2', () => {
      const options = {
        arrays: {
          mode: 'first',
        },
        objects: {
          customFnc: (obj, defaultFnc) => obj.$schema || defaultFnc(obj),
          requireOverrideFnc: (schema, obj, defaultFunc) => {
            if (obj.$schema) {
              return schema
            }
            return defaultFunc(schema)
          },
        },
        required: true,
      }

      const instance = {
        id: 1,
        label: {$schema: {type: 'string', required: false}},
      }
      const expectedSchema = {
        type: 'object',
        properties: {
          id: {type: 'integer', required: true},
          label: {type: 'string', required: false},
        },
        required: true,
      }
      testSchemaNormal(instance, expectedSchema, options)
    })
  })

  describe('Errors', () => {

    it('should throw error for undefined value', () => {
      expect(() => toJsonSchema()).to.throw(Error, "Type of value couldn't be determined")
    })

  })

})
