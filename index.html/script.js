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
                let data = now.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
                data = data.charAt(0).toUpperCase() + data.slice(1);
                currentDateEl.textContent = data;
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
                        <td>${pkg.description || '-'}</td>
                        <td>${pkg.descricao || '-'}</td>
                        <td>${pkg.courier || '-'}</td>
                        <td>${pkg.receivedBy || '-'}</td>
                        <td><span class="status-badge status-pending"><i class='fas fa-clock'></i> Pendente</span></td>
                        <td>
                            <button class="btn-action btn-success" onclick="markAsDelivered('${pkg.id}')" title="Marcar como entregue"><i class="fas fa-check"></i> Entregue</button>
                            <button class="btn-action btn-warning" onclick="editPackage('${pkg.id}')" title="Editar encomenda"><i class="fas fa-edit"></i> Editar</button>
                            <button class="btn-action btn-danger" onclick="deletePackage('${pkg.id}')" title="Excluir encomenda"><i class="fas fa-trash"></i></button>
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
                        <td>${pkg.description || '-'}</td>
                        <td>${pkg.descricao || '-'}</td>
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
                        <td>${pkg.description || '-'}</td>
                        <td>${pkg.descricao || '-'}</td>
                        <td>${pkg.receivedBy || '-'}</td>
                        <td>${pkg.deliveredBy || '-'}</td>
                        <td>
                            <span class="status-badge ${pkg.status === 'pending' ? 'status-pending' : 'status-delivered'}">
                                <i class='fas ${pkg.status === 'pending' ? 'fa-clock' : 'fa-check'}'></i> ${pkg.status === 'pending' ? 'Pendente' : 'Entregue'}
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
                    descricao: document.getElementById('descricao').value,
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

            // Modal de edição de encomenda
            const editModal = document.getElementById('edit-modal');
            const closeEditModal = document.getElementById('close-edit-modal');
            const editForm = document.getElementById('edit-form');
            let editingId = null;
            window.editPackage = function(id) {
                const pkg = packages.find(p => p.id === id);
                if (!pkg) return;
                editingId = id;
                document.getElementById('edit-id').value = pkg.id;
                document.getElementById('edit-date').value = pkg.date || '';
                document.getElementById('edit-resident').value = pkg.resident || '';
                document.getElementById('edit-apartment').value = pkg.apartment || '';
                document.getElementById('edit-description').value = pkg.description || '';
                document.getElementById('edit-descricao').value = pkg.descricao || '';
                document.getElementById('edit-courier').value = pkg.courier || '';
                document.getElementById('edit-receivedBy').value = pkg.receivedBy || '';
                editModal.style.display = 'flex';
            };
            if (closeEditModal) closeEditModal.onclick = () => { editModal.style.display = 'none'; };
            window.onclick = function(event) {
                if (event.target === editModal) editModal.style.display = 'none';
            };
            if (editForm) {
                editForm.onsubmit = function(e) {
                    e.preventDefault();
                    const id = document.getElementById('edit-id').value;
                    const date = document.getElementById('edit-date').value;
                    const resident = document.getElementById('edit-resident').value;
                    const apartment = document.getElementById('edit-apartment').value;
                    const description = document.getElementById('edit-description').value;
                    const descricao = document.getElementById('edit-descricao').value;
                    const courier = document.getElementById('edit-courier').value;
                    const receivedBy = document.getElementById('edit-receivedBy').value;
                    packages = packages.map(p => {
                        if (p.id === id) {
                            return {
                                ...p,
                                date,
                                resident,
                                apartment,
                                description,
                                descricao,
                                courier,
                                receivedBy
                            };
                        }
                        return p;
                    });
                    savePackages();
                    renderTables();
                    showToast('Encomenda editada com sucesso!');
                    editModal.style.display = 'none';
                };
            }

            // Modal de confirmação de exclusão
            const deleteModal = document.getElementById('delete-modal');
            const closeDeleteModal = document.getElementById('close-delete-modal');
            const confirmDeleteBtn = document.getElementById('confirm-delete');
            const cancelDeleteBtn = document.getElementById('cancel-delete');
            let deletingId = null;
            window.deletePackage = function(id) {
                deletingId = id;
                deleteModal.style.display = 'flex';
            };
            if (closeDeleteModal) closeDeleteModal.onclick = () => { deleteModal.style.display = 'none'; };
            if (cancelDeleteBtn) cancelDeleteBtn.onclick = () => { deleteModal.style.display = 'none'; };
            if (confirmDeleteBtn) confirmDeleteBtn.onclick = function() {
                if (deletingId) {
                    packages = packages.filter(p => p.id !== deletingId);
                    savePackages();
                    renderTables();
                    showToast('Encomenda excluída!');
                    deleteModal.style.display = 'none';
                    deletingId = null;
                }
            };
            window.onclick = function(event) {
                if (event.target === deleteModal) deleteModal.style.display = 'none';
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

            // Toast de feedback
            function showToast(msg) {
                const toast = document.getElementById('toast');
                toast.textContent = msg;
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 3000);
            }
            // Botão flutuante para nova encomenda
            const fabAdd = document.getElementById('fab-add');
            if (fabAdd) {
                fabAdd.addEventListener('click', () => {
                    document.querySelector('.tab[data-tab="register"]').click();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
            // Substituir alert por toast
            function alert(msg) { showToast(msg); }
            // Campo de busca/filtro
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.addEventListener('input', function() {
                    const value = this.value.toLowerCase();
                    document.querySelectorAll('table tbody tr').forEach(row => {
                        row.style.display = row.textContent.toLowerCase().includes(value) ? '' : 'none';
                    });
                });
            }

            // Exportação para CSV
            const exportBtn = document.getElementById('export-csv');
            if (exportBtn) {
                exportBtn.addEventListener('click', function() {
                    const csvRows = [];
                    const headers = ['Data', 'Unidade', 'Morador', 'Código N-F', 'Descrição', 'Entregador', 'Funcionário/a Recebeu', 'Funcionário/a Entregou', 'Status'];
                    csvRows.push(headers.join(','));
                    packages.forEach(pkg => {
                        csvRows.push([
                            '"' + (pkg.date || '') + '"',
                            '"' + (pkg.apartment || '') + '"',
                            '"' + (pkg.resident || '') + '"',
                            '"' + (pkg.description || '') + '"',
                            '"' + (pkg.descricao || '') + '"',
                            '"' + (pkg.courier || '') + '"',
                            '"' + (pkg.receivedBy || '') + '"',
                            '"' + (pkg.deliveredBy || '') + '"',
                            '"' + (pkg.status === 'pending' ? 'Pendente' : 'Entregue') + '"'
                        ].join(','));
                    });
                    const csvContent = csvRows.join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.setAttribute('download', 'encomendas.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showToast('Exportação concluída!');
                });
            }

            // Inicialização
            updateCurrentDate();
            renderTables();
        });
