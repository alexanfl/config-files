import subprocess
import sys
import re

icon = ''
color_def="#bbbbbb"   # gray
color_good="#88b090"  # green
color_warn="#deab6d"  # orange
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
        elif signal > 50:
            color = color_info
        elif signal > 30:
            color = color_warn
        else:
            color = color_crit
            
        fmt = FORMAT % (color, ssid, signal, speed)
        print(fmt)


if res is None:
    print(f'<span color="{color_crit}">{icon}</span>')

