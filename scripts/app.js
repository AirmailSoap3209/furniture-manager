// Rendering functions
function renderBuildings() {
    const buildingsGrid = document.getElementById('buildings-grid');
    buildingsGrid.innerHTML = '';
    
    getBuildings().forEach(building => {
        const buildingCard = document.createElement('div');
        buildingCard.className = 'building-card';
        
        buildingCard.innerHTML = `
            <div class="building-header">
                <h3 class="building-title">${building.name}</h3>
                <div class="building-actions">
                    <button class="btn-secondary" onclick="showModal('floor'); document.getElementById('floor-form').dataset.buildingId = ${building.id}">
                        <i class="fas fa-plus"></i> Add Floor
                    </button>
                    <button class="btn-danger" onclick="deleteBuilding(${building.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="floor-list">
                ${renderFloors(building)}
            </div>
        `;
        
        buildingsGrid.appendChild(buildingCard);
    });
}

function renderFloors(building) {
    return building.floors.map(floor => `
        <div class="floor-item">
            <div class="floor-header">
                <h4>${floor.name}</h4>
                <div class="floor-actions">
                    <button class="btn-secondary" onclick="showModal('room'); Object.assign(document.getElementById('room-form').dataset, {buildingId: ${building.id}, floorId: ${floor.id}})">
                        <i class="fas fa-plus"></i> Add Room
                    </button>
                    <button class="btn-danger" onclick="deleteFloor(${building.id}, ${floor.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="room-list">
                ${renderRooms(building.id, floor)}
            </div>
        </div>
    `).join('');
}

function renderRooms(buildingId, floor) {
    return floor.rooms.map(room => {
        // Group furniture by type and get quantities
        const furnitureSummary = room.furniture.reduce((acc, item) => {
            acc[item.type] = {
                id: item.id,
                count: (acc[item.type]?.count || 0) + item.quantity
            };
            return acc;
        }, {});

        // Create summary text with delete buttons
        const summaryItems = Object.entries(furnitureSummary)
            .map(([type, {id, count}]) => `
                <div class="furniture-item">
                    <span>${count} ${type}${count > 1 ? 's' : ''}</span>
                    <div class="furniture-controls">
                        <button class="btn-quantity" onclick="adjustFurnitureQuantity(${buildingId}, ${floor.id}, ${room.id}, ${id}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button class="btn-danger btn-small" onclick="removeFurniture(${buildingId}, ${floor.id}, ${room.id}, ${id})">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-quantity" onclick="adjustFurnitureQuantity(${buildingId}, ${floor.id}, ${room.id}, ${id}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            `)
            .join('');

        return `
            <div class="room-item">
                <div class="room-info">
                    <span class="room-name">${room.name}</span>
                    <div class="room-furniture-list">
                        ${summaryItems || '<span class="room-empty">No furniture</span>'}
                    </div>
                </div>
                <div class="room-actions">
                    <button class="btn-secondary" onclick="showModal('furniture'); Object.assign(document.getElementById('furniture-form').dataset, {buildingId: ${buildingId}, floorId: ${floor.id}, roomId: ${room.id}})">
                        <i class="fas fa-plus"></i> Add Furniture
                    </button>
                    <button class="btn-danger" onclick="deleteRoom(${buildingId}, ${floor.id}, ${room.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderFurniture() {
    const furnitureGrid = document.getElementById('furniture-grid');
    furnitureGrid.innerHTML = '';
    
    // Get all furniture and group by type
    const furnitureByType = getAllFurniture().reduce((acc, item) => {
        const key = item.type;
        if (!acc[key]) {
            acc[key] = {
                type: item.type,
                description: item.description,
                image: item.image,
                total: 0,
                distribution: {},
                category: Object.entries(getFurnitureCategories()).find(([_, cat]) => 
                    cat.types.some(t => t.type === item.type)
                )?.[0] || 'other'
            };
        }
        acc[key].total += item.quantity;
        
        const roomKey = `${item.building} - ${item.floor} - ${item.room}`;
        if (!acc[key].distribution[roomKey]) {
            acc[key].distribution[roomKey] = {
                count: 0
            };
        }
        acc[key].distribution[roomKey].count += item.quantity;
        
        return acc;
    }, {});

    // Create all category containers first
    const categories = {};
    Object.entries(getFurnitureCategories()).forEach(([id, cat]) => {
        const div = document.createElement('div');
        div.className = 'furniture-category';
        div.innerHTML = `
            <h3 class="category-title">
                ${cat.name}
                <span class="category-type-count">${cat.types.length} types</span>
            </h3>
            ${cat.types.length === 0 ? 
                '<p class="empty-category">No furniture types defined yet. Click "Add Furniture" and then "New Type" to add some!</p>' 
                : ''}
        `;
        categories[id] = div;
    });

    // Add "Other" category for any unmatched items
    categories.other = document.createElement('div');
    categories.other.className = 'furniture-category';
    categories.other.innerHTML = '<h3 class="category-title">Other</h3>';

    // Sort and add furniture items to their categories
    Object.values(furnitureByType).forEach(furniture => {
        const summaryCard = document.createElement('div');
        summaryCard.className = 'furniture-summary-card';
        
        const roomList = Object.entries(furniture.distribution)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([room, data]) => {
                return `
                    <div class="room-distribution">
                        <span class="room-name">${room}</span>
                        <div class="room-count">
                            <span class="count-badge">${data.count}</span>
                        </div>
                    </div>
                `;
            }).join('');

        summaryCard.innerHTML = `
            <div class="summary-header">
                <div class="summary-info">
                    <img src="${furniture.image}" alt="${furniture.type}" class="summary-image">
                    <div class="summary-details">
                        <h3 class="furniture-type">${furniture.type}</h3>
                        <p class="furniture-description">${furniture.description}</p>
                        <p class="total-count">Total Count: ${furniture.total}</p>
                    </div>
                </div>
            </div>
            <div class="distribution-list">
                <h4>Distribution</h4>
                ${roomList || '<p class="no-distribution">No items placed yet</p>'}
            </div>
        `;

        const category = categories[furniture.category] || categories.other;
        category.appendChild(summaryCard);
    });

    // Add all categories to the grid
    Object.entries(getFurnitureCategories()).forEach(([id, _]) => {
        furnitureGrid.appendChild(categories[id]);
    });

    // Add "Other" category only if it has items
    if (categories.other.children.length > 1) { // > 1 because of the title
        furnitureGrid.appendChild(categories.other);
    }
}

// Data management functions
function addBuilding(name) {
    const newBuilding = {
        id: Date.now(),
        name: name,
        floors: []
    };
    data.buildings.push(newBuilding);
    return newBuilding;
}

function addFloor(buildingId, name) {
    const building = data.buildings.find(b => b.id === parseInt(buildingId));
    if (!building) return null;
    
    const newFloor = {
        id: Date.now(),
        name: name,
        rooms: []
    };
    building.floors.push(newFloor);
    return newFloor;
}

function deleteBuilding(buildingId) {
    if (confirm('Are you sure you want to delete this building and all its contents?')) {
        data.buildings = data.buildings.filter(b => b.id !== buildingId);
        renderBuildings();
    }
}

function deleteFloor(buildingId, floorId) {
    if (confirm('Are you sure you want to delete this floor and all its contents?')) {
        const building = data.buildings.find(b => b.id === buildingId);
        if (building) {
            building.floors = building.floors.filter(f => f.id !== floorId);
            renderBuildings();
        }
    }
}

function deleteRoom(buildingId, floorId, roomId) {
    if (confirm('Are you sure you want to delete this room and all its contents?')) {
        const building = data.buildings.find(b => b.id === buildingId);
        if (building) {
            const floor = building.floors.find(f => f.id === floorId);
            if (floor) {
                floor.rooms = floor.rooms.filter(r => r.id !== roomId);
                renderBuildings();
                renderFurniture();
            }
        }
    }
}

function editFurniture(buildingId, floorId, roomId, furnitureId) {
    const furniture = getRoomFurniture(buildingId, floorId, roomId).find(f => f.id === furnitureId);
    if (!furniture) return;

    // Populate the form
    document.getElementById('furniture-type').value = furniture.type;
    document.getElementById('furniture-description').value = furniture.description;
    document.getElementById('furniture-condition').value = furniture.condition;
    document.getElementById('furniture-image').value = furniture.image;

    // Set the form data attributes
    Object.assign(document.getElementById('furniture-form').dataset, {
        buildingId,
        floorId,
        roomId,
        furnitureId
    });

    showModal('furniture');
}

function filterFurniture(searchTerm = '', condition = '') {
    const furnitureItems = getAllFurniture();
    const filteredItems = furnitureItems.filter(item => {
        const matchesSearch = !searchTerm || 
            item.type.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.room.toLowerCase().includes(searchTerm);
        
        const matchesCondition = !condition || item.condition === condition;
        
        return matchesSearch && matchesCondition;
    });

    const furnitureGrid = document.getElementById('furniture-grid');
    furnitureGrid.innerHTML = '';
    
    if (filteredItems.length === 0) {
        furnitureGrid.innerHTML = '<p class="no-results">No furniture items found matching your criteria.</p>';
        return;
    }

    filteredItems.forEach(item => {
        const furnitureCard = document.createElement('div');
        furnitureCard.className = 'furniture-card';
        
        furnitureCard.innerHTML = `
            <img src="${item.image}" alt="${item.type}" class="furniture-image">
            <div class="furniture-details">
                <h3 class="furniture-type">${item.type}</h3>
                <p class="furniture-description">${item.description}</p>
                <div class="furniture-meta">
                    <span>${item.room} - ${item.floor}</span>
                    <span class="furniture-condition condition-${item.condition.toLowerCase()}">${item.condition}</span>
                </div>
                <div class="form-actions" style="margin-top: 1rem;">
                    <button class="btn-secondary" onclick="editFurniture(${item.buildingId}, ${item.floorId}, ${item.roomId}, ${item.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-danger" onclick="deleteFurniture(${item.buildingId}, ${item.floorId}, ${item.roomId}, ${item.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        
        furnitureGrid.appendChild(furnitureCard);
    });
}

// Edit Mode Toggle
document.getElementById('edit-mode-toggle').addEventListener('change', function(e) {
    document.body.classList.toggle('edit-mode', e.target.checked);
    // Save edit mode state to localStorage
    localStorage.setItem('editMode', e.target.checked);
});

// Load edit mode state on page load
document.addEventListener('DOMContentLoaded', function() {
    const editMode = localStorage.getItem('editMode') === 'true';
    document.getElementById('edit-mode-toggle').checked = editMode;
    document.body.classList.toggle('edit-mode', editMode);
});

// Function to remove furniture
function removeFurniture(buildingId, floorId, roomId, furnitureId) {
    if (confirm('Are you sure you want to remove this furniture?')) {
        const building = data.buildings.find(b => b.id === buildingId);
        const floor = building.floors.find(f => f.id === floorId);
        const room = floor.rooms.find(r => r.id === roomId);
        room.furniture = room.furniture.filter(f => f.id !== furnitureId);
        
        // Save data and refresh views
        saveData();
        renderBuildings();
        renderFurniture();
    }
}

// Function to adjust furniture quantity
function adjustFurnitureQuantity(buildingId, floorId, roomId, furnitureId, change) {
    const building = data.buildings.find(b => b.id === buildingId);
    const floor = building.floors.find(f => f.id === floorId);
    const room = floor.rooms.find(r => r.id === roomId);
    const furniture = room.furniture.find(f => f.id === furnitureId);
    
    if (furniture) {
        const newQuantity = furniture.quantity + change;
        
        if (newQuantity <= 0) {
            // If quantity would become 0 or negative, ask to remove the furniture
            if (confirm('Remove this furniture completely?')) {
                room.furniture = room.furniture.filter(f => f.id !== furnitureId);
            }
        } else {
            furniture.quantity = newQuantity;
        }
        
        // Save data and refresh views
        saveData();
        renderBuildings();
        renderFurniture();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    renderBuildings();
    renderFurniture();
}); 