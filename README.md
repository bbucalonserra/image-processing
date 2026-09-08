# CM2030 Graphics Programming - Coursework 2

Two interactive image processing applications built with p5.js and run from one
sketch: a streaming style carousel with threshold based background removal, and
a panorama motion guide driven by edge detection and centroid comparison.

## Running

The sketch reads image files, so it has to be served over HTTP rather than
opened straight from the file system. From the project root:

```
python -m http.server 8000
```

then open `http://localhost:8000/`. The Live Server extension of VS Code does
the same job.

## Controls

Press `H` at any time for the full list on screen.

| Key | Action |
| --- | --- |
| `1` | Load Task 1, the streaming carousel |
| `2` | Load Task 2, the panorama motion guide |
| `H` | Show or hide the key list |

Task 1, once loaded:

| Key | Action |
| --- | --- |
| `c` | Open the carousel |
| `l` | Load the images and remove their backgrounds |
| `s` | Start the animation sequence |
| `v` | Compare both colour spaces on the featured image |
| `<` `>` | Change the featured image |

Task 2, once loaded:

| Key | Action |
| --- | --- |
| `p` | Open the panorama screen |
| `i` | Load the pairs of images |
| `g` | Convert both frames to greyscale |
| `e` | Apply the edge filter |
| `t` | Threshold the edge output, with a slider for the value |
| `n` | Compute the centroid of each frame |
| `d` | Show the direction arrow |
| `f` | Add the block matching estimate, the extension |
| `<` `>` | Move between the eight pairs |

## Layout

```
index.html                     Loads the library, the sources and the sketch
libraries/p5.min.js            p5.js 1.9.4
assets/task1/                  The eight provided portrait images
assets/task2/                  The four provided pairs and the four built ones
src/sketch.js                  Commentary, globals, preload, setup, draw
src/core/                      Pixel helpers, screen base class, app controller
src/task1/                     Thresholding, mask refinement, carousel,
                               animation, generated backdrop
src/task2/                     Convolution, edges, threshold, centroid, arrow,
                               block matching
tests/tests.html               Unit tests for the image processing functions
```

## Backdrop

The image behind the featured subject is not a file. It is generated at start
up with Perlin noise read around a circle, so that its left and right edges
join and the scroll loops without a seam, and it is drawn into an off-screen
buffer once. The only images the app reads are the ones the brief provides.

## Tests

Open `tests/tests.html` through the same local server. It checks the pixel
index conversion, the luma weights, the RGB to HSB conversion, the hue wrap,
the Sobel response, the flood fill, the centroid and the direction rules
against values worked out by hand, and prints the totals.

## Colour space choice

Every image was thresholded in both RGB and HSB. The row kept in
`ThresholdSettings.TABLE` is the one that makes fewer mistakes, counted as
backdrop left in the two top corners plus subject the threshold wrongly claims
and the connected component step has to give back. The losing row is kept in
`ThresholdSettings.ALTERNATIVES`, and key `v` draws both results side by side
with those counts, so the comparison can be seen rather than taken on trust.

## Task 2 image pairs

Pairs 1 to 4 are the provided ones and cover RIGHT, LEFT, DOWN-RIGHT and
UP-LEFT. Pairs 5 to 8 were built from the provided images by placing the same
photograph at two different offsets on a 500 by 350 white canvas, and they
cover UP, DOWN, UP-RIGHT and DOWN-LEFT. The offsets used are recorded in
`assets/task2/README.txt`, and each pair is scored against its expected
direction on screen.
