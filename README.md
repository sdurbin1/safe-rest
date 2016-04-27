# safe-rest

### Install node and update to latest version
As of March 16, 2016, the latest version is 5.8.0.
```
nvm install v5.8.0
nvm alias default v5.8.0
```

### Clone repo
```
git clone https://github.com/sdurbin1/safe-rest.git
```

### Install safe-rest
```
cd /path/to/safe-rest
npm install
```

### Ensure mongo is running 
Run in separate terminal, or in background
```
mongod --smallfiles
```

### Populate database with test data
```
npm run-script db-fill
```

### Run application
```
npm start
```

# Rest API and example calls

##### POST /analytics
Create an analytic
```
curl localhost:8080/analytics/ -H "Content-Type: application/json" --data '{"name": "Normal Distribution"}'
```

##### GET /analytics
Return all analytics
```
curl localhost:8080/analytics
```

##### GET /analytics/:analytic
Return an analytic
```
curl localhost:8080/analytics/56e816d8abda61a618bfccd5
```

##### PUT /analytics/:analytic
Update an analytic
```
curl localhost:8080/analytics/56ea975aec9cc0f3098ae316 -H "Content-Type: application/json" -X PUT --data '{"name":"New Name"}' 
##### DELETE /analytics/:analytic
Delete an analytic
```
curl -X DELETE http://localhost:8080/analytics/56ea975aec9cc0f3098ae316
```

##### PUT /analytics/:analytic/visualization-types
Add an existing visualization-type to an analytic
```
curl localhost:8080/analytics/56eac298ee121e4b18d92259/visualization-types -X PUT --data 'visualizationTypes=56eaa1eae319c5af0c8dfc4d&visualizationTypes=56eaa1f1e319c5af0c8dfc4f'
```

##### GET /analytics/:analytic/visualization-types
Return a list of visualizationTypes associated with an analytic
```
curl localhost:8080/analytics/56e816d2abda61a618bfccd4/visualization-types
```
##### DELETE /analytics/:analytic/visualization-types/:visualization-type
Remove a visualizationType from an analytic (does not delete the visualizationType)
```
curl -X DELETE http://localhost:8080/analytics/56eac298ee121e4b18d92259/visualization-types/56eaa1eae319c5af0c8dfc4d
```

##### GET /visualization-types
Return all visualizationTypes
```
curl localhost:8080/visualization-types
```

##### POST /visualization-types 
Create a visualizationType
```
curl http://localhost:8080/visualization-types -H "Content-Type: application/json" -X POST --data '{"visualizationParams":{"title": {"text": "Monthly Average Temperature"},"subtitle": {"text": "Source: WorldClimate.com"}}, "name":"Area"}'
```

##### GET /visualization-types/:visualization-type
Return a visualizationType
```
curl localhost:8080/visualization-types/56e8178dabda61a618bfccd9
```

##### PUT /visualization-types/:visualization-type
Update a visualizationType
```
curl -X PUT http://localhost:8080/visualization-types/56eaa1eae319c5af0c8dfc4d/ --data 'name=Area'
```

##### DELETE /visualization-types/:visualization-type
Delete a visualizationType
```
curl -X DELETE http://localhost:8080/visualization-types/56eaa1eae319c5af0c8dfc4d/
```

##### POST /sources
Create a source
```
curl localhost:8080/sources -H "Content-Type: application/json" -X POST --data '{"name": "CSV_01222016", "fields": [{"name":"Age","dataType":"Number"},{"name":"County","dataType":"String"},{"name":"Height","dataType":"Number"},{"name":"Latitude","dataType":"Number"},{"name":"Longitude","dataType":"Number"},{"name":"Street Address","dataType":"String"},{"name":"Weight","dataType":"Number"}]}'
```

##### GET /sources
Return all sources
```
curl localhost:8080/sources
```

##### GET /sources/:source
Return a source
```
curl localhost:8080/sources/56e85075cbe2b94312e95daf
```

##### PUT /sources/:source
Update a source
```
curl localhost:8080/sources/56eaec7a2308db1b1c6f795f -H "Content-Type: application/json" -X PUT --data '{"fields": [{"name":"Age","dataType":"Number"},{"name":"County","dataType":"String"},{"name":"Height","dataType":"Number"},{"name":"Latitude","dataType":"Number"},{"name":"Longitude","dataType":"Number"},{"name":"Street Address","dataType":"String"},{"name":"Weight","dataType":"Number"}]}'
```

##### DELETE /sources/:source
Delete a source
```
curl -X DELETE http://localhost:8080/sources/56eaec7a2308db1b1c6f795f/
```

##### PUT /sources/:source/analytics
```
curl localhost:8080/sources/56eaec7a2308db1b1c6f795f/analytics -X PUT --data 'analytics=56eaa9fc51ed186110af1a80&analytics=56eac298ee121e4b18d92259'
```

##### GET /sources/:source/analytics
Return all analytics associated with a source
```
curl localhost:8080/sources/56e865818c792b4f18f64f24/analytics
```

##### DELETE /sources/:source/analytics
Remove an analytic from a source (does not delete the analytic)
```
curl -X DELETE http://localhost:8080/sources/56eaec7a2308db1b1c6f795f/analytics/56eaa9fc51ed186110af1a80
```

##### GET /sources/:source/fields
Return all fields associated with a source
```
curl localhost:8080/sources/56eaec7a2308db1b1c6f795f/fields
```

##### POST /sources/:source/data
Upload a csv document. Creates a new collection with name "sourceId", and inserts document, "document"
```
curl localhost:8080/sources/56eaec7a2308db1b1c6f795f/data -H "Content-Type: application/json" --data '{"document":[{"Age":21,"County":"Anne Arundel","Height":61,"Latitude":31.33,"Longitude":33.00,"Street Address":"123 Main St.","Weight":133},{"Age":33,"County":"Howard","Height":67,"Latitude":31.33,"Longitude":33.00,"Street Address":"456 Main St.","Weight":188},{"Age":29,"County":"Anne Arundel","Height":63,"Latitude":31.33,"Longitude":33.00,"Street Address":"789 Main St.","Weight":142}]}'
```
Optionally include a list of fields
```
curl localhost:8080/sources/56eaec892308db1b1c6f7960/data -H "Content-Type: application/json" --data '{"fields": [{"name":"Age","dataType":"Number"},{"name":"County","dataType":"String"},{"name":"Height","dataType":"Number"},{"name":"Latitude","dataType":"Number"},{"name":"Longitude","dataType":"Number"},{"name":"Street Address","dataType":"String"},{"name":"Weight","dataType":"Number"}],"document":[{"Age":21,"County":"Anne Arundel","Height":61,"Latitude":31.33,"Longitude":33.00,"Street Address":"123 Main St.","Weight":133},{"Age":33,"County":"Howard","Height":67,"Latitude":31.33,"Longitude":33.00,"Street Address":"456 Main St.","Weight":188},{"Age":29,"County":"Anne Arundel","Height":63,"Latitude":31.33,"Longitude":33.00,"Street Address":"789 Main St.","Weight":142}]}'
```

##### POST /sources/data
Upload a csv document and create source.
```
curl localhost:8080/sources/data -H "Content-Type: application/json" --data '{"source": {"name":"TEST","fields": [{"name":"Age","dataType":"Number"},{"name":"County","dataType":"String"},{"name":"Height","dataType":"Number"},{"name":"Latitude","dataType":"Number"},{"name":"Longitude","dataType":"Number"},{"name":"Street Address","dataType":"String"},{"name":"Weight","dataType":"Number"}]},"document":[{"Age":21,"County":"Anne Arundel","Height":61,"Latitude":31.33,"Longitude":33.00,"Street Address":"123 Main St.","Weight":133},{"Age":33,"County":"Howard","Height":67,"Latitude":31.33,"Longitude":33.00,"Street Address":"456 Main St.","Weight":188},{"Age":29,"County":"Anne Arundel","Height":63,"Latitude":31.33,"Longitude":33.00,"Street Address":"789 Main St.","Weight":142}]}'
```

##### DELETE /sources/:source/data
Delete csv document associated with source
```
curl localhost:8080/sources/5720ade7587a45660a46cdcb/data -X DELETE
```

##### GET /sources/:source/query
Queries a data source based on a set of filters.  Note: "id" field in filters data is not needed.
```
curl localhost:8080/sources/56eaec7a2308db1b1c6f795f/query -H "Content-Type: application/json" --data '{"filters": [{"id": "1","field": "Age","operator": ">","value": 25},{"id": "2","field": "County","operator": "=","value": "Howard"}]}'
```

##### POST /visualizations
Create a new visualization
```
curl http://localhost:8080/visualizations -H "Content-Type: application/json" -X POST --data '{"name":"Visualization1", "source":"56eaec7a2308db1b1c6f795f", "visualizationType":"57055c4c43176c9118cffc95", "analytic":"56eac298ee121e4b18d92259", "visualizationParams":{"title": {"text": "Monthly Average Temperature"},"subtitle": {"text": "Source: WorldClimate.com"}}, "analyticParams": [{"groupBy": ["Age"]}], "filters":[{ "id": 1,"field": "Age","operator": ">","value": 35},{"id": 2,"field": "County","operator": "=","value": "Howard"}], "analyticParams":[{"groupBy":"Age"}]}'
```

##### GET /visualizations
Return all visualizations
```
curl http://localhost:8080/visualizations
```

##### GET /visualizations/:visualization
Return a visualization
```
curl localhost:8080/visualizations/570b93b007b51d710c748fb1
```

##### PUT /visualizations/:visualization
Update a visualization
```
curl http://localhost:8080/visualizations/570b93b007b51d710c748fb1 -H "Content-Type: application/json" -X PUT --data '{"analyticParams":[{"groupBy":"AGE"}]}'
```

##### DELETE /visualizations/:visualization
Delete a visualization
```
curl -X DELETE http://localhost:8080/visualizations/570b93b007b51d710c748fb1
```

##### POST /dashboards
Create a dashboard
```
 curl http://localhost:8080/dashboards -X POST --data 'name=Dashboard&visualizations=570b968507b51d710c748fb2&visualizations=570b9e54ddef419e0fda43a9'
```

##### GET /dashboards
Return all dashboards
```
curl http://localhost:8080/dashboards
```

##### GET /dashboards/:dashboard
```
curl http://localhost:8080/dashboards/570b9f8a877d26ac10c3b4f1
```

##### PUT /dashboards/:dashboard
Update a dashboard
```
curl http://localhost:8080/dashboards/570b9f8a877d26ac10c3b4f1 -X PUT --data 'name=Dashboard1'
```

##### DELETE /dashboards/:dashboard
Delete a dashboard
```
curl http://localhost:8080/dashboards/570b9f8a877d26ac10c3b4f1 -X DELETE
```

##### GET /dashboards/:dashboard/visualizations
Return a list of visualizations associated with a dashboard
```
curl localhost:8080/dashboards/570ba706a4cc946212bdaa42/visualizations
```

##### PUT /dashboards/:dashboard/visualizations
Add an existing visualization to a dashboard
```
curl localhost:8080/dashboards/570ba706a4cc946212bdaa42/visualizations -X PUT --data 'visualizations=570b9e54ddef419e0fda43a9'
```

##### DELETE /dashboards/:dashboard/visualizations/:visualization
Remove a visualization from a dashboard (does not delete the visualization)
```
curl -X DELETE localhost:8080/dashboards/570ba706a4cc946212bdaa42/visualizations/570b968507b51d710c748fb2
```

##### GET /authenticate
Authenticate user
```
curl localhost:8080/authentication/authenticate
```
