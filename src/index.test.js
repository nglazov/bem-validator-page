const { validateNode } = require('./index');

describe('validateNode', () => {
    it('returns error when modifier used without block or element', () => {
        const div = createDiv(`
      <div class="block_modifier"></div>
    `);

        const errors = validateNode(div);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            'Modifier without block or element in classList (modifier: block_modifier, path: )',
        );
    });

    it('returns error when element has no block in parents', () => {
        const div = createDiv(`
    <div class="block__element"></div>
  `);

        const errors = validateNode(div);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            'Element without block in parents (element: block__element, path: )',
        );
    });

    it('returns error when element has same element as parent', () => {
        const div = createDiv(`
    <div class="block">
      <div class="block__element">
        <div class="block__element"></div>
      </div>
    </div>
  `);

        const errors = validateNode(div);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            'Element is in element with same name (element: block__element, path:  > block > block__element)',
        );
    });

    it('does not return error for valid BEM', () => {
        const div = createDiv(`
    <div class="block">
      <div class="block__element block__element_modifier">
      </div>
    </div>
    <div class="block_modifier block"></div>
    <div class="block-a-1">
      <div class="block-b block-a-1__element"></div>
    </div>
  `);

        const errors = validateNode(div);

        expect(errors.length).toBe(0);
    });

    it('returns error when block is in block', () => {
        const div = createDiv(`
    <div class="block">
      <div class="block"></div>
    </div>
  `);

        const errors = validateNode(div);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            'Block are in same block (block: block, path  > block)',
        );
    });
});

function createDiv(innerHtml) {
    const div = document.createElement('div');
    div.innerHTML = innerHtml;

    return div;
}
