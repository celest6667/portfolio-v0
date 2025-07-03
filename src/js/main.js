import '../styles/style.css';

// Sélection de l’élément heure
const heureEl = document.querySelector('.heure-actuelle');

// Fonction pour mettre à jour l’heure
function mettreAJourHeure() {
  const maintenant = new Date();
  const heures = String(maintenant.getHours()).padStart(2, '0');
  const minutes = String(maintenant.getMinutes()).padStart(2, '0');
  const secondes = String(maintenant.getSeconds()).padStart(2, '0');
  heureEl.textContent = `${heures}:${minutes}:${secondes}`;
}

// Lancement immédiat et mise à jour chaque seconde
mettreAJourHeure();
setInterval(mettreAJourHeure, 1000);