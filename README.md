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

##### POST /visualizations/:visualization/params
Create a visualization param for a visualization
```
curl localhost:8080/visualizations/56e8178dabda61a618bfccd9/params --data 'name=Title'
```
##### GET /visualizations/:visualization/params
Return all visualization params for a specified visualization
```
curl localhost:8080/visualizations/56e8178dabda61a618bfccd9/params
```

##### DELETE /visualizations/:visualization/params/:param
Delete a visualization param and remove it from visualization
```
curl -X DELETE http://localhost:8080/visualizations/56eaa1eae319c5af0c8dfc4d/params/56f13c5d0140724d0da7d1c9
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
```
curl localhost:8080/sources/56e865818c792b4f18f64f24/analytics
```

##### GET /sources/:source/fields
```
curl localhost:8080/sources/56e865818c792b4f18f64f24/fields 
```

##### POST /sources/:source/fields
```
curl localhost:8080/sources/56e865818c792b4f18f64f24/fields --data 'name=Age'
```
