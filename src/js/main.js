import '../styles/style.css';
import { initSphere } from './three/sphere.js';
import { initSphere2 } from './three/sphere2.js';


const heureEl = document.querySelector('.heure-actuelle');

function mettreAJourHeure() {
  const maintenant = new Date();
  const heures = String(maintenant.getHours()).padStart(2, '0');
  const minutes = String(maintenant.getMinutes()).padStart(2, '0');
  const secondes = String(maintenant.getSeconds()).padStart(2, '0');
  heureEl.textContent = `${heures}:${minutes}:${secondes}`;
}



mettreAJourHeure();
setInterval(mettreAJourHeure, 1000);

initSphere();
initSphere2();

