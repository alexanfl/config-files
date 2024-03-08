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
        return "#e89393", "\uf026✘", ""
    if vol == 0:
        return "#e89393", "\uf026", f" {vol} %"
    if vol < 30:
        return "#666666", "\uf027", f" {vol} %"
    if vol < 70:
        return "#88b090", "\uf027", f" {vol} %"
    if vol < 85:
        return "#ded16d", "\uf028", f" {vol} %"
    if vol <= 100:
        return "#deab6d", "\uf028", f" {vol} %"


print('<span font="FontAwesome" color="%s">%s%s</span>' % getfmt(vol))
