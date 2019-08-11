
//---------------------------------------------signup page call------------------------------------------------------
exports.signup = function (req, res) {
   message = '';
   if (req.method == "POST") {
      var post = req.body;
      var first_name = post.first_name;
      var last_name = post.last_name;
      var student_id = post.student_id;
      var st_sem = post.st_sem;
      var st_year = post.st_year;
      var support_type = post.support_type;
      var supervisor = post.supervisor;

      var sql = `INSERT INTO doctoraldb.phdstudent(StudentId,FName,LName,StSem, StYear, Supervisor) VALUES ('${student_id}','${first_name}', '${last_name}', '${st_sem}', ${parseInt(st_year)}, '${supervisor}');`;

      var query = db.query(sql, function (err, result) {

         message = "Succesfully! Your account has been created.";
         res.render('signup.ejs', { message: message });
      });

   } else {
      res.render('signup');
   }
};

function checkStudentType(id) {
   return new Promise((resolve, reject) => {
      var grasql = `SELECT * FROM gra where StudentId = "${id}";`;
      db.query(grasql, (err, result) => {
         if (result.length > 0) {
            resolve('GRA');
         } else {
            var gtasql = `SELECT * FROM gta where StudentId = "${id}";`;
            db.query(gtasql, (err, result) => {
               if (result.length > 0) {
                  resolve('GTA');
               } else {
                  var sssql = `SELECT * FROM selfsupport where StudentId = "${id}";`;
                  db.query(sssql, (err, result) => {
                     if (result.length > 0) {
                        resolve('Selfsupport');
                     } else {
                        resolve('Scholarship');
                     }
                  });
               }
            });
         }
      });
   })
};
//-----------------------------------------------login page call------------------------------------------------------
exports.login = function (req, res) {
   var message = [];
   var sess = req.session;

   if (req.method == "POST") {
      var post = req.body;
      var Fname = post.FName;
      var Lname = post.LName;
      response = {};
      var StudentQuery = `SELECT * FROM doctoraldb.phdstudent where Fname = "${Fname}" and LName = "${Lname}"`;
      db.query(StudentQuery, function (err, student) {
         if (student.length) {
            response['Fname'] = post.FName;
            response['Lname'] = post.LName;
            response['id'] = student[0].StudentId;
            var supervisorId = student[0].Supervisor;
            InstructorQuery = `SELECT * FROM doctoraldb.instructor where InstructorId = "${supervisorId}";`;
            db.query(InstructorQuery, function (err, instructor) {
               if (instructor.length > 0) {
                  response['IFname'] = instructor[0].FName;
                  response['ILname'] = instructor[0].LName;
                  checkStudentType(response.id).then((type) => {
                     response['Type'] = type;
                     MilestonesPassedQuery = `SELECT * FROM doctoraldb.milestonespassed where StudentId = "${response.id}";`;
                     db.query(MilestonesPassedQuery, function (err, MilestonePssd) {
                        if (MilestonePssd.length > 0) {
                           response['PassDate'] = MilestonePssd[0].PassDate;
                           Milestones = `SELECT * FROM doctoraldb.milestone where MId = "${MilestonePssd[0].MId}";`;
                           db.query(Milestones, function (err, MIdRes) {
                              if (MIdRes.length > 0) {
                                 response['MName'] = MIdRes[0].MName;
                                 console.log(response);
                                 res.render('index.ejs', { message: [response] });
                              }
                           });
                        }
                     });
                  });
               }
            });

         }
         else {
            message = [];
            res.render('index.ejs', { message: message });
         }

      });
   } else {
      res.render('index.ejs', { message: message });
   }

};
//-----------------------------------------------dashboard page functionality----------------------------------------------

exports.dashboard = function (req, res, next) {

   var user = req.session.user,
      userId = req.session.userId;
   console.log('ddd=' + userId);
   if (userId == null) {
      res.redirect("/login");
      return;
   }

   var sql = "SELECT * FROM `users` WHERE `id`='" + userId + "'";

   db.query(sql, function (err, results) {
      res.render('dashboard.ejs', { user: user });
   });
};
//------------------------------------logout functionality----------------------------------------------
exports.logout = function (req, res) {
   req.session.destroy(function (err) {
      res.redirect("/login");
   })
};
//--------------------------------render user details after login--------------------------------
exports.profile = function (req, res) {

   var userId = req.session.userId;
   if (userId == null) {
      res.redirect("/login");
      return;
   }

   var sql = "SELECT * FROM `users` WHERE `id`='" + userId + "'";
   db.query(sql, function (err, result) {
      res.render('profile.ejs', { data: result });
   });
};


//---------------------------------edit users details after login----------------------------------
exports.editprofile = function (req, res) {
   var userId = req.session.userId;
   if (userId == null) {
      res.redirect("/login");
      return;
   }

   var sql = "SELECT * FROM `users` WHERE `id`='" + userId + "'";
   db.query(sql, function (err, results) {
      res.render('edit_profile.ejs', { data: results });
   });
};
