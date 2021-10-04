const express = require('express')
const app = express()
const port = 3000
const pg = require("pg");
const fs = require("fs");
require('dotenv').config();

var filename = "./password.txt";

var password = "";
var pool;

fs.readFile(filename, "utf8", function (err, data) {  //async method, so pool has to be set in here or password wont be set when it's accessed
  if (err) throw err;

  password = data;

  pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'weather-data',
    password: password,
    port: 5432,
  })
});

app.get('/numrows', (req, res) => {      //get number of rows
    pool.query(
      "SELECT Count(*) FROM weatherdata.weather_data",
      function (err, result) {
        res.send(result.rows);
        if (err) return console.error(err);
      }
    );
});

app.get('/tempdata', (req, res) => {      //get temperature data
  pool.query(
    "SELECT station, date_recorded, hourly_temp_dewpoint, hourly_temp_bulbtemp FROM weatherdata.weather_data " +
    "where date_recorded > date_trunc('month', CURRENT_DATE) - INTERVAL '1 year' " +
    "order by date_recorded asc",
    function (err, result) {
      res.send(result.rows);
      if (err) return console.error(err);
    }
  );
});

app.get('/allmonths', (req, res) => {      //get all months (for axis)
  pool.query(
    "SELECT distinct(date_recorded) FROM weatherdata.weather_data order by date_recorded asc",
    function (err, result) {
      res.send(result.rows);
      if (err) return console.error(err);
    }
  );
});

app.get('/alldata', (req, res) => {      //get all data
  pool.query(
    "SELECT * FROM weatherdata.weather_data",
    function (err, result) {
      res.send(result.rows);
      if (err) return console.error(err);
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})