import test from 'node:test'
import assert from 'node:assert/strict'
import { parseEth, formatEth, mulInt, percentOf } from '../../src/purchase/eth.ts'

test('parse/format preservam precisão', () => {
  assert.equal(parseEth('0.1') + parseEth('0.2'), parseEth('0.3'))
  assert.equal(formatEth(parseEth('3.333')), '3.333')
  assert.equal(formatEth(parseEth('12')), '12.00')
  assert.equal(formatEth(parseEth('0.000000000000000001')), '0.000000000000000001')
})
test('multiplicação e percentual', () => {
  assert.equal(formatEth(mulInt(parseEth('3.333'), 3)), '9.999')
  assert.equal(formatEth(percentOf(parseEth('1.75'), 10)), '0.175')
})
test('rejeita entrada inválida', () => {
  assert.throws(() => parseEth('1,5'))
  assert.throws(() => parseEth('-1'))
})
