/**
 * Automatically optimizes and compresses an image client-side before uploading.
 * - Handles camera photos, high-res PNGs, and large WebP/JPEG files up to 50MB+.
 * - Resizes images exceeding maxDimension (default 2048px) proportionally.
 * - Compresses to a high-quality WebP or JPEG blob (default ~500KB - 1.5MB).
 * - Avoids large payload upload errors, network timeouts, and server rejections.
 */
export const optimizeImageFile = async (file, maxDimension = 2048, quality = 0.85) => {
  if (!file || !file.type || !file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file; // SVGs, docs, or non-images don't need canvas compression
  }

  // If already lightweight (under 1.2MB), return original file directly
  if (file.size <= 1.2 * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            let { width, height } = img;
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return resolve(file);

            ctx.drawImage(img, 0, 0, width, height);

            const mimeType = "image/webp";
            canvas.toBlob(
              (blob) => {
                if (blob && blob.size < file.size) {
                  const cleanName = file.name.replace(/\.[^.]+$/, ".webp");
                  const optimizedFile = new File([blob], cleanName, {
                    type: mimeType,
                    lastModified: Date.now(),
                  });
                  resolve(optimizedFile);
                } else {
                  resolve(file);
                }
              },
              mimeType,
              quality
            );
          } catch (canvasErr) {
            console.warn("Canvas compression warning, using original file:", canvasErr);
            resolve(file);
          }
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    } catch (err) {
      console.warn("Image optimization error, using original file:", err);
      resolve(file);
    }
  });
};

export default optimizeImageFile;
