const http = require('http')
const url = require('url')
const fs = require('fs')

let students = []

// Try loading Students from JSON file
try{
    students = require('./student.json')
} catch(err){
    students = []
}

// Save student data to file
function saveData(data){
    fs.writeFile('student.json', JSON.stringify(data, null, 2), (err) => {
        if(err) throw err
    })
}

const server = http.createServer( (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const query = parsedUrl.query;

    if(req.method === "POST"){
        const new_student = query;
        students.push(new_student)
        saveData(students);
        res.setHeader("Content-Type", "text/html");
        res.write("<h1>Student Data Added Successfully</h1>")
        return res.end()
    }

    if(req.method === "GET" && req.url === "/"){
        res.setHeader("Content-Type", "text/html");
        res.write("<h1>Welcome to REST API Application</h1>")
        return res.end()
    }

    if(req.method === "GET" && req.url === "/list"){
        fs.readFile("student.json", (err, data) => {
            if(err){
                res.writeHead(500, {'Content-Type': "text/plain"})
                return res.end("Error in reading file")
            }
            res.writeHead(200, {"Content-Type": "application/json"})
            res.write(data)
            return res.end()
        })
        return;
    }

    if(req.method === "PUT" && parsedUrl.pathname === "/student"){
        if(!query.rollno || !query.name){
            res.statusCode = 400
            return res.end("<h1>Missing roll number or name</h1>")
        }
        const found = students.find(s=>s.rollno === query.rollno)
        if(found){
            found.name = query.name
            saveData(students)
            res.end("<h1>Student data updated successfully</h1>")
        }else{
            res.statusCode = 404;
            res.end("<h1>Student data not found</h1>")
        }
        return;
    }

    if(req.method === "DELETE" && parsedUrl.pathname === "/student"){
        if(!query.rollno){
            res.statusCode = 400
            return res.end("<h1>Missing roll number</h1>")
        }
        const idx = students.findIndex(s=>s.rollno === query.rollno)
        if(idx !== -1){
            students.splice(idx, 1)
            saveData(students)
            res.end("<h1>Student data deleted successfully</h1>")
        }else{
            res.statusCode = 404;
            res.end("<h1>Student data not found</h1>")
        }
        return;
    }

    // Default 404 response
    res.writeHead(404, {"Content-Type": "text/plain"})
    res.end("Route not found")
})

const port = 8083
server.listen(port, () => {
    console.log('Server is running on port ', port)
})