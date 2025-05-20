export async function uploadImage(file: File): Promise<string | null> {
  if (file.size > 5 * 1024 * 1024) {
    console.error("File size exceeds 5MB limit");
    return null;
  }

  const reader = new FileReader();
  const base64 = await new Promise<string>((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  try {
    const response = await fetch("/api/images/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64 }),
    });

    if (!response.ok) {
      console.error("Failed to upload image", await response.text());
      return null;
    }

    const data = (await response.json()) as { url?: string };
    return data.url || null;
  } catch (err) {
    console.error("Error uploading image:", err);
    return null;
  }
}

