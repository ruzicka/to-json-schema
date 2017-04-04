'use strict'

const testSchema = require('../helpers/testSchema').tesSchemaWithAndWithoutArrayMerge

describe('Numeric types', () => {

	describe('integer', () => {

		it('should get integer schema for positive int', () => {
			testSchema(11, {type: 'integer'})
		})

		it('should get integer schema for negative int', () => {
			testSchema(-5, {type: 'integer'})
		})

		it('should get integer schema for zero', () => {
			testSchema(0, {type: 'integer'})
		})

	})

	describe('number', () => {

		it('should get number schema for positive float number', () => {
			testSchema(11.5, {type: 'number'})
		})

		it('should get number schema for negative float number', () => {
			testSchema(-1.3, {type: 'number'})
		})

	})

})
