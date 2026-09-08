/** Class converting a colour image to greyscale. */
class GreyscaleFilter {
    /**
     * Builds a greyscale copy using the luma weights rather than a plain
     * average, so the brightness of the original is preserved (week 15).
     * @param {p5.Image} source - The colour frame.
     * @return {p5.Image} A greyscale copy of the frame.
     */
    static apply(source) {
        const w = source.width;
        const h = source.height;

        source.loadPixels();
        const output = createImage(w, h);
        output.loadPixels();

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const index = PixelUtilities.pixelIndex(x, y, w);
                const grey = PixelUtilities.luma(
                    source.pixels[index],
                    source.pixels[index + 1],
                    source.pixels[index + 2]
                );
                output.pixels[index] = grey;
                output.pixels[index + 1] = grey;
                output.pixels[index + 2] = grey;
                output.pixels[index + 3] = 255;
            }
        }

        output.updatePixels();
        return output;
    }
}
