import type { MDXComponents as MDXComponentsType } from "mdx/types";
import Image from "next/image";
import CodeBlock from "./CodeBlock";
import Callout from "./Callout";

export const MDXComponents: MDXComponentsType = {
  img: (props) => {
    const { src, alt, ...rest } = props as { src: string; alt?: string; [key: string]: unknown };
    return (
      <Image
        src={src}
        alt={alt || ""}
        width={800}
        height={400}
        className="rounded-lg"
        loading="lazy"
        {...rest}
      />
    );
  },
  pre: (props) => <CodeBlock {...props} />,
  Callout,
};
