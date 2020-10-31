const { validateNode, ERROR_CODE } = require('./index');

describe('validateNode', () => {
    it('returns error when modifier used without block or element', () => {
        const div = createDiv(`
      <div class="block_modifier"></div>
    `);

        const errors = validateNode(div);

        expect(errors.length).toBe(1);
        expect(errors[0]).toStrictEqual({
            code: ERROR_CODE.ONLY_MODIFIER,
            className: 'block_modifier',
            parentArray: [[]],
        });
    });

    it('returns error when element has no block in parents', () => {
        const div = createDiv(`
    <div class="block__element"></div>
  `);

        const errors = validateNode(div);

        expect(errors.length).toBe(1);
        expect(errors[0]).toStrictEqual({
            code: ERROR_CODE.NO_PARENT_BLOCK,
            className: 'block__element',
            parentArray: [[]],
        });
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
        expect(errors[0]).toStrictEqual({
            code: ERROR_CODE.RECURSIVE_ELEMENT,
            className: 'block__element',
            parentArray: [[], ['block'], ['block__element']],
        });
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
        expect(errors[0]).toStrictEqual({
            code: ERROR_CODE.RECURSIVE_BLOCK,
            className: 'block',
            parentArray: [[], ['block']],
        });
    });

    it('returns error when class named like block__element__element', () => {
        const div = createDiv(`
            <div class="block"><div class="block__element__element"></div></div>
        `);

        const errors = validateNode(div);

        expect(errors.length).toBe(1);
        expect(errors[0]).toStrictEqual({
            code: ERROR_CODE.ELEMENT_OF_ELEMENT,
            className: 'block__element__element',
            parentArray: [[], ['block']],
        });
    });
});

function createDiv(innerHtml) {
    const div = document.createElement('div');
    div.innerHTML = innerHtml;

    return div;
}
