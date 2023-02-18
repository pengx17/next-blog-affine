import { getWorkspacePageMD, getWorkspacePages } from "../../../lib/affine-data";
import { PostRenderer } from "./post-renderer";

export default async function Post({ params }: { params: { slug: string } }) {
  const post = await getWorkspacePageMD(params.slug);

  if (!post) {
    return <div>404 not found</div>;
  }

  return (
    <div className="w-full">
      <PostRenderer {...post} />
    </div>
  );
}

export async function generateStaticParams() {
  const pages = await getWorkspacePages();
  return pages.map((page) => ({
    id: page.id,
    slug: page.id,
  }));
}

export const revalidate = 60;
