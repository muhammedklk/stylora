// High Quality Canvas Image Enhancer & Sharpening Filter
export const enhanceImageClarity = (file, maxWidth = 1600, maxHeight = 1600, quality = 0.95) => {
    return new Promise((resolve, reject) => {
        if (!file) return resolve('');
        
        // If file is already a base64 string or URL, process directly
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
            processImageSrc(e.target.result, maxWidth, maxHeight, quality, resolve);
        };
        reader.onerror = reject;
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

            // Target high resolution rendering (minimum 1200px if original is smaller)
            const minSize = 1200;
            if (width < minSize && height < minSize) {
                const scale = minSize / Math.min(width, height);
                width = Math.round(width * scale);
                height = Math.round(height * scale);
            }

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

            // Draw upscaled image
            ctx.drawImage(img, 0, 0, width, height);

            // Apply Convolution Sharpen Matrix for ultra high clarity
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            const w = imageData.width;
            const h = imageData.height;
            const buff = new Uint8ClampedArray(data);

            // Sharpen Kernel:
            // [ 0, -0.2, 0 ]
            // [ -0.2, 1.8, -0.2 ]
            // [ 0, -0.2, 0 ]
            for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                    const idx = (y * w + x) * 4;
                    for (let c = 0; c < 3; c++) {
                        const top = buff[((y - 1) * w + x) * 4 + c];
                        const bottom = buff[((y + 1) * w + x) * 4 + c];
                        const left = buff[(y * w + (x - 1)) * 4 + c];
                        const right = buff[(y * w + (x + 1)) * 4 + c];
                        const center = buff[idx + c];

                        let val = center * 1.8 - (top + bottom + left + right) * 0.2;
                        data[idx + c] = Math.min(255, Math.max(0, val));
                    }
                }
            }

            ctx.putImageData(imageData, 0, 0);

            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
        } catch (canvasErr) {
            resolve(src);
        }
    };
    img.onerror = () => resolve(src);
    img.src = src;
}

export const fileToDataUrl = enhanceImageClarity;
