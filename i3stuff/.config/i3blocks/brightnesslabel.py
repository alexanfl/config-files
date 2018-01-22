import subprocess
cmd = "light -G".split()

output = int(eval(subprocess.Popen(cmd, stdout=subprocess.PIPE).communicate()[0]))

print('\uf042 %s%%' % output)
