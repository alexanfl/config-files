import subprocess
cmd = "cat /sys/class/net/enp0s31f6/operstate".split()

output = str(subprocess.Popen(cmd, stdout=subprocess.PIPE).communicate()[0])

if 'down' in output:
    print('<span color="#e89393" font="FontAwesome">\uf176\uf175</span>')
elif 'up' in output:
    print('<span color="#88b090" font="FontAwesome">\uf176\uf175</span>')
else:
    print('Wrong interface! Edit ethernet.py.')
