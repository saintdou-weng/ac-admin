"""usage: python3 setblock.py <file.html> <block-id> <js-file> [before-id]   — replace the block's content, or insert a new <script id> before the script with before-id"""
import re,sys
f,bid,js=sys.argv[1:4];before=sys.argv[4] if len(sys.argv)>4 else None
s=open(f,encoding='utf-8').read();code=open(js,encoding='utf-8').read()
assert '</script' not in code.lower()
m=re.search(r'(<script[^>]*\bid="%s"[^>]*>)(.*?)(</script>)'%re.escape(bid),s,re.S)
if m: s=s[:m.start(2)]+code+s[m.end(2):]; print('replaced',bid,len(code))
else:
    m=re.search(r'<script[^>]*\bid="%s"[^>]*>'%re.escape(before),s); assert m,'anchor not found'
    s=s[:m.start()]+'<script id="%s">'%bid+code+'</script>\n'+s[m.start():]; print('inserted',bid,'before',before,len(code))
open(f,'w',encoding='utf-8').write(s)
