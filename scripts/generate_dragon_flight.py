"""Rebuild dragon flight frames from the standing dragon and original wings.

Run: uv run --with pillow python scripts/generate_dragon_flight.py
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageChops

root = Path(__file__).resolve().parent.parent
images = root / 'public/assets/images'
base = Image.open(images / 'dragon.png').convert('RGBA').crop((12, 306, 179, 468))
for pose in ('up', 'down'):
    source = Image.open(root / f'asset-originals/dragon-flight-{pose}.png').convert('RGBA')
    # Preserve the standing dragon's head, chest, belly, legs and tail.
    body = base.copy()
    alpha = body.getchannel('A')
    erase = Image.new('L', base.size)
    draw = ImageDraw.Draw(erase)
    draw.polygon([(96,17),(140,10),(159,22),(165,48),(163,75),
                  (151,90),(123,88),(107,88),(94,79),(91,51)],fill=255)
    alpha.paste(0, (0,0), erase)
    body.putalpha(alpha)
    # Cut the matching near wing from the existing flight art, keeping its outline.
    mask = Image.new('L', source.size)
    draw = ImageDraw.Draw(mask)
    if pose == 'up':
        draw.polygon([(103,27),(117,13),(144,5),(165,4),(173,41),
                      (180,58),(175,64),(160,52),(141,51),(144,75),
                      (136,79),(126,58),(117,69),(107,80),(96,81)], fill=255)
        offset = (-4,0)
    else:
        draw.polygon([(102,77),(109,54),(118,48),(130,48),(154,52),
                      (179,60),(184,70),(178,78),(163,73),(145,79),
                      (137,84),(121,77),(105,85)], fill=255)
        offset = (-5,-2)
    wing = source.copy()
    wing.putalpha(ImageChops.multiply(source.getchannel('A'),mask))
    result = Image.new('RGBA',base.size)
    result.alpha_composite(wing,offset)
    result.alpha_composite(body)
    result.save(images / f'dragon-flight-{pose}.png')
