$(document).ready(function () {
  // Générer automatiquement toutes les combinaisons largeur x hauteur par palier de 2 cm
  for (let largeur = 30; largeur <= 150; largeur += 2) {
    for (let hauteur = 30; hauteur <= 300; hauteur += 2) {
      $('#dimensionsMur').append(
        $('<option>', {
          value: `${largeur}x${hauteur}`,
          text: `${largeur} x ${hauteur} cm`
        })
      );
    }
  }

  // Activer Select2
  $('#dimensionsMur').select2({
    placeholder: "Choisir les dimensions du mur",
    width: '100%'
  });

  // Bouton switch largeur/hauteur du carreau
  $('#switchBtn').on('click', function () {
    let largeurCarreau = $('#longueurCarreau').val();
    let hauteurCarreau = $('#hauteurCarreau').val();
    $('#longueurCarreau').val(hauteurCarreau);
    $('#hauteurCarreau').val(largeurCarreau);
  });

  // Simulation
  $('#formCarrelage').on('submit', function (e) {
    e.preventDefault();

    let dimensions = $('#dimensionsMur').val();
    if (!dimensions) return;

    let [largeurMur, hauteurMur] = dimensions.split("x").map(Number);
    let largeurCarreau = parseFloat($('#longueurCarreau').val());
    let hauteurCarreau = parseFloat($('#hauteurCarreau').val());

    // Calcul sans découpe
    let nbLargeur = Math.floor(largeurMur / largeurCarreau);
    let nbHauteur = Math.floor(hauteurMur / hauteurCarreau);
    let nbTotal = nbLargeur * nbHauteur;

    // Surfaces
    let surfaceMur = largeurMur * hauteurMur;
    let surfaceCouverte = (nbLargeur * largeurCarreau) * (nbHauteur * hauteurCarreau);
    let perte = surfaceMur - surfaceCouverte;
    let pourcentagePerte = ((perte / surfaceMur) * 100).toFixed(2);

    // Affichage résultats
    $('#resultat').html(`
      <div class="card border-info">
        <div class="card-body">
          <h5 class="card-title">Résultats :</h5>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">Carreaux en largeur : <strong>${nbLargeur}</strong></li>
            <li class="list-group-item">Carreaux en hauteur : <strong>${nbHauteur}</strong></li>
            <li class="list-group-item">Nombre total de carreaux : <strong>${nbTotal}</strong></li>
            <li class="list-group-item">Surface du mur : <strong>${surfaceMur} cm²</strong></li>
            <li class="list-group-item">Surface couverte : <strong>${surfaceCouverte} cm²</strong></li>
            <li class="list-group-item">Surface perdue : <strong>${perte} cm²</strong></li>
            <li class="list-group-item">Pourcentage de perte : <strong>${pourcentagePerte} %</strong></li>
          </ul>
        </div>
      </div>
    `);

    // Dessin sur Canvas responsive
    let canvas = $('#canvasMur')[0];
    let ctx = canvas.getContext("2d");

    canvas.width = $('.container').width() - 40;
    canvas.height = 400;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mise à l'échelle
    let scaleX = canvas.width / largeurMur;
    let scaleY = canvas.height / hauteurMur;

    // Dessiner le mur
    ctx.strokeStyle = "#000";
    ctx.strokeRect(0, 0, largeurMur * scaleX, hauteurMur * scaleY);

    // Dessiner les carreaux (vert)
    ctx.fillStyle = "#4CAF50";
    for (let i = 0; i < nbLargeur; i++) {
      for (let j = 0; j < nbHauteur; j++) {
        ctx.fillRect(
          i * largeurCarreau * scaleX,
          j * hauteurCarreau * scaleY,
          largeurCarreau * scaleX,
          hauteurCarreau * scaleY
        );
        ctx.strokeRect(
          i * largeurCarreau * scaleX,
          j * hauteurCarreau * scaleY,
          largeurCarreau * scaleX,
          hauteurCarreau * scaleY
        );
      }
    }

    // Colorier la surface perdue en rouge
    ctx.fillStyle = "rgba(255,0,0,0.5)";
    ctx.fillRect(
      nbLargeur * largeurCarreau * scaleX,
      0,
      (largeurMur - nbLargeur * largeurCarreau) * scaleX,
      hauteurMur * scaleY
    );
    ctx.fillRect(
      0,
      nbHauteur * hauteurCarreau * scaleY,
      largeurMur * scaleX,
      (hauteurMur - nbHauteur * hauteurCarreau) * scaleY
    );

    // Sauvegarde simulation dans Local Storage
    let imageData = canvas.toDataURL("image/png");
    let simulation = {
      dimensions: dimensions,
      carreau: `${largeurCarreau}x${hauteurCarreau}`,
      nbLargeur,
      nbHauteur,
      nbTotal,
      surfaceMur,
      surfaceCouverte,
      perte,
      pourcentagePerte,
      image: imageData,
      date: new Date().toLocaleString()
    };

    let simulations = JSON.parse(localStorage.getItem("simulations")) || [];
    simulations.push(simulation);
    localStorage.setItem("simulations", JSON.stringify(simulations));
  });

  // Bouton Enregistrer & Nouvelle simulation
  $('#saveBtn').on('click', function () {
    // Réinitialiser le formulaire et les résultats
    $('#formCarrelage')[0].reset();
    $('#dimensionsMur').val('').trigger('change');
    $('#resultat').empty();
    let canvas = $('#canvasMur')[0];
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // Bouton pour afficher l’historique des simulations
  $('#historyBtn').on('click', function () {
    let simulations = JSON.parse(localStorage.getItem("simulations")) || [];
    if (simulations.length === 0) {
      alert("Aucune simulation enregistrée.");
      return;
    }

    let html = '<h5>Historique des simulations</h5>';
    simulations.forEach((sim, index) => {
      html += `
        <div class="card mb-2">
          <div class="card-body">
            <strong>Simulation ${index + 1} (${sim.date})</strong><br>
            Mur : ${sim.dimensions} cm<br>
            Carreau : ${sim.carreau} cm<br>
            Carreaux : ${sim.nbTotal}<br>
            Perte : ${sim.perte} cm² (${sim.pourcentagePerte} %)<br>
            <img src="${sim.image}" alt="Simulation ${index + 1}" class="img-fluid mt-2"/>
          </div>
        </div>
      `;
    });
    $('#resultat').html(html);
    $('#resultatCollapse').collapse('show');
  });
});
