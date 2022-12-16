import subprocess
cmd = "amixer get Master".split()

output = str(subprocess.Popen(cmd, stdout=subprocess.PIPE).communicate()[0])

if output.find("off") != -1:
    vol = -1
else:
    a = output.find("[")
    b = output.find("]")
    vol = int(output[a+1:b-1])

def getfmt(vol):
    if vol == -1:
        return "#e89393", "\uf026\uf00d", ""
    if vol == 0:
        return "#666666", "\uf026", f" {vol} %"
    if vol < 50:
        return "#666666", "\uf027", f" {vol} %"
    if vol <= 100:
        return "#666666", "\uf028", f" {vol} %"


print('<span font="FontAwesome" color="%s">%s%s</span>' % getfmt(vol))
