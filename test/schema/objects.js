'use strict'

const should = require('chai').should()
const omit = require('lodash.omit')

const testSchemaWithAndWithoutMerge = require('../helpers/testSchema').tesSchemaWithAndWithoutArrayMerge
const testSchemaNormal = require('../helpers/testSchema').testSchemaWithoutArrayMerge
const testSchemaMerge = require('../helpers/testSchema').testSchemaWithArrayMerge
const testSchemaUniform = require('../helpers/testSchema').testSchemaArrayUniform
const toJsonSchema = require('../../src/index')

const {expect} = require('chai')

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
        preProcessFnc: (obj, defaultFnc) => defaultFnc(omit(obj, ['a'])),
      },
    }

    it('should remove a', () => {
      testSchemaWithAndWithoutMerge({a: 1, b: 2, c: 3}, {
        type: 'object',
        properties: {
          b: {type: 'integer'},
          c: {type: 'integer'},
        },
      }, options)
    })

    it('should remove a also for nested', () => {
      testSchemaWithAndWithoutMerge({a: 1, b: 2, c: {a: 1, b: 2, c: 3}}, {
        type: 'object',
        properties: {
          b: {type: 'integer'},
          c: {
            type: 'object',
            properties: {
              b: {type: 'integer'},
              c: {type: 'integer'},
            },
          },
        },
      }, options)
    })
  })

  describe('Custom object func and require override func', () => {

    it('should return proper schema when postProcessFnc is used', () => {
      const options = {
        postProcessFnc: (type, schema, value, defaultFunc) =>
          (type === 'integer') ? {...schema, required: true} : defaultFunc(type, schema, value),
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
        },
      }
      testSchemaNormal(instance, expectedSchema, options)
    })

    it('should return proper schema when both postProcessFnc and preProcessFnc are used', () => {
      const options = {
        postProcessFnc: (type, schema, value, defaultFunc) => value.$schema ? schema : defaultFunc(type, schema, value),
        arrays: {
          mode: 'first',
        },
        objects: {
          preProcessFnc: (obj, defaultFnc) => obj.$schema || defaultFnc(obj),
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

  describe('additional properties option', () => {

    it('should return proper schema that includes additionalProperties', () => {
      const options = {
        objects: {additionalProperties: false},
      }
      const instance = {
        a: 1,
        b: 'str',
      }
      const expectedSchema = {
        type: 'object',
        properties: {
          a: {type: 'integer'},
          b: {type: 'string'},
        },
        additionalProperties: false,
      }
      testSchemaNormal(instance, expectedSchema, options)
    })

    it('should return proper schema that includes additionalProperties even on nested objects', () => {
      const options = {
        objects: {additionalProperties: false},
      }
      const instance = {
        a: {
          c: 1,
          d: 1,
        },
        b: 'str',
      }
      const expectedSchema = {
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
      testSchemaNormal(instance, expectedSchema, options)
    })

    it('should return schema that does not includes additionalProperties on empty objects', () => {
      const options = {
        objects: {additionalProperties: false},
      }
      const instance = {}
      const expectedSchema = {
        type: 'object',
      }
      testSchemaNormal(instance, expectedSchema, options)
    })


    it('should return schema that does not includes additionalProperties on nested empty objects', () => {
      const options = {
        objects: {additionalProperties: false},
      }
      const instance = {
        a: {},
      }
      const expectedSchema = {
        type: 'object',
        properties: {
          a: {type: 'object'},
        },
        additionalProperties: false,
      }
      testSchemaNormal(instance, expectedSchema, options)
    })
  })

  describe('objects.postProcessFnc', () => {

    it('Custom objects.postProcessFnc makes properties required on parent type level', () => {
      const options = {
        objects: {
          postProcessFnc: (schema, obj, defaultFnc) => ({...defaultFnc(schema, obj), required: Object.getOwnPropertyNames(obj)}),
        },
      }
      testSchemaNormal({}, {type: 'object', required: []}, options)
      testSchemaNormal({a: 1}, {type: 'object', properties: {a: {type: 'integer'}}, required: ['a']}, options)
    })

  })

  describe('Errors', () => {

    it('should throw error for undefined value', () => {
      expect(() => toJsonSchema()).to.throw(Error, "Type of value couldn't be determined")
    })

  })

})
