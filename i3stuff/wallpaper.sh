#!/bin/sh

while true; do
	find ~/Pictures/Backgrounds/ -type f \( -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' \) -print0 |
		shuf -n1 -z | xargs -0 feh --bg-scale --no-xinerama "$@"
	sleep 5m
done
