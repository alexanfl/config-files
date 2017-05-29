#!/usr/bin/env python3
#
# Copyright (C) 2016 James Murphy
# Licensed under the GPL version 2 only
#
# A battery indicator blocklet script for i3blocks

from subprocess import check_output, Popen, PIPE

status = check_output(['acpi'], universal_newlines=True)


if not status:
    # stands for no battery found
    fulltext = "<span color='red'><span font='FontAwesome'>\uf00d \uf244</span></span>"
    percentleft = 100
else:
    state = status.split(": ")[1].split(", ")[0]
    commasplitstatus = status.split(", ")
    percentleft = int(commasplitstatus[1].rstrip("%\n"))

    # stands for charging
    FA_LIGHTNING = "<span color='yellow'><span font='FontAwesome'>\uf0e7</span></span>"

    # stands for plugged in
    FA_PLUG = "<span font='FontAwesome'>\uf1e6</span>"

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
            if percentleft < 100:
                return "\uf240"
        symb = symbfunc(percentleft)

    elif state == "Full":
        symb = ""
        fulltext = FA_PLUG + " "

    elif state == "Unknown":
        symb = ""
        fulltext = "<span font='FontAwesome'>\uf128</span> "
    else:
        symb = ""
        fulltext = FA_LIGHTNING + " " + FA_PLUG + " "

    def color(percent):
        if percent < 10:
            if state == "Discharging":
                bashCommand = "notify-send -t 100 Battery<10%! Plug in charger now!"
                process = Popen(bashCommand.split(), stdout=PIPE)
                output, error = process.communicate()
            # exit code 33 will turn background red
            return "#FF0000"
        if percent < 20:
            if state == "Discharging":
                bashCommand = "notify-send -t 100 Battery<20%! Plug in charger."
                process = Popen(bashCommand.split(), stdout=PIPE)
                output, error = process.communicate()
            return "#FF3300"
        if percent < 30:
            if state == "Discharging":
                bashCommand = "notify-send -t 100 Battery<30%"
                process = Popen(bashCommand.split(), stdout=PIPE)
                output, error = process.communicate()
            return "#FF6600"
        if percent < 40:
            return "#FF9900"
        if percent < 50:
            return "#FFCC00"
        if percent < 60:
            return "#FFFF00"
        if percent < 70:
            return "#FFFF33"
        if percent < 80:
            return "#FFFF66"
        return "#FFFFFF"

    form =  '<span font="FontAwesome" color="{}">{} {}%</span>'


    fulltext += form.format(color(percentleft), symb, percentleft)
    fulltext += timeleft

print(fulltext)
print(fulltext)
# if percentleft < 10:
#     exit(33)
