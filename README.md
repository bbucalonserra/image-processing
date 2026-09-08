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

## Module content used, and where

Every entry below points at code that is in the repository. The week is the
week of the module the technique comes from.

### Week 1 - object oriented structure, push and pop

| Topic | Where | How |
| --- | --- | --- |
| Classes as the unit of structure | all of `src/` | 23 classes in `src/`, one responsibility each. `Screen` is the base class, `CarouselScreen` and `PanoramaScreen` extend it |
| Saving and restoring the drawing state | `AppController.drawHeader`, `CarouselItem.draw`, `Carousel.draw`, `CaptionBanner.draw`, `ScrollingBackground.draw`, `ArrowOverlay.draw`, `PanoramaScreen` panels | every draw method wraps its fill, stroke and text settings in `push()` and `pop()`, so no method leaks style into the next |

### Week 7 - Perlin noise

| Topic | Where | How |
| --- | --- | --- |
| 3D noise | `NoiseBackdrop.render` | `noise(x, y, z)` where the third input is the row, which gives the backdrop its vertical structure |
| Octaves | `NoiseBackdrop.render` | `noiseDetail(4, 0.5)`, set explicitly rather than left at the default |
| Seeding the noise | `NoiseBackdrop.render` | `noiseSeed(this.seed)`, so the backdrop is identical on every run |
| Mapping noise to a value range | `NoiseBackdrop.rampColour` | the noise value picks a position on a three stop colour ramp |

### Week 8 - trigonometry and polar coordinates

| Topic | Where | How |
| --- | --- | --- |
| Reading a field around a circle | `NoiseBackdrop.render` | the column becomes an angle and the two horizontal noise inputs become `cos(angle)` and `sin(angle)`, so the left and right edges of the backdrop join and the scroll loops without a seam |
| Rotating a shape by hand | `ArrowOverlay.draw` | the arrow outline is written once pointing right in `ArrowOverlay.outline`, then each point is rotated with `x cos - y sin` and `x sin + y cos`, so the overlay needs no transformation stack |
| Averaging angles as unit vectors | `BackgroundRemover.sampleBackdropHue` | hues are summed as `cos` and `sin` components and recovered with `atan2`, so hues either side of 0 degrees do not cancel |

### Week 12 - loading images and off-screen buffers

| Topic | Where | How |
| --- | --- | --- |
| Preloading | `sketch.js preload` | the eight Task 1 images and the sixteen Task 2 frames are loaded before `setup` runs, so no draw call meets a half loaded file |
| Off-screen buffer | `NoiseBackdrop.render` | `createGraphics(400, 120)` holds the generated backdrop, which is drawn stretched instead of sampling noise per screen pixel |

### Week 13 - colour and the pixel array

| Topic | Where | How |
| --- | --- | --- |
| Pixel density | `sketch.js setup` | `pixelDensity(1)` before any pixel work, so one image pixel is one array entry on a high density screen |
| 2D to 1D index conversion | `PixelUtilities.pixelIndex` | `(x + y * width) * 4`, used by every class that touches pixels |
| Direct pixel array access | `BackgroundRemover`, `GreyscaleFilter`, `EdgeDetector`, `EdgeThresholder`, `CentroidAnalyser`, `BlockFlowEstimator`, `NoiseBackdrop` | `loadPixels`, read or write `pixels`, `updatePixels`; `get()` is never used because it is too slow per pixel |
| RGB and HSB colour spaces | `PixelUtilities.rgbToHsb`, `BackgroundRemover.maskByRgb`, `BackgroundRemover.maskByHsb` | the conversion is written by hand, since one p5 colour object per pixel is too slow for a full image |
| Hue on a wheel | `PixelUtilities.hueDistance` | shortest distance with the wrap at 360 handled |

### Week 15 - image processing

| Topic | Where | How |
| --- | --- | --- |
| Greyscale with luma weights | `PixelUtilities.luma`, `GreyscaleFilter.apply` | `0.299 r + 0.587 g + 0.114 b` rather than a plain average, so brightness is preserved |
| Convolution as a weighted moving average | `ConvolutionFilter.convolve` | generic kernel of any odd size, with the offset that centres it on the pixel |
| Ignoring the border | `ConvolutionFilter.convolve` | pixels without a full neighbourhood stay at zero. A partial kernel there draws a false edge around the frame, which was measured pulling the two centroids together and halving the reported shift |
| Sobel kernels | `ConvolutionFilter.SOBEL_X`, `ConvolutionFilter.SOBEL_Y`, `EdgeDetector.detect` | two passes, one for vertical edges and one for horizontal, remapped from the 1020 range and added |
| Threshold filter | `EdgeThresholder.apply` | forces every pixel to pick a side, driven by the slider |
| Mean blur kernel | `MaskRefiner.feather` | the 3x3 mean is applied to the alpha channel, so the cut out edge fades instead of stair stepping |
| Gaussian blur, tested and rejected | not in the code, reported in the commentary | a Gaussian pass before Sobel left accuracy at 64 of 64 but widened the spread of dy from 1.0 to 1.7 pixels, so it was removed |

### Week 17 - computer vision

| Topic | Where | How |
| --- | --- | --- |
| Grouping connected pixels into blobs | `MaskRefiner.keepBorderConnected`, `MaskRefiner.removeSmallIslands` | a flood fill from the image border keeps only the backdrop that is joined to the border, and foreground blobs below a size limit are dropped. This is what returns a white shirt to the subject and clears speckles |
| Optical flow | `BlockFlowEstimator` | block matching written from scratch, the extension. `reduce` scales the frames down, `blockContrast` rejects flat blocks, `matchBlock` searches by sum of absolute differences, `median` aggregates |

### Course wide p5 techniques

| Topic | Where | How |
| --- | --- | --- |
| Frame timing | `AnimationCycle.update`, `Carousel.update`, `ScrollingBackground.update` | `deltaTime` capped at 100 ms, so a background tab does not skip whole animation stages when it returns |
| Interpolation and remapping | `AnimationCycle`, `CaptionBanner.draw`, `CarouselScreen.drawSubject`, `EdgeDetector.detect`, `NoiseBackdrop.rampColour` | `lerp` for travel, scale and colour, `map` for the alpha ramp and the edge response |
| DOM controls | `PanoramaScreen` constructor | `createSlider(0, 255, 100)`, shown only from the threshold stage and hidden while Task 1 is on screen |
| Drawing without transformations | `CarouselScreen.drawSubject`, `CaptionBanner.draw`, `ScrollingBackground.draw`, `ArrowOverlay.draw` | positions and sizes are computed as numbers and passed to `image()` and `textSize()`. The brief forbids `translate()` for Task 1, and the project contains no call to `translate`, `rotate` or `scale` anywhere |
