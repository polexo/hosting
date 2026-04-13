// Générer automatiquement toutes les combinaisons largeur x hauteur par palier de 2 cm
const selectMur = document.getElementById("dimensionsMur");
for (let largeur = 30; largeur <= 150; largeur += 2) {
  for (let hauteur = 30; hauteur <= 300; hauteur += 2) {
    const option = document.createElement("option");
    option.value = `${largeur}x${hauteur}`;
    option.textContent = `${largeur} x ${hauteur} cm`;
    selectMur.appendChild(option);
  }
}

// Activer Select2
$(document).ready(function() {
  $('#dimensionsMur').select2({
    placeholder: "Choisir les dimensions du mur",
    width: '100%'
  });
});

// Bouton switch largeur/hauteur du carreau
document.getElementById("switchBtn").addEventListener("click", function() {
  const largeurCarreau = document.getElementById("longueurCarreau").value;
  const hauteurCarreau = document.getElementById("hauteurCarreau").value;
  document.getElementById("longueurCarreau").value = hauteurCarreau;
  document.getElementById("hauteurCarreau").value = largeurCarreau;
});

// Simulation
document.getElementById("formCarrelage").addEventListener("submit", function(e) {
  e.preventDefault();

  const dimensions = document.getElementById("dimensionsMur").value;
  if (!dimensions) return;

  const [largeurMur, hauteurMur] = dimensions.split("x").map(Number);
  const largeurCarreau = parseFloat(document.getElementById("longueurCarreau").value);
  const hauteurCarreau = parseFloat(document.getElementById("hauteurCarreau").value);

  // Calcul sans découpe
  const nbLargeur = Math.floor(largeurMur / largeurCarreau);
  const nbHauteur = Math.floor(hauteurMur / hauteurCarreau);
  const nbTotal = nbLargeur * nbHauteur;

  // Surfaces
  const surfaceMur = largeurMur * hauteurMur;
  const surfaceCouverte = (nbLargeur * largeurCarreau) * (nbHauteur * hauteurCarreau);
  const perte = surfaceMur - surfaceCouverte;
  const pourcentagePerte = ((perte / surfaceMur) * 100).toFixed(2);

  // Affichage résultats
  document.getElementById("resultat").innerHTML = `
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
  `;

  // Dessin sur Canvas responsive
  const canvas = document.getElementById("canvasMur");
  const ctx = canvas.getContext("2d");

  canvas.width = document.querySelector(".container").clientWidth - 40;
  canvas.height = 400;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Mise à l'échelle
  const scaleX = canvas.width / largeurMur;
  const scaleY = canvas.height / hauteurMur;

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
