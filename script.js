document.addEventListener('DOMContentLoaded', function() {
    const leadForm = document.getElementById('leadForm');
    const resetButton = document.getElementById('resetButton');
    const refreshButton = document.getElementById('refreshButton');

    // Code d'initialisation de IndexedDB (inchangé)

    if (leadForm) {
        leadForm.addEventListener('submit', handleFormSubmit);
    }

    if (resetButton) {
        resetButton.addEventListener('click', function() {
            leadForm.reset();
        });
    }

    if (refreshButton) {
        refreshButton.addEventListener('click', displayLeads);
        displayLeads();
    }
});

function handleFormSubmit(e) {
    e.preventDefault();
    
    const externalId = Date.now().toString();
    const dateFormulaire = new Date().toISOString();
    
    const formData = new FormData(this);
    const leadData = Object.fromEntries(formData.entries());
    
    leadData.ExternalId = externalId;
    leadData.DateFormulaire = dateFormulaire;

    const baseUrl = 'http://ws.ga-media.fr/services?GA_part=EGNSDGGC&GA_ws=WBJQUCEP';
    const urlParams = new URLSearchParams({
        ExternalId: leadData.ExternalId,
        DateFormulaire: leadData.DateFormulaire,
        nom: leadData.nom,
        prenom: leadData.prenom,
        civilite: leadData.civilite,
        adresse: leadData.adresse,
        cp: leadData.cp,
        ville: leadData.ville,
        telephone: leadData.telephone,
        email: leadData.email
    });
    const uniqueUrl = `${baseUrl}&${urlParams.toString()}`;

    console.log("Envoi des données à l'API:", leadData);
    sendLeadData(uniqueUrl, leadData);
}

function sendLeadData(url, data) {
    fetch(url, { method: 'GET' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de l\'envoi à l\'API');
            }
            return response.text();
        })
        .then(result => {
            console.log('Réponse de l\'API:', result);
            if (result.includes('KO')) {
                throw new Error('Erreur API: ' + result);
            }
            saveToLocalDatabase(data);
            alert("Lead enregistré avec succès!");
        })
        .catch(error => {
            console.error('Erreur lors de l\'envoi à l\'API:', error);
            saveToLocalDatabase(data);
            alert("Erreur lors de l'enregistrement du lead. Les données ont été sauvegardées localement.");
        });
}

// Les fonctions saveToLocalDatabase et displayLeads restent inchangées
