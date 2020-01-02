const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const moment = require('moment');

const app = express();

//GESTION DES RESOURCES
app.use('/css' , express.static(__dirname + '/assets/css'));
app.use('/img' , express.static(__dirname + '/assets/img'));
app.use('/scripts' , express.static(__dirname + '/assets/scripts'));

//CONNEXION A MONGOOSE
mongoose.connect('mongodb://mongo:27017/memory', {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("On est connecté !")
});

//SCHEMA ET MODEL MONGO DB
require('./models/users');
require('./models/scores');
const Users = mongoose.model('users');
const Scores = mongoose.model('scores');


const port = 3000;

//MIDDLEWARE POUR HANDLEBARS - POUR CONSTRUIRE LES TEMPLATES (Minimal templating on steroid)
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


//MIDDLEWARE POUR BODY PARSER
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// EXAMPLE POUR UNE UTILISATION DE BASE DE MIDDLEWARE
// app.use((req,res,next)=>{
//     req.saluto="Je suis un app !";
//     next();
// });
// app.get('/',(req,res)=>{
//     res.send(req.saluto)
// });



//ROUTE POUR LA PAGE INDEX
app.get('/' , (req , res) =>{
    const scoreTitle ="";
    Users.find({})
    .sort({best_time_millisecond: 'asc'})
    .limit(10)
    .then(score => {
        const scoreTitle = "Top Score";
        let formatScore = score;
        formatScore = formatScore.map((s) => {
            let placeholder = {...s.toObject()}
            placeholder["formatData"] = moment(s.data).format('DD.MM.YYYY');
            return placeholder;
        });
        res.render('home' , {
            scoreTitle: scoreTitle,
            score: formatScore
        })
    });
});


/*
1. ENREGISTRER LA SESSION DANS LA COLLECTION SCORES
2. VERIFIER COMBIEN DE SESSIONS DE JEU SONT ENREGISTRER POUR LE JOUER
3. SI IL EN A PLUS DE 3, ON LAISSE LE MEILLEUR SCORE ET ON DELATE
4. VERIFIER SU LE JOUER A DEJA JOUER DANS LA COLLECTION USERS
5. SI OUI, VERIFIER SI SON SCORE ACTUELLE EST MEILLEUR DE CELUI DEJA ENRIGISTRE
5.1 SI OUI, ON UPDATE
5.2 SI NON, ON UPDATE SEULEMENT LE NON QUE LE JOUER AURAIT PU CHANGER
*/
app.post('/api/form-submit',function(req,res){
    // CREATE - LE SCORE
    const nuovoScore = {
        email: req.body.email,
        time_millisecond: req.body.time_millisecond,
        time_display: req.body.time_display
    }
    new Scores(nuovoScore)
    .save()
    .then(score =>{
        console.log("Score ok");
        // SI LE JOUEUR EXISTE PAR RAPPORT A L'EMAIL
        Users.findOne({email: req.body.email})
        .then(user =>{
            if(user){
                // S'IL EXISTE, ON MET A JOUR SOIT QUE LE NOM, SOIT LE SCORE AUSSI SI LE TEMPS EST INFERIEURE
                now = new Date();
                if(user.best_time_millisecond <= req.body.time_millisecond){
                    user.nome = req.body.name;
                    user.data = now;
                    console.log("User update name");
                } else {
                    user.nome = req.body.name;
                    user.data = now;
                    user.best_time_millisecond = req.body.time_millisecond;
                    user.best_time_display = req.body.time_display;
                    console.log("User update score");
                }
                user.save()
                .then(user =>{
                    console.log("User update");
                    res.json({success : "Updated Successfully", status : 200});
                });
            }else{
                // LE JOUEUR N'EXISTE PAS ET ON L'INSERE
                const newUser = {
                    nome: req.body.name,
                    email: req.body.email,
                    best_time_millisecond: req.body.time_millisecond,
                    best_time_display: req.body.time_display
                }
                new Users(newUser)
                .save()
                .then(user =>{
                    console.log("New User");
                    res.json({success : "Updated Successfully", status : 200});
                 });
            }
        })
    })
})


// METTRE A JOUR LE SCORE APRES AVOIR ENREGISTRER UNE SESSION DE JEU
app.get('/api/score' , (req , res) =>{
    Users.find({})
    .sort({best_time_millisecond: 'asc'})
    .limit(10)
    .then(score => {
        let formatScore = score;
        formatScore = formatScore.map((s) => {
            let placeholder = {...s.toObject()}
            placeholder["formatData"] = moment(s.data).format('DD.MM.YYYY');
            
            console.log(placeholder)
            return placeholder;
        });
        res.json(formatScore)
    });
});


app.listen(port,()=>{
    console.log(`server activé sur la porte : ${port}`);
});