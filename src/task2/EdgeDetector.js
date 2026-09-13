/** Edge image from two Sobel passes added together (week 15). */
class EdgeDetector {
    /** Builds the edge output for a greyscale frame. */
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
                // Both responses are remapped, added, then clamped to 255.
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
