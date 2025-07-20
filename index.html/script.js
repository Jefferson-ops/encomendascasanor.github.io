document.addEventListener('DOMContentLoaded', function() {
            // Elementos DOM
            const packageForm = document.getElementById('package-form');
            const pendingTable = document.getElementById('pending-table').querySelector('tbody');
            const deliveredTable = document.getElementById('delivered-table').querySelector('tbody');
            const allTable = document.getElementById('all-table').querySelector('tbody');
            const tabs = document.querySelectorAll('.tab');
            const tabContents = document.querySelectorAll('.tab-content');
            const currentDateEl = document.getElementById('current-date');
            const pendingCountEl = document.getElementById('pending-count');
            const toggleThemeBtn = document.getElementById('toggle-theme');
            const themeIcon = document.getElementById('theme-icon');

            // Dados
            let packages = JSON.parse(localStorage.getItem('condominio_casa_nor_packages')) || [];

            // Atualizar data atual
            function updateCurrentDate() {
                const now = new Date();
                currentDateEl.textContent = now.toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                });
            }

            // Atualizar contador de pendentes
            function updatePendingCount() {
                const count = packages.filter(p => p.status === 'pending').length;
                pendingCountEl.textContent = `${count} encomenda${count !== 1 ? 's' : ''} pendente${count !== 1 ? 's' : ''}`;
            }

            // Renderizar tabelas
            function renderTables() {
                pendingTable.innerHTML = '';
                deliveredTable.innerHTML = '';
                allTable.innerHTML = '';

                const pendingPackages = packages.filter(p => p.status === 'pending');
                const deliveredPackages = packages.filter(p => p.status === 'delivered');

                // Pendentes
                pendingPackages.forEach(pkg => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${pkg.date}</td>
                        <td>${pkg.apartment}</td>
                        <td>${pkg.resident || '-'}</td>
                        <td>${pkg.description}</td>
                        <td>${pkg.courier || '-'}</td>
                        <td>${pkg.receivedBy || '-'}</td>
                        <td><span class="status-badge status-pending">Pendente</span></td>
                        <td>
                            <button class="btn btn-success" onclick="markAsDelivered('${pkg.id}')">
                                <i class="fas fa-check"></i> Entregue
                            </button>
                            <button class="btn btn-warning" onclick="editPackage('${pkg.id}')">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                        </td>
                    `;
                    pendingTable.appendChild(row);
                });

                // Entregues
                deliveredPackages.forEach(pkg => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${pkg.date}</td>
                        <td>${pkg.deliveredDate}</td>
                        <td>${pkg.apartment}</td>
                        <td>${pkg.resident || '-'}</td>
                        <td>${pkg.description}</td>
                        <td>${pkg.courier || '-'}</td>
                        <td>${pkg.deliveredBy || '-'}</td>
                    `;
                    deliveredTable.appendChild(row);
                });

                // Todas
                packages.forEach(pkg => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${pkg.date}</td>
                        <td>${pkg.apartment}</td>
                        <td>${pkg.resident || '-'}</td>
                        <td>${pkg.description}</td>
                        <td>${pkg.receivedBy || '-'}</td>
                        <td>${pkg.deliveredBy || '-'}</td>
                        <td>
                            <span class="status-badge ${pkg.status === 'pending' ? 'status-pending' : 'status-delivered'}">
                                ${pkg.status === 'pending' ? 'Pendente' : 'Entregue'}
                            </span>
                        </td>
                    `;
                    allTable.appendChild(row);
                });

                updatePendingCount();
            }

            // Registrar nova encomenda
            packageForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const newPackage = {
                    id: Date.now().toString(),
                    date: new Date().toLocaleString('pt-BR'),
                    apartment: document.getElementById('apartment').value,
                    resident: document.getElementById('resident').value, // <-- importante!
                    description: document.getElementById('description').value,
                    courier: document.getElementById('courier').value,
                    notes: document.getElementById('notes').value,
                    receivedBy: document.getElementById('receivedBy').value,
                    status: 'pending',
                    deliveredDate: null
                };

                packages.unshift(newPackage);
                savePackages();
                packageForm.reset();
                renderTables();

                // Mostrar mensagem de sucesso
                alert('Encomenda registrada com sucesso!');
            });

            // Marcar como entregue
            window.markAsDelivered = function(id) {
                const deliveredBy = prompt('Informe o nome do funcionário que entregou ao morador:');
                if (!deliveredBy) {
                    alert('É obrigatório informar o nome do funcionário que entregou!');
                    return;
                }
                packages = packages.map(pkg => {
                    if (pkg.id === id) {
                        return {
                            ...pkg,
                            status: 'delivered',
                            deliveredDate: new Date().toLocaleString('pt-BR'),
                            deliveredBy: deliveredBy // salva o nome do funcionário
                        };
                    }
                    return pkg;
                });

                savePackages();
                renderTables();
                alert('Entrega realizada com sucesso!');
            };

            // Editar encomenda
            window.editPackage = function(id) {
                const pkg = packages.find(p => p.id === id);
                if (!pkg) return;

                // Adiciona prompt para editar a data/hora
                const date = prompt('Data/Hora da encomenda:', pkg.date || '');
                const resident = prompt('Nome do Morador:', pkg.resident || '');
                const apartment = prompt('Unidade:', pkg.apartment || '');
                const description = prompt('Descrição:', pkg.description || '');
                const courier = prompt('Transportadora/Entregador:', pkg.courier || '');
                const receivedBy = prompt('Funcionário que recebeu:', pkg.receivedBy || '');

                // Atualiza os dados se não cancelar
                if (
                    date !== null && resident !== null && apartment !== null &&
                    description !== null && courier !== null && receivedBy !== null
                ) {
                    packages = packages.map(p => {
                        if (p.id === id) {
                            return {
                                ...p,
                                date,
                                resident,
                                apartment,
                                description,
                                courier,
                                receivedBy
                            };
                        }
                        return p;
                    });
                    savePackages();
                    renderTables();
                    alert('Encomenda editada com sucesso!');
                }
            };

            // Trocar de aba
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));

                    tab.classList.add('active');
                    const tabId = tab.getAttribute('data-tab');
                    document.getElementById(`${tabId}-tab`).classList.add('active');
                });
            });

            // Carregar tema salvo
            if (localStorage.getItem('theme') === 'dark') {
                document.body.classList.add('dark-mode');
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }

            // Alternar tema ao clicar
            toggleThemeBtn.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const isDark = document.body.classList.contains('dark-mode');
                themeIcon.classList.toggle('fa-moon', !isDark);
                themeIcon.classList.toggle('fa-sun', isDark);
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            });

            // Salvar pacotes no localStorage
            function savePackages() {
                localStorage.setItem('condominio_casa_nor_packages', JSON.stringify(packages));
            }

            // Inicialização
            updateCurrentDate();
            renderTables();
        });