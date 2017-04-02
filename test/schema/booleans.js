'use strict'

const testSchema = require('../helpers/testSchema').tesSchemaWithAndWithoutArrayMerge
const should = require('chai').should()

describe('Booleans', () => {

	it('should validate booleans', () => {
		testSchema(true, {type: 'boolean', required: true})
		testSchema(false, {type: 'boolean', required: true})
	})

	it("shouldn't validate 0", () => {
		should.throw(() => testSchema(0, {type: 'boolean', required: true}), Error,
			'Generated schema is not deep equal with expected result')
	})

	it("shouldn't validate empty string", () => {
		should.throw(() => testSchema('', {type: 'boolean', required: true}), Error,
			'Generated schema is not deep equal with expected result')
	})

	it("shouldn't validate empty array", () => {
		should.throw(() => testSchema([], {type: 'boolean', required: true}), Error,
			'Generated schema is not deep equal with expected result')
	})

	it("shouldn't validate null", () => {
		should.throw(() => testSchema(null, {type: 'boolean', required: true}), Error,
			'Generated schema is not deep equal with expected result')
	})


})
