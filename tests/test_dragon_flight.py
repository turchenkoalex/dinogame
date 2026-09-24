import unittest
from pathlib import Path
from PIL import Image, ImageChops

IMAGES = Path(__file__).resolve().parent.parent / 'public/assets/images'


class DragonFlightArtTest(unittest.TestCase):
    def test_flying_dragon_keeps_grounded_body_and_proportions(self):
        grounded = Image.open(IMAGES / 'dragon.png').convert('RGBA').crop((12, 306, 179, 468))
        for pose in ('up', 'down'):
            with self.subTest(pose=pose):
                flying = Image.open(IMAGES / f'dragon-flight-{pose}.png').convert('RGBA')
                self.assertEqual(flying.size, grounded.size)
                bbox = flying.getbbox()
                self.assertIsNotNone(bbox)
                assert bbox is not None
                self.assertLess(bbox[1], 20)
                self.assertGreater(bbox[3], 150)
                for region in ((0, 40, 77, 140), (45, 105, 130, 162)):
                    self.assertIsNone(ImageChops.difference(grounded.crop(region), flying.crop(region)).getbbox())

    def test_wings_move_between_frames(self):
        up = Image.open(IMAGES / 'dragon-flight-up.png').convert('RGBA')
        down = Image.open(IMAGES / 'dragon-flight-down.png').convert('RGBA')
        self.assertIsNotNone(ImageChops.difference(up, down).getbbox())


if __name__ == '__main__':
    unittest.main()
