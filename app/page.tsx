import Link from "next/link";
import { use } from "react";
import { DateString } from "./date";
import { getWorkspacePages } from "./lib/affine-data";

export default function Home() {
  const pages = use(getWorkspacePages());
  return (
    <section className="w-screen h-screen flex sm:items-center justify-self-center flex-col sm:flex-row">
      <div className="sm:flex-1 pl-12 py-2 mt-2 inline font-serif font-semibold">
        <span className="text-4xl sm:text-5xl">Index</span>
        <span className="text-gray-600 text-lg ml-1">
          <Link href="/about">pengx17</Link>
        </span>
      </div>
      <div className="sm:flex-1 sm:py-24 max-h-full overflow-auto px-12 py-12">
        {pages.filter(p => !p.trash).map(({ id, title, createDate }) => (
          <div className="mb-6" key={id}>
            <Link
              href={`/posts/${id}`}
              className="text-xl font-semibold font-serif"
            >
              {title}
            </Link>
            <br />
            <span className="text-xs text-gray-600">
              <DateString date={createDate} />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export const revalidate = 600;
