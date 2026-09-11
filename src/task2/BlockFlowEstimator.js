/**
 * The extension: a second motion estimator by block matching (week 17), on a
 * downscaled copy, skipping flat blocks, taking the median of the matches.
 */
class BlockFlowEstimator {
    /**
     * @param {number} scale - Factor the frames are reduced by before matching.
     * @param {number} blockSize - Block side in the reduced frame, in pixels.
     * @param {number} searchRadius - Search window radius in the reduced frame.
     * @param {number} minContrast - Range a block must span to be matched.
     */
    constructor(scale, blockSize, searchRadius, minContrast) {
        this.scale = scale;
        this.blockSize = blockSize;
        this.searchRadius = searchRadius;
        this.minContrast = minContrast;
    }

    /**
     * Reduces a greyscale frame and returns its grey levels as a flat array.
     * @param {p5.Image} grey - Greyscale frame.
     * @return {object} {data, w, h} of the reduced frame.
     */
    reduce(grey) {
        const w = Math.max(1, Math.round(grey.width * this.scale));
        const h = Math.max(1, Math.round(grey.height * this.scale));
        const small = PixelUtilities.scaledCopy(grey, w, h);

        small.loadPixels();
        const data = new Uint8Array(w * h);
        for (let i = 0; i < data.length; i++) {
            data[i] = small.pixels[i * 4];
        }
        return { data: data, w: w, h: h };
    }

    /**
     * Range of grey levels inside one block, used to reject flat blocks.
     * @param {object} frame - {data, w, h} of the reduced frame.
     * @param {number} blockX - Left edge of the block.
     * @param {number} blockY - Top edge of the block.
     * @return {number} Difference between the highest and lowest grey level.
     */
    blockContrast(frame, blockX, blockY) {
        let low = 255;
        let high = 0;
        for (let y = 0; y < this.blockSize; y++) {
            for (let x = 0; x < this.blockSize; x++) {
                const value = frame.data[(blockX + x) + (blockY + y) * frame.w];
                if (value < low) low = value;
                if (value > high) high = value;
            }
        }
        return high - low;
    }

    /**
     * Finds the offset with the lowest sum of absolute differences for one
     * block of frame A inside frame B.
     * @param {object} frameA - {data, w, h} of the first reduced frame.
     * @param {object} frameB - {data, w, h} of the second reduced frame.
     * @param {number} blockX - Left edge of the block in frame A.
     * @param {number} blockY - Top edge of the block in frame A.
     * @return {object} {dx, dy} of the match with the lowest score, in
     *     reduced pixels.
     */
    matchBlock(frameA, frameB, blockX, blockY) {
        let bestScore = Infinity;
        let bestX = 0;
        let bestY = 0;

        for (let dy = -this.searchRadius; dy <= this.searchRadius; dy++) {
            const originY = blockY + dy;
            if (originY < 0 || originY + this.blockSize > frameB.h) continue;

            for (let dx = -this.searchRadius; dx <= this.searchRadius; dx++) {
                const originX = blockX + dx;
                if (originX < 0) continue;
                if (originX + this.blockSize > frameB.w) continue;

                let score = 0;
                for (let y = 0; y < this.blockSize; y++) {
                    const rowA = (blockY + y) * frameA.w + blockX;
                    const rowB = (originY + y) * frameB.w + originX;
                    for (let x = 0; x < this.blockSize; x++) {
                        const diff =
                            frameA.data[rowA + x] - frameB.data[rowB + x];
                        score += diff < 0 ? -diff : diff;
                    }
                    if (score >= bestScore) break;
                }

                if (score < bestScore) {
                    bestScore = score;
                    bestX = dx;
                    bestY = dy;
                }
            }
        }
        return { dx: bestX, dy: bestY };
    }

    /**
     * Median of a list of numbers.
     * @param {Array<number>} values - The values to reduce.
     * @return {number} The median, or 0 for an empty list.
     */
    median(values) {
        if (values.length === 0) return 0;
        const sorted = values.slice().sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 1
            ? sorted[middle]
            : (sorted[middle - 1] + sorted[middle]) / 2;
    }

    /**
     * Estimates the shift between two greyscale frames.
     * @param {p5.Image} greyA - Greyscale Frame A.
     * @param {p5.Image} greyB - Greyscale Frame B.
     * @return {object} {dx, dy, vectors, matched, total, millis} in the
     *     coordinates of the original frames.
     */
    estimate(greyA, greyB) {
        const startedAt = millis();
        const frameA = this.reduce(greyA);
        const frameB = this.reduce(greyB);

        const shiftsX = [];
        const shiftsY = [];
        const vectors = [];
        let total = 0;

        const step = this.blockSize;
        for (let y = 0; y + step <= frameA.h; y += step) {
            for (let x = 0; x + step <= frameA.w; x += step) {
                total++;
                const contrast = this.blockContrast(frameA, x, y);
                if (contrast < this.minContrast) continue;

                const match = this.matchBlock(frameA, frameB, x, y);
                shiftsX.push(match.dx / this.scale);
                shiftsY.push(match.dy / this.scale);
                vectors.push({
                    x: (x + this.blockSize / 2) / this.scale,
                    y: (y + this.blockSize / 2) / this.scale,
                    dx: match.dx / this.scale,
                    dy: match.dy / this.scale
                });
            }
        }

        return {
            dx: this.median(shiftsX),
            dy: this.median(shiftsY),
            vectors: vectors,
            matched: shiftsX.length,
            total: total,
            millis: millis() - startedAt
        };
    }
}
