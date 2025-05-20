export async function uploadImage(file: File): Promise<string | null> {
  if (file.size > 5 * 1024 * 1024) {
    console.error("File size exceeds 5MB limit");
    return null;
  }

  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    console.error("ImgBB API key is not configured");
    return null;
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();
    if (data.success) {
      return data.data.display_url || data.data.url;
    }

    console.error("Failed to upload image", data.error);
    return null;
  } catch (err) {
    console.error("Error uploading image:", err);
    return null;
  }
}

