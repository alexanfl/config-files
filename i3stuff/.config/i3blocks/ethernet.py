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
            return vals[-1]


interface = get_interface() if len(sys.argv) < 2 else sys.argv[1]


cmd = f"cat /sys/class/net/{interface}/operstate".split()

output = str(subprocess.Popen(cmd, stdout=subprocess.PIPE).communicate()[0])



if 'down' in output:
    print('<span color="#e89393" font="FontAwesome">↯</span>')
elif 'up' in output:
    print('<span color="#88b090" font="FontAwesome">↯</span>')
else:
    print('Wrong interface! Edit ethernet.py.')
