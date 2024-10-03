document.addEventListener('DOMContentLoaded', function() {
    const leadForm = document.getElementById('leadForm');
    const refreshButton = document.getElementById('refreshButton');

    if (leadForm) {
        leadForm.addEventListener('submit', handleFormSubmit);
    }

    if (refreshButton) {
        refreshButton.addEventListener('click', displayLeads);
        displayLeads(); // Afficher les leads au chargement de la page de visualisation
    }
});

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Génération de l'ID unique et de la date
    const externalId = Date.now().toString();
    const dateFormulaire = new Date().toISOString();

    // Récupération des données du formulaire
    const formData = new FormData(this);
    const leadData = Object.fromEntries(formData.entries());

    // Ajout de l'ID et de la date
    leadData.ExternalId = externalId;
    leadData.DateFormulaire = dateFormulaire;

    // Création de l'URL unique
    const baseUrl = 'http://ws.ga-media.fr/services?GA_part=EGNSDGGC&GA_ws=WBJQUCEP';
    const urlParams = new URLSearchParams(leadData);
    const uniqueUrl = `${baseUrl}&${urlParams.toString()}`;

    // Envoi des données à l'API et à la base de données locale
    sendLeadData(uniqueUrl, leadData);
}

function sendLeadData(url, data) {
    fetch(url, { method: 'POST' }) // Changer en POST si nécessaire
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de l\'envoi à l\'API');
            }
            return response.json();
        })
        .then(result => {
            console.log('Réponse de l\'API:', result);
            saveToLocalDatabase(data);
        })
        .catch(error => {
            console.error('Erreur lors de l\'envoi à l\'API:', error);
            saveToLocalDatabase(data); // Sauvegarde même en cas d'erreur
        });
}

function saveToLocalDatabase(data) {
    const request = indexedDB.open('LeadsDatabase', 1);

    request.onerror = function(event) {
        console.error("Erreur d'ouverture de la base de données:", event.target.error);
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['leads'], 'readwrite');
        const objectStore = transaction.objectStore('leads');
        const addRequest = objectStore.add(data);

        addRequest.onerror = function(event) {
            console.error("Erreur d'ajout de données:", event.target.error);
        };

        addRequest.onsuccess = function(event) {
            console.log("Données sauvegardées localement avec succès");
            alert("Lead enregistré avec succès!");
        };
    };

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        db.createObjectStore('leads', { keyPath: 'ExternalId' });
    };
}

function displayLeads() {
    const request = indexedDB.open('LeadsDatabase', 1);

    request.onerror = function(event) {
        console.error("Erreur d'ouverture de la base de données:", event.target.error);
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['leads'], 'readonly');
        const objectStore = transaction.objectStore('leads');
        const getAllRequest = objectStore.getAll();

        getAllRequest.onerror = function(event) {
            console.error("Erreur de récupération des données:", event.target.error);
        };

        getAllRequest.onsuccess = function(event) {
            const leads = event.target.result;
            const tableBody = document.querySelector('#leadsTable tbody');
            if (tableBody) {
                tableBody.innerHTML = ''; // Vider le tableau existant

                leads.forEach(lead => {
                    const row = tableBody.insertRow();
                    row.insertCell(0).textContent = lead.nom;
                    row.insertCell(1).textContent = lead.prenom;
                    row.insertCell(2).textContent = lead.email;
                    row.insertCell(3).textContent = lead.telephone;
                    row.insertCell(4).textContent = `${lead.adresse}, ${lead.cp} ${lead.ville}`;
                    row.insertCell(5).textContent = new Date(lead.DateFormulaire).toLocaleString();
                });
            }
        };
    };
}
