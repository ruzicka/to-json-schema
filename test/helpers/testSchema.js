'use strict'

const toJsonSchema = require('../../src/index')
const _ = require('lodash')

function testSchema(options) {
	return function (instance, jsonSchema) {
		const schema = toJsonSchema(instance, options.arrayMerge)
		if (!_.isEqual(schema, jsonSchema)) {
			throw new Error('Generated schema is not deep equal with expected result')
		}
	}
}

const testSchemaWithArrayMerge = testSchema({arrayMerge: true})

const testSchemaWithoutArrayMerge = testSchema({arrayMerge: false})

const tesSchemaWithAndWithoutArrayMerge = function (instance, jsonSchema, testData) {
	testSchemaWithArrayMerge(instance, jsonSchema, testData)
	testSchemaWithoutArrayMerge(instance, jsonSchema, testData)
}

module.exports = {
	testSchema,
	testSchemaWithArrayMerge,
	testSchemaWithoutArrayMerge,
	tesSchemaWithAndWithoutArrayMerge,
}
