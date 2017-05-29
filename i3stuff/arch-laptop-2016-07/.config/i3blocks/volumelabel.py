import subprocess
cmd = "amixer get Master".split()

output = str(subprocess.Popen(cmd, stdout=subprocess.PIPE).communicate()[0])

if output.find("off") != -1:
    vol = -1
else:
    a = output.find("[")
    b = output.find("]")
    vol = int(output[a+1:b-1])

def getsymb(vol):
    if vol == -1:
        return "#ff0000", "\uf026\uf00d"
    if vol == 0:
        return "#ffffff", "\uf026"
    if vol < 50:
        return "#ffffff", "\uf027"
    if vol <= 100:
        return "#ffffff", "\uf028"


print('<span font="FontAwesome" color="%s">%s</span>' % (getsymb(vol)))
