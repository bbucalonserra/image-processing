/**
 * Class drawing the caption that travels right to left across the stage while
 * sharing the fade and zoom of the subject, as the brief requires. The text
 * size is what zooms, so no translate() or scale() is involved.
 */
class CaptionBanner {
    /**
     * @param {number} baseSize - Text size at a scale factor of one.
     * @param {p5.Color} textColour - Colour the caption is drawn in.
     * @param {number} margin - Distance kept from either edge of the stage, so
     *     the caption never runs off the panel at the ends of its travel.
     */
    constructor(baseSize, textColour, margin) {
        this.baseSize = baseSize;
        this.textColour = textColour;
        this.margin = margin;
    }

    /**
     * Draws the caption for the current frame.
     * @param {string} caption - The line of text.
     * @param {number} boxX - Left edge of the stage box.
     * @param {number} boxW - Stage box width in pixels.
     * @param {number} y - Baseline height of the caption.
     * @param {number} progress - Position in the stage, 0 to 1.
     * @param {number} alphaValue - Opacity of the caption, 0 to 255.
     * @param {number} scaleFactor - Zoom shared with the subject.
     * @return {void}
     */
    draw(caption, boxX, boxW, y, progress, alphaValue, scaleFactor) {
        // Right to left, the opposite of the subject.
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
