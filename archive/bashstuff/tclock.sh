#!/bin/bash

if [ "$1" ] 
then
    minutes=60*$1 
else
    minutes=60*25
fi

if [ "$2" ] 
then 
    seconds=$2 
else
    seconds=0
fi

date1=$((`date +%s` + $minutes + $seconds)); 
while [ "       $date1" -ge `date +%s` ]; do 
    echo -ne "$(date -u --date @$(($date1 - `date +%s` )) +%H:%M:%S)\r"; 
done

notify-send "Timer finished! :)"
