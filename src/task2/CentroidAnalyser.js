/** Centroid of a thresholded image: mean x and mean y of its pixels. */
class CentroidAnalyser {
    /** Sums x and y over the white pixels and divides by the count. */
    static compute(binary) {
        const w = binary.width;
        const h = binary.height;

        binary.loadPixels();
        let sumX = 0;
        let sumY = 0;
        let count = 0;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const index = PixelUtilities.pixelIndex(x, y, w);
                if (binary.pixels[index] === 0) continue;
                sumX += x;
                sumY += y;
                count++;
            }
        }

        if (count === 0) return null;
        return { x: sumX / count, y: sumY / count, count: count };
    }
}
