// Test Plant Detection Functionality
// This script demonstrates the plant detection system

console.log('🌱 Testing Virtual Garden Plant Detection System');

// Test the API service
async function testPlantDetection() {
  try {
    // Check if the API service is loaded
    if (typeof PlantDetectionAPI !== 'undefined') {
      console.log('✅ PlantDetectionAPI is available');
      
      // Test health check
      const health = await PlantDetectionAPI.checkHealth();
      console.log('Backend Health:', health ? '✅ Available' : '❌ Unavailable (using fallback)');
      
      if (!health) {
        console.log('🔄 Backend not available - demonstrating fallback detection');
        
        // Create a mock file for testing
        const testImage = new File(['test'], 'test-plant.jpg', { type: 'image/jpeg' });
        
        try {
          const result = await PlantDetectionAPI.fallbackDetection(testImage);
          console.log('📊 Fallback Detection Result:', result);
          
          if (result.plants && result.plants.length > 0) {
            console.log('🌿 Detected Plants:');
            result.plants.forEach((plant, index) => {
              console.log(`  ${index + 1}. ${plant.label}`);
              console.log(`     Scientific: ${plant.scientific_name}`);
              console.log(`     Confidence: ${Math.round(plant.confidence * 100)}%`);
              console.log(`     Category: ${plant.category}`);
              console.log(`     Properties: ${plant.properties.join(', ')}`);
            });
          }
        } catch (error) {
          console.error('❌ Fallback detection failed:', error);
        }
      }
      
    } else {
      console.log('❌ PlantDetectionAPI not found - checking if modules are loaded');
    }
    
    // Test if the plant database is accessible
    if (typeof mockPlantDatabase !== 'undefined') {
      console.log(`📚 Plant Database: ${mockPlantDatabase.length} plants available`);
      console.log('Available categories:', [...new Set(mockPlantDatabase.map(p => p.category))]);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Instructions for manual testing
console.log(`
🧪 MANUAL TESTING INSTRUCTIONS:

1. Frontend Testing (Current):
   - The Virtual Garden is running at your current URL
   - Try uploading any image (even non-plant images work for testing)
   - Check if bounding boxes appear
   - Verify plant information shows in sidebar

2. Backend Setup (Local Development):
   \`\`\`bash
   cd ml-backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   \`\`\`

3. API Testing:
   - Health check: http://localhost:8000/health
   - API docs: http://localhost:8000/docs
   - Test upload via API docs interface

4. Expected Results:
   ✅ Image upload works
   ✅ Plant detection results appear (fallback or real)
   ✅ Bounding boxes show on images
   ✅ Plant info displays with confidence scores
   ✅ 3D garden allows adding detected plants
`);

// Run the test
testPlantDetection();
