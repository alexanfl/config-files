#!/usr/bin/env python3
#
# Copyright (C) 2016 James Murphy
# Licensed under the GPL version 2 only
#
# A battery indicator blocklet script for i3blocks

from subprocess import check_output, Popen, PIPE

status = check_output(['acpi'], universal_newlines=True)

color_def="#bbbbbb"   # gray
color_good="#88b090"  # green
color_warn="#ccdc90"  # orange
color_crit="#e89393"  # red
color_info="#ded16d"  # yellow
color_red="#ff0000"   # red


if not status:
    # stands for no battery found
    fulltext = "<span font='mononoki nf bold 'color='red'>\uf00d \uf244</span>"
    percentleft = 100
else:
    state = status.split(": ")[1].split(", ")[0]
    commasplitstatus = status.partition("\n")[0].split(", ")
    percentleft = int(commasplitstatus[1].strip("%"))

    # stands for charging
    FA_LIGHTNING = "<span font='mononoki nf bold 'color='yellow'>\uf0e7</span>"

    # stands for plugged in
    FA_PLUG = "<span font='mononoki nf bold'>\uf1e6</span>"

    fulltext = ""
    timeleft = ""
    if state == "Discharging":
        time = commasplitstatus[-1].split()[0]
        time = ":".join(time.split(":")[0:2])
        timeleft = " ({})".format(time)
        
        def symbfunc(percentleft):
            if percentleft < 10:
                return "\uf244"
            if percentleft < 25:
                return "\uf243"
            if percentleft < 50:
                return "\uf242"
            if percentleft < 75:
                return "\uf241"
            if percentleft <= 100:
                return "\uf240"
        symb = symbfunc(percentleft)

    elif state == "Full":
        symb = ""
        fulltext = FA_PLUG

    elif state == "Unknown":
        symb = ""
        fulltext = "<span font='mononoki nf bold'>\uf128</span> "
    else:
        symb = ""
        fulltext = f"{FA_LIGHTNING}{FA_PLUG}"

    def color(percent):
        if percent < 10:
            # exit code 33 will turn background red
            return color_red
        if percent < 20:
            return color_crit
        if percent < 30:
            return color_warn
        if percent < 40:
            return color_warn
        if percent < 50:
            return color_info
        if percent < 60:
            return color_info
        if percent < 70:
            return color_info
        if percent < 80:
            return color_good
        return color_def

    form = '<span font="mononoki nf bold" color="{}">{}  {}%</span>'

    bash_command = None
    if state == "Discharging":
        if percentleft < 10:
            bash_command = ["notify-send", "-w", "-u", "critical", "Warning: Battery<10%! Plug in charger now!"]
        elif percentleft < 20:
            bash_command = ["notify-send", "-w", "-u", "critical", "Warning: Battery<20%! Plug in charger."]
        elif percentleft < 30:
            bash_command = ["notify-send", "-w", "-u", "normal", "Warning: Battery<30%"]

    if bash_command:
        process = Popen(bash_command, stdout=PIPE)
        # .communicate() will block the execution until notification has been clicked on:
        #output, error = process.communicate()

    fulltext += form.format(color(percentleft), symb, percentleft)
    fulltext += timeleft

print(fulltext)
# if percentleft < 10:
#     exit(33)
