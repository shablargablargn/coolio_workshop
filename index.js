const pg = require("pg")
const client = new pg.Client('postgres://localhost/demo')
const morgan = require("morgan")
const cors = require("cors")
const express = require("express")
const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

app.get(`/api/anime`, async(req, res, next)=>{
    try{
        const SQL = `
            SELECT *
            FROM anime
        `;
        const response = await client.query(SQL)
        res.send(response.rows)
    }catch(error){
        next(error)
    }
})

app.get('/api/anime/:id', async(req,res,next)=>{
    try{
        const SQL = `
            SELECT *
            FROM anime
            WHERE id = $1
        `;
        const response = await client.query(SQL,[req.params.id])
        if(response.rows.length === 0){
            throw new Error("ID does not exist")
        }

        res.send(response.rows[0])
    
    }
    catch (error){
        next(error)
    }
})

app.delete('/api/anime/:id', async(req,res,next)=>{
    try{
        const SQL = `
            DELETE
            FROM anime
            WHERE id=$1
        `;
        const response = await client.query(SQL,[req.params.id])
        res.send(response.rows)
    }
    catch (error){
        next(error)
    }
})

app.post('/api/anime', async(req, res, next)=>{
    const body = req.body
    console.log(body)
    try{
        const SQL =`
        INSERT INTO anime(name, genre, rating)
        VALUES($1, $2, $3)
        RETURNING *

        `;
        const response = await client.query(SQL, [req.body.name, req.body.genre, req.body.rating])
        res.send(response.rows)
    }catch(error){
        next(error)
    }
})

app.put('/api/anime/:id', async (req, res, next)=>{
    try{
        const SQL =`
        UPDATE anime
        SET name = $1, genre = $2, rating = $3
        WHERE id = $4
        RETURNING *

        `;
        const response = await client.query(SQL, [req.body.name, req.body.genre, req.body.rating, req.params.id])
        res.send(response.rows)
    }catch(error){
        next(error)
    }
})

app.use('*', (req, res, next)=>{
    res.status(404).send("InvalidRoute")
})
app.use((err, req, res, next)=>{
    console.log('error handler')
    res.status(500).send(err.message)
})

const start = async () =>{
    await client.connect()
    console.log("conected to db")
    const SQL = `
        DROP TABLE IF EXISTS anime;
        CREATE TABLE anime(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            genre VARCHAR(100),
            rating VARCHAR(100)
        );
        INSERT INTO anime (name, genre, rating) VALUES ('Fairy Tail', 'Action', '7/10');
        INSERT INTO anime (name, genre, rating) VALUES ('Jujutsu Kaisen', 'Action', '9/10');
        INSERT INTO anime (name, genre, rating) VALUES ('Haikyuu!!', 'Sports', '10/10');
       
    `
    await client.query(SQL)
    console.log("table seeded")
    const PORT = process.env.PORT || 3300
    app.listen(PORT, ()=>{
        console.log(`listening on ${PORT}`)
    })
}

start()