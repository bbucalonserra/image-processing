/**
 * Centroid of a thresholded edge image: sum of x and sum of y over every
 * pixel left, each divided by the count.
 */
class CentroidAnalyser {
    /**
     * @param {p5.Image} binary - Thresholded edge image, white on black.
     * @return {object} {x, y, count}, or null when no pixel survived.
     */
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
