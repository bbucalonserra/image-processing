Task 2 motion pair dataset
==========================

Provided pairs
--------------
Generated from the available real uploaded images.
Pairs include both cardinal and diagonal motion.

Pair 1: pair1_1.png, pair1_2.png -> RIGHT
Pair 2: pair2_1.png, pair2_2.png -> LEFT
Pair 3: pair3_1.png, pair3_2.png -> DOWN-RIGHT
Pair 4: pair4_1.png, pair4_2.png -> UP-LEFT

Additional pairs
----------------
The provided set demonstrates four directions only, so four more pairs were
built from the provided portrait images to cover the remaining directions. Each
one places the same photograph at two different offsets on a 500 by 350 white
canvas, matching the construction of the provided pairs.

Pair 5: pair5_1.png, pair5_2.png -> UP
        source 5.jpg scaled to 230x153, placed at (135, 140) then (135, 50)
Pair 6: pair6_1.png, pair6_2.png -> DOWN
        source 6.jpg scaled to 230x172, placed at (135, 40) then (135, 130)
Pair 7: pair7_1.png, pair7_2.png -> UP-RIGHT
        source 7.jpg scaled to 180x180, placed at (90, 140) then (165, 60)
Pair 8: pair8_1.png, pair8_2.png -> DOWN-LEFT
        source 8.jpg scaled to 160x223, placed at (230, 30) then (150, 110)

The expected direction of every pair is listed in PanoramaScreen.PAIRS and is
compared with the detected direction on screen.
