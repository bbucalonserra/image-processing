/**
 * Forces the edge output to pick sides so only the strongest outlines survive.
 * This is the threshold filter of week 15, driven by the on screen slider.
 */
class EdgeThresholder {
    /**
     * Builds a black and white copy of an edge image.
     * @param {p5.Image} edges - Output of EdgeDetector.
     * @param {number} threshold - Strength a pixel must reach, 0 to 255.
     * @return {p5.Image} White outlines on black.
     */
    static apply(edges, threshold) {
        const w = edges.width;
        const h = edges.height;

        edges.loadPixels();
        const output = createImage(w, h);
        output.loadPixels();

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const index = PixelUtilities.pixelIndex(x, y, w);
                const value = edges.pixels[index] >= threshold ? 255 : 0;
                output.pixels[index] = value;
                output.pixels[index + 1] = value;
                output.pixels[index + 2] = value;
                output.pixels[index + 3] = 255;
            }
        }

        output.updatePixels();
        return output;
    }
}
