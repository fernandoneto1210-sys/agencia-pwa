// === CONTROLE DE ABAS ===
function showTab(event, tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    updateStats();
}

// === ADICIONAR ITENS PERSONALIZADOS ===
function addCustomItem(tabId) {
    const tab = document.getElementById(tabId);
    const input = tab.querySelector('.custom-input');
    const text = input.value.trim();

    if (text === '') {
        alert('Por favor, digite um item antes de adicionar!');
        return;
    }

    const section = tab.querySelector('.checklist-section');
    const addContainer = tab.querySelector('.add-item-container');

    const newItem = document.createElement('div');
    newItem.className = 'item';

    const uniqueId = 'custom_' + Date.now();

    newItem.innerHTML = `
        <input type="checkbox" id="${uniqueId}" onchange="updateStats()">
        <label for="${uniqueId}">${text}</label>
    `;

    section.insertBefore(newItem, addContainer);
    input.value = '';

    updateStats();
}

// === ESTATÍSTICAS ===
function updateStats() {
    const allCheckboxes = document.querySelectorAll('.tab-content input[type="checkbox"]');
    const checkedCheckboxes = document.querySelectorAll('.tab-content input[type="checkbox"]:checked');

    const total = allCheckboxes.length;
    const checked = checkedCheckboxes.length;
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('checkedCount').textContent = checked;
    document.getElementById('progress').textContent = percentage + '%';
}

// === SALVAR PROGRESSO LOCAL ===
function saveProgress() {
    const data = {
        tripInfo: {
            destino: document.getElementById('destino').value,
            tipoViagem: document.getElementById('tipoViagem').value,
            dataIda: document.getElementById('dataIda').value,
            dataVolta: document.getElementById('dataVolta').value,
            viajantes: document.getElementById('viajantes').value,
            clima: document.getElementById('clima').value,
            consultor: document.getElementById('consultor') ? document.getElementById('consultor').value : '',
            observacoes: document.getElementById('observacoes') ? document.getElementById('observacoes').value : ''
        },
        checkboxes: {},
        customItems: []
    };

    const checkboxes = document.querySelectorAll('.tab-content input[type="checkbox"]');
    checkboxes.forEach(cb => {
        data.checkboxes[cb.id] = cb.checked;
    });

    const items = document.querySelectorAll('.tab-content .item');
    items.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.id.startsWith('custom_')) {
            const label = item.querySelector('label');
            data.customItems.push({
                id: checkbox.id,
                text: label.textContent,
                checked: checkbox.checked,
                parent: item.closest('.tab-content').id
            });
        }
    });

    localStorage.setItem('travelChecklistOficina', JSON.stringify(data));
    alert('✅ Progresso salvo com sucesso!');
}

// === CARREGAR PROGRESSO LOCAL ===
function loadProgress() {
    const saved = localStorage.getItem('travelChecklistOficina');

    if (!saved) {
        alert('❌ Nenhum progresso salvo encontrado!');
        return;
    }

    const data = JSON.parse(saved);

    if (data.tripInfo) {
        document.getElementById('destino').value = data.tripInfo.destino || '';
        document.getElementById('tipoViagem').value = data.tripInfo.tipoViagem || '';
        document.getElementById('dataIda').value = data.tripInfo.dataIda || '';
        document.getElementById('dataVolta').value = data.tripInfo.dataVolta || '';
        document.getElementById('viajantes').value = data.tripInfo.viajantes || '';
        document.getElementById('clima').value = data.tripInfo.clima || '';

        if (document.getElementById('consultor'))
            document.getElementById('consultor').value = data.tripInfo.consultor || '';
        if (document.getElementById('observacoes'))
            document.getElementById('observacoes').value = data.tripInfo.observacoes || '';
    }

    // Remover itens personalizados antigos
    const allItems = document.querySelectorAll('.tab-content .item');
    allItems.forEach(item => {
        const cb = item.querySelector('input[type="checkbox"]');
        if (cb && cb.id.startsWith('custom_')) {
            item.remove();
        }
    });

    // Restaurar checkboxes padrão
    if (data.checkboxes) {
        Object.keys(data.checkboxes).forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox && !id.startsWith('custom_')) {
                checkbox.checked = data.checkboxes[id];
            }
        });
    }

    // Restaurar itens personalizados
    if (data.customItems) {
        data.customItems.forEach(item => {
            const tab = document.getElementById(item.parent);
            if (tab) {
                const section = tab.querySelector('.checklist-section');
                const addContainer = tab.querySelector('.add-item-container');

                const newItem = document.createElement('div');
                newItem.className = 'item';
                newItem.innerHTML = `
                    <input type="checkbox" id="${item.id}" ${item.checked ? 'checked' : ''} onchange="updateStats()">
                    <label for="${item.id}">${item.text}</label>
                `;

                section.insertBefore(newItem, addContainer);
            }
        });
    }

    updateStats();
    alert('✅ Progresso carregado com sucesso!');
}

// === GERAR PDF COM CABEÇALHO E DUAS COLUNAS ===
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;

    // Duas colunas
    const columnGap = 8;
    const columnWidth = (pageWidth - margin * 2 - columnGap) / 2;

    let currentColumn = 0; // 0 = esquerda, 1 = direita
    let yPosition = 0;
    const lineHeight = 5;

    // === CABEÇALHO ===
    function drawHeader() {
        yPosition = 15;

        const logoImg = document.querySelector('.logo-area img');
        if (logoImg && logoImg.complete) {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = logoImg.naturalWidth;
                canvas.height = logoImg.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(logoImg, 0, 0);
                const imgData = canvas.toDataURL('image/png');

                const logoWidth = 18;
                const logoHeight = (logoWidth * logoImg.naturalHeight) / logoImg.naturalWidth;
                doc.addImage(imgData, 'PNG', margin, yPosition - 3, logoWidth, logoHeight);
            } catch (e) {
                // Se der erro, segue sem logo
            }
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(44, 140, 58);
        doc.text('Oficina de Turismo', 38, yPosition);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        yPosition += 5;
        doc.text('Av. D. Pedro II, Lj 03 - Centro - 37470-000 - São Lourenço/MG', 38, yPosition);
        yPosition += 4;
        doc.text('Tel / WhatsApp: (35) 98862-2943  •  (35) 98844-5517', 38, yPosition);
        yPosition += 4;
        doc.text('Instagram: @oficinadeturismo  •  Site: www.oficinatur.com.br', 38, yPosition);
        yPosition += 5;

        doc.setDrawColor(44, 140, 58);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 4;
    }

    function getColumnX() {
        return currentColumn === 0
            ? margin
            : margin + columnWidth + columnGap;
    }

    function nextColumnOrPage() {
        if (currentColumn === 0) {
            currentColumn = 1;
            yPosition = 40;
        } else {
            doc.addPage();
            drawHeader();
            currentColumn = 0;
            yPosition = 40;
        }
    }

    drawHeader();

    // === TÍTULO ===
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(44, 140, 58);
    doc.text('Check List de Viagem', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    yPosition += 4;
    currentColumn = 0;

    // === INFORMAÇÕES DA VIAGEM ===
    const destino = document.getElementById('destino').value;
    const tipoViagem = document.getElementById('tipoViagem').value;
    const dataIda = document.getElementById('dataIda').value;
    const dataVolta = document.getElementById('dataVolta').value;
    const viajantes = document.getElementById('viajantes').value;
    const clima = document.getElementById('clima').value;
    const consultor = document.getElementById('consultor') ? document.getElementById('consultor').value : '';
    const observacoes = document.getElementById('observacoes') ? document.getElementById('observacoes').value : '';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 74, 125);
    doc.text('Informações da Viagem', getColumnX(), yPosition);
    yPosition += lineHeight;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    function writeInfoLine(label, value) {
        if (!value) return;
        if (yPosition > pageHeight - 20) {
            nextColumnOrPage();
        }
        doc.setFont('helvetica', 'bold');
        doc.text(label + ':', getColumnX(), yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(value, getColumnX() + 30, yPosition);
        yPosition += lineHeight;
    }

    writeInfoLine('Destino', destino);
    writeInfoLine('Tipo de Viagem', tipoViagem);
    writeInfoLine('Data de Ida', dataIda);
    writeInfoLine('Data de Volta', dataVolta);
    writeInfoLine('Viajantes', viajantes);
    writeInfoLine('Clima Previsto', clima);
    writeInfoLine('Consultor(a)', consultor);

    yPosition += lineHeight;

    // Observações
    if (observacoes) {
        if (yPosition > pageHeight - 30) {
            nextColumnOrPage();
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 74, 125);
        doc.text('Observações Importantes', getColumnX(), yPosition);
        yPosition += lineHeight;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);

        const obsLines = doc.splitTextToSize(observacoes, columnWidth - 4);
        obsLines.forEach(line => {
            if (yPosition > pageHeight - 20) {
                nextColumnOrPage();
            }
            doc.text(line, getColumnX(), yPosition);
            yPosition += lineHeight;
        });

        yPosition += lineHeight;
    }

    // === LISTAS POR CATEGORIA ===
    const tabs = ['preparativos', 'documentos', 'malasMao', 'roupas', 'higiene', 'eletronicos', 'farmacia', 'extras'];
    const tabNames = {
        'preparativos': 'Preparativos Antes da Viagem',
        'documentos': 'Documentos Essenciais',
        'malasMao': 'Mala de Mão',
        'roupas': 'Roupas e Calçados',
        'higiene': 'Higiene e Cosméticos',
        'eletronicos': 'Eletrônicos e Acessórios',
        'farmacia': 'Farmácia e Saúde',
        'extras': 'Itens Extras'
    };

    tabs.forEach(tabId => {
        const tab = document.getElementById(tabId);
        if (!tab) return;

        const items = Array.from(tab.querySelectorAll('.item'));
        if (items.length === 0) return;

        if (yPosition > pageHeight - 20) {
            nextColumnOrPage();
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 74, 125);
        doc.text(tabNames[tabId], getColumnX(), yPosition);
        yPosition += lineHeight;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);

        items.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const label = item.querySelector('label');
            if (!checkbox || !label) return;

            const isChecked = checkbox.checked;
            const text = label.textContent || '';

            const availableWidth = columnWidth - 8;
            const lines = doc.splitTextToSize(
                (isChecked ? '[X] ' : '') + text,
                availableWidth
            );
            const blockHeight = lines.length * lineHeight;

            if (yPosition + blockHeight > pageHeight - 20) {
                nextColumnOrPage();
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(30, 74, 125);
                doc.text(tabNames[tabId], getColumnX(), yPosition);
                yPosition += lineHeight;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
            }

            const xStart = getColumnX();

            if (isChecked) {
                lines.forEach(line => {
                    doc.text(line, xStart, yPosition);
                    yPosition += lineHeight;
                });
            } else {
                const boxSize = 3;
                doc.rect(xStart, yPosition - boxSize + 1, boxSize, boxSize);
                const textLines = doc.splitTextToSize(text, availableWidth);
                textLines.forEach((line, idx) => {
                    const x = xStart + boxSize + 2;
                    const y = yPosition + idx * lineHeight;
                    doc.text(line, x, y);
                });
                yPosition += textLines.length * lineHeight;
            }
        });

        yPosition += lineHeight;
    });

    // === RESUMO FINAL ===
    if (yPosition > pageHeight - 40) {
        doc.addPage();
        drawHeader();
        currentColumn = 0;
        yPosition = 40;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(44, 140, 58);
    doc.text('Resumo do Checklist', margin, yPosition);
    yPosition += lineHeight;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    const total = Number(document.getElementById('totalCount').textContent || 0);
    const checked = Number(document.getElementById('checkedCount').textContent || 0);
    const progress = document.getElementById('progress').textContent;

    doc.text('Total de Itens: ' + total, margin, yPosition);
    yPosition += lineHeight;
    doc.text('Itens Já Marcados: ' + checked, margin, yPosition);
    yPosition += lineHeight;
    doc.text('Progresso Atual: ' + progress, margin, yPosition);
    yPosition += lineHeight;
    doc.text('Itens Pendentes: ' + (total - checked), margin, yPosition);

    const fileName = `checklist_oficina_${(destino || 'minha_viagem').replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);

    alert('✅ PDF gerado com sucesso!\n\n• Itens marcados: [X] texto\n• Itens pendentes: quadradinho vazio para marcar à caneta\n• Layout em duas colunas para economizar papel');
}

// === LIMPAR TUDO ===
function resetAll() {
    if (!confirm('⚠️ Tem certeza que deseja limpar tudo? Esta ação não pode ser desfeita!')) {
        return;
    }

    document.getElementById('destino').value = '';
    document.getElementById('tipoViagem').value = '';
    document.getElementById('dataIda').value = '';
    document.getElementById('dataVolta').value = '';
    document.getElementById('viajantes').value = '';
    document.getElementById('clima').value = '';

    if (document.getElementById('consultor'))
        document.getElementById('consultor').value = '';
    if (document.getElementById('observacoes'))
        document.getElementById('observacoes').value = '';

    const checkboxes = document.querySelectorAll('.tab-content input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);

    const items = document.querySelectorAll('.tab-content .item');
    items.forEach(item => {
        const cb = item.querySelector('input[type="checkbox"]');
        if (cb && cb.id.startsWith('custom_')) {
            item.remove();
        }
    });

    localStorage.removeItem('travelChecklistOficina');

    updateStats();
    alert('✅ Tudo foi limpo!');
}

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', function() {
    const customInputs = document.querySelectorAll('.custom-input');
    customInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tab = this.closest('.tab-content');
                addCustomItem(tab.id);
            }
        });
    });

    const allCheckboxes = document.querySelectorAll('.tab-content input[type="checkbox"]');
    allCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateStats);
    });

    updateStats();
});
