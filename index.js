const sqlite3 = require('sqlite3');
const express = require("express");
var app = express();

const db = new sqlite3.Database('./animal.db', (err) => {
    if (err) {
        console.error("Erro opening database " + err.message);
    } else {
        db.run('CREATE TABLE animal( \
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,\
            name NVARCHAR(20)  NOT NULL,\
            animal NVARCHAR(20)  NOT NULL,\
            description NVARCHAR(20),\
            location NVARCHAR(100)\
        )', (err) => {
            if (err) {
                console.log("Table already exists.");
            }
        });
    }
});


const badyParser = require("body-parser");
app.use(badyParser.urlencoded({ extended: false }));
app.use(badyParser.json());  // this is help as when we send json body requset in ajax 

app.set('view engine', 'ejs'); // هاي خاصة لتشغل او لقراءة مكتبة ejs 
app.use(express.static(__dirname + '/public')); // لقراء الملفات مثل ال css والصور وغيرها داخل ملف public



app.get('/', function(req, res) {
    res.render('index');
});

app.get("/activity", async(req, res) => {
    res.render('activity');
})


app.get('/reports', function(req, res) {
    res.render('missingPets');
});


app.get("/report/:id", (req, res, next) => {
    db.get(`SELECT * FROM animal where id = ?`, [req.params.id], (err, row) => { // params gets the id from routes(URL)
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.render('aboutPet', { data : row }); // to render aboutpet object and return the object by ID.
    });
});

app.get("/api/reports/:name", (req, res, next) => {

    db.get(`SELECT * FROM animal where name = ?`, [req.params.name], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(200).json({ row }); // return json for api
    });
});

app.post("/api/report", (req, res, next) => {
    var reqBody = req.body;
    console.log(req);
 
    db.run(`INSERT INTO animal (name, animal, description, location) VALUES (?,?,?,?)`, [reqBody.name, reqBody.animal, reqBody.description, reqBody.location],
        function(err, result) {
            if (err) {
                res.status(400).json({ "error": err.message })
                return;
            }
            res.status(200).json({
                data: this.row
            })
        });
});

app.get("/reports", (req, res, next) => {
    db.all("SELECT * FROM animal", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.render('missingPets', { data: rows });
        //  res.status(200).json({ rows });
    });
});


app.get("/api/report/:id", (req, res, next) => {

    db.get(`SELECT * FROM animal where id = ?`, [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(200).json({ data : row }); // return only json format
    });
});

app.get("/api/reports/", (req, res, next) => {
    db.all("SELECT * FROM animal", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(200).json({ rows });
    });
});


app.put("/api/report/:id", (req, res, next) => {           // edit pet by ID (ID will be get by routes and data will be fetch by request body) 
    var reqBody = req.body;
    var paramsId = [req.params.id]
    db.run(`UPDATE animal set name = ?, animal = ?, description = ?, location = ? WHERE id = ?`, [reqBody.name, reqBody.animal, reqBody.description, reqBody.location, paramsId],
        function(err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.status(200).json({ data : reqBody });
        });
});


app.delete("/api/report/:id", (req, res, next) => {
    var paramsId = [req.params.id];
    db.run(`DELETE FROM animal WHERE id = ?`,
       paramsId,
        function(err, result) {
            if (err) {
                res.status(400).json({ "error": res.message , 
             })
                return;
            }
            res.status(200).json({ data: this.row  , message : "Done !"})
        });
});




app.listen(5000, () => console.log("Work on 5000 !"))

