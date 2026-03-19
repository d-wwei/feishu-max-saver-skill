import { marked, type Token, type Tokens } from 'marked'

// Feishu block type constants
const BLOCK_TYPE = {
  TEXT: 2,
  HEADING1: 3,
  HEADING2: 4,
  HEADING3: 5,
  HEADING4: 6,
  HEADING5: 7,
  HEADING6: 8,
  BULLET: 12,
  ORDERED: 13,
  CODE: 14,
} as const

const HEADING_BLOCK_TYPES = [
  BLOCK_TYPE.HEADING1, BLOCK_TYPE.HEADING2, BLOCK_TYPE.HEADING3,
  BLOCK_TYPE.HEADING4, BLOCK_TYPE.HEADING5, BLOCK_TYPE.HEADING6,
]
const HEADING_KEYS = ['heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6']

// Feishu code language enum (common subset)
const CODE_LANGUAGES: Record<string, number> = {
  plaintext: 1, bash: 6, sh: 6, shell: 59, c: 9, cpp: 8, 'c++': 8,
  csharp: 7, 'c#': 7, css: 11, dart: 14, dockerfile: 17, go: 21,
  html: 23, java: 28, javascript: 29, js: 29, json: 27, kotlin: 31,
  lua: 35, markdown: 38, md: 38, php: 42, python: 48, py: 48,
  ruby: 51, rb: 51, rust: 52, rs: 52, sql: 55, swift: 60,
  typescript: 62, ts: 62, xml: 65, yaml: 66, yml: 66,
}

export interface TextElement {
  text_run: {
    content: string
    text_element_style?: Record<string, boolean>
  }
}

export interface FeishuBlock {
  block_type: number
  [key: string]: unknown
}

/** Process inline marked tokens into feishu text elements */
function processInlineTokens(tokens: Token[]): TextElement[] {
  const elements: TextElement[] = []

  for (const token of tokens) {
    switch (token.type) {
      case 'text': {
        const t = token as Tokens.Text
        if (t.tokens && t.tokens.length > 0) {
          elements.push(...processInlineTokens(t.tokens))
        } else {
          elements.push({ text_run: { content: t.text } })
        }
        break
      }
      case 'strong': {
        const t = token as Tokens.Strong
        const children = processInlineTokens(t.tokens)
        for (const child of children) {
          child.text_run.text_element_style = { ...child.text_run.text_element_style, bold: true }
        }
        elements.push(...children)
        break
      }
      case 'em': {
        const t = token as Tokens.Em
        const children = processInlineTokens(t.tokens)
        for (const child of children) {
          child.text_run.text_element_style = { ...child.text_run.text_element_style, italic: true }
        }
        elements.push(...children)
        break
      }
      case 'codespan': {
        const t = token as Tokens.Codespan
        elements.push({ text_run: { content: t.text, text_element_style: { inline_code: true } } })
        break
      }
      case 'del': {
        const t = token as Tokens.Del
        const children = processInlineTokens(t.tokens)
        for (const child of children) {
          child.text_run.text_element_style = { ...child.text_run.text_element_style, strikethrough: true }
        }
        elements.push(...children)
        break
      }
      case 'br': {
        elements.push({ text_run: { content: '\n' } })
        break
      }
      case 'escape': {
        const t = token as Tokens.Escape
        elements.push({ text_run: { content: t.text } })
        break
      }
      default: {
        // Links, images, etc. — fall back to raw text
        if ('text' in token && typeof token.text === 'string') {
          elements.push({ text_run: { content: token.text } })
        } else if ('raw' in token && typeof token.raw === 'string') {
          elements.push({ text_run: { content: token.raw } })
        }
        break
      }
    }
  }

  return elements.filter(el => el.text_run.content.length > 0)
}

function makeTextBlock(elements: TextElement[]): FeishuBlock {
  return { block_type: BLOCK_TYPE.TEXT, text: { elements, style: {} } }
}

function makeHeadingBlock(level: number, elements: TextElement[]): FeishuBlock {
  const idx = Math.min(level - 1, 5)
  return {
    block_type: HEADING_BLOCK_TYPES[idx],
    [HEADING_KEYS[idx]]: { elements, style: {} },
  }
}

function makeCodeBlock(code: string, lang?: string): FeishuBlock {
  const language = lang ? (CODE_LANGUAGES[lang.toLowerCase()] ?? 1) : 1
  return {
    block_type: BLOCK_TYPE.CODE,
    code: {
      elements: [{ text_run: { content: code } }],
      style: { language },
    },
  }
}

function makeBulletBlock(elements: TextElement[]): FeishuBlock {
  return { block_type: BLOCK_TYPE.BULLET, bullet: { elements, style: {} } }
}

function makeOrderedBlock(elements: TextElement[]): FeishuBlock {
  return { block_type: BLOCK_TYPE.ORDERED, ordered: { elements, style: {} } }
}

function convertToken(token: Token): FeishuBlock[] {
  switch (token.type) {
    case 'paragraph': {
      const t = token as Tokens.Paragraph
      const elements = processInlineTokens(t.tokens)
      return elements.length > 0 ? [makeTextBlock(elements)] : []
    }
    case 'heading': {
      const t = token as Tokens.Heading
      const elements = processInlineTokens(t.tokens)
      return elements.length > 0 ? [makeHeadingBlock(t.depth, elements)] : []
    }
    case 'code': {
      const t = token as Tokens.Code
      return [makeCodeBlock(t.text, t.lang)]
    }
    case 'list': {
      const t = token as Tokens.List
      return t.items.map(item => {
        const elements = item.tokens
          .filter((sub): sub is Tokens.Text | Tokens.Paragraph =>
            sub.type === 'text' || sub.type === 'paragraph')
          .flatMap(sub => processInlineTokens(sub.tokens ?? []))
        if (elements.length === 0) {
          elements.push({ text_run: { content: item.text } })
        }
        return t.ordered ? makeOrderedBlock(elements) : makeBulletBlock(elements)
      })
    }
    case 'blockquote': {
      const t = token as Tokens.Blockquote
      // Simulate blockquote as text blocks with ">" prefix
      return t.tokens.flatMap(sub => {
        const blocks = convertToken(sub)
        return blocks.map(block => {
          // For text blocks, prepend ">" to first element
          if (block.block_type === BLOCK_TYPE.TEXT) {
            const text = block.text as { elements: TextElement[]; style: unknown }
            if (text.elements.length > 0) {
              text.elements[0] = {
                text_run: {
                  content: '> ' + text.elements[0].text_run.content,
                  text_element_style: text.elements[0].text_run.text_element_style,
                },
              }
            }
          }
          return block
        })
      })
    }
    case 'space':
    case 'hr':
      return []
    default:
      return []
  }
}

/** Convert markdown text to an array of feishu block structures */
export function markdownToBlocks(markdown: string): FeishuBlock[] {
  const tokens = marked.lexer(markdown)
  return tokens.flatMap(convertToken)
}
