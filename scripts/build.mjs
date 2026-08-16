import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const styleFiles = [
  'src/styles/tokens.css',
  'src/styles/chrome.css',
  'src/styles/surfaces.css',
  'src/styles/controls.css',
  'src/compat/dsh-0.1.0-rc.6.css',
]

const styles = await Promise.all(styleFiles.map((file) => readFile(resolve(root, file), 'utf8')))
const background = await readFile(resolve(root, 'assets/pixel-kingdom-bg-v2-ui.webp'))
const backgroundUrl = `data:image/webp;base64,${background.toString('base64')}`
const css = styles.join('\n').replaceAll('__PIXEL_KINGDOM_BACKGROUND__', backgroundUrl)

const source = await readFile(resolve(root, 'src/client.js'), 'utf8')
const clientBody = source
  .replace("const CSS_TEXT = '__DSH_CSS__'", `const CSS_TEXT = ${JSON.stringify(css)}`)
  .replace('export function apply', 'function apply')

if (clientBody.includes('__DSH_CSS__') || css.includes('__PIXEL_KINGDOM_BACKGROUND__')) {
  throw new Error('build placeholder was not replaced')
}

const client = `window.__ModuleLoader__.load({
  id: ${JSON.stringify(packageJson.name)},
  factory: () => {
    const module = { exports: {} }
${clientBody.split('\n').map((line) => line ? `    ${line}` : '').join('\n')}
    module.exports.apply = apply
    return module.exports
  },
})
`

await mkdir(resolve(root, 'lib'), { recursive: true })
await writeFile(resolve(root, 'lib/client.js'), client)
await writeFile(resolve(root, 'lib/index.js'), await readFile(resolve(root, 'src/index.js')))
