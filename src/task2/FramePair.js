/** One pair of frames and everything built from it, cached by stage. */
class FramePair {
    /** Pair name, the two frames and the direction it was built to show. */
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
        /** @type {boolean} True once the centroids were computed. */
        this.centroidsBuilt = false;
        /** @type {object|null} Motion reported by the centroid method. */
        this.motion = null;
        /** @type {object|null} Output of the block matching estimator. */
        this.flow = null;
        /** @type {object|null} Motion from the block matching method. */
        this.flowMotion = null;
        /** @type {number} Threshold the cached binaries were built with. */
        this.binaryThreshold = -1;
    }

    /** Original frame in that slot. */
    frame(slot) {
        return slot === 0 ? this.frameA : this.frameB;
    }

    /** Converts both frames to greyscale. */
    buildGrey() {
        if (this.grey[0]) return;
        this.grey[0] = GreyscaleFilter.apply(this.frameA);
        this.grey[1] = GreyscaleFilter.apply(this.frameB);
    }

    /** Runs the edge filter on both greyscale frames. */
    buildEdges() {
        if (this.edges[0]) return;
        this.buildGrey();
        this.edges[0] = EdgeDetector.detect(this.grey[0]);
        this.edges[1] = EdgeDetector.detect(this.grey[1]);
    }

    /** Thresholds both edge images, redone when the slider value changed. */
    buildBinary(threshold) {
        if (this.binary[0] && this.binaryThreshold === threshold) return;
        this.buildEdges();
        this.binary[0] = EdgeThresholder.apply(this.edges[0], threshold);
        this.binary[1] = EdgeThresholder.apply(this.edges[1], threshold);
        this.binaryThreshold = threshold;

        // The centroids come from the thresholded pixels, so they drop.
        this.centroids = [null, null];
        this.centroidsBuilt = false;
        this.motion = null;
    }

    /** Computes the centroid of both thresholded frames. */
    buildCentroids(threshold) {
        this.buildBinary(threshold);
        if (this.centroidsBuilt) return;
        this.centroids[0] = CentroidAnalyser.compute(this.binary[0]);
        this.centroids[1] = CentroidAnalyser.compute(this.binary[1]);
        this.centroidsBuilt = true;
    }

    /** Estimates the motion between the two centroids. */
    buildMotion(threshold, estimator) {
        this.buildCentroids(threshold);
        if (this.motion) return;
        if (!this.centroids[0] || !this.centroids[1]) return;
        this.motion = estimator.estimate(this.centroids[0], this.centroids[1]);
    }

    /** Runs the block matching estimator on the greyscale frames, once. */
    buildFlow(flowEstimator, estimator) {
        if (this.flow) return;
        this.buildGrey();
        this.flow = flowEstimator.estimate(this.grey[0], this.grey[1]);
        this.flowMotion = estimator.classify(this.flow.dx, this.flow.dy);
    }
}
