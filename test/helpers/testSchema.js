'use strict'

const isEqual = require('lodash.isequal')
const merge = require('lodash.merge')
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

const testSchemaWithArrayMerge = testSchema({arrays: {mode: 'all'}})
const testSchemaWithoutArrayMerge = testSchema({arrays: {mode: 'first'}})
const testSchemaArrayUniform = testSchema({arrays: {mode: 'uniform'}})
const testSchemaArrayTuple = testSchema({arrays: {mode: 'tuple'}})

const tesSchemaWithAndWithoutArrayMerge = (instance, jsonSchema, additionalOptions) => {
  testSchemaWithArrayMerge(instance, jsonSchema, additionalOptions)
  testSchemaWithoutArrayMerge(instance, jsonSchema, additionalOptions)
  testSchemaArrayUniform(instance, jsonSchema, additionalOptions)
}

module.exports = {
  testSchema,
  testSchemaWithArrayMerge,
  testSchemaWithoutArrayMerge,
  tesSchemaWithAndWithoutArrayMerge,
  testSchemaArrayUniform,
  testSchemaArrayTuple,
}
