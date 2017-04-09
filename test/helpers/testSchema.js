'use strict'

const toJsonSchema = require('../../src/index')
const isEqual = require('lodash.isequal')
const merge = require('lodash.merge')
const omit = require('lodash.omit')
const without = require('lodash.without');
const helpers = require('../../src/helpers')

const defaultOptions = {
  required: false,
  arrays: {
    mode: 'merge',
  },
  strings: {
    customFnc: (value, defaultFnc) => {
      const index = helpers.stringFormats.indexOf(value)
      if (index >= 0) {
        return {type: 'string', format: helpers.stringFormats[index]}
      }
      return defaultFnc(value)
    },
  },
  objects: {
    customFnc: (obj, defaultFnc) => {
      if (obj.$schema) {return obj.$schema}

      if (obj.$required && obj.$optional) {
        throw new Error("Defining both '$required' and '$optional' fields is not allowed")
      }
      let requiredFields = obj.$required || []
      const optionalFields = obj.$optional || []

      const stripedObj = omit(obj, ['$required', '$optional'])

      // optional to required
      if (obj.$optional) {
        requiredFields = without(Object.keys(stripedObj), optionalFields)
      }

      return  defaultFnc(stripedObj, requiredFields)
    }
  },
}

function testSchema(options) {
	const opt = merge({}, defaultOptions, options)
	return function (instance, jsonSchema) {
		const schema = toJsonSchema(instance, opt)
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
