#!/bin/bash
BATTERY=$(upower -i $(upower -e | grep BAT) | grep percentage | awk '{print $2}' | sed 's/%//')
if [ "$BATTERY" -le 50 ]; then
    notify-send -u low "Half battery left" "Battery at ${BATTERY}%"
fi
if [ "$BATTERY" -le 30 ]; then
    notify-send -u normal "Battery Low" "Battery at ${BATTERY}%"
fi
if [ "$BATTERY" -le 20 ]; then
    notify-send -u critical "Battery very Low" "Battery at ${BATTERY}%"
fi
if [ "$BATTERY" -le 10 ]; then
    notify-send -u critical "Battery Critical" "Plug in your charger!"
fi

