/**
 * One pair of frames and everything derived from it. Each stage is computed
 * once and cached.
 */
class FramePair {
    /**
     * @param {string} label - Pair name shown on screen.
     * @param {p5.Image} frameA - First frame.
     * @param {p5.Image} frameB - Second frame.
     * @param {string} expected - Direction the pair was built to show, checked
     *     against the estimate on screen.
     */
    constructor(label, frameA, frameB, expected) {
        this.label = label;
        this.frameA = frameA;
        this.frameB = frameB;
        this.expected = expected;

        /** @type {Array<p5.Image|null>} Greyscale copies of both frames. */
        this.grey = [null, null];
        /** @type {Array<p5.Image|null>} Edge output of both frames. */
        this.edges = [null, null];
        /** @type {Array<p5.Image|null>} Thresholded edge output. */
        this.binary = [null, null];
        /** @type {Array<object|null>} Centroid of each thresholded frame. */
        this.centroids = [null, null];
        /** @type {object|null} Motion reported by the centroid method. */
        this.motion = null;
        /** @type {object|null} Output of the block matching estimator. */
        this.flow = null;
        /** @type {object|null} Motion reported by the block matching method. */
        this.flowMotion = null;
        /** @type {number} Threshold the cached binaries were built with. */
        this.binaryThreshold = -1;
    }

    /**
     * @param {number} slot - 0 for Frame A, 1 for Frame B.
     * @return {p5.Image} Original frame in that slot.
     */
    frame(slot) {
        return slot === 0 ? this.frameA : this.frameB;
    }

    /**
     * Converts both frames to greyscale.
     * @return {void}
     */
    buildGrey() {
        if (this.grey[0]) return;
        this.grey[0] = GreyscaleFilter.apply(this.frameA);
        this.grey[1] = GreyscaleFilter.apply(this.frameB);
    }

    /**
     * Runs the edge filter on both greyscale frames.
     * @return {void}
     */
    buildEdges() {
        if (this.edges[0]) return;
        this.buildGrey();
        this.edges[0] = EdgeDetector.detect(this.grey[0]);
        this.edges[1] = EdgeDetector.detect(this.grey[1]);
    }

    /**
     * Thresholds both edge images, redone when the slider value changed.
     * @param {number} threshold - Strength a pixel must reach.
     * @return {void}
     */
    buildBinary(threshold) {
        if (this.binary[0] && this.binaryThreshold === threshold) return;
        this.buildEdges();
        this.binary[0] = EdgeThresholder.apply(this.edges[0], threshold);
        this.binary[1] = EdgeThresholder.apply(this.edges[1], threshold);
        this.binaryThreshold = threshold;

        // The centroids come from the thresholded pixels, so they are
        // dropped whenever the threshold changes.
        this.centroids = [null, null];
        this.motion = null;
    }

    /**
     * Computes the centroid of both thresholded frames.
     * @param {number} threshold - Strength a pixel must reach.
     * @return {void}
     */
    buildCentroids(threshold) {
        this.buildBinary(threshold);
        if (this.centroids[0]) return;
        this.centroids[0] = CentroidAnalyser.compute(this.binary[0]);
        this.centroids[1] = CentroidAnalyser.compute(this.binary[1]);
    }

    /**
     * Estimates the motion between the two centroids.
     * @param {number} threshold - Strength a pixel must reach.
     * @param {MotionEstimator} estimator - Estimator to use.
     * @return {void}
     */
    buildMotion(threshold, estimator) {
        this.buildCentroids(threshold);
        if (this.motion) return;
        if (!this.centroids[0] || !this.centroids[1]) return;
        this.motion = estimator.estimate(this.centroids[0], this.centroids[1]);
    }

    /**
     * Runs the block matching estimator on the greyscale frames, once.
     * @param {BlockFlowEstimator} flowEstimator - Block matching estimator.
     * @param {MotionEstimator} estimator - Classifier for the shift it finds.
     * @return {void}
     */
    buildFlow(flowEstimator, estimator) {
        if (this.flow) return;
        this.buildGrey();
        this.flow = flowEstimator.estimate(this.grey[0], this.grey[1]);
        this.flowMotion = estimator.classify(this.flow.dx, this.flow.dy);
    }
}
