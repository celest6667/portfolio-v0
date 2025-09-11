// main.js - redirection mobile/desktop et horloe
import './styles/style.css'; // chemin relatif, pas de / au début
import { initSphere } from './src/js/three/sphere.js';
import { initSphere2 } from './src/js/three/sphere2.js';

const heureEl = document.querySelector('.heure-actuelle');

function mettreAJourHeure() {
  const maintenant = new Date();
  const heures = String(maintenant.getHours()).padStart(2, '0');
  const minutes = String(maintenant.getMinutes()).padStart(2, '0');
  const secondes = String(maintenant.getSeconds()).padStart(2, '0');
  if (heureEl) {
    heureEl.textContent = `${heures}:${minutes}:${secondes}`;
  }
}

// Redirection mobile/desktop
document.addEventListener("DOMContentLoaded", () => {
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Vérifie que nous sommes sur index.html avant de rediriger
  if (isMobile && window.location.pathname.endsWith("index.html")) {
    // redirection relative pour éviter problème 404 sur Vercel
    window.location.href = "./mobile.html";
  }
});

mettreAJourHeure();
setInterval(mettreAJourHeure, 1000);

initSphere();
initSphere2()