'use strict'

const testSchema = require('../helpers/testSchema').tesSchemaWithAndWithoutArrayMerge
const should = require('chai').should()

describe('Dates', () => {

	it('should validate date', () => {
		testSchema(new Date(), {type: 'date'})
	})

	it("shouldn't validate string date", () => {
		should.throw(() => testSchema('2012-07-08T16:41:41.532+00:00', {type: 'date'}), Error,
			'Generated schema is not deep equal with expected result')
	})

})
