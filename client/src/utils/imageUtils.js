// High Quality Original Camera Quality Image Enhancer & Auto-Clarity Engine
export const enhanceImageClarity = (file, maxWidth = 3840, maxHeight = 3840, quality = 0.98) => {
    return new Promise((resolve, reject) => {
        if (!file) return resolve('');
        
        // If file is already a URL or base64 string
        if (typeof file === 'string') {
            if (file.startsWith('data:image')) {
                processImageSrc(file, maxWidth, maxHeight, quality, resolve);
            } else {
                return resolve(file);
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            // Preserve full original camera resolution & original background
            processImageSrc(e.target.result, maxWidth, maxHeight, quality, resolve);
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
    });
};

function processImageSrc(src, maxWidth, maxHeight, quality, resolve) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
        try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Preserve full camera resolution (up to 3840px 4K UHD)
            if (width > maxWidth || height > maxHeight) {
                if (width > height) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                } else {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Pass 1: Draw original image with its EXACT original background colors intact!
            ctx.drawImage(img, 0, 0, width, height);

            // Pass 2: High Definition Adaptive Sharpening WITHOUT altering original background color tint
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            const w = imageData.width;
            const h = imageData.height;

            // Copy for 3x3 Sharpen Kernel
            const buff = new Uint8ClampedArray(data);

            for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                    const idx = (y * w + x) * 4;
                    const alpha = buff[idx + 3];
                    if (alpha < 10) continue; // preserve transparency

                    for (let c = 0; c < 3; c++) {
                        const center = buff[idx + c];
                        const top = buff[((y - 1) * w + x) * 4 + c];
                        const bottom = buff[((y + 1) * w + x) * 4 + c];
                        const left = buff[(y * w + (x - 1)) * 4 + c];
                        const right = buff[(y * w + (x + 1)) * 4 + c];

                        // Subtle edge sharpening preserving exact background colors
                        let sharp = center * 1.6 - (top + bottom + left + right) * 0.15;
                        data[idx + c] = Math.min(255, Math.max(0, sharp));
                    }
                }
            }

            ctx.putImageData(imageData, 0, 0);

            // Preserve PNG format if original is PNG to keep original background transparency/tint!
            const format = (typeof src === 'string' && src.startsWith('data:image/png')) ? 'image/png' : 'image/jpeg';
            const dataUrl = canvas.toDataURL(format, quality);
            resolve(dataUrl);
        } catch (canvasErr) {
            resolve(src);
        }
    };
    img.onerror = () => resolve(src);
    img.src = src;
}

export const fileToDataUrl = enhanceImageClarity;
