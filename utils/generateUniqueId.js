// Helper function to generate unique export ID
function generateUniqueId() {
  return `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  // Example: EXP-1704067200000-A7X9K2L
}