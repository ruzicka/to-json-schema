'use strict'

const testSchema = require('../helpers/testSchema').tesSchemaWithAndWithoutArrayMerge
const should = require('chai').should()

describe('Nulls', () => {

	it('should validate null', () => {
		testSchema(null, {type: 'null'})
	})

	it("shouldn't validate 0", () => {
		should.throw(() => testSchema(0, {type: 'null'}), Error,
			'Generated schema is not deep equal with expected result')
	})

	it("shouldn't validate empty string", () => {
		should.throw(() => testSchema('', {type: 'null'}), Error,
			'Generated schema is not deep equal with expected result')
	})

	it("shouldn't validate empty array", () => {
		should.throw(() => testSchema([], {type: 'null'}), Error,
			'Generated schema is not deep equal with expected result')
	})

	it("shouldn't validate false", () => {
		should.throw(() => testSchema(false, {type: 'null'}), Error,
			'Generated schema is not deep equal with expected result')
	})

})
