import { cache } from "react";
import * as Y from "yjs";
import { fetch } from "undici";

const workspaceId = "mWn__KSlOgS1tdDEjdX6P";
const target = "https://app.affine.pro";

import { deltaToMd } from "./delta-to-md";

type YBlock = Y.Map<unknown>;
type YBlocks = Y.Map<YBlock>;
type BaseFlavour<T extends string> = `affine:${T}`;
type Flavour = BaseFlavour<
  | "page"
  | "frame"
  | "paragraph"
  | "code"
  | "list"
  | "divider"
  | "embed"
  | "surface"
  | "database"
>;

function block2md(yBlock: YBlock, yBlocks: YBlocks, padLeft = ""): string {
  const flavour = yBlock.get("sys:flavour") as Flavour;
  const type = yBlock.get("prop:type") as string;
  const toMd = () => deltaToMd((yBlock.get("prop:text") as Y.Text).toDelta());
  let content = "";
  let resetPadding = false;

  switch (flavour) {
    case "affine:paragraph": {
      let initial = "";
      if (type === "h1") {
        initial = "# ";
      } else if (type === "h2") {
        initial = "## ";
      } else if (type === "h3") {
        initial = "### ";
      } else if (type === "h4") {
        initial = "#### ";
      } else if (type === "h5") {
        initial = "##### ";
      } else if (type === "h6") {
        initial = "###### ";
      } else if (type === "quote") {
        initial = "> ";
      }
      content = initial + toMd() + "\n";
      break;
    }
    case "affine:divider": {
      content = "\n---\n\n";
      break;
    }
    case "affine:list": {
      content = "* " + toMd();
      break;
    }
    case "affine:code": {
      content = "```" + yBlock.get("prop:language") + "\n" + toMd() + "```\n\n";
      break;
    }
    case "affine:embed": {
      if (type === "image") {
        // https://app.affine.pro/api/workspace/mWn__KSlOgS1tdDEjdX6P/blob/hG9UPLuPwAO_Ahot5ztXkr53NVIRKaMb_7NcPaiK5MQ=
        const sourceId = yBlock.get("prop:sourceId") as string;
        content = `![${sourceId}](${target}/api/workspace/${workspaceId}/blob/${sourceId})\n\n`;
        break;
      }
    }
    case "affine:page":
    case "affine:frame": {
      content = "";
      resetPadding = true;
      break;
    }
    default:
      throw new Error(flavour + " rendering not implemented");
  }

  const childrenIds = yBlock.get("sys:children");
  if (childrenIds instanceof Y.Array) {
    content += childrenIds
      .map((cid) => {
        return block2md(
          yBlocks.get(cid) as YBlock,
          yBlocks,
          resetPadding ? "" : padLeft + "  "
        );
      })
      .join("");
  }
  return padLeft + content;
}

export interface PostProperties {
  slug?: string;
  id: string;
  name?: string;
  date: string;
}

async function getYDoc(id: string) {
  const response = await fetch(`${target}/api/public/doc/${id}`);
  const updates = await response.arrayBuffer();
  const doc = new Y.Doc();
  Y.applyUpdate(doc, new Uint8Array(updates));
  return doc;
}

export interface WorkspacePage {
  id: string;
  title: string;
  createDate: string;
  md?: string;
}

export const getWorkspacePages = cache(
  async (retry = 3): Promise<WorkspacePage[]> => {
    try {
      const start = performance.now();
      console.log(`getting doc from affine public workspace API ...(${retry})`);

      const yDoc = await getYDoc(workspaceId);
      const meta = yDoc.getMap("space:meta").toJSON();
      const elapsed = (performance.now() - start).toFixed(2);

      console.log(`got doc from affine public workspace API in ${elapsed}ms`);

      return meta.pages;
    } catch {
      if (retry > 0) {
        return getWorkspacePages(retry - 1);
      }
      throw new Error("could not get workspace doc");
    }
  }
);

export const getWorkspacePageMD = cache(
  async (id: string): Promise<WorkspacePage | null> => {
    try {
      const start = performance.now();
      console.log(
        `getting page "${id}" from affine public workspace API ...`
      );

      const yDoc = await getYDoc(workspaceId);
      const meta = yDoc.getMap("space:meta").toJSON();
      const page = meta.pages.find((p: any) => p.id === id);

      if (!page) {
        return null;
      }

      const yBlocks: YBlocks = yDoc.getMap(`space:${page.id}`);
      const yPage = Array.from(yBlocks.values())[0];

      const pageWithMD = {
        ...page,
        md: block2md(yPage, yBlocks),
      };

      const elapsed = (performance.now() - start).toFixed(2);

      console.log(`got doc from affine public workspace API in ${elapsed}ms`);

      return pageWithMD;
    } catch {
      throw new Error("could not get workspace doc");
    }
  }
);
