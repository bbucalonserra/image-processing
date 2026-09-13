/** Applies a convolution kernel. Responses are signed. */
class ConvolutionFilter {
    /** Sobel kernel for vertical edges (week 15). */
    static get SOBEL_X() {
        return [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
    }

    /** Sobel kernel for horizontal edges (week 15). */
    static get SOBEL_Y() {
        return [
            [-1, -2, -1],
            [0, 0, 0],
            [1, 2, 1]
        ];
    }

    /** Largest sum a Sobel kernel can return, 4 times 255. */
    static get SOBEL_RANGE() {
        return 1020;
    }

    /** Convolves the red channel of a greyscale image with a kernel. */
    static convolve(source, kernel) {
        const w = source.width;
        const h = source.height;
        const size = kernel.length;
        const offset = Math.floor(size / 2);
        const response = new Float32Array(w * h);

        // Border pixels stay at zero. A cut kernel draws a false edge.
        for (let y = offset; y < h - offset; y++) {
            for (let x = offset; x < w - offset; x++) {
                let total = 0;
                for (let j = 0; j < size; j++) {
                    for (let i = 0; i < size; i++) {
                        const index = PixelUtilities.pixelIndex(
                            x + i - offset, y + j - offset, w
                        );
                        total += source.pixels[index] * kernel[j][i];
                    }
                }
                response[x + y * w] = total;
            }
        }
        return response;
    }
}
