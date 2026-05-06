import html
import re

file_path = 'files/digOutOfPrison.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Look for data-code=" ... "
# It's probably escaped inside the attribute.

# Find the start of data-code
data_code_start = content.find('data-code="')
if data_code_start != -1:
    data_code_start += len('data-code="')
    # Find the closing quote of data-code attribute
    # This is tricky because the content itself contains escaped quotes.
    # In HTML attributes, quotes are escaped as &quot;
    # So the closing quote should be a literal "
    
    data_code_end = content.find('"', data_code_start)
    encoded_code = content[data_code_start:data_code_end]
    decoded_code = html.unescape(encoded_code)
    
    clean_html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Dig out of Prison</title>
    <meta charset="utf-8">
</head>
<body style="margin:0;padding:0;overflow:hidden;background-color:#000;">
{decoded_code}
<script>
    // Ensure the container is visible if it was set to display:none
    document.addEventListener('DOMContentLoaded', () => {{
        const container = document.getElementById('container') || document.querySelector('.content-container');
        if (container) {{
            container.style.display = 'block';
        }}
    }});
</script>
</body>
</html>"""
    
    with open('files/digOutOfPrison.html.clean', 'w', encoding='utf-8') as f:
        f.write(clean_html)
    print("Successfully extracted and decoded game code to files/digOutOfPrison.html.clean")
else:
    print("data-code attribute not found.")
