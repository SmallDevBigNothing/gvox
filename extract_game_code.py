import html
import re

file_path = 'files/digOutOfPrison.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Look for the encoded content. It seems to be inside some attribute or just sitting there.
# Based on the read_file output, it looks like it starts with &lt;div class=&quot;content-container&quot;&gt;
# and ends with &lt;/script&gt;

# Actually, let's look for anything that looks like encoded HTML and contains 'content-container'
match = re.search(r'(&lt;div class=&quot;content-container&quot;&gt;.*?&lt;/script&gt;)', content, re.DOTALL)
if not match:
    # Try just searching for the encoded tags we saw
    match = re.search(r'(&lt;iframe id=&quot;fr&quot;.*?&lt;/script&gt;)', content, re.DOTALL)

if match:
    encoded_code = match.group(1)
    # We also need the &lt;div class=&quot;content-container&quot;&gt; which might be before the iframe
    # Let's broaden the search
    full_match = re.search(r'(&lt;div class=&quot;content-container&quot;&gt;.*?&lt;/script&gt;)', content, re.DOTALL)
    if full_match:
        encoded_code = full_match.group(1)
    
    decoded_code = html.unescape(encoded_code)
    
    clean_html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Dig out of Prison</title>
    <meta charset="utf-8">
</head>
<body>
{decoded_code}
</body>
</html>"""
    
    with open('files/digOutOfPrison.html.clean', 'w', encoding='utf-8') as f:
        f.write(clean_html)
    print("Successfully extracted and decoded game code to files/digOutOfPrison.html.clean")
else:
    print("Could not find encoded game code.")
