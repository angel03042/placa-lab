import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveHash } from '../src/router/routes.js'

test('los enlaces publicados abren la pantalla y la subsección correctas', () => {
  for (const hash of ['#home', '#turno', '#turno/004', '#fit/ssd', '#workshop/ram', '#lab/calor', '#lab/energia', '#lessons', '#library', '#diagnostics', '#glossary']) {
    assert.equal(resolveHash(hash).hash, hash)
  }
})

test('un enlace incompleto o antiguo siempre ofrece una pantalla utilizable', () => {
  for (const [input, expected] of [
    ['', '#home'], ['#desconocida', '#home'], ['#/turno/001', '#turno/001'],
    ['#turno/999', '#turno'], ['#fit', '#fit/ram'], ['#fit/cpu', '#fit/ram'],
    ['#workshop', '#workshop/limpieza'], ['#lab/frio', '#lab'],
  ]) assert.equal(resolveHash(input).hash, expected)
})
