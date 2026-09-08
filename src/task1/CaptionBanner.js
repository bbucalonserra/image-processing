/**
 * Caption travelling right to left across the stage, sharing the fade and zoom
 * of the subject. The zoom is applied through textSize, so neither translate()
 * nor scale() is used.
 */
class CaptionBanner {
    /**
     * @param {number} baseSize - Text size at scale one.
     * @param {p5.Color} textColour - Caption colour.
     * @param {number} margin - Distance kept from either edge, so the caption
     *     stays on the panel at the ends of its travel.
     */
    constructor(baseSize, textColour, margin) {
        this.baseSize = baseSize;
        this.textColour = textColour;
        this.margin = margin;
    }

    /**
     * Draws the caption for the current frame.
     * @param {string} caption - Line of text.
     * @param {number} boxX - Left edge of the stage box.
     * @param {number} boxW - Stage box width in pixels.
     * @param {number} y - Height of the caption.
     * @param {number} progress - Position in the stage, 0 to 1.
     * @param {number} alphaValue - Opacity, 0 to 255.
     * @param {number} scaleFactor - Zoom shared with the subject.
     * @return {void}
     */
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
