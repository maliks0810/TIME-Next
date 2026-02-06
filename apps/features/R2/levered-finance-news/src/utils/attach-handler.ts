import { cloneElement, isValidElement } from 'react';
import { JSX } from 'react';

export const attachHandler = <P extends { children?: string | JSX.Element | JSX.Element[] }>(
    node: string | React.ReactElement<P>,
    handler: (e: Event, props: P) => void
): string | JSX.Element => {
    if (!isValidElement(node)) {
        // If it is a string, return it
        return node;
    }

    // If it is tag with a string child,  attach handler if it is a link
    if (!Array.isArray(node.props.children)) {
        if (node.type !== 'a') return node;

        return cloneElement(node, {
            ...node.props,
            onClick: (e: Event) => handler(e, node.props),
        });
    }

    return {
        ...node,
        props: {
            ...node.props,
            children: node.props.children.map((ch) => attachHandler(ch, handler)),
        },
    };
};
