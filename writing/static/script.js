document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('close-sidebar');
    const mainContent = document.querySelector('main'); 

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            if (mainContent) {
                mainContent.classList.add('shifted-content');
            }
        });
    }

    if (closeSidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('active');
            if (mainContent) {
                mainContent.classList.remove('shifted-content');
            }
        });
    }

    if (mainContent) {
        mainContent.addEventListener('click', (event) => {
            if (sidebar.classList.contains('active') && !sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
                sidebar.classList.remove('active');
                mainContent.classList.remove('shifted-content');
            }
        });
    }

    // --- Inizio nuove funzionalità per libro.html ---

    const selectButtons = document.querySelectorAll('.select-btn');
    const itemSelector = document.getElementById('item-selector');
    const itemDetailsDiv = document.getElementById('item-details');
    const mainContainer = document.querySelector('.main-layout-container');

    // Mappatura delle proprietà per ogni tipo di elemento
    const propertyMap = {
        personaggi: ['nome', 'descrizione', 'sesso', 'razza', 'professione', 'note', 'is_protagonista'],
        luoghi: ['nome', 'descrizione', 'eventiaccaduti', 'note', 'tipo_luogo'],
        oggetti: ['nome', 'descrizione', 'funzione', 'potere', 'storia', 'provenienza', 'proprietario']
    };

    if (selectButtons.length > 0) {
        selectButtons.forEach(button => {
            button.addEventListener('click', () => {
                const type = button.getAttribute('data-type');
                itemSelector.setAttribute('data-type', type);
                itemSelector.style.display = 'block';
                itemDetailsDiv.style.display = 'none';

                fetch(`/api/${type}/${mainContainer.getAttribute('data-book-id')}`)
                    .then(response => response.json())
                    .then(data => {
                        itemSelector.innerHTML = '<option value="">Seleziona un elemento...</option>';
                        data.forEach(item => {
                            const option = document.createElement('option');
                            option.value = item[1];
                            option.textContent = item[0];
                            itemSelector.appendChild(option);
                        });
                    })
                    .catch(error => console.error('Error fetching items:', error));
            });
        });

        itemSelector.addEventListener('change', () => {
            const selectedItemId = itemSelector.value;
            const currentType = itemSelector.getAttribute('data-type');
            const bookId = mainContainer.getAttribute('data-book-id');

            if (selectedItemId) {
                fetch(`/api/dettagli/${currentType}/${selectedItemId}`)
                    .then(response => response.json())
                    .then(details => {
                        if (details) {
                            // Uso il primo elemento della tupla come titolo
                            let htmlContent = `<h4>${details[0]}</h4>`;
                            
                            // Utilizzo la mappatura per iterare i dettagli
                            const keys = propertyMap[currentType];
                            for (let i = 1; i < details.length; i++) {
                                // Evito di mostrare campi nulli o vuoti
                                if (details[i] !== null && details[i] !== '' && keys[i]) {
                                    const keyName = keys[i].replace(/_/g, ' '); // Rimuovo gli underscore dai nomi delle chiavi
                                    htmlContent += `<p><strong>${keyName.charAt(0).toUpperCase() + keyName.slice(1)}:</strong> ${details[i]}</p>`;
                                }
                            }
                            
                            // Aggiungo i link di modifica in base al tipo
                            if (currentType === 'personaggi') {
                                htmlContent += `<a href="/modificapersonaggio/${bookId}/${selectedItemId}" class="edit-btn">Modifica Personaggio</a>`;
                            }
                            if (currentType === 'luoghi') {
                                htmlContent += `<a href="/modificaluogo/${bookId}/${selectedItemId}" class="edit-btn">Modifica Luogo</a>`;
                            }
                            if (currentType === 'oggetti') {
                                htmlContent += `<a href="/modificaoggetto/${bookId}/${selectedItemId}" class="edit-btn">Modifica Oggetto</a>`;
                            }

                            itemDetailsDiv.innerHTML = htmlContent;
                            itemDetailsDiv.style.display = 'block';
                        }
                    })
                    .catch(error => {
                        console.error('Errore durante il fetch dei dettagli:', error);
                        itemDetailsDiv.innerHTML = `<p style="color: red;">Impossibile caricare i dettagli.</p>`;
                    });
            } else {
                itemDetailsDiv.style.display = 'none';
            }
        });
    }
});