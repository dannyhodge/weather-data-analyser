const express = require('express')
const app = express()
const port = 3000
const pg = require("pg");
const fs = require("fs");
const cors = require('cors'); 
app.use(cors());
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

app.get('/stationgeodata', (req, res) => {      //get stations
  pool.query(
    "SELECT name, st_asgeojson(geom) as geom FROM weatherdata.stations",
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

app.get('/dewpointtempdata', (req, res) => {      //get dewpoint temp data
  pool.query(
    "SELECT date_recorded as name, AVG(hourly_temp_dewpoint) as value FROM weatherdata.weather_data " + 
    "WHERE date_recorded > date_trunc('month', CURRENT_DATE) - INTERVAL '1 year' " + 
    "AND station = 1 " + 
    "GROUP BY date_recorded ORDER BY date_recorded asc",
    function (err, result) {
      var temp = "[{\"name\": \"Dewpoint Temperature\",\"series\": ";
      temp += JSON.stringify(result.rows);
      temp += " }]";
      res.send(temp);
      
      if (err) return console.error(err);
    }
  );
});

app.get('/alltempdata', async (req, res) => {      //get all temp data in correct json format
  var responseContent = "[";
  pool.query(
    "SELECT date_recorded as name, AVG(hourly_temp_dewpoint) as value FROM weatherdata.weather_data " + 
    "WHERE date_recorded > date_trunc('month', CURRENT_DATE) - INTERVAL '" + req.query.months + " month' " + 
    "AND station = 1 " + 
    "GROUP BY date_recorded ORDER BY date_recorded asc",
    function (err, result) {
      if(result == null)  {
        res.send(null);
        return null;
      }
      
      responseContent += "{\"name\": \"Dewpoint Temperature\",\"series\": ";
      responseContent += JSON.stringify(result.rows);
      responseContent += " }, ";
      
      pool.query(
        "SELECT date_recorded as name, AVG(hourly_temp_bulbtemp) as value FROM weatherdata.weather_data " + 
        "WHERE date_recorded > date_trunc('month', CURRENT_DATE) - INTERVAL '" + req.query.months + " month' " + 
        //"AND station = 1 " + 
        "GROUP BY date_recorded ORDER BY date_recorded asc",
        function (err, result) {
          if(result == null)  {
            res.send(null);
            return null;
          }
          responseContent += "{\"name\": \"Wet Bulb Temperature\",\"series\": ";
          responseContent += JSON.stringify(result.rows);
          responseContent += " }";
          responseContent += " ]";
          res.send(responseContent);
          if (err) return console.error(err);
        }
      );

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