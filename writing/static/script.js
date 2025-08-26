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

    const selectButtons = document.querySelectorAll('.select-btn');
    const itemSelector = document.getElementById('item-selector');
    const itemDetailsDiv = document.getElementById('item-details');
    const mainContainer = document.querySelector('.main-layout-container');

    const propertyMap = {
        personagg: ['Nome', 'Alias', 'Descrizione Fisica', 'Psicologia', 'Obiettivi', 'Background', 'Note', 'Ruolo'],
        luogh: ['Nome', 'Descrizione', 'Eventi Accaduti', 'Note', 'Tipo di Luogo'],
        oggett: ['Nome', 'Descrizione', 'Funzione', 'Potere', 'Storia', 'Provenienza', 'Proprietario']
    };

    if (selectButtons.length > 0) {
        selectButtons.forEach(button => {
            button.addEventListener('click', () => {
                const currentType = button.dataset.type;
                const bookId = mainContainer.dataset.bookId;
                const apiUrl = `/api/${currentType}/${bookId}`;

                // Aggiungi la classe 'active' al pulsante cliccato e rimuovila dagli altri
                selectButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // ✅ FIX: Imposta il 'data-type' sull'elemento `itemSelector`
                itemSelector.setAttribute('data-type', currentType);

                fetch(apiUrl)
                    .then(response => response.json())
                    .then(data => {
                        itemSelector.innerHTML = '<option value="">Seleziona un elemento...</option>';
                        data.forEach(item => {
                            const option = document.createElement('option');
                            option.value = item.id;
                            option.textContent = item.nome;
                            itemSelector.appendChild(option);
                        });
                        itemSelector.style.display = 'block';
                        itemDetailsDiv.style.display = 'none';
                    })
                    .catch(error => {
                        console.error(`Errore durante il fetch degli elementi di tipo ${currentType}:`, error);
                        itemSelector.innerHTML = `<option value="">Errore di caricamento</option>`;
                    });
            });
        });

        itemSelector.addEventListener('change', () => {
            const selectedItemId = itemSelector.value;
            // Leggi il 'data-type' dall'elemento stesso
            const currentType = itemSelector.getAttribute('data-type');
            const bookId = mainContainer.getAttribute('data-book-id');

            if (selectedItemId && currentType) {
                fetch(`/api/dettagli/${currentType}/${selectedItemId}`)
                    .then(response => response.json())
                    .then(details => {
                        if (details) {
                            let htmlContent = '';
                            const keys = propertyMap[currentType];
                            let firstDetail = true;

                            for (const key in details) {
                                if (details[key] !== null && details[key] !== '') {
                                    if (firstDetail) {
                                        // Usa il primo dettaglio come titolo
                                        htmlContent += `<h4>${details[key]}</h4>`;
                                        firstDetail = false;
                                    } else {
                                        htmlContent += `<p><strong>${key}:</strong> ${details[key]}</p>`;
                                    }
                                }
                            }

                            // Aggiungi i link di modifica in base al tipo
                            if (currentType === 'personaggi') {
                                htmlContent += `<a href="/modificapersonaggio/${bookId}/${selectedItemId}" class="edit-btn">Modifica Personaggio</a>`;
                            } else if (currentType === 'luoghi') {
                                htmlContent += `<a href="/modificaluogo/${bookId}/${selectedItemId}" class="edit-btn">Modifica Luogo</a>`;
                            } else if (currentType === 'oggetti') {
                                htmlContent += `<a href="/modificaoggetto/${bookId}/${selectedItemId}" class="edit-btn">Modifica Oggetto</a>`;
                            }

                            itemDetailsDiv.innerHTML = htmlContent;
                            itemDetailsDiv.style.display = 'block';
                        } else {
                             itemDetailsDiv.innerHTML = `<p style="color: red;">Dettagli non trovati.</p>`;
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