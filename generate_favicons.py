import os
from PIL import Image, ImageDraw

def render_professional_favicon():
    out_dir = os.path.join(os.path.dirname(__file__), "frontend", "public")
    os.makedirs(out_dir, exist_ok=True)
    
    # 512x512 Master Canvas
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Dark Rounded App Canvas
    draw.rounded_rectangle([0, 0, size, size], radius=128, fill=(11, 15, 25, 255))

    # 2. Road Perspective Polygon
    road_poly = [(150, 440), (215, 100), (297, 100), (362, 440)]
    draw.polygon(road_poly, fill=(30, 41, 59, 255))

    # 3. Road Dashed Markings
    slate = (100, 116, 139, 255)
    draw.rounded_rectangle([250, 120, 262, 158], radius=6, fill=slate)
    draw.rounded_rectangle([249, 190, 263, 244], radius=7, fill=slate)
    draw.rounded_rectangle([248, 275, 264, 345], radius=8, fill=slate)
    draw.rounded_rectangle([246, 375, 266, 440], radius=10, fill=slate)

    # 4. Pothole Ellipse Damage Indicator
    amber = (245, 158, 11, 255)
    dark_pit = (2, 6, 23, 255)
    draw.ellipse([256 - 80, 310 - 42, 256 + 80, 310 + 42], fill=dark_pit, outline=amber, width=6)
    draw.ellipse([256 - 55, 310 - 26, 256 + 55, 310 + 26], fill=(9, 13, 22, 255))

    # 5. AI Bounding Box Corner Brackets
    bracket_w = 14
    bracket_l = 40
    x1, y1, x2, y2 = 140, 200, 372, 410

    # Top-Left
    draw.line([(x1, y1), (x1 + bracket_l, y1)], fill=amber, width=bracket_w)
    draw.line([(x1, y1), (x1, y1 + bracket_l)], fill=amber, width=bracket_w)
    # Top-Right
    draw.line([(x2, y1), (x2 - bracket_l, y1)], fill=amber, width=bracket_w)
    draw.line([(x2, y1), (x2, y1 + bracket_l)], fill=amber, width=bracket_w)
    # Bottom-Left
    draw.line([(x1, y2), (x1 + bracket_l, y2)], fill=amber, width=bracket_w)
    draw.line([(x1, y2), (x1, y2 - bracket_l)], fill=amber, width=bracket_w)
    # Bottom-Right
    draw.line([(x2, y2), (x2 - bracket_l, y2)], fill=amber, width=bracket_w)
    draw.line([(x2, y2), (x2, y2 - bracket_l)], fill=amber, width=bracket_w)

    # 6. Central Detection Cyan Reticle Target
    cyan = (6, 182, 212, 255)
    draw.ellipse([256 - 14, 310 - 14, 256 + 14, 310 + 14], outline=cyan, width=5)
    draw.ellipse([256 - 4, 310 - 4, 256 + 4, 310 + 4], fill=cyan)

    # Export PNG formats
    img.save(os.path.join(out_dir, "android-chrome-512x512.png"))

    img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save(os.path.join(out_dir, "android-chrome-192x192.png"))

    img_180 = img.resize((180, 180), Image.Resampling.LANCZOS)
    img_180.save(os.path.join(out_dir, "apple-touch-icon.png"))

    img_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
    img_32.save(os.path.join(out_dir, "favicon-32x32.png"))

    img_16 = img.resize((16, 16), Image.Resampling.LANCZOS)
    img_16.save(os.path.join(out_dir, "favicon-16x16.png"))

    # Multi-resolution ICO for browser tabs
    img_48 = img.resize((48, 48), Image.Resampling.LANCZOS)
    img.save(
        os.path.join(out_dir, "favicon.ico"),
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)]
    )

    print("Successfully generated all professional favicon assets.")

if __name__ == "__main__":
    render_professional_favicon()
