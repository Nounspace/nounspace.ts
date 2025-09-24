'use client';

import React from "react";

type LinkOutProps = React.PropsWithChildren<
  React.AnchorHTMLAttributes<HTMLAnchorElement>
> & {
  href: string;
};

const LinkOut: React.FC<LinkOutProps> = ({ children, href, ...props }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  );
};

export default LinkOut;
