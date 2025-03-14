const express = require("express");
const sql = require("mssql");

const app = express();
app.use(express.json());

const config = {
	user: 'henrik',
	password: '1234',
	server: 'localhost\\SQLEXPRESS',
	database: 'expressnode',
	options: {
		trustServerCertificate: true,
		connectionTimeout: 30000
	}
};

// Koble til databasen
sql.connect(config, (error) => {
	if (error) console.error(error);
	else console.log("Connected to the database.");
});

//The bellow endpoint simply returns all user data from the Database, logs the results in the console and sends the results to the client.
app.get("/api/getAllUsers", async (req, res) => {
	try{
		const result = await sql.query`SELECT * FROM users`;
		console.log(result)
		res.send(result);
	} catch (error){
		 res.send(error.message);
	}
});
//The bellow endpoint accepts the parmater "id" from the url and returns the user with the id spessified in the request.
 app.get("/api/getUserById/:id", async (req, res) => {
 	const {id} = req.params;
 	try{
 		const result = await sql.query`SELECT * FROM users WHERE ID = ${id}`;
 		res.status(200).send(result);
 	}
 	catch (error) {
 		res.status(400).send(error.message);
 	}
 });
//The bellow endpoint accepts the paramaters minAge and maxAge from the url and returns all users that are within the age range between those two provided numbers
 app.get("/api/getUserEmailByAge/:minAge/:maxAge", async (req, res) =>{
	const {minAge, maxAge} = req.params;

	try{
		const users = await sql.query`SELECT EMAIL FROM users WHERE AGE >= ${minAge} AND AGE <= ${maxAge}`;
		res.send(users);
	} catch (error){
		console.error("Database error:", error);
		res.status(400).send("Internal Server Error: ", error.message);
	}
});
//The bellow endpoint doesn't take any paramaters and simply returns all users from the database who has the letter "A" in their name
app.get("/api/getUsersWithLetterAInName", async (req, res) =>{
	try{
		const result = await sql.query`SELECT * FROM users WHERE NAME LIKE '%a%'`;
		console.log(result)
		res.send(result)
	} catch(error){
		res.send(error.message);
	}
})
//The bellow endpoint takes the parameters "EMAIL, NAME, AGE" from the request body and uses them to create a new user in the database
 app.post("/api/createUser", async (req, res) => {
 	const {EMAIL, NAME, AGE } = req.body;
 	try {
 		await sql.query`INSERT INTO users (EMAIL, NAME, AGE) VALUES (${EMAIL}, ${NAME}, ${AGE})`;
 		res.status(201).send("User created");
 	} catch (error) {
 		res.status(500).send(error.message);
 	}
 });
//The bellow endpoint accepts the parameters "ID" from the url and "EMAIL, NAME, AGE" from the request body, to update-
//-the information of an existing user at the spessified ID, but only if said user actualy exists
 app.put("/api/UpdateUserAtId/:id", async (req, res) => {
	const { id } = req.params;
	const { EMAIL, NAME, AGE } = req.body;
	try {
		const result = await sql.query`UPDATE users SET EMAIL = ${EMAIL}, NAME = ${NAME}, AGE = ${AGE} WHERE ID = ${id}`;
		if (result.rowsAffected[0] > 0) {
			res.send("User updated");
		} else {
			res.status(404).send("User not found");
		}
	} catch (err) {
		res.status(500).send(err.message);
	}
});
//The bellow endpoint accepts the parameter "ID" from the url in order to delete a user at the spessified ID
 app.delete("/api/deleteUser/:id", async (req, res) => {
 	const { id } = req.params;
 	try {
 		const result = await sql.query`DELETE FROM users WHERE ID = ${id}`;
 		if (result.rowsAffected[0] > 0) {
 			res.send("User deleted");
 		} else {
 			res.status(404).send("User not found");
 		}
 	} catch (error) {
 		res.status(500).send(error.message);
 	}
 });

const port = 3000;
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
