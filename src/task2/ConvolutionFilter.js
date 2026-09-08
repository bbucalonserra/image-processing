/**
 * Class applying a convolution kernel to an image, following the moving
 * weighted average described in week 15. The result is returned as raw signed
 * sums rather than pixels, because an edge kernel produces negative responses
 * that must survive until the two Sobel passes are combined.
 */
class ConvolutionFilter {
    /**
     * Sobel kernel with its asymmetry running left to right, so it responds to
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
     * Sobel kernel with its asymmetry running top to bottom, so it responds to
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
     * Largest sum a Sobel kernel can return, used to map the response back
     * into the 0 to 255 range: the positive weights total four, and the
     * brightest pixel is 255.
     * @return {number} The largest possible response.
     */
    static get SOBEL_RANGE() {
        return 1020;
    }

    /**
     * Convolves the red channel of a greyscale image with a kernel. The offset
     * centres the kernel on the pixel being examined, and pixels outside the
     * image are skipped, which leaves the one pixel border untouched. The
     * kernels above are written row by row, so the row picks the vertical
     * neighbour and the column the horizontal one, which is the transposed
     * reading week 15 warns about.
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

        // Pixels within one kernel radius of the border have no full
        // neighbourhood, so they are left at zero rather than convolved with a
        // partial kernel, which would otherwise draw a bright false edge right
        // around the frame (week 15).
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
