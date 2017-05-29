import subprocess
cmd = "cat /sys/class/net/enp3s0/operstate".split()

output = str(subprocess.Popen(cmd, stdout=subprocess.PIPE).communicate()[0])

if 'down' in output:
    print('<span color="#ff0000" font="FontAwesome">\uf176\uf175</span>')
elif 'up' in output:
    print('<span color="#00ff00" font="FontAwesome">\uf176\uf175</span>')
else:
    print('Wrong interface! Edit ethernet.py.')
