import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';

const TestNvidiaImage = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);
  const [nextImgError, setNextImgError] = useState(false);

  // The problematic image URL
  const imageUrl = "https://ap-south-1.graphassets.com/A0wVMTJ4GQepRGqAydCKQz/resize=width:1000,height:621/cmaa1f3vm1x9j07pq02ewqp2v";
  
  // Alternative URLs to try
  const alternativeUrls = [
    // Original URL
    imageUrl,
    // Without resize parameters
    "https://ap-south-1.graphassets.com/A0wVMTJ4GQepRGqAydCKQz/cmaa1f3vm1x9j07pq02ewqp2v",
    // CDN URL format
    "https://ap-south-1.cdn.hygraph.com/content/cky5wgpym15ym01z44tk90zeb/master/cmaa1f3vm1x9j07pq02ewqp2v"
  ];

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const response = await fetch('/api/test-specific-image');
        const data = await response.json();
        setTestResults(data);
      } catch (err) {
        setError(`Error fetching test results: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Test Nvidia RTX 5060 Image | urTechy Blog</title>
      </Head>
      
      <h1 className="text-3xl font-bold mb-6">Test Nvidia RTX 5060 Image</h1>
      <p className="mb-6 text-gray-700">
        This page tests the specific image that's causing issues in the Nvidia RTX 5060 post.
      </p>
      
      {loading ? (
        <div className="text-center py-8">
          <p>Loading test results...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">API Test Results</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Test with regular img tag */}
        <div>
          <h2 className="text-xl font-bold mb-4">Regular img Tag Test</h2>
          <div className="border border-gray-200 rounded-md p-4">
            {imgError ? (
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-600">Failed to load with regular img tag</p>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt="Nvidia RTX 5060"
                className="max-w-full h-auto rounded-md"
                onError={() => setImgError(true)}
              />
            )}
          </div>
        </div>
        
        {/* Test with Next.js Image component */}
        <div>
          <h2 className="text-xl font-bold mb-4">Next.js Image Component Test</h2>
          <div className="border border-gray-200 rounded-md p-4">
            {nextImgError ? (
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-600">Failed to load with Next.js Image</p>
              </div>
            ) : (
              <div style={{ position: 'relative', height: '300px' }}>
                <Image
                  src={imageUrl}
                  alt="Nvidia RTX 5060"
                  fill
                  style={{ objectFit: 'contain' }}
                  onError={() => setNextImgError(true)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <h2 className="text-xl font-bold mb-4">Alternative URLs Test</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alternativeUrls.map((url, index) => (
          <div key={index} className="border border-gray-200 rounded-md p-4">
            <h3 className="font-bold mb-2">Alternative URL {index + 1}</h3>
            <p className="text-xs mb-2 break-all">{url}</p>
            <img
              src={url}
              alt={`Alternative ${index + 1}`}
              className="max-w-full h-auto rounded-md"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="bg-red-50 p-2 rounded-md mt-2 hidden">
              <p className="text-red-600 text-sm">Failed to load</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-md">
        <h2 className="text-xl font-bold mb-2">Debugging Information</h2>
        <p className="mb-2">
          If the image fails to load in both the regular img tag and Next.js Image component, 
          the issue might be related to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>CORS restrictions on the Hygraph CDN</li>
          <li>Invalid image URL format</li>
          <li>Image no longer exists in Hygraph</li>
          <li>Network connectivity issues</li>
        </ul>
        <p>
          Check the API test results above for more detailed information about the image request.
        </p>
      </div>
    </div>
  );
};

export default TestNvidiaImage;
