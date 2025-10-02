import { ProgressRequest } from "@/components/editor/version-7.0.0/types";

import { getRenderState } from "@/components/editor/version-7.0.0/ssr-helpers/render-state";
import { executeApi } from "@/components/editor/version-7.0.0/ssr-helpers/api-response";

/**
 * POST endpoint handler for checking rendering progress
 */
export const POST = executeApi(ProgressRequest, async (req, body) => {
  const { id } = body;
  const state = getRenderState(id);

  if (!state) {
    return {
      type: "error",
      message: `No render found with ID: ${id}`,
    };
  }

  switch (state.status) {
    case "error":
      return {
        type: "error",
        message: state.error || "Unknown error occurred",
      };
    case "done":
      return {
        type: "done",
        url: state.url,
        size: state.size,
      };
    default:
      return {
        type: "progress",
        progress: state.progress || 0,
      };
  }
});
