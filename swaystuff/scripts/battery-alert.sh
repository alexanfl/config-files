#!/bin/bash
LAST_ALERT=100  # start with a high value
BATTERY_PATH=$(upower -e | grep BAT | head -n 1)

while true; do
    BATTERY=$(upower -i "$BATTERY_PATH" | awk '/percentage/ {gsub("%","",$2); print $2}')

    if [ "$BATTERY" -le 10 ] && [ "$LAST_ALERT" -gt 10 ]; then
        notify-send -u critical "Battery Critical" "Plug in your charger!"
        LAST_ALERT=10
    elif [ "$BATTERY" -le 20 ] && [ "$LAST_ALERT" -gt 20 ]; then
        notify-send -u critical "Battery Very Low" "Battery at ${BATTERY}%"
        LAST_ALERT=20
    elif [ "$BATTERY" -le 30 ] && [ "$LAST_ALERT" -gt 30 ]; then
        notify-send -u normal "Battery Low" "Battery at ${BATTERY}%"
        LAST_ALERT=30
    elif [ "$BATTERY" -le 50 ] && [ "$LAST_ALERT" -gt 50 ]; then
        notify-send -u low "Half Battery Left" "Battery at ${BATTERY}%"
        LAST_ALERT=50
    fi

    sleep 300
done
