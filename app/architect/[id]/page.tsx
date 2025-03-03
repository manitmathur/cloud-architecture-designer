// app/architect/[id]/page.tsx

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Architecture interface
interface Architecture {
  _id: string;
  name: string;
  createdAt: string;
  components: any[];
  connections: any[];
}

// Component interface - defines the structure of a component
interface Component {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Define component types enum for better type safety
enum ComponentType {
  WEB_CONTAINER = 'WEB_CONTAINER',
  FUNCTION_CONTAINER = 'FUNCTION_CONTAINER',
  S3 = 'S3',
  AURORA_DB = 'AURORA_DB',
  DYNAMODB = 'DYNAMODB'
}

// Drag state interface to track dragging information
interface DragState {
  isDragging: boolean;
  component: Component | null;
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
  fromPanel: boolean;
}

interface Connection {
  id: string;
  fromComponentId: string;
  toComponentId: string;
}

export default function ArchitectPage() {
  const params = useParams(); {/* gets url parameters for architecture ID */}
  const id = params.id as string;
  const router = useRouter();

  // Reference to the canvas element for calculating positions
  const canvasRef = useRef<HTMLDivElement>(null);

  const [architecture, setArchitecture] = useState<Architecture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

   // State for side panel
   const [isPanelOpen, setIsPanelOpen] = useState(false);

  // State for components on the canvas
  const [components, setComponents] = useState<Component[]>([]);
  
  // State for tracking dragging
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    component: null,
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
    fromPanel: false
  });

  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [mode, setMode] = useState<'editor' | 'connection'>('editor');

  // state for tracking connections and connection start
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);

  // Component definitions with display properties
  const componentTypes = {
    [ComponentType.WEB_CONTAINER]: {
      type: ComponentType.WEB_CONTAINER,
      label: 'Web Container',
      color: '#4299e1', // blue
      icon: '🌐',
      width: 120,
      height: 80
    },
    [ComponentType.FUNCTION_CONTAINER]: {
      type: ComponentType.FUNCTION_CONTAINER,
      label: 'Function Container',
      color: '#9f7aea', // purple
      icon: 'λ',
      width: 120,
      height: 80
    },
    [ComponentType.S3]: {
      type: ComponentType.S3,
      label: 'S3 Storage',
      color: '#E47128', // AWS orange
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-8 h-8">
          <path 
            fill="#FFF" 
            d="M50 10L10 30v40l40 20 40-20V30L50 10zm0 70L20 57.5V42.5L50 57.5l30-15v15L50 80z"
          />
          <path 
            fill="#FFF" 
            d="M50 42.5L20 57.5l30 15 30-15-30-15z"
          />
        </svg>
      ),
      width: 100,
      height: 100
    },
    [ComponentType.AURORA_DB]: {
      type: ComponentType.AURORA_DB,
      label: 'Aurora DB',
      color: '#4a4a4a', // dark gray to match Aurora's branding
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-8 h-8">
          <path 
            fill="#FFF" 
            d="M50 10L10 50l40 40 40-40-40-40zm0 70c-16.569 0-30-13.431-30-30s13.431-30 30-30 30 13.431 30 30-13.431 30-30 30z"
          />
          <circle cx="50" cy="50" r="20" fill="#FFF" />
        </svg>
      ),
      width: 120,
      height: 80
    },
    [ComponentType.DYNAMODB]: {
      type: ComponentType.DYNAMODB,
      label: 'DynamoDB',
      color: '#7AA116', // Amazon green
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-8 h-8">
          <path 
            fill="#FFF" 
            d="M50 10L10 30v40l40 20 40-20V30L50 10zm30 47.5L50 77.5 20 57.5V42.5L50 22.5l30 20v15z"
          />
          <path 
            fill="#FFF" 
            d="M50 42.5L20 57.5l30 15 30-15-30-15z"
          />
        </svg>
      ),
      width: 120,
      height: 80
    }
  };

  useEffect(() => {
    async function fetchArchitecture() {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/architectures/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch architecture');
        }
        
        const data = await response.json();
        setArchitecture(data);
        
        // Set components first
        if (data.components && Array.isArray(data.components)) {
          setComponents(data.components);
        }
  
        // Preserve connections based on component type and name
        if (data.connections && Array.isArray(data.connections)) {
          console.log('Original Connections:', data.connections);
          
          const validConnections: Connection[] = data.connections.filter((connection: any) => {
            // Find the from and to components based on the stored connections
            const fromComponent = data.components.find(
              (c: Component) => c.id === connection.fromComponentId
            );
            
            const toComponent = data.components.find(
              (c: Component) => c.id === connection.toComponentId
            );
  
            // Return true if both components exist
            return fromComponent && toComponent;
          }).map((connection: any) => ({
            id: connection.id,
            fromComponentId: connection.fromComponentId,
            toComponentId: connection.toComponentId
          }));
  
          console.log('Valid Connections:', validConnections);
          
          // Set the connections
          setConnections(validConnections);
        }
  
      } catch (err) {
        console.error('Error fetching architecture:', err);
        setError('Failed to load architecture');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchArchitecture();
  }, [id]); {/* dependency array means has the effect run when the ID changes */}

  useEffect(() => {
    // Skip saving if we're still loading the initial data
    if (isLoading || !architecture) return;
    
    const saveArchitecture = async () => {
      try {
        console.log('Saving Architecture:', {
          components,
          connections
        });
    
        const response = await fetch(`/api/architectures/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            components,
            connections
          }),
        });
        
        const responseData = await response.json();
        console.log('Save Response:', responseData);
    
        if (!response.ok) {
          throw new Error('Failed to save architecture: ' + responseData.error);
        }
      } catch (err) {
        console.error('Error saving architecture:', err);
        // Optionally set an error state here
      }
    };
    
    // Debounce the save to avoid too many requests
    const timeoutId = setTimeout(() => {
      saveArchitecture();
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [components, id, architecture, isLoading]);


   // Handle going back to the architectures list
   const handleBack = () => {
    router.push('/');
  };

    // Toggle side panel open/closed
    const togglePanel = () => {
      setIsPanelOpen(!isPanelOpen);
    };

    // Function to start dragging a component from the panel
    const startDragFromPanel = (componentType: ComponentType, e: React.MouseEvent) => {
      
      if (mode === 'connection') return;

      
      if (!canvasRef.current) return;
      
      // Get canvas position for relative coordinates
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      // Get component type configuration
      const typeConfig = componentTypes[componentType];
      
      // Create a new component
      const newComponent: Component = {
        id: `component-${Date.now()}`,
        type: componentType,
        name: `${typeConfig.label} ${components.filter(c => c.type === componentType).length + 1}`,
        x: e.clientX - canvasRect.left - (typeConfig.width / 2), // Center the component under cursor
        y: e.clientY - canvasRect.top - (typeConfig.height / 2),  // Center the component under cursor
        width: typeConfig.width,
        height: typeConfig.height
      };
      
      // Set up the drag state
      setDragState({
        isDragging: true,
        component: newComponent,
        offsetX: typeConfig.width / 2, // Center of the component
        offsetY: typeConfig.height / 2, // Center of the component
        startX: e.clientX,
        startY: e.clientY,
        fromPanel: true
      });
    };

    // Function to start dragging an existing component
  const startDragExisting = (e: React.MouseEvent, component: Component) => {
  
    // Prevent dragging in connection mode
  if (mode === 'connection') return;

  e.stopPropagation();
    
    // Calculate the offset from the mouse to the component's top-left
    const offsetX = e.clientX - component.x;
    const offsetY = e.clientY - component.y;
    
    // Set up the drag state
    setDragState({
      isDragging: true,
      component: component,
      offsetX,
      offsetY,
      startX: e.clientX,
      startY: e.clientY,
      fromPanel: false
    });
  };

  // Function to handle mouse movement during dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    
    // Prevent dragging in connection mode
    if (mode === 'connection') return;
    
    if (!dragState.isDragging || !dragState.component || !canvasRef.current) return;
    
    // Get canvas position for relative coordinates
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Calculate new position
    const newX = e.clientX - canvasRect.left - dragState.offsetX;
    const newY = e.clientY - canvasRect.top - dragState.offsetY;
    
    // Update the component in the drag state
    setDragState(prev => ({
      ...prev,
      component: {
        ...prev.component!,
        x: newX,
        y: newY
      }
    }));
  };

  // Function to handle end of dragging
  const handleMouseUp = () => {
    if (!dragState.isDragging || !dragState.component) return;
    
    if (dragState.fromPanel) {
      // Add new component to the components array
      setComponents(prev => [...prev, dragState.component!]);
    } else {
      // Update existing component in the array
      setComponents(prev => 
        prev.map(comp => 
          comp.id === dragState.component!.id ? dragState.component! : comp
        )
      );
    }
    
    //deletes componennt
    const deleteComponent = (id: string, e: React.MouseEvent) => {
      // Stop event propagation to prevent dragging when clicking the delete button
      e.stopPropagation();
      
      // Filter out the component with the matching id
      const updatedComponents = components.filter(component => component.id !== id);
      
      // Update state
      setComponents(updatedComponents);

    };


    // Reset drag state
    setDragState({
      isDragging: false,
      component: null,
      offsetX: 0,
      offsetY: 0,
      startX: 0,
      startY: 0,
      fromPanel: false
    });
  };

  // Function to handle component click in connection mode
  const handleComponentClick = (componentId: string) => {
    if (mode !== 'connection') return;
  
    if (!connectionStart) {
      setConnectionStart(componentId);
    } else {
      if (componentId !== connectionStart) {
        const newConnection: Connection = {
          id: `connection-${Date.now()}`,
          fromComponentId: connectionStart,
          toComponentId: componentId
        };
  
        console.log('Creating Connection:', newConnection);
  
        setConnections(prev => {
          // Prevent duplicate connections
          const connectionExists = prev.some(
            conn => 
              conn.fromComponentId === newConnection.fromComponentId && 
              conn.toComponentId === newConnection.toComponentId
          );
  
          return connectionExists ? prev : [...prev, newConnection];
        });
  
        setConnectionStart(null);
      } else {
        setConnectionStart(null);
      }
    }
  };
  

const getComponentCenter = (component: Component) => ({
  x: component.x + component.width / 2,
  y: component.y + component.height / 2
});

// Render connections as SVG lines
const renderConnections = () => {
  console.log('Rendering Connections:', connections);
  
  return connections.map(connection => {
    const fromComponent = components.find(c => c.id === connection.fromComponentId);
    const toComponent = components.find(c => c.id === connection.toComponentId);

    if (!fromComponent || !toComponent) {
      console.warn('Could not find components for connection:', connection);
      return null;
    }

    const fromCenter = getComponentCenter(fromComponent);
    const toCenter = getComponentCenter(toComponent);

    console.log('From Center:', fromCenter);
    console.log('To Center:', toCenter);

    return (
      <line
        key={connection.id}
        x1={fromCenter.x}
        y1={fromCenter.y}
        x2={toCenter.x}
        y2={toCenter.y}
        stroke="#4A5568"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
    );
  }).filter(line => line !== null);
};

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading architecture...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center justify-center">
        <p className="text-xl text-red-600 mb-4">{error}</p>
        <button 
          onClick={handleBack}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Architectures
        </button>
      </div>
    );
  }

  // Helper function to get component style based on its type
  const getComponentStyle = (component: Component) => {
    const typeConfig = componentTypes[component.type as ComponentType] || {
      color: '#4299e1', // default blue
      icon: '⬜'
    };
    
    return {
      backgroundColor: typeConfig.color,
      borderColor: typeConfig.color
    };
  };

  //main component layout
  return (
    <div className="min-h-screen w-full bg-gray-100">
      {/* Header bar */}
      <div className="w-full bg-blue-900 p-4 flex items-center justify-between">
        {/* Back button */}
        <button 
          onClick={handleBack}
          className="px-3 py-1 bg-blue-800 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        
        {/* Architecture title */}
        <h1 className="text-xl font-bold text-white absolute left-1/2 transform -translate-x-1/2">
          {architecture?.name || 'Architecture'}
        </h1>
        
      {/* menu button */}
      <button 
          onClick={togglePanel}
          className="px-3 py-1 bg-blue-800 text-white rounded-md hover:bg-blue-700 flex flex-col items-center justify-center h-10 w-10"
          aria-label="Toggle components panel"
        >
          <div className="w-5 h-0.5 bg-white mb-1"></div>
          <div className="w-5 h-0.5 bg-white mb-1"></div>
          <div className="w-5 h-0.5 bg-white"></div>
        </button>
      </div>
      
      {/* Main content with side panel */}
      <div className="flex flex-1 h-[calc(100vh-68px)]">
        {/* Main canvas area */}
        <div 
          ref={canvasRef}
          className="flex-1 relative"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >

          {/* SVG for rendering connections */}
          <svg 
            className="absolute inset-0 pointer-events-none z-10" 
            style={{ 
              width: '100%', 
              height: '100%', 
              position: 'absolute', 
              top: 0, 
              left: 0 
            }}
          >
            {renderConnections()}
          </svg>


          {/* Render all the placed components */}
          {components.map(component => (
            <div
              key={component.id}
              className={`absolute border-2 rounded ${
                mode === 'editor' 
                  ? 'cursor-move hover:shadow-lg' 
                  : 'cursor-pointer hover:border-blue-500'
              }`}
              style={{
                left: `${component.x}px`,
                top: `${component.y}px`,
                width: `${component.width}px`,
                height: `${component.height}px`,
                position: 'absolute',
                ...getComponentStyle(component),
                borderColor: connectionStart === component.id 
                  ? 'blue' 
                  : getComponentStyle(component).borderColor
              }}
              onMouseDown={mode === 'editor' 
                ? (e) => startDragExisting(e, component) 
                : undefined}
              onClick={() => handleComponentClick(component.id)}
              onMouseEnter={() => setHoveredComponent(component.id)}
              onMouseLeave={() => setHoveredComponent(null)}
            >
              {/* Delete button - only visible when this component is hovered */}
              {hoveredComponent === component.id && (
                <div 
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600 z-10 cursor-pointer"
                  onClick={(e) => {
                    // Stop propagation to prevent other handlers from firing
                    e.stopPropagation();
                    e.preventDefault();
                    
                    // Create a new array without this component
                    const updatedComponents = components.filter(c => c.id !== component.id);
                    
                    // Update the state
                    setComponents(updatedComponents);
                  }}
                >
                  <span className="text-lg font-bold">×</span>
                </div>
              )}

              {/* Rename button at bottom right - only visible when this component is hovered */}
              {hoveredComponent === component.id && (
                <div 
                  className="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center z-10 cursor-pointer"
                  onMouseDown={(e) => {
                    // Critical: prevent the parent's mouseDown from firing
                    e.stopPropagation();
                    e.preventDefault();
                    
                    // Show the prompt after a tiny delay to ensure the event doesn't propagate
                    setTimeout(() => {
                      const newName = prompt("Enter new name:", component.name);
                      if (newName && newName.trim()) {
                        const updatedComponents = components.map(c => 
                          c.id === component.id ? {...c, name: newName.trim()} : c
                        );
                        setComponents(updatedComponents);
                      }
                    }, 10);
                  }}
                >
                  <span className="text-white text-sm">✏️</span>
                </div>
              )}

              <div className="flex flex-col items-center justify-center h-full text-white">
                <div className="text-2xl mb-1">
                {React.isValidElement(componentTypes[component.type as ComponentType].icon)
                  ? componentTypes[component.type as ComponentType].icon
                  : componentTypes[component.type as ComponentType].icon}
                </div>
                
                {/* Name without edit button */}
                <div className="text-center text-sm px-1">
                  {component.name}
                </div>
              </div>
            </div>
          ))}
          
          {/* Render the component being dragged */}
          {dragState.isDragging && dragState.component && mode === 'editor' && (
            <div
              className="absolute border-2 rounded opacity-70"
              style={{
                left: `${dragState.component!.x}px`,
                top: `${dragState.component!.y}px`,
                width: `${dragState.component!.width}px`,
                height: `${dragState.component!.height}px`,
                ...getComponentStyle(dragState.component!)
              }}
            >
              <div className="flex flex-col items-center justify-center h-full text-white">
                <div className="text-2xl mb-1">
                {React.isValidElement(componentTypes[dragState.component!.type as ComponentType].icon)
                  ? componentTypes[dragState.component!.type as ComponentType].icon
                  : componentTypes[dragState.component!.type as ComponentType].icon}
                </div>
                <div className="text-center text-sm px-1">
                  {dragState.component!.name}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Side panel for components */}
        <div 
          className={`w-80 bg-white shadow-lg fixed top-[68px] bottom-0 right-0 transform transition-transform duration-300 ease-in-out ${
            isPanelOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Components</h2>
              <button 
                onClick={togglePanel}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close panel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100%-64px)]"> {/*adds overflow scrolling*/}
            {/* Component palette */}
            <h3 className="text-md font-medium mb-3">Drag to add:</h3>

            {/* Web Container component */}
            <div 
              className="w-full p-3 rounded border-2 mb-4 cursor-grab flex items-center"
              style={{ backgroundColor: componentTypes[ComponentType.WEB_CONTAINER].color, borderColor: componentTypes[ComponentType.WEB_CONTAINER].color }}
              onMouseDown={(e) => startDragFromPanel(ComponentType.WEB_CONTAINER, e)}
            >
              <span className="text-2xl mr-2">{componentTypes[ComponentType.WEB_CONTAINER].icon}</span>
              <span className="text-white">{componentTypes[ComponentType.WEB_CONTAINER].label}</span>
            </div>

            {/* Function Container component */}
            <div 
              className="w-full p-3 rounded border-2 mb-4 cursor-grab flex items-center"
              style={{ backgroundColor: componentTypes[ComponentType.FUNCTION_CONTAINER].color, borderColor: componentTypes[ComponentType.FUNCTION_CONTAINER].color }}
              onMouseDown={(e) => startDragFromPanel(ComponentType.FUNCTION_CONTAINER, e)}
            >
              <span className="text-2xl mr-2">{componentTypes[ComponentType.FUNCTION_CONTAINER].icon}</span>
              <span className="text-white">{componentTypes[ComponentType.FUNCTION_CONTAINER].label}</span>
            </div>

            {/* S3 Storage component */}
            <div 
              className="w-full p-3 rounded border-2 mb-4 cursor-grab flex items-center"
              style={{ backgroundColor: componentTypes[ComponentType.S3].color, borderColor: componentTypes[ComponentType.S3].color }}
              onMouseDown={(e) => startDragFromPanel(ComponentType.S3, e)}
            >
              <span className="text-2xl mr-2">{componentTypes[ComponentType.S3].icon}</span>
              <span className="text-white">{componentTypes[ComponentType.S3].label}</span>
            </div>

            {/* Aurora DB component */}
            <div 
              className="w-full p-3 rounded border-2 mb-4 cursor-grab flex items-center"
              style={{ backgroundColor: componentTypes[ComponentType.AURORA_DB].color, borderColor: componentTypes[ComponentType.AURORA_DB].color }}
              onMouseDown={(e) => startDragFromPanel(ComponentType.AURORA_DB, e)}
            >
              <span className="text-2xl mr-2">{componentTypes[ComponentType.AURORA_DB].icon}</span>
              <span className="text-white">{componentTypes[ComponentType.AURORA_DB].label}</span>
            </div>

            {/* DynamoDB component */}
            <div 
              className="w-full p-3 rounded border-2 mb-4 cursor-grab flex items-center"
              style={{ backgroundColor: componentTypes[ComponentType.DYNAMODB].color, borderColor: componentTypes[ComponentType.DYNAMODB].color }}
              onMouseDown={(e) => startDragFromPanel(ComponentType.DYNAMODB, e)}
            >
              <span className="text-2xl mr-2">{componentTypes[ComponentType.DYNAMODB].icon}</span>
              <span className="text-white">{componentTypes[ComponentType.DYNAMODB].label}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mode toggle buttons - fixed at bottom right */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-20">
        {/* Editor mode button */}
        <button 
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
            mode === 'editor' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
          }`}
          onClick={() => setMode('editor')}
          title="Edit Mode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        
        {/* Connection mode button */}
        <button 
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
            mode === 'connection' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
          }`}
          onClick={() => setMode('connection')}
          title="Connection Mode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        </button>
      </div>
    </div>
  );
}