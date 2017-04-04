'use strict'

const toJsonSchema = require('../../src/index')
const isEqual = require('lodash.isequal')
const merge = require('lodash.merge')
const helpers = require('../../src/helpers')

const defaultOptions = {
  required: false,
  arrays: {
    mode: 'merge',
  },
  strings: {
    customFnc: (value, prevFnc) => {
      const index = helpers.stringFormats.indexOf(value)
      if (index >= 0) {
        return {type: 'string', format: helpers.stringFormats[index]}
      }
      return prevFnc(value)
    },
  },
  objects: {
    customFnc: (value, prevFnc) => value.$schema || prevFnc(value),
  },
}

function testSchema(options) {
	const opt = merge({}, defaultOptions, options)
	return function (instance, jsonSchema) {
		const schema = toJsonSchema(instance, opt)
		console.log('aa', schema)
		console.log('ex', jsonSchema)
		if (!isEqual(schema, jsonSchema)) {
			throw new Error('Generated schema is not deep equal with expected result')
		}
	}
}

const testSchemaWithArrayMerge = testSchema({arrays: {mode: 'merge'}})

const testSchemaWithoutArrayMerge = testSchema({arrays: {mode: 'first'}})

const tesSchemaWithAndWithoutArrayMerge = function (instance, jsonSchema) {
	testSchemaWithArrayMerge(instance, jsonSchema)
	testSchemaWithoutArrayMerge(instance, jsonSchema)
}

module.exports = {
	testSchema,
	testSchemaWithArrayMerge,
	testSchemaWithoutArrayMerge,
	tesSchemaWithAndWithoutArrayMerge,
	toJsonSchema: value => toJsonSchema(value, defaultOptions)
}
