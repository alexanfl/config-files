#!/bin/bash

minutes=60*25

date1=$((`date +%s` + $minutes)); 
while [ "$date1" -ge `date +%s` ]; do 
    echo -ne "      $(date -u --date @$(($date1 - `date +%s` )) +%H:%M:%S)\r"; 
done

notify-send "Timer finished! :)"
