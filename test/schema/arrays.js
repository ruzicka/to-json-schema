'use strict'

const should = require('chai').should()

const testSchema = require('../helpers/testSchema').testSchemaWithoutArrayMerge
const testSchemaMerge = require('../helpers/testSchema').testSchemaWithArrayMerge
const testSchemaBoth = require('../helpers/testSchema').tesSchemaWithAndWithoutArrayMerge

describe('Array', () => {

  describe('Simple types', () => {

    it('should get simple array schema for empty array', () => {
      testSchemaBoth([], {type: 'array'})
    })

    it('should get array of integers schema for array of ints', () => {
      testSchemaBoth([11, 12, 4], {
        type: 'array',
        items: {
          type: 'integer',
        },
      })
    })

    it('should get array of numbers schema for array of floats', () => {
      testSchemaBoth([11.3, 12.4, 11.3], {
        type: 'array',
        items: {
          type: 'number',
        },
      })
    })

    it('should get array of numbers schema for array of mixed ints and floats with float first', () => {
      const data = [11.3, 12.4, 4]
      testSchemaMerge(data, {
        type: 'array',
        items: {
          type: 'number',
        },
      })
      should.throw(() => testSchema(data), Error)
    })

    it('should get array of numbers schema for array of mixed ints and floats with int first', () => {
      const data = [11, 12.4, 4]
      testSchemaMerge(data, {
        type: 'array',
        items: {
          type: 'number',
        },
      })
      should.throw(() => testSchema(data), Error)
    })

    it('should get array of strings schema for array of strings', () => {
      testSchemaBoth(['hello', 'hi', 'yo'], {
        type: 'array',
        items: {
          type: 'string',
        },
      })
    })

    it('should get simple array schema for array of mixed types', () => {
      const data = ['hello', 'hi', 11]
      testSchemaMerge(data, {type: 'array'})
      should.throw(() => testSchema(data), Error)
    })

  })


  describe('Objects and arrays', () => {

    it('should get array of specific objects schema for array containing just one object', () => {
      testSchemaBoth([{id: 11, title: 'test'}], {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {type: 'integer'},
            title: {type: 'string'},
          },
        },
      })
    })

    it('should get array of specific objects schema for array of objects of same type', () => {
      testSchemaBoth([
				{id: 11, title: 'test'},
				{id: 12, title: 'test 2'},
      ], {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {type: 'integer'},
            title: {type: 'string'},
          },
        },
      })
    })

    it('should get array of specific objects schema for array of objects of same schema', () => {
      const data = [
				{id: 11, title: 'test'},
				{id: 12.1, title: 'test 2'},
      ]
      testSchemaMerge(data, {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {type: 'number'},
            title: {type: 'string'},
          },
        },
      })
      should.throw(() => testSchema(data), Error)
    })

    it('should get array of generic objects schema for array of objects of incompatible schemas', () => {
      const data = [
				{id: 11, title: 'test'},
				{id: 12, name: 'nameless'},
      ]
      testSchemaMerge(data, {
        type: 'array',
        items: {
          type: 'object',
        },
      })
      should.throw(() => testSchema(data), Error)
    })

    it('should get array of arrays of Numbers schema for array of arrays of mixed numbers/ints', () => {
      const data = [
				[1, 2, 3],
				[1.1, 2.2, 3],
      ]
      testSchemaMerge(data, {
        type: 'array',
        items: {
          type: 'array',
          items: {type: 'number'},
        },
      })
      should.throw(() => testSchema(data), Error)
    })

    it('should get array of generic arrays schema for array of arrays of incompatible types', () => {
      const data = [
				[1, 2, 3, {test: 23}],
				[1.1, 2.2, 3],
      ]
      testSchemaMerge(data, {
        type: 'array',
        items: {
          type: 'array',
        },
      })
      should.throw(() => testSchema(data), Error)
    })

    it('should get schema for array of complex objects containing arrays of mixed ints/nums', () => {
      const data = [
				{id: 11, a: [1, 2, 3]},
				{id: 12, a: [1.1, 2.2, 3]},
      ]
      testSchemaMerge(data, {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {type: 'integer'},
            a: {
              type: 'array',
              items: {type: 'number'},
            },
          },
        },
      })
      should.throw(() => testSchema(data), Error)
    })

    it('should get schema for array of complex objects containing arrays of incompatible types', () => {
      const data = [
				{id: 11, a: [1, 2, 3, {test: 23}]},
				{id: 12, a: [1.1, 2.2, 3]},
      ]
      testSchemaMerge(data, {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {type: 'integer'},
            a: {
              type: 'array',
            },
          },
        },
      })
      should.throw(() => testSchema(data), Error)
    })

    it('should get schema for array of complex objects containing deeply ' +
			'nested arrays of all kind of compatible/incompatible types', () => {
      const data = [
        {id: 11,
          a: [
            {b: [1, 2, 3],
              c: [1, 2, 3],
              d: [1, 2, 3],
              e: [1, 2, 3],
            },
            {b: [1, 2, 3],
              c: [1, 2.2, 3],
              d: [1, 2, 3],
              e: [1, 2, {x: 11}],
            },
          ],
        },
        {id: 12,
          a: [
            {b: [1, 2, 3],
              c: [1, 2, 3],
              d: [1, 2.2, 3],
              e: [1, 2, 3],
            },
            {b: [1, 2, 3],
              c: [1, 2.2, 3],
              d: [1, 2, 3],
              e: [1, 2, 3],
            },
          ],
        },
      ]
      testSchemaMerge(data, {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {type: 'integer'},
            a: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  b: {type: 'array', items: {type: 'integer'}},
                  c: {type: 'array', items: {type: 'number'}},
                  d: {type: 'array', items: {type: 'number'}},
                  e: {type: 'array'},
                },
              },
            },
          },
        },
      })
      should.throw(() => testSchema(data), Error)
    })

    it('should get schema for array of objects that differs in items of nested arrays', () => {
      const data = [
        {id: 11, a: [
					{test: 1},
					{test: 2.1},
        ]},
        {id: 12, a: [
					{test: 1},
					{differentKeyName: 2},
        ]},
      ]
      testSchemaMerge(data, {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {type: 'integer'},
            a: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
          },
        },
      })
      should.throw(() => testSchema(data), Error)
    })

    it('should get array of generic objects', () => {
      // objects properties have incompatible type and as such will be ignored
      testSchemaMerge([{a: 1}, {a: 'a'}], {
        type: 'array',
        items: {
          type: 'object',
        },
      })
    })

    // // TODO eventualy make this work
    // it('merging strings of different formats', () => {
    //   testSchemaMerge([{a: ['test']}, {a: ['2012-07-08T16:41:41.532Z']}], {
    //     type: 'array',
    //     items: {
    //       type: 'object',
    //      properties: {
    //       	a: {
    //       		type: 'array',
    //          items: {
    //       			type: 'string'
    //          }
    //        }
    //      }
    //     },
    //   })
    // })

  })

})
