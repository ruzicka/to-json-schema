'use strict'

const isEqual = require('lodash.isequal')
const merge = require('lodash.merge')
const omit = require('lodash.omit')
const without = require('lodash.without')

const helpers = require('../../src/helpers')
const toJsonSchema = require('../../src/index')

function testSchema(options) {
  const opt = merge({}, options)
  return (instance, jsonSchema, additionalOptions = {}) => {
    const optToUse = merge({}, opt, additionalOptions)
    const schema = toJsonSchema(instance, optToUse)
    if (!isEqual(schema, jsonSchema)) {
      throw new Error('Generated schema is not deep equal with expected result')
    }
  }
}

const testSchemaWithArrayMerge = testSchema({arrays: {mode: 'merge'}})

const testSchemaWithoutArrayMerge = testSchema({arrays: {mode: 'first'}})

const tesSchemaWithAndWithoutArrayMerge = (instance, jsonSchema, additionalOptions) => {
  testSchemaWithArrayMerge(instance, jsonSchema, additionalOptions)
  testSchemaWithoutArrayMerge(instance, jsonSchema, additionalOptions)
}

module.exports = {
  testSchema,
  testSchemaWithArrayMerge,
  testSchemaWithoutArrayMerge,
  tesSchemaWithAndWithoutArrayMerge,
}
