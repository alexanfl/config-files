import subprocess
import sys
import re

icon = ''
color_def="#666666"   # gray
color_good="#88b090"  # green
color_warn="#ccdc90"  # orange
color_crit="#e89393"  # red
color_info="#ded16d"  # yellow


FORMAT = f'<span color="%s">{icon} %s (%s %%) [%s]</span>'
cmd = ['nmcli', 'dev', 'wifi']

output = subprocess.Popen(cmd, stdout=subprocess.PIPE).communicate()[0].decode()
res = None
regex_pattern = r'\s{2,}'
for line in output.split('\n'):
    if line.startswith('*'):
        matches = re.split(regex_pattern, line)
        ssid = matches[2]
        signal = int(matches[6])
        speed = matches[5]

        if signal > 70:
            color = color_good
        elif signal > 40:
            color = color_warn
        elif signal > 25:
            color = color_info
        else:
            color = color_info
            
        fmt = FORMAT % (color, ssid, signal, speed)
        print(fmt)


if res is None:
    print(f'<span color="{color_crit}">{icon}</span>')

