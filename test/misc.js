'use strict'

const testSchemaMerge = require('./helpers/testSchema').testSchemaWithArrayMerge
const toJsonSchema = require('../src/index')
const {expect} = require('chai')

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

  describe('additional properties option', () => {

    it('should return proper schema 1', () => {
      const options = {
        arrays: {mode: 'non-existing-mode'},
      }
      expect(() => toJsonSchema([1, 'a'], options)).to.throw(Error, "Unknown array mode option 'non-existing-mode'")
    })
  })
})
