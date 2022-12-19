import subprocess
import sys


interface = sys.argv[1]

cmd = f"cat /sys/class/net/{interface}/operstate".split()

output = str(subprocess.Popen(cmd, stdout=subprocess.PIPE).communicate()[0])

if 'down' in output:
    print('<span color="#e89393" font="FontAwesome">↯</span>')
elif 'up' in output:
    print('<span color="#88b090" font="FontAwesome">↯</span>')
else:
    print('Wrong interface! Edit ethernet.py.')
