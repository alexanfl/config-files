import subprocess
import sys


interface = sys.argv[1]

cmd = f"cat /sys/class/net/{device}/operstate".split()

output = str(subprocess.Popen(cmd, stdout=subprocess.PIPE).communicate()[0])

if 'down' in output:
    print('<span color="#e89393" font="FontAwesome">\uf176\uf175</span>')
elif 'up' in output:
    print('<span color="#88b090" font="FontAwesome">\uf176\uf175</span>')
else:
    print('Wrong interface! Edit ethernet.py.')
