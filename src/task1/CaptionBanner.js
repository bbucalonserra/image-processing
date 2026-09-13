/** Caption moving right to left. The zoom goes through textSize. */
class CaptionBanner {
    /** Text size at scale one, colour and margin kept from the edges. */
    constructor(baseSize, textColour, margin) {
        this.baseSize = baseSize;
        this.textColour = textColour;
        this.margin = margin;
    }

    /** Draws the caption for the current frame. */
    draw(caption, boxX, boxW, y, progress, alphaValue, scaleFactor) {
        // Right to left, opposite to the subject.
        const x = lerp(
            boxX + boxW - this.margin, boxX + this.margin, progress
        );

        push();
        noStroke();
        fill(red(this.textColour), green(this.textColour),
            blue(this.textColour), alphaValue);
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textSize(this.baseSize * scaleFactor);
        text(caption, x, y);
        pop();
    }
}
