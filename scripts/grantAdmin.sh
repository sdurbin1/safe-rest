#!/bin/bash

if [ -z "$1" ]; then
  echo -e "\nUsage: ./scripts/grantAdmin.sh username\n"
  exit
fi

USERNAME=$1

mongo safe --eval 'db.users.update({"username":'\"$USERNAME\"'},{$set:{"admin":true}});'
