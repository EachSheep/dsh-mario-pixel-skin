const PACKAGE_NAME = 'dsh-client-ui-skin-pixel-kingdom'
const BODY_ATTR = 'data-dsh-pixel-kingdom'
const CSS_TEXT = '__DSH_CSS__'
const DEFAULT_CONFIG = Object.freeze({
  showTitlebar: true,
  backgroundBlurPx: 5,
  fontScale: 1,
  compatibility: 'dsh-0.1.0-rc.6',
})

function makeElement(tagName, className, text) {
  const element = document.createElement(tagName)
  element.className = className
  if (text !== undefined) element.textContent = text
  return element
}

// rc.6 can activate an out-of-tree browser half without a second argument.
// Keep schema-aligned defaults at this external boundary; newer runners may
// supply the validated config directly.
export function apply(ctx, config = DEFAULT_CONFIG) {
  const body = document.body
  body.setAttribute(BODY_ATTR, '')
  body.dataset.dshPixelKingdomCompat = config.compatibility
  body.style.setProperty('--pixel-font-scale', String(config.fontScale))
  body.style.setProperty('--pixel-backdrop-blur', `${config.backgroundBlurPx}px`)
  body.style.setProperty('--pixel-titlebar-height', config.showTitlebar ? '48px' : '0px')

  const style = makeElement('style', '')
  style.dataset.plugin = PACKAGE_NAME
  style.textContent = CSS_TEXT

  const scene = makeElement('div', 'pixelKingdomScene')
  scene.dataset.skinChrome = 'pixel-kingdom-scene'
  scene.setAttribute('aria-hidden', 'true')

  const titlebar = makeElement('div', 'pixelKingdomTitlebar')
  titlebar.dataset.skinChrome = 'pixel-kingdom-titlebar'
  titlebar.setAttribute('aria-hidden', 'true')
  titlebar.hidden = !config.showTitlebar

  const brand = makeElement('div', 'pixelKingdomBrand', 'DEEPSEEK ')
  brand.append(makeElement('b', '', 'HARNESS'))
  const level = makeElement('div', 'pixelKingdomLevel', 'WORLD 1–1 ')
  level.append(makeElement('span', 'pixelKingdomCoin', '●'), document.createTextNode(' ×08'))
  titlebar.append(brand, level, makeElement('div', 'pixelKingdomReady', 'READY'))

  document.head.append(style)
  body.append(scene, titlebar)

  ctx.effect(() => () => {
    body.removeAttribute(BODY_ATTR)
    delete body.dataset.dshPixelKingdomCompat
    body.style.removeProperty('--pixel-font-scale')
    body.style.removeProperty('--pixel-backdrop-blur')
    body.style.removeProperty('--pixel-titlebar-height')
    scene.remove()
    titlebar.remove()
    style.remove()
  }, 'ui-skin-pixel-kingdom: visual surface')
}
