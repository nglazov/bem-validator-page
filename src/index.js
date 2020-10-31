const button = document.querySelector('button');
if (button) {
    button.addEventListener('click', validate);
}

// console.log = ()=>{}
const ul = document.querySelector('ul');

function validate() {
    ul.innerHTML = '';
    const parser = new DOMParser();
    const text = document.querySelector('textarea').value;
    const inputDocument = parser.parseFromString(text.trim(), 'text/html');

    if (!text || !inputDocument.body) {
        insertErrors();
        return;
    }

    const errors = validateNode(inputDocument.body);

    insertErrors(errors);
}

function insertErrors(errors) {
    if (!errors.length) {
        errors.push('No errors');
    }

    errors.forEach((error) => {
        const li = document.createElement('li');
        li.innerText = `${ERROR_TRANSLATION['ru'][error.code]} (className: ${
            error.className
        } path: ${getParentPath(error.parentArray)})`;
        ul.appendChild(li);
    });
}

const ERROR_CODE = {
    NO_PARENT_BLOCK: 'NO_PARENT_BLOCK',
    RECURSIVE_ELEMENT: 'RECURSIVE_ELEMENT',
    ONLY_MODIFIER: 'ONLY_MODIFIER',
    RECURSIVE_BLOCK: 'RECURSIVE_BLOCK',
    ELEMENT_OF_ELEMENT: 'ELEMENT_OF_ELEMENT',
};

function validateNode(node, parentArray = []) {
    const errors = [];
    const currentClasses = [...node.classList];
    const parentArrayWithCurrent = [...parentArray, currentClasses];

    currentClasses.forEach((className) => {
        const { blockName, elementName, modifierName } = parseClassName(
            className,
        );

        if (
            elementName &&
            !parentArray.flat().find((parentClass) => parentClass === blockName)
        ) {
            errors.push({
                code: ERROR_CODE.NO_PARENT_BLOCK,
                className,
                parentArray,
            });
        }

        if (
            elementName &&
            parentArray
                .flat()
                .find(
                    (parentClass) =>
                        parentClass === `${blockName}__${elementName}`,
                )
        ) {
            errors.push({
                code: ERROR_CODE.RECURSIVE_ELEMENT,
                className,
                parentArray,
            });
        }

        if (
            modifierName &&
            !currentClasses.find((currentClass) =>
                elementName
                    ? currentClass === `${blockName}__${elementName}`
                    : blockName === currentClass,
            )
        ) {
            errors.push({
                code: ERROR_CODE.ONLY_MODIFIER,
                className,
                parentArray,
            });
        }

        if (
            !elementName &&
            !modifierName &&
            parentArray.flat().some((parentClass) => parentClass === blockName)
        ) {
            errors.push({
                code: ERROR_CODE.RECURSIVE_BLOCK,
                className,
                parentArray,
            });
        }

        if (className.split('__').length > 2) {
            errors.push({
                code: ERROR_CODE.ELEMENT_OF_ELEMENT,
                className,
                parentArray,
            });
        }
    });

    if (node.children) {
        [...node.children].forEach((node) => {
            const childErrors = validateNode(node, parentArrayWithCurrent);
            errors.push(...childErrors);
        });
    }

    return errors;
}

function getParentPath(parents) {
    return parents
        .filter((element) => element.length > 0)
        .map((element) =>
            Array.isArray(element) ? element.join('.') : element,
        )
        .join(' > ');
}

function parseClassName(className) {
    const regExp = /^([a-z-0-9]*)(__)?([a-z-0-9]*)(_)?([a-z-0-9]*)?(_)?([a-z-0-9])?/i;

    const [
        ,
        blockName,
        ,
        elementName,
        ,
        modifierName,
        ,
        modifierValue,
    ] = regExp.exec(className);

    return { blockName, elementName, modifierName, modifierValue };
}

const ERROR_TRANSLATION = {
    ru: {
        [ERROR_CODE.ELEMENT_OF_ELEMENT]: 'Не может быть элемента у элемента',
        [ERROR_CODE.RECURSIVE_BLOCK]: 'Блок вложен в блок с таким же именем',
        [ERROR_CODE.RECURSIVE_ELEMENT]:
            'Элемент вложен в элемент с таким же именем',
        [ERROR_CODE.NO_PARENT_BLOCK]:
            'Элемент используется без блока в родителях',
        [ERROR_CODE.ONLY_MODIFIER]:
            'Модификатор используется без блока или элемента',
    },
    en: {
        [ERROR_CODE.ELEMENT_OF_ELEMENT]: 'It could not be element of element',
        [ERROR_CODE.RECURSIVE_BLOCK]: 'Block is in block with same name',
        [ERROR_CODE.RECURSIVE_ELEMENT]: 'Element is in element with same name',
        [ERROR_CODE.NO_PARENT_BLOCK]:
            'Element was used without block as parent',
        [ERROR_CODE.ONLY_MODIFIER]:
            'Modifier was used without block or element',
    },
};

module.exports = {
    validateNode,
    ERROR_CODE,
};
