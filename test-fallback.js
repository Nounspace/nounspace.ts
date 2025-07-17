// Simple test for the fallback URL logic
function getFallbackUrl(originalUrl) {
  if (originalUrl.includes('nouns.com')) {
    return originalUrl.replace(/nouns\.com/g, 'nouns.wtf');
  }
  return null;
}

// Test cases
const testUrls = [
  'https://www.nouns.com',
  'https://nouns.com/about',
  'https://www.nouns.com/proposals',
  'https://example.com',
  'https://nouns.wtf'
];

console.log('Testing fallback URL logic:');
testUrls.forEach(url => {
  const fallback = getFallbackUrl(url);
  console.log(`${url} -> ${fallback || 'No fallback'}`);
});
