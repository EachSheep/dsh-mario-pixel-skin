import Schema from '@deepseek-ai/schemastery'

export const name = 'ui-skin-pixel-kingdom'

export const Config = Schema.object({
  showTitlebar: Schema.boolean().default(true),
  backgroundBlurPx: Schema.number().min(0).max(16).step(1).default(5),
  fontScale: Schema.number().min(0.85).max(1.3).step(0.05).default(1),
  compatibility: Schema.union(['dsh-0.1.0-rc.6', 'tokens-only']).default('dsh-0.1.0-rc.6'),
})

/** Host half of a browser-only skin. The Web client owns every visual effect. */
export function apply() {}
