import { NextApiRequest, NextApiResponse } from "next/types";
import requestHandler from "@/common/data/api/requestHandler";

export type ImageUploadResponse = {
  url?: string;
  error?: string;
};

async function uploadImage(req: NextApiRequest, res: NextApiResponse<ImageUploadResponse>) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image } = req.body as { image?: string };
  if (!image) {
    return res.status(400).json({ error: "Missing image" });
  }

  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ImgBB API key not configured" });
  }

  const formData = new FormData();
  formData.append("image", image);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as any;
    if (data.success) {
      return res.status(200).json({ url: data.data.display_url || data.data.url });
    }
    return res
      .status(500)
      .json({ error: data.error?.message || "Failed to upload image" });
  } catch (err) {
    console.error("Error uploading image:", err);
    return res.status(500).json({ error: "Error uploading image" });
  }
}

export default requestHandler({ post: uploadImage });
