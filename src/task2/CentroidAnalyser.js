/**
 * Centroid of a thresholded edge image, by the method the brief sets out: take
 * every pixel left in the image, add up their x positions and their y
 * positions, divide both totals by the number counted.
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
