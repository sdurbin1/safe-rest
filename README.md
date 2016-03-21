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
```
curl localhost:8080/analytics --data 'name=Count'
```

##### GET /analytics
```
curl localhost:8080/analytics
```

##### GET /analytics/:analytic
```
curl localhost:8080/analytics/56e816d8abda61a618bfccd5
```

##### POST /analytics/:analytic/params
```
curl localhost:8080/analytics/56e816d2abda61a618bfccd4 --data 'name=Mean' 
```

##### GET /analytics/:analytic/params
```
curl localhost:8080/analytics/56e816d2abda61a618bfccd4/params
```

##### PUT /analytics/:analytic/visualizations
```
curl localhost:8080/analytics/56eac298ee121e4b18d92259/visualizations -X PUT --data 'visualizations=56eaa1eae319c5af0c8dfc4d&visualizations=56eaa1f1e319c5af0c8dfc4f'
```

##### GET /analytics/:analytic/visualizations
```
curl localhost:8080/analytics/56e816d2abda61a618bfccd4/visualizations
```

##### GET /visualizations
```
curl localhost:8080/visualizations
```

##### GET /visualizations/:visualization
```
curl localhost:8080/visualizations/56e8178dabda61a618bfccd9
```

##### POST /visualizations/:visualization/params
```
curl localhost:8080/visualizations/56e8178dabda61a618bfccd9/params --data 'name=Title'
```
##### GET /visualizations/:visualization/params
```
curl localhost:8080/visualizations/56e8178dabda61a618bfccd9/params
```

##### POST /sources
```
curl localhost:8080/sources --data 'name=CSV_20160122'
```

##### GET /sources
```
curl localhost:8080/sources
```

##### GET /sources/:source
```
curl localhost:8080/sources/56e85075cbe2b94312e95daf
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
