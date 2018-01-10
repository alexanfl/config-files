#!/usr/bin/env python
# -*- coding: utf-8 -*-

from __future__ import unicode_literals
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt


def multiplier(base, a, b, N):
    x = np.linspace(a-10, b+10, N)
    y = np.zeros(N)

    for i in range(len(x)):
        if x[i] < a:
            y[i] = base**(a)
        elif x[i] >= a and x[i] <= b:
            y[i] = base**(x[i])
        else:
            y[i] = base**(b)
    return x, y

N = 10000
base = 0.9747
a = -47.27
b = 21.27

x, y = multiplier(base, a, b, N)

x_bblue, x_bgrey, x_green, x_yellow, x_orange, x_red, x_dred = [], [],[], [],[], [], []
y_bblue, y_bgrey, y_green, y_yellow, y_orange, y_red, y_dred = [], [],[], [],[], [], []


for i in range(len(x)):
    if x[i] >= 10:
        x_bblue.append(x[i])
        y_bblue.append(y[i])

    if x[i] >= 5 and x[i] <= 10:
        x_bgrey.append(x[i])
        y_bgrey.append(y[i])

    if x[i] >= 1 and x[i] <= 5:
        x_green.append(x[i])
        y_green.append(y[i])

    if x[i] >= -1 and x[i] <= 1:
        x_yellow.append(x[i])
        y_yellow.append(y[i])

    if x[i] >= -10 and x[i] <= -1:
        x_orange.append(x[i])
        y_orange.append(y[i])

    if x[i] >= -20 and x[i] <= -10:
        x_red.append(x[i])
        y_red.append(y[i])

    if x[i] <= -20:
        x_dred.append(x[i])
        y_dred.append(y[i])


plt.figure(figsize=(16, 4))

plt.plot(x_bblue, y_bblue, color="#0000ff", linewidth=3.0)
plt.annotate("12+",
        xy = (10, base**(10)),
        xytext = (10, base**(10)+0.25),
        arrowprops = dict(arrowstyle = '->')
        )
plt.hold("on")
plt.plot(x_bgrey, y_bgrey, color="#00ffff", linewidth=3.0)
plt.annotate("6+",
        xy = (5, base**(5)),
        xytext = (5, base**(5)+0.25),
        arrowprops = dict(arrowstyle = '->')
        )
plt.hold("on")
plt.plot(x_green, y_green, color="#00ff00", linewidth=3.0)
plt.annotate("1+",
        xy = (1, base**(1)),
        xytext = (1, base**(1)+0.25),
        arrowprops = dict(arrowstyle = '->')
        )
plt.hold("on")
plt.plot(x_yellow, y_yellow, color="#ffff00", linewidth=3.0)
plt.hold("on")
plt.plot(x_orange, y_orange, color="#ff9933", linewidth=3.0)
plt.annotate("1-",
        xy = (-1, base**(-1)),
        xytext = (-1, base**(-1)-0.25),
        arrowprops = dict(arrowstyle = '->')
        )
plt.hold("on")
plt.plot(x_red, y_red, color="#ff0000", linewidth=3.0)
plt.annotate("9-",
        xy = (-10, base**(-10)),
        xytext = (-10, base**(-10)-0.25),
        arrowprops = dict(arrowstyle = '->')
        )
plt.hold("on")
plt.plot(x_dred, y_dred, color="#cc0000", linewidth=3.0)
plt.annotate("16-",
        xy = (-20, base**(-20)),
        xytext = (-20, base**(-20)-0.25),
        arrowprops = dict(arrowstyle = '->')
        )

matplotlib.rc('text', usetex = True)

my_xticks_label = [r"$-\infty$", "-47.27", "-20", "-10", "-5", "-1", "0", "1", "5", "10", "21.27", r"$\infty$"]
my_xticks_value = [a - 10, -47.27, -20, -10, -5, -1, 0, 1, 5, 10, 21.27, b + 10]

plt.xticks(my_xticks_value, my_xticks_label)
plt.title("Taskvalue Multipliers for Different Taskvalues and Number of Consecutive Clicks")
plt.xlabel("Taskvalue")
plt.ylabel("Multiplier")
plt.savefig("taskvalue-plot.eps")
