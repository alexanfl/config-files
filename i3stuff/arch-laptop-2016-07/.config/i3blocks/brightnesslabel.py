import subprocess
cmd = "xbacklight -get".split()

output = int(eval(subprocess.Popen(cmd, stdout=subprocess.PIPE).communicate()[0]))

print('<span font="FontAwesome">\uf042 %s%%</span>' % output)
