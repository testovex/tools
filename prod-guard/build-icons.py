#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Testovex — https://testovex.com
"""Generate PROD Guard icons (16, 48, 128 PNG)."""

from PIL import Image, ImageDraw, ImageFont
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "icons")
os.makedirs(OUT_DIR, exist_ok=True)

# Shield emoji feel with red gradient
NAVY = (31, 42, 68)
RED = (220, 38, 38)
WHITE = (255, 255, 255)
LIGHT_GRAY = (243, 244, 246)


def make_icon(size, out_path):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Circle background (navy)
    padding = max(1, size // 32)
    draw.ellipse((padding, padding, size - padding, size - padding),
                 fill=NAVY)

    # Inner circle (red)
    inner_pad = max(2, size // 8)
    draw.ellipse((inner_pad, inner_pad, size - inner_pad, size - inner_pad),
                 fill=RED)

    # Center shield-like text "P"
    try:
        # Try to load a system font
        font_size = int(size * 0.6)
        font = None
        for candidate in [
            "/System/Library/Fonts/Helvetica.ttc",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        ]:
            if os.path.exists(candidate):
                font = ImageFont.truetype(candidate, font_size)
                break
        if font is None:
            font = ImageFont.load_default()

        text = "P"
        # Center the text
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        x = (size - text_w) // 2 - bbox[0]
        y = (size - text_h) // 2 - bbox[1]
        draw.text((x, y), text, fill=WHITE, font=font)
    except Exception as e:
        # Fallback: draw a shield-like triangle
        cx, cy = size // 2, size // 2
        r = size // 3
        draw.polygon([
            (cx, cy - r),
            (cx + r, cy + r // 2),
            (cx - r, cy + r // 2),
        ], fill=WHITE)

    img.save(out_path, "PNG")
    print(f"Wrote {out_path}")


for size in [16, 48, 128]:
    make_icon(size, os.path.join(OUT_DIR, f"icon{size}.png"))

print("\nAll icons generated.")
