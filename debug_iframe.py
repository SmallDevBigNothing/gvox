import html
import re

file_path = 'files/digOutOfPrison.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

iframe_idx = content.find('&lt;iframe id=&quot;fr&quot;')
if iframe_idx != -1:
    print(f"Iframe context: {content[iframe_idx-200:iframe_idx+500]}")
else:
    print("Iframe not found")
