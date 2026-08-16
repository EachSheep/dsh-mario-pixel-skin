import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFile(resolve(root, path), 'utf8')

test('package exposes a Web bundle without using the official namespace', async () => {
  const pkg = JSON.parse(await read('package.json'))
  const patch = await read('cordis.patch.yml')

  assert.equal(pkg.name, 'dsh-client-ui-skin-pixel-kingdom')
  assert.equal(pkg.private, undefined)
  assert.equal(pkg.dsh.client.platform, 'web')
  assert.deepEqual(pkg.dsh.client.inject, [])
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
  assert.match(patch, /name: dsh-client-ui-skin-pixel-kingdom/)
  assert.match(patch, /compatibility: dsh-0\.1\.0-rc\.6/)
})

test('host entry exports a Schemastery configuration contract', async () => {
  const source = await read('src/index.js')
  const { Config } = await import('../src/index.js')

  assert.match(source, /export const Config = Schema\.object/)
  assert.match(source, /showTitlebar/)
  assert.match(source, /backgroundBlurPx/)
  assert.match(source, /fontScale/)
  assert.match(source, /compatibility/)
  assert.deepEqual(await Config({}), {
    showTitlebar: true,
    backgroundBlurPx: 5,
    fontScale: 1,
    compatibility: 'dsh-0.1.0-rc.6',
  })
  assert.throws(() => Config({ backgroundBlurPx: 99 }), /expected number <= 16/)
})

test('client effects are reversible and do not own the document title', async () => {
  const source = await read('src/client.js')

  assert.match(source, /ctx\.effect/)
  assert.match(source, /body\.removeAttribute\(BODY_ATTR\)/)
  assert.match(source, /scene\.remove\(\)/)
  assert.match(source, /titlebar\.remove\(\)/)
  assert.match(source, /style\.remove\(\)/)
  assert.doesNotMatch(source, /document\.title/)
})

test('client lifecycle adds one surface and removes every owned mutation', async () => {
  class FakeStyle {
    values = new Map()
    setProperty(name, value) { this.values.set(name, value) }
    removeProperty(name) { this.values.delete(name) }
  }
  class FakeElement {
    constructor(tagName) {
      this.tagName = tagName
      this.attributes = new Map()
      this.children = []
      this.dataset = {}
      this.style = new FakeStyle()
    }
    setAttribute(name, value) { this.attributes.set(name, value) }
    removeAttribute(name) { this.attributes.delete(name) }
    append(...children) { this.children.push(...children); children.forEach((child) => { child.parent = this }) }
    remove() {
      if (!this.parent) return
      this.parent.children = this.parent.children.filter((child) => child !== this)
      delete this.parent
    }
  }

  const title = 'Original Harness title'
  const body = new FakeElement('body')
  const head = new FakeElement('head')
  globalThis.document = {
    title,
    body,
    head,
    createElement: (tagName) => new FakeElement(tagName),
    createTextNode: (text) => ({ text }),
  }

  const { apply } = await import('../src/client.js')
  let dispose
  apply({ effect: (effect) => { dispose = effect() } })

  assert.ok(body.attributes.has('data-dsh-pixel-kingdom'))
  assert.equal(body.children.length, 2)
  assert.equal(head.children.length, 1)
  assert.equal(document.title, title)

  dispose()
  assert.ok(!body.attributes.has('data-dsh-pixel-kingdom'))
  assert.equal(body.children.length, 0)
  assert.equal(head.children.length, 0)
  assert.equal(body.style.values.size, 0)
  assert.equal(document.title, title)
  delete globalThis.document
})

test('stable styles do not depend on DSH implementation names', async () => {
  const stable = await Promise.all([
    read('src/styles/tokens.css'),
    read('src/styles/chrome.css'),
    read('src/styles/surfaces.css'),
    read('src/styles/controls.css'),
  ])
  const css = stable.join('\n')

  assert.doesNotMatch(css, /\[class[$*^]?=/)
  assert.doesNotMatch(css, /\[aria-label/)
  assert.doesNotMatch(css, /!important/)
})

test('unstable selectors stay inside the bounded rc6 adapter', async () => {
  const compat = await read('src/compat/dsh-0.1.0-rc.6.css')
  const count = (pattern) => compat.match(pattern)?.length ?? 0

  assert.ok(count(/\[class[$*^]?=/g) <= 28)
  assert.ok(count(/\[aria-label/g) <= 32)
  assert.equal(count(/!important/g), 0)
})

test('settings trigger stays visible and settings icons have distinct states', async () => {
  const compat = await read('src/compat/dsh-0.1.0-rc.6.css')

  assert.match(compat, /\[class\$="_footArea"\]/)
  assert.match(compat, /\[class\$="_settingsArea"\] button\[aria-haspopup="dialog"\]/)
  assert.match(compat, /button\[class\*="_navCell"\]\[aria-current="true"\]/)
  assert.match(compat, /\[class\$="_navIcon"\]/)
  assert.match(compat, /button\[class\$="_close"\]/)
})

test('maintainer guidance preserves the stable and compatibility boundary', async () => {
  const agents = await read('AGENTS.md')

  assert.match(agents, /src\/styles/)
  assert.match(agents, /src\/compat/)
  assert.match(agents, /npm test/)
  assert.match(agents, /禁止.*!important/)
  assert.match(agents, /3080/)
})

test('client contains no network, storage, cookie, or dynamic-code access', async () => {
  const source = await read('src/client.js')

  assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|WebSocket/)
  assert.doesNotMatch(source, /localStorage|sessionStorage|document\.cookie/)
  assert.doesNotMatch(source, /\beval\(|new Function/)
})

test('distribution contains one background copy and generated entries', async () => {
  const pkg = JSON.parse(await read('package.json'))
  const client = await read('lib/client.js')
  const host = await read('lib/index.js')

  assert.ok(!pkg.files.some((entry) => entry.startsWith('assets/')))
  assert.match(client, /data:image\/webp;base64,/)
  assert.match(client, /id: "dsh-client-ui-skin-pixel-kingdom"/)
  assert.doesNotMatch(client, /__DSH_CSS__|__PIXEL_KINGDOM_BACKGROUND__/)
  assert.match(host, /export const Config = Schema\.object/)
})
