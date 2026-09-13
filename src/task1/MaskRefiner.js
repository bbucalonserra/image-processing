/** Turns a threshold mask into an alpha channel with no leftovers. */
class MaskRefiner {
    /** Island size limit, growth passes and blur passes. */
    constructor(minIslandArea, growPasses, featherPasses) {
        this.minIslandArea = minIslandArea;
        this.growPasses = growPasses;
        this.featherPasses = featherPasses;

        /** @type {Array<number>} Horizontal offsets, four connected. */
        this.stepX = [1, -1, 0, 0];
        /** @type {Array<number>} Matching vertical offsets. */
        this.stepY = [0, 0, 1, -1];
    }

    /** Runs the four steps and counts the pixels given back. */
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
            reclaimed: thresholdBackground - connectedBackground
        };
    }

    /** Keeps only background joined to the image border (week 17). */
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

    /** Adds a border pixel to the fill stack when it is background. */
    pushSeed(mask, reached, stack, top, x, y, w) {
        const cell = x + y * w;
        if (mask[cell] === 1 && reached[cell] === 0) {
            reached[cell] = 1;
            stack[top++] = cell;
        }
        return top;
    }

    /** Removes foreground blobs below minIslandArea. */
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

    /** Grows the background by one pixel per pass. */
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

    /** Converts the binary mask to an alpha channel. */
    toAlpha(mask) {
        const alpha = new Uint8Array(mask.length);
        for (let i = 0; i < alpha.length; i++) {
            alpha[i] = mask[i] === 1 ? 0 : 255;
        }
        return alpha;
    }

    /** Blurs the alpha channel with the 3x3 mean kernel of week 15. */
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
