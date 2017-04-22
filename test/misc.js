'use strict'

const should = require('chai').should()

const testSchema = require('./helpers/testSchema').testSchemaWithoutArrayMerge
const testSchemaMerge = require('./helpers/testSchema').testSchemaWithArrayMerge
// const testSchemaBoth = require('./helpers/testSchema').tesSchemaWithAndWithoutArrayMerge

describe('Misc', () => {

  describe('Required', () => {

    it('All items should be required', () => {
      const expected = {
        type: 'object',
        properties: {
          a: {
            type: 'integer',
            required: true,
          },
          b: {
            type: 'string',
            required: true,
          },
          c: {
            type: 'array',
            items: {
              type: 'integer',
              required: true,
            },
            required: true,
          },
          d: {
            type: 'array',
            required: true,
          },
          e: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                a: {
                  type: 'integer',
                  required: true,
                },
                b: {
                  type: 'string',
                  required: true,
                },
                c: {
                  type: 'array',
                  items: {
                    type: 'integer',
                    required: true,
                  },
                  required: true,
                },
                d: {
                  type: 'array',
                  required: true,
                },
              },
              required: true,
            },
            required: true,
          },
        },
        required: true,
      }

      const schema = {
        a: 1,
        b: 'str',
        c: [11, 12, 4],
        d: [1, 'a'],
        e: [{a: 1, b: 'str', c: [11, 12, 4], d: [1, 'a']}],
      }

      testSchemaMerge(schema, expected, {required: true})
    })
  })

})
