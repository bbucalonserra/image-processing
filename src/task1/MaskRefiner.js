/**
 * Turns a threshold mask into an alpha channel with no residual background:
 * flood fill from the border (week 17), island removal, growth, 3x3 blur.
 */
class MaskRefiner {
    /**
     * @param {number} minIslandArea - Foreground blobs below this pixel count
     *     are removed.
     * @param {number} growPasses - Pixels the background grows by.
     * @param {number} featherPasses - Blur passes applied to the edge.
     */
    constructor(minIslandArea, growPasses, featherPasses) {
        this.minIslandArea = minIslandArea;
        this.growPasses = growPasses;
        this.featherPasses = featherPasses;

        /** @type {Array<number>} Horizontal offsets, four connected. */
        this.stepX = [1, -1, 0, 0];
        /** @type {Array<number>} Matching vertical offsets. */
        this.stepY = [0, 0, 1, -1];
    }

    /**
     * Runs the four refinement steps.
     * @param {Uint8Array} mask - 1 where the threshold called background.
     * @param {number} w - Mask width in pixels.
     * @param {number} h - Mask height in pixels.
     * @return {Uint8Array} Alpha channel, 0 background to 255 foreground.
     */
    refine(mask, w, h) {
        return this.refineWithCounts(mask, w, h).alpha;
    }

    /**
     * Same chain as refine, and also reports how many pixels the threshold
     * called background and how many of those were not joined to the border,
     * the figure the two colour spaces are compared on.
     * @param {Uint8Array} mask - 1 where the threshold called background.
     * @param {number} w - Mask width in pixels.
     * @param {number} h - Mask height in pixels.
     * @return {object} {alpha, thresholdBackground, reclaimed}.
     */
    refineWithCounts(mask, w, h) {
        const connected = this.keepBorderConnected(mask, w, h);

        let thresholdBackground = 0;
        let connectedBackground = 0;
        for (let i = 0; i < mask.length; i++) {
            if (mask[i] === 1) thresholdBackground++;
            if (connected[i] === 1) connectedBackground++;
        }

        let refined = this.removeSmallIslands(connected, w, h);
        refined = this.growBackground(refined, w, h);
        return {
            alpha: this.feather(this.toAlpha(refined), w, h),
            thresholdBackground: thresholdBackground,
            reclaimed: thresholdBackground - connectedBackground
        };
    }

    /**
     * Keeps only background reachable from the image border (week 17).
     * Backdrop colour enclosed by the subject is returned to the subject.
     * @param {Uint8Array} mask - Threshold mask.
     * @param {number} w - Mask width in pixels.
     * @param {number} h - Mask height in pixels.
     * @return {Uint8Array} Border connected background only.
     */
    keepBorderConnected(mask, w, h) {
        const reached = new Uint8Array(w * h);
        const stack = new Int32Array(w * h);
        let top = 0;

        for (let x = 0; x < w; x++) {
            top = this.pushSeed(mask, reached, stack, top, x, 0, w);
            top = this.pushSeed(mask, reached, stack, top, x, h - 1, w);
        }
        for (let y = 0; y < h; y++) {
            top = this.pushSeed(mask, reached, stack, top, 0, y, w);
            top = this.pushSeed(mask, reached, stack, top, w - 1, y, w);
        }

        while (top > 0) {
            const cell = stack[--top];
            const x = cell % w;
            const y = (cell - x) / w;
            for (let s = 0; s < 4; s++) {
                const nx = x + this.stepX[s];
                const ny = y + this.stepY[s];
                if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
                const next = nx + ny * w;
                if (mask[next] === 1 && reached[next] === 0) {
                    reached[next] = 1;
                    stack[top++] = next;
                }
            }
        }
        return reached;
    }

    /**
     * Adds a border pixel to the fill stack when it is unvisited background.
     * @param {Uint8Array} mask - Threshold mask.
     * @param {Uint8Array} reached - Visited flags, edited in place.
     * @param {Int32Array} stack - The fill stack, edited in place.
     * @param {number} top - Current stack height.
     * @param {number} x - Column of the candidate seed.
     * @param {number} y - Row of the candidate seed.
     * @param {number} w - Mask width in pixels.
     * @return {number} The new stack height.
     */
    pushSeed(mask, reached, stack, top, x, y, w) {
        const cell = x + y * w;
        if (mask[cell] === 1 && reached[cell] === 0) {
            reached[cell] = 1;
            stack[top++] = cell;
        }
        return top;
    }

    /**
     * Removes foreground blobs below minIslandArea.
     * @param {Uint8Array} mask - Background mask.
     * @param {number} w - Mask width in pixels.
     * @param {number} h - Mask height in pixels.
     * @return {Uint8Array} The cleaned mask.
     */
    removeSmallIslands(mask, w, h) {
        const cleaned = Uint8Array.from(mask);
        const visited = new Uint8Array(w * h);
        const stack = new Int32Array(w * h);
        const blob = new Int32Array(w * h);

        for (let start = 0; start < cleaned.length; start++) {
            if (cleaned[start] === 1 || visited[start] === 1) continue;

            let top = 0;
            let size = 0;
            visited[start] = 1;
            stack[top++] = start;

            while (top > 0) {
                const cell = stack[--top];
                blob[size++] = cell;
                const x = cell % w;
                const y = (cell - x) / w;
                for (let s = 0; s < 4; s++) {
                    const nx = x + this.stepX[s];
                    const ny = y + this.stepY[s];
                    if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
                    const next = nx + ny * w;
                    if (cleaned[next] === 0 && visited[next] === 0) {
                        visited[next] = 1;
                        stack[top++] = next;
                    }
                }
            }

            if (size < this.minIslandArea) {
                for (let i = 0; i < size; i++) cleaned[blob[i]] = 1;
            }
        }
        return cleaned;
    }

    /**
     * Grows the background by one pixel per pass, removing the rim of mixed
     * pixels left by JPEG compression.
     * @param {Uint8Array} mask - Background mask to grow.
     * @param {number} w - Mask width in pixels.
     * @param {number} h - Mask height in pixels.
     * @return {Uint8Array} The grown mask.
     */
    growBackground(mask, w, h) {
        let current = mask;
        for (let pass = 0; pass < this.growPasses; pass++) {
            const grown = Uint8Array.from(current);
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const cell = x + y * w;
                    if (current[cell] === 1) continue;
                    for (let s = 0; s < 4; s++) {
                        const nx = x + this.stepX[s];
                        const ny = y + this.stepY[s];
                        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
                        if (current[nx + ny * w] === 1) {
                            grown[cell] = 1;
                            break;
                        }
                    }
                }
            }
            current = grown;
        }
        return current;
    }

    /**
     * Converts the binary mask to an alpha channel.
     * @param {Uint8Array} mask - Background mask.
     * @return {Uint8Array} Alpha values, 0 or 255.
     */
    toAlpha(mask) {
        const alpha = new Uint8Array(mask.length);
        for (let i = 0; i < alpha.length; i++) {
            alpha[i] = mask[i] === 1 ? 0 : 255;
        }
        return alpha;
    }

    /**
     * Blurs the alpha channel with the 3x3 mean kernel of week 15.
     * @param {Uint8Array} alpha - Alpha channel to soften.
     * @param {number} w - Image width in pixels.
     * @param {number} h - Image height in pixels.
     * @return {Uint8Array} The softened alpha channel.
     */
    feather(alpha, w, h) {
        let current = alpha;
        for (let pass = 0; pass < this.featherPasses; pass++) {
            const blurred = Uint8Array.from(current);
            for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                    let total = 0;
                    for (let j = -1; j <= 1; j++) {
                        for (let i = -1; i <= 1; i++) {
                            total += current[(x + i) + (y + j) * w];
                        }
                    }
                    blurred[x + y * w] = total / 9;
                }
            }
            current = blurred;
        }
        return current;
    }
}
