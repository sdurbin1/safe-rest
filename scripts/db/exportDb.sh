#!/bin/bash

OPTIND=1         # Reset in case getopts has been used previously in the shell.

# Initialize our own variables:
host="localhost"
db="safe"

while getopts "uh:d:" opt; do
    case "$opt" in
    u)  
        echo -e "\nUsage: ./scripts/db/exportDb.sh -h HOST -d DB. Defaults are host: localhost, database: safe.\n"
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

rm data/safe/*.json
mongoexport --db $db --host $host --collection 56eaec7a2308db1b1c6f795f --out data/safe/56eaec7a2308db1b1c6f795f.json
mongoexport --db $db --host $host --collection 572a16e5fbdcac91218b9a1c --out data/safe/572a16e5fbdcac91218b9a1c.json
mongoexport --db $db --host $host --collection 5748845f8058984023ca43d6 --out data/safe/5748845f8058984023ca43d6.json
mongoexport --db $db --host $host --collection 57a4d2c21c5e543405b806cd --out data/safe/57a4d2c21c5e543405b806cd.json
mongoexport --db $db --host $host --collection analytics --out data/safe/analytics.json
mongoexport --db $db --host $host --collection dashboardgroups --out data/safe/dashboardgroups.json
mongoexport --db $db --host $host --collection dashboards --out data/safe/dashboards.json
mongoexport --db $db --host $host --collection sources --out data/safe/sources.json
mongoexport --db $db --host $host --collection visualizations --out data/safe/visualizations.json
mongoexport --db $db --host $host --collection visualizationtypes --out data/safe/visualizationtypes.json
