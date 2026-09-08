/** Class holding one carousel entry and how it is drawn as a thumbnail. */
class CarouselItem {
    /**
     * @param {p5.Image} foreground - The provided image with its backdrop cut
     *     out, so only the person is left.
     * @param {string} caption - Title shown with the entry.
     * @param {string} settingLabel - Readable form of its threshold row.
     */
    constructor(foreground, caption, settingLabel) {
        this.foreground = foreground;
        this.caption = caption;
        this.settingLabel = settingLabel;
    }

    /**
     * Draws the entry as a card inside a box, keeping its aspect ratio.
     * @param {number} x - Left edge of the card.
     * @param {number} y - Top edge of the card.
     * @param {number} boxW - Card width in pixels.
     * @param {number} boxH - Card height in pixels.
     * @param {boolean} featured - Whether this entry is the one on the stage.
     * @return {void}
     */
    draw(x, y, boxW, boxH, featured) {
        push();
        noStroke();
        fill(featured ? color(38, 58, 92) : color(26, 30, 38));
        rect(x, y, boxW, boxH, 8);

        const inset = 10;
        const fitted = this.fitInside(boxW - inset * 2, boxH - inset * 2 - 26);
        image(
            this.foreground,
            x + (boxW - fitted.w) / 2,
            y + inset + (boxH - inset * 2 - 26 - fitted.h) / 2,
            fitted.w,
            fitted.h
        );

        fill(featured ? color(120, 190, 255) : color(150));
        textSize(11);
        textAlign(CENTER, BOTTOM);
        text(this.settingLabel, x + boxW / 2, y + boxH - 8);

        if (featured) {
            noFill();
            stroke(120, 190, 255);
            strokeWeight(2);
            rect(x, y, boxW, boxH, 8);
        }
        pop();
    }

    /**
     * Works out the largest size that fits a box without distorting the image.
     * @param {number} boxW - Available width in pixels.
     * @param {number} boxH - Available height in pixels.
     * @return {object} {w, h} of the fitted image.
     */
    fitInside(boxW, boxH) {
        const factor = Math.min(
            boxW / this.foreground.width,
            boxH / this.foreground.height
        );
        return {
            w: this.foreground.width * factor,
            h: this.foreground.height * factor
        };
    }
}
