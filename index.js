import express from "express";
import bodyParser from "body-parser";
import pg from "pg";  // Import the entire module

const app = express();
const port = 3000;

const pool = new pg.Pool({  // Access Pool from the default import
  user: 'postgres',
  host: 'localhost',
  database: 'world',
  password: 'samet',
  port: 5432
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    const result = await pool.query('SELECT country_code FROM visited_countries');
    //CONNECTION POOLING DAHA IYI YONTEM NORMAL CONNECTIONA GORE
    let countries = [];
    result.rows.forEach(country => countries.push(country.country_code));
    console.log(countries);
    
    res.render('index.ejs', {
      countries,
      total: countries.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

app.post('/add', async (req, res) => {
  try {
    const country = req.body.country;
    const result = await pool.query(`SELECT country_code FROM countries WHERE country_name = '${country}'`)
    await pool.query(`INSERT INTO visited_countries (country_code) VALUES ('${result.rows[0].country_code}')`)
    res.redirect('/')
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  pool.end(() => {
    console.log('Pool has ended');
  });
});
