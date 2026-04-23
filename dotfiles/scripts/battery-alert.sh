#!/bin/bash
LAST_ALERT=100
BATTERY_PATH=$(upower -e | grep BAT | head -n 1)

if [ -z "$BATTERY_PATH" ]; then
    echo "No battery detected."
    exit 1
fi

while true; do
    BATTERY=$(upower -i "$BATTERY_PATH" | awk -F': *' '/percentage/ {print int($2)}')


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
    elif [ "$BATTERY" -gt 50 ]; then
        LAST_ALERT=100  # reset alerts when battery is healthy
    fi

    sleep 300
done

