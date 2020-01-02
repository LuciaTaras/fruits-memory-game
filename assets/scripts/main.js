// On utilise console.log pour s'assurer que les scripts fonctionnent ...
// On commence par definir les variables dont on va avoir besoin

var cardContent = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];
// Un array pour les cartes : on double pour créer les couples
var matchCouple = 14;
var matchCount = 0;
// Les couples qu'il faut trouver et le compteur
var cardClicks = 0;
// Il faut compter 2 clicks pour valider ou pas si le couple est ok
var firstSelection;
// On stocke la première carte 
var secondSelection;
// ... et la deuxième 
var previousCard;
// Pour la comparaison : c'est bien le meme fruit ou non?
var intervalTimer;
var gameStartTime;
// On enregistre le temp qu'il faut pour terminer le jeu
var timer = null;
// Pour stopper le compteur quand on gagne

// Fonction pour commencer le jeu, qui appelle l'initialisation
function closePopin() {
    $('.popin-container').fadeOut();
    inizialise();
}

// Fonctions pour afficher le div des cartes ou des scores ( au click des 2 buttons, qui affecte une classe pour identifier le div activé )
function openGame() {
    $('.game-container').show();
    $('.highscore-container').hide();
    $('#but-game').addClass("tab-active");
    $('#but-highscore').removeClass("tab-active");
}
function openHighscore() {
    $('.game-container').hide();
    $('.highscore-container').show();
    $('#but-game').removeClass("tab-active");
    $('#but-highscore').addClass("tab-active");
}

// Fonction pour la répartition aléatoire des cartes
function shuffle(arra1) {
    var ctr = arra1.length, temp, index;
    // Les éléments du array dans la variable ctr
    while (ctr > 0) {
        // On choisi un indice aléatoire
        index = Math.floor(Math.random() * ctr);
        // On diminue ctr de 1
        ctr--;
        // et on échange le dernier élément
        temp = arra1[ctr];
        arra1[ctr] = arra1[index];
        arra1[index] = temp;
    }
    return arra1;
}

/* On commence. Fonction qui : 
1. melange les cartes (appelle la fonction shuffle pour leur répartition aléatoire de l'array cardContent)
2. distribue les cartes et le positionne dans le div (class .card-container). 
ATTENTION : ici on positionne aussi le sprite en background.
Mais, comment gérer un positionnement responsive ? Il faut utiliser le % ! L'astuce est de diviser 100 par le nombre d'image (il y en a 18) - 1.
3. demarre le timer 
4. demarre le compteur de temps et la barre de progression
Avec setTimeout, on retarde de 1 sec ... le temps de commencer.
*/
function inizialise() {
    cardContent = shuffle(cardContent);
    for (var i = 0; i < 28; i++) {
        var card = "<div class='flip-card'><div class='flip-card-inner' id='card" + i + "' onclick='selectCard(" + i + "," + cardContent[i] + ")'><div class='flip-card-front'></div><div class='flip-card-back' style='background-position: 0 " + 5.88 * cardContent[i] + "%'></div></div></div>";
        $(".card-container").append(card);
    }
    progress(180, 180, $('#progressBar')); 
    // 3 minutes... ca ira ?
    setTimeout(function () {
        startTimer();
    }, 1000)
}

/* Ici on gére le chronomètre : définit l'heure de départ, le temps qui s'écoule et on convertit le tout pour l'écrire dans le champ de texte (displayText) */
function startTimer() {
    gameStartTime = new Date().getTime();
    intervalTimer = setInterval(incrementTime, 100);
}
function incrementTime() {
    var currentTime = getCounterTime;
    $(".timer").text(currentTime);
}
function getCounterTime() {
    var newTime = new Date().getTime();
    var difference = newTime - gameStartTime;
    var seconds = Math.floor((difference % (1000 * 60) / 1000));
    var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    var milli = difference % 1000;
    milli = ('0' + milli).slice(-3);
    seconds = ('0' + seconds).slice(-2);
    minutes = ('0' + minutes).slice(-2);
    var displayText =  minutes + ":" + seconds + ":" + milli;
    return displayText;
}

/* Fontion compteur de temps, avec une barre de progression */
function progress(timeleft, timetotal, $element) {
    var progressBarWidth = timeleft * $element.width() / timetotal;
    $element.find('div').animate({ width: progressBarWidth }, timeleft == timetotal ? 0 : 1000, "linear").html(Math.floor(timeleft / 60) + ":" + timeleft % 60);
    if (timeleft != 0) {
        timer = setTimeout(function () {
            progress(timeleft - 1, timetotal, $element);
        }, 1000);
    } else {
        // tu as perdu !
        clearInterval(intervalTimer);
        $('#score_form').hide();
        $('#the-end').text('Quel dommage ! Tu as perdu ...');
        $('#result').text("");
        $('#temps').text("");
        modal.style.display = "block"; 
    }
};

/* Fonction pour la logique du jeu */
function selectCard(id, current) {
    console.log(id, current);
    var cardID = "#card" + id;
    if (!$(cardID).hasClass('rotate180') && cardClicks != 2) {
        $(cardID).addClass('rotate180');
        cardClicks++;
        if (cardClicks == 1) {
            firstSelection = current;
            previousCard = cardID;
            // Il faut qu'on garde en previousCard l'id pour pouvoir retourner la carte si on ne trouve pas le couple
        }
        if (cardClicks == 2) {
            secondSelection = current;
            // ici on a les 2 cartes ... soit elles sont ègales : 
            if (firstSelection == secondSelection) {
                console.log("Match!!!")
                matchCount++;
                if (matchCount == matchCouple) {
                    // toutes les couples ont étés trouvées : tu as gagné !
                    clearInterval(intervalTimer);
                    clearTimeout(timer);
                    // stop timer et compteur
                    var currentTime = getCounterTime;
                    // on affiche le temps passé
                    $(".timer").text(currentTime);
                    // on va calculer le temps passé en millisecond pour enregistrer le score
                    var newTime = new Date().getTime();
                    var timeDifferenceMilli = newTime - gameStartTime;
                    // on passe les 2 variables dans les 2 champs input hidden du form
                    $("#time_display").val(currentTime);
                    $("#time_millisecond").val(timeDifferenceMilli);
                    //pour pouvoir recomencer... on reser le comteur des couples de cartes:
                    matchCount = 0;
                    // ... et on va afficher le Modal
                    setTimeout(function () { 
                        $('#score_form').show();
                        $('#the-end').text('Bravo ! Tu as gagnééééééé !');
                        $('#result').text('Tu as terminé le jeu en');
                        modal.style.display = "block"; 
                    }, 1000);
                }
                setTimeout(function () {
                    cardClicks = 0;
                }, 500)
            // ... soit elles ne le sont pas : 
            } else {
                setTimeout(function () {
                    $(cardID).removeClass('rotate180');
                    $(previousCard).removeClass('rotate180');
                    cardClicks = 0;
                }, 500)
            }
        }
    }
}

// Pour finir, le modal
var modal = document.getElementById("myModal");
var modal_score = document.getElementById("scoreModal");

// Le <span> qui ferme le modal et ... on recommance
var span = document.getElementsByClassName("close")[0];
span.onclick = function() {
    reStart()
}

// Si on clique n'importe où en dehors du modal, on peut le fermer, mais ici nous n'en avons pas besoin 
//window.onclick = function(event) {
//    if (event.target == modal) {
//      reStart()
//   }
//}

// Fonction pour rejouer
function closeModal() {
    $('.modal').fadeOut();
    $(".card-container").empty();
    $(".timer").text("00:00:000");
    inizialise();
}

// Fonction de retour à la première capture d'écran
function reStart() {
    $('.modal').fadeOut();
    $(".card-container").empty();
    $(".timer").text("00:00:000");
    $('.popin-container').fadeIn();
}

// Fonction pour mettre à jour le Top Scores après en avir enregistrer un
function reSet() {
    fetch("/api/score/")   
    .then(response => response.json())
        .then(data => {
        console.log(data);
        $("#list").empty();
        data.forEach(element => {
            var itemScore = "<p class='score'><strong>"+element.nome+"</strong> le "+ element.formatData +" : <span class='red'>"+element.best_time_display+"</span></p>";
            $("#list").append(itemScore);
        });
     })
}

// Form 
$(".score-button").click(function(e) {
      e.preventDefault();
      $('.error').hide();    
      // validation du form    
      var time_display = $("input#time_display").val();
      var time_millisecond = $("input#time_millisecond").val();
  	  var name = $("input#name").val();
  		if (name == "") {
        $("label#name_error").show();
        $("input#name").focus();
        return false;
      }
        var email = $("input#email").val();
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  		if (!reg.test(email)) {
        $("label#email_error").show();
        $("input#email").focus();
        return false;
      }
    //Fetch est un API integré dans les navigateurs qui permet de effectuer des requetes http
    fetch("/api/form-submit/",
    {
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
            name: name, 
            email: email,
            time_display: time_display, 
            time_millisecond: time_millisecond
        })
    })
    .then(function(res){ 
        reSet();
        reStart() 
    })
    .catch(function(res){ console.log(res) })
  });
  