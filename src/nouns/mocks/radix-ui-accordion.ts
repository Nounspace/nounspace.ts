// Mock implementation for @radix-ui/react-accordion
import React from 'react';

export const Root = ({ children, ...props }: any) => React.createElement('div', props, children);
export const Item = ({ children, ...props }: any) => React.createElement('div', props, children);
export const Header = ({ children, ...props }: any) => React.createElement('div', props, children);
export const Trigger = ({ children, ...props }: any) => React.createElement('button', props, children);
export const Content = ({ children, ...props }: any) => React.createElement('div', props, children);

export const Accordion = Root;
export const AccordionItem = Item;
export const AccordionTrigger = Trigger;
export const AccordionContent = Content;
