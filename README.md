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
curl localhost:8080/analytics --data 'name=Count'
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
curl -X PUT http://localhost:8080/analytics/56ea93bcec9cc0f3098ae30a --data 'name=Binomial'
```

##### DELETE /analytics/:analytic
Delete an analytic
```
curl -X DELETE http://localhost:8080/analytics/56ea975aec9cc0f3098ae316
```

##### POST /analytics/:analytic/params
Create an analytic param for an analytic
```
curl localhost:8080/analytics/56e816d2abda61a618bfccd4 --data 'name=Mean' 
```

##### GET /analytics/:analytic/params
Return a list of analytic params associated with an analytic
```
curl localhost:8080/analytics/56e816d2abda61a618bfccd4/params
```

##### DELETE /analytics/:analytic/params/:param
Delete an analytic param
```
curl -X DELETE http://localhost:8080/analytics/56ea975aec9cc0f3098ae316/params/56eaf56002a2ebc41e8e108d
```

##### PUT /analytics/:analytic/visualizations
Add an existing visualization to an analytic
```
curl localhost:8080/analytics/56eac298ee121e4b18d92259/visualizations -X PUT --data 'visualizations=56eaa1eae319c5af0c8dfc4d&visualizations=56eaa1f1e319c5af0c8dfc4f'
```

##### GET /analytics/:analytic/visualizations
Return a list of visualizations associated with an analytic
```
curl localhost:8080/analytics/56e816d2abda61a618bfccd4/visualizations
```
##### DELETE /analytics/:analytic/visualizations/:visualization
Remove a visualization from an analytic (does not delete the visualization)
```
curl -X DELETE http://localhost:8080/analytics/56eac298ee121e4b18d92259/visualizations/56eaa1eae319c5af0c8dfc4d
```

##### GET /visualizations
Return all visualizations
```
curl localhost:8080/visualizations
```

##### POST /visualizations 
Create a visualization
```
curl http://localhost:8080/visualizations -H "Content-Type: application/json" -X POST --data '{"visualizationParams":{"title": {"text": "Monthly Average Temperature"},"subtitle": {"text": "Source: WorldClimate.com"}}, "name":"Area"}'
```

##### GET /visualizations/:visualization
Return a visualization
```
curl localhost:8080/visualizations/56e8178dabda61a618bfccd9
```

##### PUT /visualizations/:visualization
Update a visualization
```
curl -X PUT http://localhost:8080/visualizations/56eaa1eae319c5af0c8dfc4d/ --data 'name=Area'
```

##### DELETE /visualizations/:visualization
Delete a visualization
```
curl -X DELETE http://localhost:8080/visualizations/56eaa1eae319c5af0c8dfc4d/
```

##### POST /sources
Create a source
```
curl localhost:8080/sources --data 'name=CSV_20160122'
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
curl -X PUT http://localhost:8080/sources/56eaec7a2308db1b1c6f795f/ --data 'name=TEST'
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
Return fields associated with a source
```
curl localhost:8080/sources/56e865818c792b4f18f64f24/fields 
```

##### POST /sources/:source/fields
Create a field
```
curl localhost:8080/sources/56e865818c792b4f18f64f24/fields --data 'name=Age'
```

##### DELETE /sources/:source/fields/:field
Remove a field from a source and delete field
```
curl -X DELETE http://localhost:8080/sources/56eaec7a2308db1b1c6f795f/fields/56f14ffccc36acc513000286
```

##### POST /sources/:source/upload
Upload a csv document. Creates a new collection with "name"(TBD), and inserts document, "document"
```
curl localhost:8080/sources/56eaec7a2308db1b1c6f795f/upload -H "Content-Type: application/json" --data '{"document":[{"Age":21,"County":"Anne Arundel","Height":61,"Latitude":31.33,"Longitude":33.00,"Street Address":"123 Main St.","Weight":133},{"Age":33,"County":"Howard","Height":67,"Latitude":31.33,"Longitude":33.00,"Street Address":"456 Main St.","Weight":188},{"Age":29,"County":"Anne Arundel","Height":63,"Latitude":31.33,"Longitude":33.00,"Street Address":"789 Main St.","Weight":142}]}'
```

##### GET /sources/:source/query
Queries a data source based on a set of filters
```
curl localhost:8080/sources/56eaec7a2308db1b1c6f795f/query -H "Content-Type: application/json" --data '{"filters": [{"id": "1","field": "Age","operator": ">","value": 25},{"id": "2","field": "County","operator": "=","value": "Howard"}]}'
```

##### POST /charts
Create a new chart
```
curl http://localhost:8080/charts -H "Content-Type: application/json" -X POST --data '{"name":"Chart1", "source":"56eaec7a2308db1b1c6f795f", "visualization":"57055c4c43176c9118cffc95", "analytic":"56eac298ee121e4b18d92259", "chartParams":{"title": {"text": "Monthly Average Temperature"},"subtitle": {"text": "Source: WorldClimate.com"}}, "filters":[{ "id": 1,"field": "Age","operator": ">","value": 35},{"id": 2,"field": "County","operator": "=","value": "Howard"}], "analyticParams":[{"groupBy":"Age"}]}'
```

##### GET /charts
Return all charts
```
curl http://localhost:8080/charts
```

##### GET /charts/:chart
Return a chart
```
curl localhost:8080/charts/570b93b007b51d710c748fb1
```

##### PUT /charts/:chart
Update a chart
```
curl http://localhost:8080/charts/570b93b007b51d710c748fb1 -H "Content-Type: application/json" -X PUT --data '{"analyticParams":[{"groupBy":"AGE"}]}'
```

##### DELETE /charts/:chart
Delete a chart
```
curl -X DELETE http://localhost:8080/charts/570b93b007b51d710c748fb1
```

##### POST /dashboards
Create a dashboard
```
 curl http://localhost:8080/dashboards -X POST --data 'name=Dashboard&charts=570b968507b51d710c748fb2&charts=570b9e54ddef419e0fda43a9'
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

##### GET /dashboards/:dashboard/charts
Return a list of charts associated with a dashboard
```
curl localhost:8080/dashboards/570ba706a4cc946212bdaa42/charts
```

##### PUT /dashboards/:dashboard/charts
Add an existing chart to a dashboard
```
curl localhost:8080/dashboards/570ba706a4cc946212bdaa42/charts -X PUT --data 'charts=570b9e54ddef419e0fda43a9'
```

##### DELETE /dashboards/:dashboard/charts/:chart
Remove a chart from a dashboard (does not delete the chart)
```
curl -X DELETE localhost:8080/dashboards/570ba706a4cc946212bdaa42/charts/570b968507b51d710c748fb2
```

##### GET /authenticate
Authenticate user
```
curl localhost:8080/authentication/authenticate
```
