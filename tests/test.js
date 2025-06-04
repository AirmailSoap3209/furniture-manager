// Test Suite for Furniture Manager

// Mock DOM setup
function setupTestDOM() {
    // Create mock elements that our app tries to access
    const mockElements = {
        'buildings-grid': document.createElement('div'),
        'furniture-grid': document.createElement('div'),
        'building-form': document.createElement('form'),
        'floor-form': document.createElement('form'),
        'room-form': document.createElement('form'),
        'furniture-form': document.createElement('form'),
        'category-form': document.createElement('form'),
        'type-form': document.createElement('form'),
        'furniture-search': document.createElement('input'),
        'test-summary': document.createElement('div')
    };

    // Add elements to document
    Object.entries(mockElements).forEach(([id, element]) => {
        element.id = id;
        document.body.appendChild(element);
    });

    // Return cleanup function
    return () => {
        Object.values(mockElements).forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    };
}

// Reset application data
function resetTestData() {
    // Reset furniture categories
    Object.keys(FURNITURE_CATEGORIES).forEach(key => {
        if (!['seating', 'desks', 'storage', 'equipment'].includes(key)) {
            delete FURNITURE_CATEGORIES[key];
        }
    });

    // Reset building data
    data.buildings = [];
}

const TestSuite = {
    passed: 0,
    failed: 0,
    total: 0,

    assert(condition, message) {
        this.total++;
        if (condition) {
            this.passed++;
            console.log(`✅ PASS: ${message}`);
        } else {
            this.failed++;
            console.error(`❌ FAIL: ${message}`);
        }
    },

    assertEqual(actual, expected, message) {
        const condition = JSON.stringify(actual) === JSON.stringify(expected);
        this.assert(condition, `${message} - Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`);
    },

    summarize() {
        console.log('\n=== Test Summary ===');
        console.log(`Total Tests: ${this.total}`);
        console.log(`Passed: ${this.passed}`);
        console.log(`Failed: ${this.failed}`);
        
        // Update the UI
        const summary = document.getElementById('test-summary');
        if (summary) {
            summary.innerHTML = `
                <h3>Test Results</h3>
                <p>Total Tests: ${this.total}</p>
                <p style="color: green;">Passed: ${this.passed}</p>
                <p style="color: red;">Failed: ${this.failed}</p>
            `;
        }
    }
};

// Data Structure Tests
function testDataStructure() {
    console.log('\n=== Testing Data Structure ===');

    // Reset data before test
    resetTestData();

    // Test category creation
    const categoryId = 'test_category';
    const categoryName = 'Test Category';
    const result = addFurnitureCategory(categoryId, categoryName);
    TestSuite.assert(result !== null, 'Should create new category');

    const categories = getFurnitureCategories();
    TestSuite.assert(categories[categoryId] !== undefined, 'Category should exist in categories');
    TestSuite.assertEqual(categories[categoryId].name, categoryName, 'Category should have correct name');

    // Test furniture type creation
    const typeResult = addFurnitureType(categoryId, 'Test Type', 'Test Description', 'test.jpg');
    TestSuite.assert(typeResult !== null, 'Should create new furniture type');
    TestSuite.assertEqual(categories[categoryId].types.length, 1, 'Category should have one type');

    // Test duplicate category prevention
    const duplicateResult = addFurnitureCategory(categoryId, 'Duplicate');
    TestSuite.assert(duplicateResult === null, 'Should prevent duplicate category creation');

    // Test duplicate type prevention
    const duplicateType = addFurnitureType(categoryId, 'Test Type', 'Another description', 'another.jpg');
    TestSuite.assert(duplicateType === null, 'Should prevent duplicate type creation');
}

// Building Management Tests
function testBuildingManagement() {
    console.log('\n=== Testing Building Management ===');

    // Reset data before test
    resetTestData();

    // Test building creation
    const buildingName = 'Test Building';
    const building = addBuilding(buildingName);
    TestSuite.assert(building !== null, 'Should create new building');
    TestSuite.assertEqual(building.name, buildingName, 'Building should have correct name');

    // Test floor addition
    const floor = addFloor(building.id, 'First Floor');
    TestSuite.assert(floor !== null, 'Should create new floor');
    TestSuite.assertEqual(floor.name, 'First Floor', 'Floor should have correct name');

    // Test room addition
    const room = addRoom(building.id, floor.id, 'Room 101');
    TestSuite.assert(room !== null, 'Should create new room');
    TestSuite.assertEqual(room.name, 'Room 101', 'Room should have correct name');
}

// Furniture Management Tests
function testFurnitureManagement() {
    console.log('\n=== Testing Furniture Management ===');

    // Reset data before test
    resetTestData();

    // Create test data
    const building = addBuilding('Test Building');
    const floor = addFloor(building.id, 'First Floor');
    const room = addRoom(building.id, floor.id, 'Room 101');
    const categoryId = 'test_furniture';
    addFurnitureCategory(categoryId, 'Test Furniture');
    addFurnitureType(categoryId, 'Test Chair', 'A test chair', 'chair.jpg');

    // Test furniture addition
    const furnitureData = {
        type: 'Test Chair',
        description: 'A test chair',
        image: 'chair.jpg',
        quantity: 5
    };

    const furniture = addFurniture(building.id, floor.id, room.id, furnitureData);
    TestSuite.assert(furniture !== null, 'Should add furniture to room');
    TestSuite.assertEqual(furniture.quantity, 5, 'Furniture should have correct quantity');

    // Test furniture retrieval
    const allFurniture = getAllFurniture();
    TestSuite.assert(allFurniture.length > 0, 'Should retrieve all furniture');
    TestSuite.assert(
        allFurniture.some(f => f.type === 'Test Chair' && f.quantity === 5),
        'Should find added furniture in full list'
    );
}

// Data Persistence Tests
function testDataPersistence() {
    console.log('\n=== Testing Data Persistence ===');

    // Reset data and localStorage before test
    resetTestData();
    localStorage.clear();

    // Create test data
    const building = addBuilding('Test Building');
    TestSuite.assert(building !== null, 'Should create new building');
    
    const floor = addFloor(building.id, 'First Floor');
    TestSuite.assert(floor !== null, 'Should create new floor');
    
    const room = addRoom(building.id, floor.id, 'Room 101');
    TestSuite.assert(room !== null, 'Should create new room');
    
    const categoryId = 'test_furniture';
    const category = addFurnitureCategory(categoryId, 'Test Furniture');
    TestSuite.assert(category !== null, 'Should create new category');
    
    const type = addFurnitureType(categoryId, 'Test Chair', 'A test chair', 'chair.jpg');
    TestSuite.assert(type !== null, 'Should create new furniture type');

    // Verify data was saved to localStorage
    const storedDataStr = localStorage.getItem('furnitureManagerData');
    TestSuite.assert(storedDataStr !== null, 'Data should be saved to localStorage');
    
    const storedData = JSON.parse(storedDataStr);
    TestSuite.assert(Array.isArray(storedData.buildings), 'Stored data should have buildings array');
    TestSuite.assert(storedData.buildings.length > 0, 'Buildings should be saved');
    TestSuite.assert(storedData.categories && storedData.categories[categoryId], 'Categories should be saved');

    // Test data loading
    resetTestData();
    loadStoredData();
    
    const buildings = getBuildings();
    TestSuite.assert(Array.isArray(buildings), 'Should get buildings array');
    TestSuite.assert(buildings.length > 0, 'Should load buildings from localStorage');
    TestSuite.assertEqual(buildings[0].name, 'Test Building', 'Should load correct building data');

    const categories = getFurnitureCategories();
    TestSuite.assert(categories[categoryId] !== undefined, 'Should load custom categories from localStorage');
}

// Run all tests
function runTests() {
    // Clear the console output div instead of using console.clear
    const consoleOutput = document.getElementById('console-output');
    if (consoleOutput) {
        consoleOutput.textContent = '';
    }
    console.log('Starting Furniture Manager Tests...\n');
    
    TestSuite.passed = 0;
    TestSuite.failed = 0;
    TestSuite.total = 0;

    // Setup mock DOM elements
    const cleanup = setupTestDOM();

    try {
        testDataStructure();
        testBuildingManagement();
        testFurnitureManagement();
        testDataPersistence();
    } catch (error) {
        console.error('Test execution failed:', error);
    } finally {
        // Clean up mock DOM elements
        cleanup();
        // Clean up localStorage after tests
        localStorage.clear();
    }

    TestSuite.summarize();
} 