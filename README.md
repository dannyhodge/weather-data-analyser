# weather-data-analyser: API
Using different methods to improve speed of db querying of weather data (big data)

Using a PostgresDB, use methods like partitions, index etc to speed up querying, and note speeds of different techniques. Different algorithms may also be tried to improve speed.

The DB schema should be automatically created when the code is run, a local db/connection string is only thing needed to get this working.


**Speeds**

DB without partitions or index:

With partitions:

With Index:

With both:



The API itself is written in ExpressJS. It's quite simple, with the only complication being getting the data in a format that the front-end ngx-charts would accept. This probably ought've been done using a defined dto, however since this API was a means to and end, it was done by formatting the JSON string in order to change it's structure.
