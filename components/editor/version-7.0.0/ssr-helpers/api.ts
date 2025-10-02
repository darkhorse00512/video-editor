import { z } from "zod";
import {
  RenderRequest,
  ProgressRequest,
  ProgressResponse,
} from "@/components/editor/version-7.0.0/types";
import { CompositionProps } from "@/components/editor/version-7.0.0/types";

type ApiResponse<T> = {
  type: "success" | "error";
  data?: T;
  message?: string;
};

const makeRequest = async <Res>(
  endpoint: string,
  body: unknown
): Promise<Res> => {
  console.log(`Making request to ${endpoint}`, { body });
  const result = await fetch(endpoint, {
    method: "post",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  });
  const json = (await result.json()) as ApiResponse<Res>;
  console.log(`Response received from ${endpoint}`, { json });
  if (json.type === "error") {
    console.error(`Error in response from ${endpoint}:`, json.message);
    throw new Error(json.message);
  }

  if (!json.data) {
    throw new Error(`No data received from ${endpoint}`);
  }

  return json.data;
};

export interface RenderResponse {
  renderId: string;
}

export const renderVideo = async ({
  id,
  inputProps,
}: {
  id: string;
  inputProps: z.infer<typeof CompositionProps>;
}) => {
  console.log("Rendering video", { id, inputProps });
  const body: z.infer<typeof RenderRequest> = {
    id,
    inputProps,
  };

  const response = await makeRequest<RenderResponse>(
    "/api/latest/ssr/render",
    body
  );
  console.log("Video render response", { response });
  return response;
};

export const getProgress = async ({
  id,
  bucketName,
}: {
  id: string;
  bucketName: string;
}) => {
  console.log("Getting progress", { id });
  const body: z.infer<typeof ProgressRequest> = {
    id,
    bucketName,
  };

  const response = await makeRequest<ProgressResponse>(
    "/api/latest/ssr/progress",
    body
  );
  console.log("Progress response", { response });
  return response;
};
