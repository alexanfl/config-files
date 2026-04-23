import subprocess
import sys



def get_interface():
    cmd = ['nmcli', 'c']
    output = subprocess.Popen(cmd, stdout=subprocess.PIPE).communicate()[0].decode()
    for line in output.split('\n'):
        vals = line.split()
        if len(vals) < 4:
            continue

        if 'ethernet' in line:
            return vals[-1] if vals[-1] != '--' else None


interface = get_interface() if len(sys.argv) < 2 else sys.argv[1]


cmd = f"cat /sys/class/net/{interface}/operstate".split()

if interface:
    output = str(subprocess.Popen(cmd, stdout=subprocess.PIPE).communicate()[0])
else:
    output = 'down'


if 'down' in output:
    print('<span color="#e89393" font="mononoki nf bold">✘🖧</span>')
elif 'up' in output:
    print('<span color="#88b090" font="mononoki nf bold">✔🖧</span>')
else:
    print('Wrong interface! Edit ethernet.py.')
