#!/bin/bash
#!/bin/bash

A=$(/home/u53118/.local/bin/i3-gnome-pomodoro status)
if [[ -n $A ]]; then
    echo "🍅 $A"
else
    echo "🍅 Pomodoro"
fi
