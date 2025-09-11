export function initHeure() {
    const heureEl = document.querySelector('.heure-actuelle');
    if (!heureEl) return; // évite les erreurs si l'élément n'existe pas
  
    function mettreAJourHeure() {
      const maintenant = new Date();
      const heures = String(maintenant.getHours()).padStart(2, '0');
      const minutes = String(maintenant.getMinutes()).padStart(2, '0');
      const secondes = String(maintenant.getSeconds()).padStart(2, '0');
      heureEl.textContent = `${heures}:${minutes}:${secondes}`;
    }
  
    mettreAJourHeure();
    setInterval(mettreAJourHeure, 1000);
  }