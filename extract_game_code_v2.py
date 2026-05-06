import html
import re

file_path = 'files/digOutOfPrison.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find all occurrences of "content-container"
# We want the DIV that contains the game elements.

# Search for the start of the div
start_marker = '&lt;div class=&quot;content-container&quot;&gt;'
if start_marker not in content:
    # Maybe it's not encoded this way? Let's search for "content-container" and look around
    indices = [m.start() for m in re.finditer('content-container', content)]
    print(f"Found 'content-container' at indices: {indices}")
    # Let's look at the context of each
    for idx in indices:
        print(f"Context at {idx}: {content[max(0, idx-50):idx+100]}")

# Based on the previous output, we saw:
# L154:   .content-container {
# This was CSS.

# Let's find the HTML div.
# Looking at the user provided snippet:
# &lt;iframe id=&quot;fr&quot; ... &lt;/div&gt;

# Let's try to find where the iframe starts and look backwards for a div.
iframe_idx = content.find('&lt;iframe id=&quot;fr&quot;')
if iframe_idx != -1:
    div_start = content.rfind('&lt;div', 0, iframe_idx)
    script_end = content.find('&lt;/script&gt;', iframe_idx) + len('&lt;/script&gt;')
    
    if div_start != -1 and script_end != -1:
        encoded_code = content[div_start:script_end]
        decoded_code = html.unescape(encoded_code)
        
        clean_html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Dig out of Prison</title>
    <meta charset="utf-8">
    <style>
        body, html {{
            margin: 0;
            padding: 0;
            overflow: hidden;
            height: 100%;
            width: 100%;
            background-color: #000;
        }}
    </style>
</head>
<body>
{decoded_code}
</body>
</html>"""
        
        with open('files/digOutOfPrison.html.clean', 'w', encoding='utf-8') as f:
            f.write(clean_html)
        print("Successfully extracted and decoded game code to files/digOutOfPrison.html.clean")
    else:
        print(f"Could not find div_start ({div_start}) or script_end ({script_end})")
else:
    print("Could not find iframe start.")
