const mysql = require('mysql2');
const encryption = require('bcrypt');
const jwt = require('jsonwebtoken')

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DATABASE_PORT
});

exports.addAccount = (req,res) => {

    const {first_name, last_name, email, password, confirm_password} = req.body

    db.query("SELECT email FROM user WHERE email = ?",email,
    async function (err,result){
        if(err){
            console.log("Error:" + err);
        }else{
            if(result.length > 0){
             return res.render("register",{message:"Email is already existing"})
            }else{
                if(confirm_password !== password){
                    return res.render("register",{message:"Passwords do no match"})
                }else{
                    let hashPassword = await encryption.hash(password,8);
                    console.log(hashPassword)
                    db.query("INSERT INTO user set ?", {first_name: first_name, last_name: last_name, email: email, password: hashPassword},
                        function(err, result){
                            if(err){
                                console.log("Error:" + err);
                            }else{
                                console.log(result);
                                return res.render("register", {message:"User has been registered successfully"})

                            }
                        })
                }
                
            }
        }
    }
    )
}

exports.loginAccount = async(req,res) => {
    try{
        const {email, password} = req.body
        if(!email || !password){
            return res.render("index", {message:"Email and Password cannot be blank"})
        }else{
            db.query("SELECT * FROM user WHERE email = ?", email,
                async function(err, result){
                    if(!result){
                        return res.render("index", {message:"Email is incorrect"})
                    }else if (!(await encryption.compare(password, result[0].password))){
                        return res.render("index", {message:"Password is incorrect"})
                    }else{
                        const id = result[0].user_id;
                        const token = jwt.sign(id, process.env.JWT_SECRET);
                        const cookieOption = {expires: new Date(Date.now() + process.env.JWT_EXPIRES) *24*60*1000, httpOnly:true}
                        res.cookie('cookie_access_token', token, cookieOption)
                        console.log(token)
                        // return res.render("index", {message:"Logged in succesfully"})
                        db.query(`SELECT s.student_id, s.first_name, s.last_name, s.email, c.course_name, c.course_description FROM student s INNER JOIN course c ON c.course_id = s.course_id`,function (err, result){
                            if(!result){
                                return res.render("students", {message:"No results found"})
                            }else{
                                res.render("students",{title:"List of Students",data:result})
                            }
                        })
                    }            
                }
            )
        }
    }
    catch(err){
        console.log(err)
     }
   
}

exports.updateform = (req,res) =>{
    const email = req.params.email;
    db.query(`SELECT * FROM student WHERE email = "${email}"`,(err,result)=>{
        res.render('updateStudent',{title:`Update student account`,user:result[0]})
    });
}

exports.updateStudent = (req,res) =>{
    const {first_name, last_name, email, course_id} = req.body;
    db.query(`UPDATE student SET first_name = '${first_name}', last_name = '${last_name}', course_id = '${course_id}' WHERE email = '${email}'`,(err)=>{
        if(err) throw err 
        else
        db.query("SELECT s.student_id, s.first_name, s.last_name, s.email, c.course_name, c.course_description FROM student s INNER JOIN course c ON c.course_id = s.course_id",(err,result)=>{
            res.render("students",{title:"List of students",data:result})
        })
    })
}

exports.deleteStudent = (req,res) =>{
    const email = req.params.email;
    db.query(`DELETE FROM student WHERE email = '${email}'`,(err)=>{
        if(err) throw err
        else
        db.query("SELECT s.student_id, s.first_name, s.last_name, s.email, c.course_name, c.course_description FROM student s INNER JOIN course c ON c.course_id = s.course_id",(err,result)=>{
            res.render("students",{title:"List of Students",data:result})
        })
    })
}

exports.addStudent = (req,res) => {

    const {first_name, last_name, email, course_id} = req.body

    db.query("SELECT email FROM student WHERE email = ?",email,
    async function (err,result){
        if(err){
            console.log("Error:" + err);
        }else{
            if(result.length > 0){
             return res.render("addStudent",{message:"Email is already existing"})
            }else{
                    db.query("INSERT INTO student set ?", {first_name: first_name, last_name: last_name, email: email, course_id: course_id},
                        function(err){
                            if(err){
                                console.log("Error:" + err);
                            }else{
                                db.query("SELECT s.student_id, s.first_name, s.last_name, s.email, c.course_name, c.course_description FROM student s INNER JOIN course c ON c.course_id = s.course_id",(err,result)=>{
                                    res.render("students",{title:"List of Students",data:result})
                                })
                            }
                        })  
            }
        }
    }
    )
}

exports.logoutAccount = (req,res) =>{
    res.clearCookie("cookie_access_token")
    res.render("index")

}