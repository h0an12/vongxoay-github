document.addEventListener('DOMContentLoaded', function() {
    // Tên mặc định
    let names = ['Minh', 'An', 'Bảo', 'Chi', 'Dương', 'Giang', 'Hùng', 'Lan'];
    let colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'];
    let isSpinning = false;
    let rotation = 0;
    let resultsCount = 0;
    let escapeCount = 0;
    let recentResults = [];
    
    // Biến cho chế độ tăng cơ hội thông minh
    let smartCheatMode = false;
    let cheatTargetName = null;
    let cheatProbability = 0;
    
    // Các phần tử DOM
    const wheel = document.getElementById('wheel');
    const spinBtn = document.getElementById('spin-btn');
    const resetBtn = document.getElementById('reset-btn');
    const addBtn = document.getElementById('add-btn');
    const nameInput = document.getElementById('name-input');
    const namesTextarea = document.getElementById('names-textarea');
    const namesList = document.getElementById('names-list');
    const result = document.getElementById('result');
    const wheelResult = document.getElementById('wheel-result');
    const closeBtn = document.getElementById('close-btn');
    const moveBtn = document.getElementById('move-btn');
    const currentYear = document.getElementById('current-year');
    const entriesCount = document.getElementById('entries-count');
    const resultsCountElem = document.getElementById('results-count');
    const escapeCountElem = document.getElementById('escape-count');
    const listCount = document.getElementById('list-count');
    const clearListBtn = document.getElementById('clear-list-btn');
    const editTitleBtn = document.getElementById('edit-title-btn');
    const editModal = document.getElementById('edit-modal');
    const editTitleInput = document.getElementById('edit-title-input');
    const editDescriptionInput = document.getElementById('edit-description-input');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const saveEditBtn = document.getElementById('save-edit-btn');
    const wheelTitle = document.getElementById('wheel-title');
    const wheelDescription = document.getElementById('wheel-description');
    const exportBtn = document.getElementById('export-btn');
    const recentResultsContainer = document.getElementById('recent-results');
    
    // Các phần tử tăng cơ hội
    const cheatBtnCorner = document.getElementById('cheat-btn');
    const cheatModal = document.getElementById('cheat-modal');
    const cheatSelect = document.getElementById('cheat-select');
    const cancelCheatBtn = document.getElementById('cancel-cheat-btn');
    const confirmCheatBtn = document.getElementById('confirm-cheat-btn');
    
    // Load dữ liệu từ localStorage khi khởi động
    function loadFromLocalStorage() {
        try {
            const savedNames = localStorage.getItem('wheelNames');
            const savedTitle = localStorage.getItem('wheelTitle');
            const savedDescription = localStorage.getItem('wheelDescription');
            const savedResults = localStorage.getItem('wheelResults');
            const savedEscapes = localStorage.getItem('wheelEscapes');
            const savedRecentResults = localStorage.getItem('wheelRecentResults');
            
            if (savedNames) {
                names = JSON.parse(savedNames);
            }
            if (savedTitle) {
                wheelTitle.textContent = savedTitle;
            }
            if (savedDescription) {
                wheelDescription.textContent = savedDescription;
            }
            if (savedResults) {
                resultsCount = parseInt(savedResults);
            }
            if (savedEscapes) {
                escapeCount = parseInt(savedEscapes);
            }
            if (savedRecentResults) {
                recentResults = JSON.parse(savedRecentResults);
                updateRecentResults();
            }
        } catch (error) {
            console.error('Lỗi khi load dữ liệu từ localStorage:', error);
        }
    }
    
    // Lưu dữ liệu vào localStorage
    function saveToLocalStorage() {
        try {
            localStorage.setItem('wheelNames', JSON.stringify(names));
            localStorage.setItem('wheelTitle', wheelTitle.textContent);
            localStorage.setItem('wheelDescription', wheelDescription.textContent);
            localStorage.setItem('wheelResults', resultsCount.toString());
            localStorage.setItem('wheelEscapes', escapeCount.toString());
            localStorage.setItem('wheelRecentResults', JSON.stringify(recentResults));
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu vào localStorage:', error);
        }
    }
    
    // Đặt năm hiện tại trong footer
    currentYear.textContent = new Date().getFullYear();
    
    // Khởi tạo vòng quay
    loadFromLocalStorage();
    updateWheel();
    renderNamesList();
    updateStats();
    updateCheatSelect();
    
    // Sự kiện
    spinBtn.addEventListener('click', spinWheel);
    resetBtn.addEventListener('click', resetWheel);
    addBtn.addEventListener('click', addName);
    namesTextarea.addEventListener('input', handleTextareaInput);
    closeBtn.addEventListener('click', closeResult);
    moveBtn.addEventListener('click', moveResult);
    clearListBtn.addEventListener('click', clearList);
    editTitleBtn.addEventListener('click', openEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);
    saveEditBtn.addEventListener('click', saveEdit);
    exportBtn.addEventListener('click', exportResults);
    
    // Sự kiện tăng cơ hội
    cheatBtnCorner.addEventListener('click', openCheatModal);
    cancelCheatBtn.addEventListener('click', closeCheatModal);
    confirmCheatBtn.addEventListener('click', confirmCheat);
    cheatSelect.addEventListener('change', handleCheatSelectChange);
    
    // Thêm tên khi nhấn Enter trong ô input
    nameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addName();
        }
    });
    
    // Đóng modal khi click ra ngoài
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
    
    cheatModal.addEventListener('click', function(e) {
        if (e.target === cheatModal) {
            closeCheatModal();
        }
    });
    
    // Xử lý resize window
    window.addEventListener('resize', handleResize);
    
    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (wheelResult.style.display === 'block') {
                const oldConfetti = document.querySelectorAll('.confetti');
                if (oldConfetti.length > 0) {
                    createConfetti();
                }
            }
        }, 250);
    }
    
    // Hàm kiểm tra dữ liệu đầu vào
    function validateName(name) {
        if (!name || name.trim() === '') {
            return false;
        }
        if (name.length > 50) {
            alert('Tên quá dài! Vui lòng nhập tên ngắn hơn 50 ký tự.');
            return false;
        }
        return true;
    }
    
    // Các hàm chính
    function updateWheel() {
        wheel.innerHTML = '';
        
        if (names.length === 0) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '250');
            circle.setAttribute('cy', '250');
            circle.setAttribute('r', '240');
            circle.setAttribute('fill', '#f0f0f0');
            circle.setAttribute('stroke', '#ddd');
            circle.setAttribute('stroke-width', '2');
            wheel.appendChild(circle);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', '250');
            text.setAttribute('y', '250');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('font-size', '24');
            text.setAttribute('fill', '#999');
            text.textContent = 'Thêm tên để bắt đầu';
            wheel.appendChild(text);
            return;
        }
        
        const angle = 360 / names.length;
        const radius = 240;
        const centerX = 250;
        const centerY = 250;
        
        for (let i = 0; i < names.length; i++) {
            const startAngle = i * angle;
            const endAngle = (i + 1) * angle;
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            
            const x1 = centerX + radius * Math.sin(startRad);
            const y1 = centerY - radius * Math.cos(startRad);
            const x2 = centerX + radius * Math.sin(endRad);
            const y2 = centerY - radius * Math.cos(endRad);
            
            const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
            
            const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
            ].join(' ');
            
            path.setAttribute('d', pathData);
            path.setAttribute('fill', colors[i % colors.length]);
            path.setAttribute('stroke', '#fff');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('data-index', i);
            
            wheel.appendChild(path);
            
            const textAngle = (startAngle + endAngle) / 2;
            const textRad = (textAngle * Math.PI) / 180;
            const textRadius = radius * 0.7;
            
            const textX = centerX + textRadius * Math.sin(textRad);
            const textY = centerY - textRadius * Math.cos(textRad);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', textX);
            text.setAttribute('y', textY);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('font-size', '16');
            text.setAttribute('fill', '#fff');
            text.setAttribute('transform', `rotate(${textAngle}, ${textX}, ${textY})`);
            text.textContent = names[i];
            
            wheel.appendChild(text);
        }
    }
    
    function spinWheel() {
        try {
            if (isSpinning || names.length === 0) return;
            
            isSpinning = true;
            spinBtn.classList.add('spin-btn-loading');
            result.textContent = '-';
            wheelResult.style.display = 'none';
            
            let randomSegment;
            let isCheatSuccessful = false;
            
            if (smartCheatMode && cheatTargetName) {
                const randomValue = Math.random() * 100;
                isCheatSuccessful = randomValue <= cheatProbability;
                
                if (isCheatSuccessful) {
                    randomSegment = names.indexOf(cheatTargetName);
                    if (randomSegment === -1) {
                        randomSegment = Math.floor(Math.random() * names.length);
                    }
                } else {
                    randomSegment = Math.floor(Math.random() * names.length);
                }
                
                smartCheatMode = false;
                cheatTargetName = null;
                // Reset nút cheat corner
                cheatBtnCorner.innerHTML = '<span class="cheat-icon">🎯</span>';
                cheatBtnCorner.classList.remove('active');
            } else {
                randomSegment = Math.floor(Math.random() * names.length);
            }
            
            // Tính toán góc quay chính xác
            const extraRotations = 5 + Math.floor(Math.random() * 5);
            const segmentAngle = 360 / names.length;
            
            // Tính toán góc để kim chỉ đúng vào segment mong muốn
            const currentRotation = rotation % 360;
            const targetAngle = 360 - (randomSegment * segmentAngle + segmentAngle / 2);
            const rotationNeeded = (360 - currentRotation) + targetAngle + (extraRotations * 360);
            
            rotation += rotationNeeded;
            
            wheel.style.transform = `rotate(${rotation}deg)`;
            
            setTimeout(() => {
                try {
                    isSpinning = false;
                    spinBtn.classList.remove('spin-btn-loading');
                    const winner = names[randomSegment];
                    
                    // Thêm vào kết quả gần đây
                    addRecentResult(winner, isCheatSuccessful);
                    
                    if (isCheatSuccessful) {
                        result.innerHTML = `${winner} <span style="font-size: 0.7em; color: #FFD700;">🎯</span>`;
                    } else {
                        result.textContent = winner;
                    }
                    
                    resultsCount++;
                    updateStats();
                    saveToLocalStorage();
                    
                    setTimeout(() => {
                        wheelResult.style.display = 'block';
                        createConfetti();
                    }, 500);
                } catch (error) {
                    console.error('Lỗi khi xử lý kết quả:', error);
                    isSpinning = false;
                    spinBtn.classList.remove('spin-btn-loading');
                }
            }, 4000);
        } catch (error) {
            console.error('Lỗi khi quay:', error);
            isSpinning = false;
            spinBtn.classList.remove('spin-btn-loading');
            alert('Có lỗi xảy ra khi quay, vui lòng thử lại!');
        }
    }
    
    function resetWheel() {
        if (isSpinning) return;
        
        rotation = 0;
        wheel.style.transform = `rotate(${rotation}deg)`;
        result.textContent = '-';
        wheelResult.style.display = 'none';
        
        if (smartCheatMode) {
            smartCheatMode = false;
            cheatTargetName = null;
            cheatBtnCorner.innerHTML = '<span class="cheat-icon">🎯</span>';
            cheatBtnCorner.classList.remove('active');
        }
        
        const confetti = document.querySelectorAll('.confetti');
        confetti.forEach(c => c.remove());
    }
    
    function addName() {
        const name = nameInput.value.trim();
        if (validateName(name)) {
            names.push(name);
            updateWheel();
            renderNamesList();
            updateStats();
            updateCheatSelect();
            nameInput.value = '';
            saveToLocalStorage();
        }
    }
    
    function handleTextareaInput() {
        const text = namesTextarea.value;
        const newNames = text.split('\n')
            .map(name => name.trim())
            .filter(name => validateName(name));
        
        names = newNames;
        updateWheel();
        renderNamesList();
        updateStats();
        updateCheatSelect();
        saveToLocalStorage();
    }
    
    function renderNamesList() {
        namesList.innerHTML = '';
        
        if (names.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'name-item';
            emptyMsg.textContent = 'Chưa có tên nào';
            emptyMsg.style.justifyContent = 'center';
            emptyMsg.style.color = '#999';
            namesList.appendChild(emptyMsg);
            return;
        }
        
        names.forEach((name, index) => {
            const nameItem = document.createElement('div');
            nameItem.className = 'name-item';
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = name;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = 'Xóa';
            removeBtn.addEventListener('click', () => {
                names.splice(index, 1);
                updateWheel();
                renderNamesList();
                updateStats();
                updateCheatSelect();
                saveToLocalStorage();
            });
            
            nameItem.appendChild(nameSpan);
            nameItem.appendChild(removeBtn);
            namesList.appendChild(nameItem);
        });
    }
    
    function updateStats() {
        entriesCount.textContent = names.length;
        resultsCountElem.textContent = resultsCount;
        escapeCountElem.textContent = escapeCount;
        listCount.textContent = names.length;
    }
    
    function clearList() {
        if (confirm('Bạn có chắc muốn xóa toàn bộ danh sách tên?')) {
            names = [];
            updateWheel();
            renderNamesList();
            updateStats();
            updateCheatSelect();
            namesTextarea.value = '';
            saveToLocalStorage();
        }
    }
    
    function openEditModal() {
        editTitleInput.value = wheelTitle.textContent;
        editDescriptionInput.value = wheelDescription.textContent;
        editModal.style.display = 'flex';
    }
    
    function closeEditModal() {
        editModal.style.display = 'none';
    }
    
    function saveEdit() {
        const newTitle = editTitleInput.value.trim();
        const newDescription = editDescriptionInput.value.trim();
        
        if (newTitle) {
            wheelTitle.textContent = newTitle;
        }
        
        if (newDescription) {
            wheelDescription.textContent = newDescription;
        }
        
        saveToLocalStorage();
        closeEditModal();
    }
    
    function closeResult() {
        wheelResult.style.display = 'none';
        const confetti = document.querySelectorAll('.confetti');
        confetti.forEach(c => c.remove());
    }
    
    function moveResult() {
        escapeCount++;
        updateStats();
        saveToLocalStorage();
        
        wheelResult.style.transform = 'scale(0.8)';
        wheelResult.style.opacity = '0';
        setTimeout(() => {
            wheelResult.style.display = 'none';
            wheelResult.style.transform = 'scale(1)';
            wheelResult.style.opacity = '1';
            const confetti = document.querySelectorAll('.confetti');
            confetti.forEach(c => c.remove());
        }, 300);
    }
    
    // Các hàm tăng cơ hội thông minh
    function openCheatModal() {
        if (names.length === 0) {
            alert('Vui lòng thêm ít nhất một tên vào danh sách trước khi sử dụng tính năng này!');
            return;
        }
        
        updateCheatSelect();
        cheatModal.style.display = 'flex';
    }
    
    function closeCheatModal() {
        cheatModal.style.display = 'none';
        cheatTargetName = null;
        cheatSelect.value = '';
    }
    
    function updateCheatSelect() {
        cheatSelect.innerHTML = '<option value="">-- Chọn tên --</option>';
        
        names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            cheatSelect.appendChild(option);
        });
    }
    
    function handleCheatSelectChange() {
        cheatTargetName = cheatSelect.value;
    }
    
    function confirmCheat() {
        if (!cheatTargetName) {
            alert('Vui lòng chọn một người chiến thắng!');
            return;
        }
        
        const selectedName = cheatTargetName;
        
        closeCheatModal();
        
        setTimeout(() => {
            showProbabilityModal(selectedName);
        }, 300);
    }
    
    function showProbabilityModal(targetName) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Chọn mức độ "may mắn"</h3>
                <div class="input-group">
                    <label>Khả năng trúng thưởng cho "<strong>${targetName}</strong>":</label>
                    <div class="probability-options">
                        <button class="prob-btn" data-prob="30">May mắn nhẹ (30%)</button>
                        <button class="prob-btn" data-prob="50">Khá may mắn (50%)</button>
                        <button class="prob-btn" data-prob="70">Rất may mắn (70%)</button>
                        <button class="prob-btn" data-prob="90">Cực kỳ may mắn (90%)</button>
                        <button class="prob-btn" data-prob="100">Đảm bảo trúng (100%)</button>
                    </div>
                </div>
                <div class="cheat-warning">
                    <p>⚠️ Tính năng này chỉ dành cho mục đích giải trí!</p>
                </div>
                <div class="modal-buttons">
                    <button id="cancel-prob-btn" class="cancel-btn">Hủy bỏ</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelectorAll('.prob-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const probability = parseInt(this.getAttribute('data-prob'));
                activateSmartCheat(targetName, probability);
                document.body.removeChild(modal);
            });
        });
        
        modal.querySelector('#cancel-prob-btn').addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    function activateSmartCheat(targetName, probability) {
        smartCheatMode = true;
        cheatTargetName = targetName;
        cheatProbability = probability;
        
        // Cập nhật nút corner
        cheatBtnCorner.innerHTML = `<span class="cheat-icon">${probability}%</span>`;
        cheatBtnCorner.classList.add('active');
        
        setTimeout(() => {
            cheatBtnCorner.innerHTML = '<span class="cheat-icon">🎯</span>';
            cheatBtnCorner.classList.remove('active');
        }, 3000);
    }
    
    function createConfetti() {
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'];
        const container = document.body;
        
        const oldConfetti = document.querySelectorAll('.confetti');
        oldConfetti.forEach(confetti => confetti.remove());
        
        const isMobile = window.innerWidth < 768;
        const count = isMobile ? 50 : 80;
        
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = Math.random() * 8 + 4 + 'px';
            confetti.style.height = Math.random() * 8 + 4 + 'px';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.position = 'fixed';
            confetti.style.zIndex = '9999';
            confetti.style.willChange = 'transform, opacity';
            confetti.style.animation = `fall ${Math.random() * 2 + 1.5}s linear forwards`;
            
            fragment.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.remove();
                }
            }, 3500);
        }
        
        container.appendChild(fragment);
    }
    
    // Hàm quản lý kết quả gần đây
    function addRecentResult(winner, isCheat) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('vi-VN');
        
        recentResults.unshift({
            name: winner,
            time: timeString,
            isCheat: isCheat
        });
        
        // Giới hạn số lượng kết quả hiển thị
        if (recentResults.length > 5) {
            recentResults = recentResults.slice(0, 5);
        }
        
        updateRecentResults();
        saveToLocalStorage();
    }
    
    function updateRecentResults() {
        recentResultsContainer.innerHTML = '';
        
        if (recentResults.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'recent-result-item';
            emptyMsg.textContent = 'Chưa có kết quả nào';
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.color = 'rgba(255, 255, 255, 0.7)';
            recentResultsContainer.appendChild(emptyMsg);
            return;
        }
        
        recentResults.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'recent-result-item';
            
            let content = `<strong>${result.name}</strong> - ${result.time}`;
            if (result.isCheat) {
                content += ' 🎯';
            }
            
            resultItem.innerHTML = content;
            recentResultsContainer.appendChild(resultItem);
        });
    }
    
    // Hàm xuất kết quả
    function exportResults() {
        const data = {
            title: wheelTitle.textContent,
            description: wheelDescription.textContent,
            names: names,
            resultsCount: resultsCount,
            escapeCount: escapeCount,
            recentResults: recentResults,
            exportDate: new Date().toLocaleString('vi-VN')
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ket-qua-vong-quay.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        // Hiển thị thông báo
        alert('Đã xuất kết quả thành công!');
    }
});