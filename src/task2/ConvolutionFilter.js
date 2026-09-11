/**
 * Applies a convolution kernel (week 15). The result is returned as signed
 * sums, since an edge kernel gives negative responses.
 */
class ConvolutionFilter {
    /**
     * Sobel kernel with its asymmetry left to right, so it responds to
     * vertical edges (week 15).
     * @return {Array<Array<number>>} The 3x3 kernel.
     */
    static get SOBEL_X() {
        return [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
    }

    /**
     * Sobel kernel with its asymmetry top to bottom, so it responds to
     * horizontal edges (week 15).
     * @return {Array<Array<number>>} The 3x3 kernel.
     */
    static get SOBEL_Y() {
        return [
            [-1, -2, -1],
            [0, 0, 0],
            [1, 2, 1]
        ];
    }

    /**
     * Largest sum a Sobel kernel can return: the positive weights total four
     * and a pixel reaches 255.
     * @return {number} Largest possible response.
     */
    static get SOBEL_RANGE() {
        return 1020;
    }

    /**
     * Convolves the red channel of a greyscale image with a kernel. The offset
     * centres the kernel on the pixel. The kernel row picks the vertical
     * neighbour and the column the horizontal one (week 15).
     * @param {p5.Image} source - Greyscale image with its pixels loaded.
     * @param {Array<Array<number>>} kernel - Square kernel of odd size.
     * @return {Float32Array} One signed response per pixel.
     */
    static convolve(source, kernel) {
        const w = source.width;
        const h = source.height;
        const size = kernel.length;
        const offset = Math.floor(size / 2);
        const response = new Float32Array(w * h);

        // Border pixels stay at zero. A partial kernel there would draw an
        // edge around the frame, because its weights no longer sum to zero.
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
