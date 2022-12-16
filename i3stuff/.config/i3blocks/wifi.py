import subprocess
import sys
import re

icon = ''
color_def="#666666"		# gray
color_good="#88b090"	# green
color_warn="#ccdc90"	# yellow
color_crit="#e89393"	# red
color_info="#fce94f"	# bright yellow

FORMAT = f'<span color="%s">{icon} %s (%s %%) [%s %s]</span>'
cmd = ['nmcli', 'dev', 'wifi']

output = subprocess.Popen(cmd, stdout=subprocess.PIPE).communicate()[0].decode()
res = None
for line in output.split('\n'):
    if line.startswith('*'):
        res = line.split()
        ssid = res[2]
        signal = int(res[7])
        speed = res[5]
        unit = res[6]

        if signal > 70:
            color = color_good
        elif signal > 40:
            color = color_warn
        elif signal > 25:
            color = color_info
        else:
            color = color_info
            
        fmt = FORMAT % (color, ssid, signal, speed, unit)
        print(fmt)


if res is None:
    print(f'<span color="{color_crit}">{icon}</span>')

