'use strict'

const testSchema = require('../helpers/testSchema').tesSchemaWithAndWithoutArrayMerge
const should = require('chai').should()

describe('Booleans', () => {

	it('should validate booleans', () => {
		testSchema(true, {type: 'boolean'})
		testSchema(false, {type: 'boolean'})
	})

	it("shouldn't validate 0", () => {
		should.throw(() => testSchema(0, {type: 'boolean'}), Error,
			'Generated schema is not deep equal with expected result')
	})

	it("shouldn't validate empty string", () => {
		should.throw(() => testSchema('', {type: 'boolean'}), Error,
			'Generated schema is not deep equal with expected result')
	})

	it("shouldn't validate empty array", () => {
		should.throw(() => testSchema([], {type: 'boolean'}), Error,
			'Generated schema is not deep equal with expected result')
	})

	it("shouldn't validate null", () => {
		should.throw(() => testSchema(null, {type: 'boolean'}), Error,
			'Generated schema is not deep equal with expected result')
	})


})
