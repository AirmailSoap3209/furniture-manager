// View switching
function switchView(viewName) {
    document.querySelectorAll('.view-container').forEach(container => {
        container.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${viewName}-view`).classList.add('active');
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
}

// Modal handling
function showModal(type) {
    const modal = document.getElementById(`${type}-modal`);
    modal.classList.add('active');
    
    if (type === 'furniture') {
        // Reset and populate the form
        const categorySelect = document.getElementById('furniture-category');
        const typeSelect = document.getElementById('furniture-type');
        const quantityInput = document.getElementById('furniture-quantity');
        
        // Clear previous values
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        typeSelect.innerHTML = '<option value="">Select Type</option>';
        quantityInput.value = '1';
        
        // Populate categories
        const categories = getFurnitureCategories();
        Object.entries(categories).forEach(([id, category]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } else if (type === 'type') {
        // Store current category for new type
        const categorySelect = document.getElementById('furniture-category');
        document.getElementById('type-form').dataset.categoryId = categorySelect.value;
    }
}

function closeModal(type) {
    const modal = document.getElementById(`${type}-modal`);
    modal.classList.remove('active');
}

// Furniture category and type handling
function updateFurnitureTypes() {
    const categoryId = document.getElementById('furniture-category').value;
    const typeSelect = document.getElementById('furniture-type');
    const categories = getFurnitureCategories();
    
    typeSelect.innerHTML = '<option value="">Select Type</option>';
    
    if (categoryId && categories[categoryId]) {
        categories[categoryId].types.forEach((type, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = type.type;
            typeSelect.appendChild(option);
        });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchView(btn.dataset.view);
        });
    });

    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Building form handler
    document.getElementById('building-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const buildingName = document.getElementById('building-name').value;
        addBuilding(buildingName);
        closeModal('building');
        renderBuildings();
    });

    // Floor form handler
    document.getElementById('floor-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const floorName = document.getElementById('floor-name').value;
        const buildingId = parseInt(e.target.dataset.buildingId);
        addFloor(buildingId, floorName);
        closeModal('floor');
        renderBuildings();
    });

    // Room form handler
    document.getElementById('room-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const roomName = document.getElementById('room-name').value;
        const buildingId = parseInt(e.target.dataset.buildingId);
        const floorId = parseInt(e.target.dataset.floorId);
        addRoom(buildingId, floorId, roomName);
        closeModal('room');
        renderBuildings();
    });

    // Category form handler
    document.getElementById('category-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('category-id').value.toLowerCase();
        const name = document.getElementById('category-name').value;
        
        if (addFurnitureCategory(id, name)) {
            closeModal('category');
            
            // Update furniture modal dropdowns
            const categorySelect = document.getElementById('furniture-category');
            categorySelect.innerHTML = '<option value="">Select Category</option>';
            Object.entries(getFurnitureCategories()).forEach(([catId, category]) => {
                const option = document.createElement('option');
                option.value = catId;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
            categorySelect.value = id;
            updateFurnitureTypes();
            
            // Clear the form
            document.getElementById('category-id').value = '';
            document.getElementById('category-name').value = '';
            
            // Refresh the furniture view
            renderFurniture();
        } else {
            alert('A category with this ID already exists. Please choose a different ID.');
        }
    });

    // Type form handler
    document.getElementById('type-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const categoryId = e.target.dataset.categoryId;
        const type = document.getElementById('type-name').value;
        const description = document.getElementById('type-description').value;
        const image = document.getElementById('type-image').value;
        
        if (addFurnitureType(categoryId, type, description, image)) {
            closeModal('type');
            updateFurnitureTypes();
            
            // Select the new type
            const typeSelect = document.getElementById('furniture-type');
            typeSelect.value = getFurnitureCategories()[categoryId].types.length - 1;
            
            // Clear the form
            document.getElementById('type-name').value = '';
            document.getElementById('type-description').value = '';
            document.getElementById('type-image').value = '';
            
            // Refresh the furniture view
            renderFurniture();
        } else {
            alert('Failed to add furniture type. Please make sure a category is selected.');
        }
    });

    // Furniture form handler
    document.getElementById('furniture-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const categoryId = document.getElementById('furniture-category').value;
        const typeIndex = document.getElementById('furniture-type').value;
        const quantity = parseInt(document.getElementById('furniture-quantity').value);
        
        if (!categoryId || typeIndex === '') {
            alert('Please select both category and type');
            return;
        }
        
        const categories = getFurnitureCategories();
        const furnitureType = categories[categoryId].types[parseInt(typeIndex)];
        const furnitureData = {
            ...furnitureType,
            quantity: quantity
        };
        
        const { buildingId, floorId, roomId } = e.target.dataset;
        if (addFurniture(parseInt(buildingId), parseInt(floorId), parseInt(roomId), furnitureData)) {
            closeModal('furniture');
            renderBuildings();
            renderFurniture();
        } else {
            alert('Failed to add furniture. Please check all values and try again.');
        }
    });

    // Search and filter
    document.getElementById('furniture-search').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterFurniture(searchTerm);
    });
}); 