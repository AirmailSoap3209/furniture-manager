// Furniture Categories and Types
const FURNITURE_CATEGORIES = {
    seating: {
        name: "Seating",
        types: [
            {
                type: "Student Chair - Standard",
                description: "Standard plastic student chair with metal frame",
                image: "https://cdn.corenexis.com/i/mm/ju10/jkMznU.png?token=d132213e2811723f3708d260531c34a0"
            },
            {
                type: "Student Chair - Adjustable",
                description: "Height-adjustable student chair with ergonomic design",
                image: "https://rework-furniture.com/cdn/shop/files/l_Qvzdtg_5712de7f-f646-49b2-bfde-5228b102ff57.jpg?v=1722346203"
            },
            {
                type: "Teacher Chair - Ergonomic",
                description: "Ergonomic office chair with lumbar support and adjustable features",
                image: "https://cdn.corenexis.com/i/mm/ju10/IDoS9q.jpg?token=d132213e2811723f3708d260531c34a0"
            }
        ]
    },
    desks: {
        name: "Desks",
        types: [
            {
                type: "Student Desk - Standard",
                description: "Standard student desk with storage shelf",
                image: "https://cdn.corenexis.com/i/mm/ju10/RsG37c.png?token=d132213e2811723f3708d260531c34a0"
            },
            {
                type: "Computer Desk",
                description: "Computer desk with cable management and keyboard tray",
                image: "https://cdn.corenexis.com/i/mm/ju10/9kZLEm.png?token=d132213e2811723f3708d260531c34a0"
            },
            {
                type: "Standard Table",
                description: "A Standard Table that seats 2 students",
                image: "https://cdn.corenexis.com/i/mm/ju10/3la5f5.jpg?token=d132213e2811723f3708d260531c34a0"
            }
        ]
    },
    storage: {
        name: "Storage",
        types: []
    },
    equipment: {
        name: "Equipment",
        types: []
    }
};

// Sample data structure
const data = {
    buildings: [
        {
            id: 1,
            name: "STEM IA High School",
            floors: [
                {
                    id: 1,
                    name: "First Floor",
                    rooms: [
                        {
                            id: 1,
                            name: "Room 101",
                            furniture: [
                                {
                                    id: 1,
                                    ...FURNITURE_CATEGORIES.seating.types[0],
                                    quantity: 25
                                },
                                {
                                    id: 2,
                                    ...FURNITURE_CATEGORIES.desks.types[0],
                                    quantity: 25
                                }
                            ]
                        },
                        {
                            id: 2,
                            name: "Computer Lab",
                            furniture: [
                                {
                                    id: 3,
                                    ...FURNITURE_CATEGORIES.seating.types[1],
                                    quantity: 30
                                },
                                {
                                    id: 4,
                                    ...FURNITURE_CATEGORIES.desks.types[2],
                                    quantity: 30
                                }
                            ]
                        },
                        {
                            id: 3,
                            name: "Science Lab",
                            furniture: [
                                {
                                    id: 5,
                                    ...FURNITURE_CATEGORIES.seating.types[3],
                                    quantity: 10
                                },
                                {
                                    id: 6,
                                    ...FURNITURE_CATEGORIES.desks.types[3],
                                    quantity: 10
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 2,
                    name: "Second Floor",
                    rooms: [
                        {
                            id: 4,
                            name: "Room 201",
                            furniture: [
                                {
                                    id: 7,
                                    ...FURNITURE_CATEGORIES.seating.types[0],
                                    quantity: 15
                                },
                                {
                                    id: 8,
                                    ...FURNITURE_CATEGORIES.desks.types[0],
                                    quantity: 15
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};

// Function to get all buildings
function getBuildings() {
    return data.buildings;
}

// Function to get floors for a building
function getFloors(buildingId) {
    const building = data.buildings.find(b => b.id === buildingId);
    return building ? building.floors : [];
}

// Function to get rooms for a floor
function getRooms(buildingId, floorId) {
    const building = data.buildings.find(b => b.id === buildingId);
    if (!building) return [];
    
    const floor = building.floors.find(f => f.id === floorId);
    return floor ? floor.rooms : [];
}

// Function to get all furniture categories
function getFurnitureCategories() {
    return FURNITURE_CATEGORIES;
}

// Function to add a new furniture category
function addFurnitureCategory(id, name) {
    // Check if category already exists
    if (FURNITURE_CATEGORIES[id]) {
        return null;
    }
    
    // Create new category
    FURNITURE_CATEGORIES[id] = {
        name,
        types: []
    };
    
    return FURNITURE_CATEGORIES[id];
}

// Function to add a new furniture type to a category
function addFurnitureType(categoryId, type, description, image) {
    if (!FURNITURE_CATEGORIES[categoryId]) {
        return null;
    }
    
    // Check if type already exists in category
    const existingType = FURNITURE_CATEGORIES[categoryId].types.find(t => t.type === type);
    if (existingType) {
        return null;
    }
    
    const newType = {
        type,
        description,
        image
    };
    
    FURNITURE_CATEGORIES[categoryId].types.push(newType);
    return newType;
}

// Function to get all furniture items
function getAllFurniture() {
    const furnitureList = [];
    data.buildings.forEach(building => {
        building.floors.forEach(floor => {
            floor.rooms.forEach(room => {
                room.furniture.forEach(item => {
                    furnitureList.push({
                        ...item,
                        room: room.name,
                        floor: floor.name,
                        building: building.name,
                        roomId: room.id,
                        floorId: floor.id,
                        buildingId: building.id
                    });
                });
            });
        });
    });
    return furnitureList;
}

// Function to get furniture for a specific room
function getRoomFurniture(buildingId, floorId, roomId) {
    const building = data.buildings.find(b => b.id === buildingId);
    if (!building) return [];
    
    const floor = building.floors.find(f => f.id === floorId);
    if (!floor) return [];
    
    const room = floor.rooms.find(r => r.id === roomId);
    return room ? room.furniture : [];
}

// Function to add a new room
function addRoom(buildingId, floorId, roomName) {
    const building = data.buildings.find(b => b.id === buildingId);
    if (!building) return null;
    
    const floor = building.floors.find(f => f.id === floorId);
    if (!floor) return null;
    
    const newRoom = {
        id: Date.now(),
        name: roomName,
        furniture: []
    };
    
    floor.rooms.push(newRoom);
    return newRoom;
}

// Function to add new furniture
function addFurniture(buildingId, floorId, roomId, furnitureData) {
    const building = data.buildings.find(b => b.id === buildingId);
    if (!building) return null;
    
    const floor = building.floors.find(f => f.id === floorId);
    if (!floor) return null;
    
    const room = floor.rooms.find(r => r.id === roomId);
    if (!room) return null;
    
    const newFurniture = {
        id: Date.now(),
        ...furnitureData
    };
    
    room.furniture.push(newFurniture);
    return newFurniture;
}

// Function to update furniture
function updateFurniture(buildingId, floorId, roomId, furnitureId, updatedData) {
    const building = data.buildings.find(b => b.id === buildingId);
    if (!building) return null;
    
    const floor = building.floors.find(f => f.id === floorId);
    if (!floor) return null;
    
    const room = floor.rooms.find(r => r.id === roomId);
    if (!room) return null;
    
    const furnitureIndex = room.furniture.findIndex(f => f.id === furnitureId);
    if (furnitureIndex === -1) return null;
    
    room.furniture[furnitureIndex] = {
        ...room.furniture[furnitureIndex],
        ...updatedData
    };
    
    return room.furniture[furnitureIndex];
}

// Function to delete furniture
function deleteFurniture(buildingId, floorId, roomId, furnitureId) {
    const building = data.buildings.find(b => b.id === buildingId);
    if (!building) return false;
    
    const floor = building.floors.find(f => f.id === floorId);
    if (!floor) return false;
    
    const room = floor.rooms.find(r => r.id === roomId);
    if (!room) return false;
    
    const initialLength = room.furniture.length;
    room.furniture = room.furniture.filter(f => f.id !== furnitureId);
    
    return room.furniture.length !== initialLength;
}

// Load data from localStorage or use defaults
function loadStoredData() {
    const storedData = localStorage.getItem('furnitureManagerData');
    if (storedData) {
        const parsed = JSON.parse(storedData);
        data.buildings = parsed.buildings || [];
        
        // Merge stored categories with default ones
        Object.entries(parsed.categories || {}).forEach(([id, category]) => {
            if (!FURNITURE_CATEGORIES[id]) {
                FURNITURE_CATEGORIES[id] = category;
            }
        });
    }
}

// Save current data to localStorage
function saveData() {
    const dataToSave = {
        buildings: data.buildings,
        categories: FURNITURE_CATEGORIES
    };
    localStorage.setItem('furnitureManagerData', JSON.stringify(dataToSave));
}

// Add save calls to all data modification functions
const originalAddBuilding = addBuilding;
addBuilding = function(...args) {
    const result = originalAddBuilding.apply(this, args);
    if (result) saveData();
    return result;
};

const originalAddFloor = addFloor;
addFloor = function(...args) {
    const result = originalAddFloor.apply(this, args);
    if (result) saveData();
    return result;
};

const originalAddRoom = addRoom;
addRoom = function(...args) {
    const result = originalAddRoom.apply(this, args);
    if (result) saveData();
    return result;
};

const originalAddFurniture = addFurniture;
addFurniture = function(...args) {
    const result = originalAddFurniture.apply(this, args);
    if (result) saveData();
    return result;
};

const originalAddFurnitureCategory = addFurnitureCategory;
addFurnitureCategory = function(...args) {
    const result = originalAddFurnitureCategory.apply(this, args);
    if (result) saveData();
    return result;
};

const originalAddFurnitureType = addFurnitureType;
addFurnitureType = function(...args) {
    const result = originalAddFurnitureType.apply(this, args);
    if (result) saveData();
    return result;
};

// Function to add a new building
function addBuilding(name) {
    const newBuilding = {
        id: Date.now(),
        name: name,
        floors: []
    };
    
    data.buildings.push(newBuilding);
    return newBuilding;
}

// Function to add a new floor
function addFloor(buildingId, floorName) {
    const building = data.buildings.find(b => b.id === buildingId);
    if (!building) return null;
    
    const newFloor = {
        id: Date.now(),
        name: floorName,
        rooms: []
    };
    
    building.floors.push(newFloor);
    return newFloor;
}

// Initialize empty data structure if not already defined
if (!data.buildings) {
    data.buildings = [];
}

// Load data when the script initializes
loadStoredData(); 
