// app/page.tsx 

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Simple interface for our architecture data
interface Architecture {
  _id: string;
  name: string;
  createdAt: string;
  components?: any[]; // Make components optional with ?
  connections?: any[];
}

export default function Home() {
  // State for storing architectures and UI state
  const [architectures, setArchitectures] = useState<Architecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  // Fetch architectures when component mounts
  useEffect(() => {
    async function fetchArchitectures() {
      try {
        setIsLoading(true);
        
        // Make API request to get architectures
        const response = await fetch('/api/architectures');
        
        if (!response.ok) {
          throw new Error('Failed to fetch architectures');
        }
        
        // Parse the JSON response
        const data = await response.json();
        setArchitectures(data);
      } catch (err) {
        console.error('Error fetching architectures:', err);
        setError('Failed to load architectures');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchArchitectures();
  }, []);

  /**
   * Handles creating a new architecture
   * @param name - The name for the new architecture
   */
  const createNewArchitecture = async (name: string) => {
    if (!name.trim()) return;
    
    try {
      // Make API request to create a new architecture
      const response = await fetch('/api/architectures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create architecture');
      }
      
      // Parse the JSON response
      const newArchitecture = await response.json();
      
      // Update the architectures list with the new architecture
      setArchitectures([...architectures, newArchitecture]);
      
      alert(`Architecture "${name}" created successfully!`);
    } catch (err) {
      console.error('Error creating architecture:', err);
      setError('Failed to create architecture');
    }
  };

  /**
   * Handles deleting an architecture
   * @param id - The ID of the architecture to delete
   * @param name - The name of the architecture (for confirmation message)
   */
  const deleteArchitecture = async (id: string, name: string) => {
    try {
      // Make API request to delete the architecture
      const response = await fetch(`/api/architectures/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete architecture');
      }
      
      // Remove the deleted architecture from the state
      setArchitectures(architectures.filter(arch => arch._id !== id));
      
      // Reset delete confirmation state
      setDeleteConfirm(null);
      
      // Show confirmation
      alert(`Architecture "${name}" deleted successfully!`);
    } catch (err) {
      console.error('Error deleting architecture:', err);
      setError('Failed to delete architecture');
    }
  };

  /**
   * Handles clicking on the "New Architecture" card
   */
  const handleNewArchitectureClick = () => {
    const name = prompt('Enter a name for your new architecture:');
    if (name && name.trim()) {
      createNewArchitecture(name.trim());
    }
  };

  return (
    // Main container - full viewport width and height
    <div className="min-h-screen w-full bg-gray-100">
      {/* Header section with blue background */}
      <div className="w-full bg-blue-900 p-4 sticky top-0 z-10">
        {/* Application title - aligned to the left */}
        <h1 className="text-xl font-bold text-white">Fortress Cloud</h1>
      </div>
      
      {/* Main content area */}
      <div className="p-8">
        {/* Error message display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Loading state or architectures grid */}
        {isLoading ? (
          <div className="text-center py-10">Loading architectures...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            
            {/* Create new architecture card */}
            <div 
              className="w-full h-52 bg-blue-600 rounded-lg shadow-lg flex flex-col items-center justify-center text-white cursor-pointer hover:bg-blue-700 transition-colors"
              onClick={handleNewArchitectureClick}
            >
              {/* Plus icon - centered in the box */}
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              
              {/* Text below the icon */}
              <p className="text-lg font-medium">New Architecture</p>
            </div>
            
            {/* List existing architectures */}
            {architectures.map((architecture) => (
              <div 
                key={architecture._id}
                className="w-full h-52 bg-white rounded-lg shadow-lg p-4 flex flex-col cursor-pointer hover:shadow-xl transition-shadow relative"
                onClick={() => router.push(`/architect/${architecture._id}`)}
              >
                <h3 className="text-lg font-medium text-gray-800 mb-2">{architecture.name}</h3>
                <p className="text-xs text-gray-500">
                  Created: {new Date(architecture.createdAt).toLocaleDateString()}
                </p>
                <div className="flex-grow flex items-center justify-center">
                  {architecture.components?.length ? (
                    <p className="text-gray-600 text-center">{architecture.components.length} components</p>
                  ) : (
                    <p className="text-gray-400 text-center">No components yet</p>
                  )}
                </div>
                <div className="mt-2 flex justify-center">
                  <span className="text-blue-600 hover:text-blue-800 text-sm">
                    Edit Architecture 
                  </span>
                </div>

                {/* Delete button - positioned at bottom right */}
                <button 
                  className="absolute bottom-2 right-2 p-2 text-gray-500 hover:text-red-500 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigating to edit page
                    setDeleteConfirm(architecture._id);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                
                {/* Delete confirmation popup */}
                {deleteConfirm === architecture._id && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center p-4 rounded-lg">
                    <p className="text-center mb-4">
                      Are you sure you want to delete <strong>{architecture.name}</strong>?
                    </p>
                    <div className="flex space-x-4">
                      <button 
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent navigating to edit page
                          deleteArchitecture(architecture._id, architecture.name);
                        }}
                      >
                        Delete
                      </button>
                      <button 
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent navigating to edit page
                          setDeleteConfirm(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}