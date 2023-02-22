// imports 
require('dotenv').config();
const express = require("express");
const mysql = require("mysql");
const session = require("express-session");
const { resolveInclude } = require("ejs");


const app= express();
const PORT=process.env.PORT||5000;

// middleware
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(session({
    secret:"my secret key",
    saveUninitialized:true,
    resave:false,
}));

app.use((req,res,next)=>{
    res.locals.message=req.session.mession;
    delete req.session.message;
    next();
});
// set template engin
app.set("view engine", "ejs");
// rout prefix
app.use("",require("./routes"));

app.listen(PORT, ()=>{
    console.log(`Server started at http://localhost:${PORT}`);
});


// connection  mySQl with node.js
const con=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"root",
    database:"mydb"
});

con.connect(function(err){
    if(err) throw err;
    console.log("Connected!");
    
    });

    app.post('/save-data', (req, res) => {
        const data = req.body;
        console.log('Data received:', data)
    
        try {
            data.forEach(result => {
                const query = `INSERT INTO users (Name, Age, Email, City) VALUES ('${result.name.first} ${result.name.last}', '${result.dob.age}', '${result.email}','${JSON.stringify(result.location.city)}')`;
    
                con.query(query, (error, results, fields) => {
                    if (error) throw error;
                    console.log(results);
                });
            });
    
            res.send('Data saved to database');
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal server error');
        }
        
    });

 //    Delete all the data from the table   
  app.post('/delete', function(req, res) {
      
    const sql = "TRUNCATE TABLE users";
    con.query(sql, function (err, result) {
      if (err) {
        console.error('Error deleting data:', err);
        res.status(500).send('Error deleting data');
      } else {
        res.redirect('/');
        
      }
    });
    
});



app.get('/data', function(req, res) {
    // Retrieve data from the database

    const sql = "SELECT * FROM users";
    //  LIMIT ${itemPerPage} OFFSET ${offset}`;
    
    con.query(sql, function (err, results, fields) {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
        
        // Pass the data to the EJS template
        res.render('userdetails', { data: results });

      }
      
    });
  });

