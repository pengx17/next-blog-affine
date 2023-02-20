import { WorkspacePage } from "blocksuite-reader";
import { MDXRemote } from "next-mdx-remote/rsc";

import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { getMdxComponents } from "../../../components/mdx-components";
import { DateString } from "../../../date";

import rehypeShiki from "../../../lib/rehype-shiki";

export function PostRenderer({ createDate, md, title }: WorkspacePage) {
  return (
    <>
      <h1 className="my-6 text-4xl font-serif font-bold leading-snug">
        {title}
      </h1>
      <div className="text-gray-600 mb-8 ml-0.5">
        <DateString date={createDate} />
      </div>
      {/* @ts-expect-error Server Component */}
      <MDXRemote
        options={{
          mdxOptions: {
            // development: process.env.NODE_ENV !== "production",
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug, rehypeShiki],
          },
        }}
        source={md ?? ''}
        // @ts-expect-error Server Component
        components={getMdxComponents({
          notes: {},
          tweetAstMap: {},
        })}
      />
    </>
  );
}
