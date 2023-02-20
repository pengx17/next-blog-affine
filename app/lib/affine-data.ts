import { cache } from "react";

import { getBlocksuiteReader, WorkspacePage } from 'blocksuite-reader';

const workspaceId = "mWn__KSlOgS1tdDEjdX6P";

const reader = getBlocksuiteReader({
  workspaceId
})

export const getWorkspacePages = cache(
  async (retry = 3): Promise<WorkspacePage[]> => {
    try {
      const start = performance.now();
      console.log(`getting doc from affine public workspace API ...(${retry})`);

      const pages = reader.getWorkspacePages(false);
      const elapsed = (performance.now() - start).toFixed(2);

      console.log(`got doc from affine public workspace API in ${elapsed}ms`);

      return pages;
    } catch (err) {
      console.error(err);
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
      console.log(`getting page "${id}" from affine public workspace API ...`);

      const pageWithMD = await reader.getWorkspacePage(id);

      const elapsed = (performance.now() - start).toFixed(2);

      console.log(`got doc from affine public workspace API in ${elapsed}ms`);

      return pageWithMD;
    } catch (error) {
      console.error(error);
      throw new Error("could not get workspace doc");
    }
  }
);
