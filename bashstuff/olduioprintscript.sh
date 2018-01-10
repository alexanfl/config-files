#!/bin/bash

# How to run (enclosed in [] means optional):
#
# sh print.sh pushprint PRINTER FILE [USERNAME] [PATH]
# where PATH is where to dump the file 
# (which will be deleted after printing.) 
#
# OR
#
# sh print.sh pullprint QUEUE
# where QUEUE is ricoh, hp or xerox.

user="alexanfl"
path="~/"

if [ "$4" ]
then
    user=$4
fi

if [ "$5" ]
then
    path=$5
fi

scp $3 $user@coronium.uio.no:$path$3

sleep 5s

if [ "$1" == "pullprint" ]
then
    ssh coronium pullprint -P $2
fi

if [ "$1" == "pushprint" ]
then
    ssh $user@coronium.uio.no pushprint -P $2 $path$3
fi

sleep 10s

ssh $user@coronium.uio.no rm $path$3
