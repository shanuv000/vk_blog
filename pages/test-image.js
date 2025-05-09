import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { extractImageDimensions, createImageDebugUrl } from '../utils/imageUtils';

const TestImage = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegularImg, setShowRegularImg] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageUrl) {
      setError('Please enter an image URL');
      return;
    }
    
    setLoading(true);
    setError('');
    setTestResults(null);
    
    try {
      // Test the image using our debug API
      const debugUrl = createImageDebugUrl(imageUrl);
      const response = await fetch(debugUrl);
      const data = await response.json();
      
      // Extract dimensions
      const dimensions = extractImageDimensions(imageUrl);
      
      setTestResults({
        ...data,
        extractedDimensions: dimensions
      });
    } catch (err) {
      setError(`Error testing image: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Image Testing Tool | urTechy Blog</title>
      </Head>
      
      <h1 className="text-3xl font-bold mb-6">Image Testing Tool</h1>
      <p className="mb-6 text-gray-700">
        Use this tool to test if an image URL is accessible and can be displayed correctly.
      </p>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="imageUrl" className="block text-gray-700 mb-2">
            Image URL
          </label>
          <input
            type="text"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Image'}
          </button>
          
          <button
            type="button"
            onClick={() => setShowRegularImg(!showRegularImg)}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
          >
            {showRegularImg ? 'Use Next.js Image' : 'Use Regular Img Tag'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {imageUrl && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Preview</h2>
          <div className="border border-gray-200 rounded-md p-4">
            {showRegularImg ? (
              <img
                src={imageUrl}
                alt="Test image"
                className="max-w-full h-auto rounded-md"
                style={{ maxHeight: '400px' }}
                onError={() => setError('Failed to load image with regular img tag')}
              />
            ) : (
              <div style={{ position: 'relative', height: '400px' }}>
                <Image
                  src={imageUrl}
                  alt="Test image"
                  fill
                  style={{ objectFit: 'contain' }}
                  onError={() => setError('Failed to load image with Next.js Image component')}
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      {testResults && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Test Results</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-2">Status</h3>
                <p className={testResults.success ? 'text-green-600' : 'text-red-600'}>
                  {testResults.success ? 'Success' : 'Failed'}
                </p>
                {testResults.status && (
                  <p>
                    HTTP Status: {testResults.status} {testResults.statusText}
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Content Type</h3>
                <p>{testResults.contentType || 'Unknown'}</p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Extracted Dimensions</h3>
                <p>
                  Width: {testResults.extractedDimensions.width || 'Not detected'}<br />
                  Height: {testResults.extractedDimensions.height || 'Not detected'}
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Timestamp</h3>
                <p>{new Date(testResults.timestamp).toLocaleString()}</p>
              </div>
            </div>
            
            {testResults.headers && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">Response Headers</h3>
                <pre className="bg-gray-100 p-2 rounded-md text-xs overflow-auto max-h-40">
                  {JSON.stringify(testResults.headers, null, 2)}
                </pre>
              </div>
            )}
            
            {testResults.error && (
              <div className="mt-4">
                <h3 className="font-bold mb-2 text-red-600">Error</h3>
                <p>{testResults.message}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestImage;
