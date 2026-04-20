import os
import re
from PIL import Image

# Directories
base_dir = r"c:\Users\CT\Downloads\latif-portfolio"
img_dir = os.path.join(base_dir, "img")
thumb_dir = os.path.join(base_dir, "thumbnail")
out_dir = os.path.join(base_dir, "optimized-thumbs")

# Create output directory
if not os.path.exists(out_dir):
    os.makedirs(out_dir)

# Function to process image
def process_image(img_path, output_filename):
    out_path = os.path.join(out_dir, output_filename)
    if os.path.exists(out_path):
        return f"optimized-thumbs/{output_filename}"
    try:
        with Image.open(img_path) as img:
            # Convert to RGB to avoid issues with transparent PNGs being saved as JPEG-like webp without alpha
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGBA")
            else:
                img = img.convert("RGB")
            
            # Resize while maintaining aspect ratio
            # Thumbnail max width = 600px
            max_size = (600, 600)
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save as webp
            img.save(out_path, "WEBP", quality=80)
            print(f"Optimized: {output_filename}")
            return f"optimized-thumbs/{output_filename}"
    except Exception as e:
        print(f"Error processing {img_path}: {e}")
        return None

# Dictionary to hold the mapping from old src to new src
src_mapping = {}

# Process all images in img/ and thumbnail/
for d, prefix in [(img_dir, "img_"), (thumb_dir, "thumb_")]:
    if not os.path.exists(d): continue
    for f in os.listdir(d):
        if f.lower().endswith(('.png', '.jpg', '.jpeg')):
            old_src = f"{os.path.basename(d)}/{f}"
            new_filename = f"{prefix}{os.path.splitext(f)[0]}.webp"
            new_src = process_image(os.path.join(d, f), new_filename)
            if new_src:
                src_mapping[old_src] = new_src

# Now replace the <img src="..."> in index.html, but NOT data-src
html_path = os.path.join(base_dir, "index.html")
with open(html_path, "r", encoding="utf-8") as file:
    html_content = file.read()

# Replace logic using regex
def replace_img_src(match):
    full_match = match.group(0)
    old_src = match.group(1)
    # Check if old_src is in our mapping
    for orig_src, new_src in src_mapping.items():
        # Match if the old_src ends with our orig_src (to handle possible / or ./ prefixes)
        if old_src.endswith(orig_src) or old_src.replace("\\", "/").endswith(orig_src):
            print(f"Replaced {old_src} -> {new_src} in HTML")
            # Replace only the src="..." part
            return full_match.replace(f'src="{old_src}"', f'src="{new_src}"')
    return full_match

# Regex to find <img src="..."> 
# We only want to replace inside <img src="..."> 
pattern = r'<img\s+[^>]*src="([^"]+)"'
new_html_content = re.sub(pattern, replace_img_src, html_content)

# We also need to process the "about" image which might have a different class, but the regex catches all <img src="...">
# The lightbox data-src="..." won't be matched because it's not an <img> tag (it's <div class="lightbox-data" data-src="...">) or if it is, the regex only matches <img ...>

with open(html_path, "w", encoding="utf-8") as file:
    file.write(new_html_content)

print("HTML update complete!")
