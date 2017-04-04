'use strict'

const testSchema = require('./helpers/testSchema').testSchemaWithoutArrayMerge
const testSchemaMerge = require('./helpers/testSchema').testSchemaWithArrayMerge
const testSchemaBoth = require('./helpers/testSchema').tesSchemaWithAndWithoutArrayMerge
const should = require('chai').should()

describe('Misc', () => {

  describe('Required', () => {

    it.skip('All items should be required', () => {
      testSchemaBoth({
        a: 1,
        b: 'str',
        c: [11, 12, 4],
        d: [1, 'a'],
        e: [{a: 1, b: 'str', c:[11, 12, 4], d: [1, 'a']}]
      }, {})
    })
  })

})
