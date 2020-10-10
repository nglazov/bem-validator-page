const button = document.querySelector('button');
if (button) {
    button.addEventListener('click', validate);
}

// console.log = ()=>{}
const ul = document.querySelector('ul');

function validate() {
    ul.innerHTML = '';
    const text = document.querySelector('textarea').value;
    var div = document.createElement('div');
    div.innerHTML = text.trim();

    if (!text || !div.children[0]) {
        insertErrors();
        return;
    }

    const errors = validateNode(div.children[0]);

    insertErrors(errors);
}

function insertErrors(errors) {
    if (!errors.length) {
        errors.push('No errors');
    }

    errors.forEach((error) => {
        const li = document.createElement('li');
        li.innerText = error;
        ul.appendChild(li);
    });
}

function validateNode(node, parentArray = []) {
    const errors = [];
    const currentClasses = [...node.classList];
    const parentArrayWithCurent = [...parentArray, currentClasses];

    currentClasses.forEach((className) => {
        const { blockName, elementName, modifierName } = parseClassName(
            className,
        );

        if (
            elementName &&
            !parentArray.flat().find((parentClass) => parentClass === blockName)
        ) {
            errors.push(
                `Element without block in parents (element: ${className}, path: ${getParentPath(
                    parentArray,
                )})`,
            );
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
            errors.push(
                `Element is in element with same name (element: ${className}, path: ${getParentPath(
                    parentArray,
                )})`,
            );
        }

        if (
            modifierName &&
            !currentClasses.find((currentClass) =>
                elementName
                    ? currentClass === `${blockName}__${elementName}`
                    : blockName === currentClass,
            )
        ) {
            errors.push(
                `Modifier without block or element in classList (modifier: ${className}, path: ${getParentPath(
                    parentArray,
                )})`,
            );
        }

        if (
            !elementName &&
            !modifierName &&
            parentArray.flat().some((parentClass) => parentClass === blockName)
        ) {
            errors.push(
                `Block are in same block (block: ${className}, path ${getParentPath(
                    parentArray,
                )})`,
            );
        }
    });

    if (node.children) {
        [...node.children].forEach((node) => {
            const childErrors = validateNode(node, parentArrayWithCurent);
            errors.push(...childErrors);
        });
    }

    return errors;
}

function getParentPath(parents) {
    return parents
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

module.exports = {
    validateNode,
};
