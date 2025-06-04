// DOM Elements
const buildingSelect = document.getElementById('buildingFilter');
const floorSelect = document.getElementById('floorFilter');
const roomSelect = document.getElementById('roomFilter');
const roomView = document.getElementById('roomView');
const furnitureView = document.getElementById('furnitureView');
const roomContent = document.getElementById('roomContent');
const furnitureContent = document.getElementById('furnitureContent');
const navButtons = document.querySelectorAll('.nav-btn');

// Current state
let currentView = 'room';
let currentBuilding = null;
let currentFloor = null;
let currentRoom = null;
let editingItemId = null;

// Initialize the application
function init() {
    populateBuildingSelect();
    setupEventListeners();
    updateView();
}

// Setup event listeners
function setupEventListeners() {
    buildingSelect.addEventListener('change', onBuildingChange);
    floorSelect.addEventListener('change', onFloorChange);
    roomSelect.addEventListener('change', onRoomChange);
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentView = btn.dataset.view;
            updateActiveNavButton();
            updateView();
        });
    });
}

// Populate building select
function populateBuildingSelect() {
    const buildings = getBuildings();
    buildingSelect.innerHTML = '<option value="">Select Building</option>';
    buildings.forEach(building => {
        buildingSelect.innerHTML += `<option value="${building.id}">${building.name}</option>`;
    });
}

// Handle building selection change
function onBuildingChange() {
    currentBuilding = parseInt(buildingSelect.value);
    currentFloor = null;
    currentRoom = null;
    
    // Reset dependent dropdowns
    floorSelect.innerHTML = '<option value="">Select Floor</option>';
    roomSelect.innerHTML = '<option value="">Select Room</option>';
    
    if (currentBuilding) {
        const floors = getFloors(currentBuilding);
        floors.forEach(floor => {
            floorSelect.innerHTML += `<option value="${floor.id}">${floor.name}</option>`;
        });
    }
    
    updateView();
}

// Handle floor selection change
function onFloorChange() {
    currentFloor = parseInt(floorSelect.value);
    currentRoom = null;
    
    // Reset room dropdown
    roomSelect.innerHTML = '<option value="">Select Room</option>';
    
    if (currentFloor) {
        const rooms = getRooms(currentBuilding, currentFloor);
        rooms.forEach(room => {
            roomSelect.innerHTML += `<option value="${room.id}">${room.name}</option>`;
        });
    }
    
    updateView();
}

// Handle room selection change
function onRoomChange() {
    currentRoom = parseInt(roomSelect.value);
    updateView();
}

// Update active navigation button
function updateActiveNavButton() {
    navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === currentView);
    });
    
    roomView.classList.toggle('active', currentView === 'room');
    furnitureView.classList.toggle('active', currentView === 'furniture');
}

// Create room card HTML
function createRoomCard(room) {
    const furnitureList = room.furniture.map(item => `
        <li>
            ${item.type} - ${item.condition}
            <div class="card-actions">
                <button class="edit-btn" onclick="editFurniture(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteFurnitureItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>
    `).join('');

    return `
        <div class="room-card">
            <div class="card-title">${room.name}</div>
            <div class="card-content">
                <p>Furniture Items: ${room.furniture.length}</p>
                <ul>${furnitureList}</ul>
            </div>
        </div>
    `;
}

// Create furniture card HTML
function createFurnitureCard(item) {
    return `
        <div class="furniture-card">
            ${item.image ? `<img src="${item.image}" alt="${item.type}" class="card-image">` : ''}
            <div class="card-actions">
                <button class="edit-btn" onclick="editFurniture(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteFurnitureItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="card-title">${item.type}</div>
            <div class="card-content">
                <p>Location: ${item.building} > ${item.floor} > ${item.room}</p>
                <p>Description: ${item.description}</p>
                <p>Condition: ${item.condition}</p>
                <p>Last Checked: ${item.lastChecked}</p>
            </div>
        </div>
    `;
}

// Update the view based on current state
function updateView() {
    if (currentView === 'room') {
        updateRoomView();
    } else {
        updateFurnitureView();
    }
}

// Update room view
function updateRoomView() {
    let content = '';
    
    if (currentBuilding && currentFloor) {
        const rooms = getRooms(currentBuilding, currentFloor);
        if (currentRoom) {
            const room = rooms.find(r => r.id === currentRoom);
            if (room) {
                content = createRoomCard(room);
            }
        } else {
            content = rooms.map(room => createRoomCard(room)).join('');
        }
    }
    
    roomContent.innerHTML = content || '<p>Select a building and floor to view rooms</p>';
}

// Update furniture view
function updateFurnitureView() {
    const allFurniture = getAllFurniture();
    let filteredFurniture = allFurniture;
    
    if (currentBuilding) {
        filteredFurniture = filteredFurniture.filter(item => 
            item.building === getBuildings().find(b => b.id === currentBuilding).name
        );
        
        if (currentFloor) {
            filteredFurniture = filteredFurniture.filter(item =>
                item.floor === getFloors(currentBuilding).find(f => f.id === currentFloor).name
            );
            
            if (currentRoom) {
                filteredFurniture = filteredFurniture.filter(item =>
                    item.room === getRooms(currentBuilding, currentFloor).find(r => r.id === currentRoom).name
                );
            }
        }
    }
    
    furnitureContent.innerHTML = filteredFurniture.map(item => createFurnitureCard(item)).join('') ||
        '<p>No furniture items found</p>';
}

// Modal functions
function openAddRoomModal() {
    editingItemId = null;
    document.getElementById('roomModalTitle').textContent = 'Add Room';
    document.getElementById('roomModal').classList.add('active');
    populateRoomModalSelects();
}

function openAddFurnitureModal() {
    editingItemId = null;
    document.getElementById('furnitureModalTitle').textContent = 'Add Furniture';
    document.getElementById('furnitureModal').classList.add('active');
    populateFurnitureModalSelects();
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    editingItemId = null;
}

function populateRoomModalSelects() {
    const roomBuilding = document.getElementById('roomBuilding');
    const roomFloor = document.getElementById('roomFloor');
    
    // Populate buildings
    roomBuilding.innerHTML = '<option value="">Select Building</option>';
    getBuildings().forEach(building => {
        roomBuilding.innerHTML += `<option value="${building.id}">${building.name}</option>`;
    });
    
    // Handle building change
    roomBuilding.onchange = () => {
        const buildingId = parseInt(roomBuilding.value);
        roomFloor.innerHTML = '<option value="">Select Floor</option>';
        if (buildingId) {
            getFloors(buildingId).forEach(floor => {
                roomFloor.innerHTML += `<option value="${floor.id}">${floor.name}</option>`;
            });
        }
    };
}

function populateFurnitureModalSelects() {
    const furnitureLocation = document.getElementById('furnitureLocation');
    furnitureLocation.innerHTML = '<option value="">Select Room</option>';
    
    getBuildings().forEach(building => {
        building.floors.forEach(floor => {
            floor.rooms.forEach(room => {
                furnitureLocation.innerHTML += `
                    <option value="${building.id},${floor.id},${room.id}">
                        ${building.name} > ${floor.name} > ${room.name}
                    </option>
                `;
            });
        });
    });
}

function handleRoomSubmit(event) {
    event.preventDefault();
    
    const buildingId = parseInt(document.getElementById('roomBuilding').value);
    const floorId = parseInt(document.getElementById('roomFloor').value);
    const roomName = document.getElementById('roomName').value;
    
    if (editingItemId) {
        // TODO: Implement room editing
    } else {
        addRoom(buildingId, floorId, roomName);
    }
    
    closeModal('roomModal');
    updateView();
}

function handleFurnitureSubmit(event) {
    event.preventDefault();
    
    const [buildingId, floorId, roomId] = document.getElementById('furnitureLocation').value.split(',').map(Number);
    const furnitureData = {
        type: document.getElementById('furnitureType').value,
        description: document.getElementById('furnitureDescription').value,
        condition: document.getElementById('furnitureCondition').value,
        image: document.getElementById('furnitureImage').value || null
    };
    
    if (editingItemId) {
        updateFurniture(buildingId, floorId, roomId, editingItemId, furnitureData);
    } else {
        addFurniture(buildingId, floorId, roomId, furnitureData);
    }
    
    closeModal('furnitureModal');
    updateView();
}

function editFurniture(furnitureId) {
    const furniture = getAllFurniture().find(item => item.id === furnitureId);
    if (!furniture) return;
    
    editingItemId = furnitureId;
    document.getElementById('furnitureModalTitle').textContent = 'Edit Furniture';
    document.getElementById('furnitureType').value = furniture.type;
    document.getElementById('furnitureDescription').value = furniture.description;
    document.getElementById('furnitureCondition').value = furniture.condition;
    document.getElementById('furnitureImage').value = furniture.image || '';
    
    const furnitureLocation = document.getElementById('furnitureLocation');
    populateFurnitureModalSelects();
    furnitureLocation.value = `${furniture.buildingId},${furniture.floorId},${furniture.roomId}`;
    
    document.getElementById('furnitureModal').classList.add('active');
}

function deleteFurnitureItem(furnitureId) {
    const furniture = getAllFurniture().find(item => item.id === furnitureId);
    if (!furniture) return;
    
    if (confirm('Are you sure you want to delete this furniture item?')) {
        deleteFurniture(furniture.buildingId, furniture.floorId, furniture.roomId, furnitureId);
        updateView();
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 