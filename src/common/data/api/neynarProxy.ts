import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next/types";

/**
 * Proxy API requests to Neynar API with common error handling and request formatting
 * 
 * @param req - Next.js API request
 * @param res - Next.js API response
 * @param endpoint - Neynar API endpoint (e.g. "/v2/farcaster/channel/followers")
 * @returns Promise<void>
 */
export async function proxyToNeynar(
  req: NextApiRequest, 
  res: NextApiResponse, 
  endpoint: string
): Promise<void> {
  try {
    // Validate API key
    if (!process.env.NEYNAR_API_KEY) {
      return res.status(500).json({
        error: "Server configuration error: Missing Neynar API key"
      });
    }

    const options: AxiosRequestConfig = {
      method: "GET",
      url: `https://api.neynar.com${endpoint}`,
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY,
      },
      params: req.query,
    };

    const { data } = await axios.request(options);

    // Handle case where data includes status other than 200
    if (data.status && data.status !== 200) {
      return res.status(data.status).json(data);
    }

    return res.status(200).json(data);
  }   catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorData = error.response?.data;
      // Ensure errorData is a proper object
      const responseData = typeof errorData === 'object' && errorData !== null 
        ? errorData 
        : { error: errorData || "An unknown error occurred", status };
      return res.status(status).json(responseData);
    }
    // For non-Axios errors, ensure consistent format
    return res.status(500).json({ error: "An unknown error occurred", status: 500 });
  }
}

