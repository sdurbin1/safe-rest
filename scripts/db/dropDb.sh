#!/bin/bash

OPTIND=1         # Reset in case getopts has been used previously in the shell.

# Initialize our own variables:
host="localhost"
db="safe"

while getopts "uh:d:" opt; do
    case "$opt" in
    u)  
        echo -e "\nUsage: ./scripts/db/dropDb.sh -h HOST -d DB. Defaults are host: localhost, database: safe.\n"
        exit 0
        ;;
    h)  host=$OPTARG
        ;;
    d)  db=$OPTARG
        ;;
    esac
done

shift $((OPTIND-1))

[ "$1" = "--" ] && shift

echo "Mongo options: host='$host', db='$db'"

mongo $db --host $host --eval "db.dropDatabase()"
