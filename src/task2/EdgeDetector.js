/**
 * Edge image from a greyscale frame. The two Sobel passes of week 15 are run
 * separately, one for vertical edges and one for horizontal, then added.
 */
class EdgeDetector {
    /**
     * Builds the edge output for a greyscale frame.
     * @param {p5.Image} grey - Frame produced by GreyscaleFilter.
     * @return {p5.Image} Image whose bright pixels are the edges.
     */
    static detect(grey) {
        const w = grey.width;
        const h = grey.height;

        grey.loadPixels();
        const gx = ConvolutionFilter.convolve(grey, ConvolutionFilter.SOBEL_X);
        const gy = ConvolutionFilter.convolve(grey, ConvolutionFilter.SOBEL_Y);

        const output = createImage(w, h);
        output.loadPixels();

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const cell = x + y * w;
                // Each response is remapped before the two are added, and
                // the sum is clamped to a legal pixel value.
                const edgeX = map(
                    Math.abs(gx[cell]), 0, ConvolutionFilter.SOBEL_RANGE, 0, 255
                );
                const edgeY = map(
                    Math.abs(gy[cell]), 0, ConvolutionFilter.SOBEL_RANGE, 0, 255
                );
                const strength = Math.min(edgeX + edgeY, 255);

                const index = PixelUtilities.pixelIndex(x, y, w);
                output.pixels[index] = strength;
                output.pixels[index + 1] = strength;
                output.pixels[index + 2] = strength;
                output.pixels[index + 3] = 255;
            }
        }

        output.updatePixels();
        return output;
    }
}
