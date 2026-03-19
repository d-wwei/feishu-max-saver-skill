import { describe, it, expect } from 'vitest'
import { markdownToBlocks, type FeishuBlock, type TextElement } from '../src/markdown-to-blocks.js'

function getElements(block: FeishuBlock): TextElement[] {
  const key = Object.keys(block).find(k => k !== 'block_type') as string
  const data = block[key] as { elements: TextElement[] }
  return data.elements
}

function getTextContent(block: FeishuBlock): string {
  return getElements(block).map(el => el.text_run.content).join('')
}

describe('markdownToBlocks', () => {
  describe('paragraphs', () => {
    it('converts a simple paragraph', () => {
      const blocks = markdownToBlocks('Hello world')
      expect(blocks).toHaveLength(1)
      expect(blocks[0].block_type).toBe(2)
      expect(getTextContent(blocks[0])).toBe('Hello world')
    })

    it('converts multiple paragraphs', () => {
      const blocks = markdownToBlocks('First\n\nSecond')
      expect(blocks).toHaveLength(2)
      expect(blocks[0].block_type).toBe(2)
      expect(blocks[1].block_type).toBe(2)
      expect(getTextContent(blocks[0])).toBe('First')
      expect(getTextContent(blocks[1])).toBe('Second')
    })
  })

  describe('headings', () => {
    it('converts h1-h6', () => {
      const md = '# H1\n\n## H2\n\n### H3\n\n#### H4\n\n##### H5\n\n###### H6'
      const blocks = markdownToBlocks(md)
      expect(blocks).toHaveLength(6)
      expect(blocks[0].block_type).toBe(3) // heading1
      expect(blocks[1].block_type).toBe(4) // heading2
      expect(blocks[2].block_type).toBe(5) // heading3
      expect(blocks[3].block_type).toBe(6) // heading4
      expect(blocks[4].block_type).toBe(7) // heading5
      expect(blocks[5].block_type).toBe(8) // heading6

      expect(getTextContent(blocks[0])).toBe('H1')
      expect(getTextContent(blocks[3])).toBe('H4')
    })

    it('heading has correct key name', () => {
      const blocks = markdownToBlocks('## Title')
      expect(blocks[0]).toHaveProperty('heading2')
    })
  })

  describe('code blocks', () => {
    it('converts a code block with language', () => {
      const md = '```javascript\nconsole.log("hi")\n```'
      const blocks = markdownToBlocks(md)
      expect(blocks).toHaveLength(1)
      expect(blocks[0].block_type).toBe(14)
      const code = blocks[0].code as { elements: TextElement[]; style: { language: number } }
      expect(code.elements[0].text_run.content).toBe('console.log("hi")')
      expect(code.style.language).toBe(29) // javascript
    })

    it('converts a code block without language as plaintext', () => {
      const md = '```\nsome code\n```'
      const blocks = markdownToBlocks(md)
      const code = blocks[0].code as { style: { language: number } }
      expect(code.style.language).toBe(1) // plaintext
    })

    it('maps typescript to correct language enum', () => {
      const md = '```ts\nconst x = 1\n```'
      const blocks = markdownToBlocks(md)
      const code = blocks[0].code as { style: { language: number } }
      expect(code.style.language).toBe(62)
    })
  })

  describe('lists', () => {
    it('converts unordered list', () => {
      const md = '- Item 1\n- Item 2\n- Item 3'
      const blocks = markdownToBlocks(md)
      expect(blocks).toHaveLength(3)
      blocks.forEach(b => expect(b.block_type).toBe(12)) // bullet
      expect(getTextContent(blocks[0])).toBe('Item 1')
      expect(getTextContent(blocks[2])).toBe('Item 3')
    })

    it('converts ordered list', () => {
      const md = '1. First\n2. Second'
      const blocks = markdownToBlocks(md)
      expect(blocks).toHaveLength(2)
      blocks.forEach(b => expect(b.block_type).toBe(13)) // ordered
      expect(getTextContent(blocks[0])).toBe('First')
    })
  })

  describe('inline formatting', () => {
    it('converts bold text', () => {
      const blocks = markdownToBlocks('**bold** text')
      const elements = getElements(blocks[0])
      expect(elements[0].text_run.content).toBe('bold')
      expect(elements[0].text_run.text_element_style?.bold).toBe(true)
      expect(elements[1].text_run.content).toBe(' text')
      expect(elements[1].text_run.text_element_style).toBeUndefined()
    })

    it('converts italic text', () => {
      const blocks = markdownToBlocks('*italic* word')
      const elements = getElements(blocks[0])
      expect(elements[0].text_run.content).toBe('italic')
      expect(elements[0].text_run.text_element_style?.italic).toBe(true)
    })

    it('converts inline code', () => {
      const blocks = markdownToBlocks('use `console.log`')
      const elements = getElements(blocks[0])
      expect(elements[1].text_run.content).toBe('console.log')
      expect(elements[1].text_run.text_element_style?.inline_code).toBe(true)
    })

    it('converts strikethrough', () => {
      const blocks = markdownToBlocks('~~deleted~~')
      const elements = getElements(blocks[0])
      expect(elements[0].text_run.content).toBe('deleted')
      expect(elements[0].text_run.text_element_style?.strikethrough).toBe(true)
    })

    it('handles nested bold + italic', () => {
      const blocks = markdownToBlocks('***bold italic***')
      const elements = getElements(blocks[0])
      expect(elements[0].text_run.text_element_style?.bold).toBe(true)
      expect(elements[0].text_run.text_element_style?.italic).toBe(true)
    })
  })

  describe('blockquotes', () => {
    it('converts blockquote as prefixed text', () => {
      const blocks = markdownToBlocks('> Quote text')
      expect(blocks).toHaveLength(1)
      expect(blocks[0].block_type).toBe(2) // text
      expect(getTextContent(blocks[0])).toContain('Quote text')
      expect(getTextContent(blocks[0])).toMatch(/^>/)
    })
  })

  describe('mixed content', () => {
    it('converts a typical document', () => {
      const md = `# 标题

正文内容

- 列表项 1
- 列表项 2

\`\`\`python
print("hello")
\`\`\``
      const blocks = markdownToBlocks(md)
      expect(blocks[0].block_type).toBe(3) // heading1
      expect(blocks[1].block_type).toBe(2) // text
      expect(blocks[2].block_type).toBe(12) // bullet
      expect(blocks[3].block_type).toBe(12) // bullet
      expect(blocks[4].block_type).toBe(14) // code
    })

    it('returns empty array for empty input', () => {
      expect(markdownToBlocks('')).toEqual([])
    })

    it('skips blank lines and hr', () => {
      const blocks = markdownToBlocks('Before\n\n---\n\nAfter')
      expect(blocks.every(b => b.block_type !== undefined)).toBe(true)
      // hr is skipped, only paragraphs remain
      const textBlocks = blocks.filter(b => b.block_type === 2)
      expect(textBlocks).toHaveLength(2)
    })
  })
})
