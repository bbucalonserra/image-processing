/** Turns dx and dy into one of the eight directions, past a dead zone. */
class MotionEstimator {
    /** Dead zone as a share of the frame, and the frame size. */
    constructor(deadZoneFraction, frameWidth, frameHeight) {
        this.deadZoneX = deadZoneFraction * frameWidth;
        this.deadZoneY = deadZoneFraction * frameHeight;
    }

    /** Arrow angles in degrees, x to the right and y downwards. */
    static get ANGLES() {
        return {
            "RIGHT": 0,
            "DOWN-RIGHT": 45,
            "DOWN": 90,
            "DOWN-LEFT": 135,
            "LEFT": 180,
            "UP-LEFT": 225,
            "UP": 270,
            "UP-RIGHT": 315
        };
    }

    /** Classifies a shift, whichever method measured it. */
    classify(dx, dy) {
        let horizontal = "";
        if (dx > this.deadZoneX) horizontal = "RIGHT";
        else if (dx < -this.deadZoneX) horizontal = "LEFT";

        let vertical = "";
        if (dy > this.deadZoneY) vertical = "DOWN";
        else if (dy < -this.deadZoneY) vertical = "UP";

        let label = "NONE";
        if (horizontal && vertical) label = vertical + "-" + horizontal;
        else if (horizontal) label = horizontal;
        else if (vertical) label = vertical;

        return {
            dx: dx,
            dy: dy,
            label: label,
            // The arrow follows the label, not the vector.
            angle: label === "NONE" ? 0 : MotionEstimator.ANGLES[label],
            distance: Math.sqrt(dx * dx + dy * dy)
        };
    }

    /** Compares the centroid of Frame A with the centroid of Frame B. */
    estimate(centroidA, centroidB) {
        return this.classify(
            centroidB.x - centroidA.x,
            centroidB.y - centroidA.y
        );
    }
}
