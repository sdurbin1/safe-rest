#!/bin/bash

OPTIND=1         # Reset in case getopts has been used previously in the shell.

# Initialize our own variables:
host="localhost"
db="safe"

while getopts "uh:d:" opt; do
    case "$opt" in
    u)  
        echo -e "\nUsage: ./scripts/db/importDb.sh -h HOST -d DB. Defaults are host: localhost, database: safe.\n"
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

mongoimport --db $db --host $host --collection 56eaec7a2308db1b1c6f795f --file data/safe/56eaec7a2308db1b1c6f795f.json
mongoimport --db $db --host $host --collection 572a16e5fbdcac91218b9a1c --file data/safe/572a16e5fbdcac91218b9a1c.json
mongoimport --db $db --host $host --collection 5748845f8058984023ca43d6 --file data/safe/5748845f8058984023ca43d6.json
mongoimport --db $db --host $host --collection 57a4d2c21c5e543405b806cd --file data/safe/57a4d2c21c5e543405b806cd.json
mongoimport --db $db --host $host --collection analytics --file data/safe/analytics.json
mongoimport --db $db --host $host --collection dashboardgroups --file data/safe/dashboardgroups.json
mongoimport --db $db --host $host --collection dashboards --file data/safe/dashboards.json
mongoimport --db $db --host $host --collection sources --file data/safe/sources.json
mongoimport --db $db --host $host --collection visualizations --file data/safe/visualizations.json
mongoimport --db $db --host $host --collection visualizationtypes --file data/safe/visualizationtypes.json
