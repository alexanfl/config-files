#!/bin/bash

defaultuser="<username goes here>"

if [ "$1" ]
then
    printtype=$1
else
    echo "Usage: sh print.sh <push/pull> <printer> <filename> -u/-N <username"
    echo "Print type missing (push/pull)."
    exit
fi

if [ "$2" ]
then
    printer=$2
else
    echo "Usage: sh print.sh <push/pull> <printer> <filename> -u/-N <username"
    echo "Printer missing."
    exit
fi

if [ "$3" ]
then
    filename=$3
else
    echo "Usage: sh print.sh <push/pull> <printer> <filename> -u/-N <username"
    echo "File missing."
    exit
fi

if [ "$5" ]
then
    user=$5
else
    user=$defaultuser
    echo "Using default username: $defaultuser"
fi

echo "Enter password: "
read -s passw

if [ "$4" == "-N" ]
then
    cat $filename | ssh $user@login.uio.no $printtype"print -P $printer"
elif [ "$4" == "-u" ]
then
    cat <<< $passw | ssh $user@login.uio.no 'kinit' && cat $filename | ssh $user@login.uio.no $printtype"print -P $printer"
fi
