// types/models.ts

/**
 * Types and interfaces for the Cloud Architecture Designer application
 */

/**
 * Enum defining the types of components available in the architecture designer
 */
export enum ComponentType {
    WEB_CONTAINER = 'WEB_CONTAINER',           // For web applications
    FUNCTION_CONTAINER = 'FUNCTION_CONTAINER', // For microservices/functions
    S3 = 'S3',                                 // For document storage
    AURORA_DB = 'AURORA_DB',                   // For relational database
    DYNAMODB = 'DYNAMODB'                      // For document database
  }
  
  /**
   * Interface for the Architecture model
   * Represents a customer application with its architecture
   */
  export interface Architecture {
    _id?: string;                // MongoDB ObjectId (optional for new applications)
    name: string;                // Name of the architecture
    components: Component[];     // Array of architecture components
    connections: Connection[];   // Array of connections between components
    createdAt: Date | string;    // Creation timestamp
    updatedAt?: Date | string;   // Last update timestamp
  }
  
  /**
   * Interface for Component model
   * Represents a single architecture component (e.g., web container, database)
   */
  export interface Component {
    id: string;           // Client-generated unique ID
    type: ComponentType;  // Type of component from enum
    name: string;         // User-given name for this component
    x: number;            // X position on canvas
    y: number;            // Y position on canvas
    width: number;        // Width of component
    height: number;       // Height of component
  }
  
  /**
   * Interface for Connection model
   * Represents a connection between two components in the architecture
   */
  export interface Connection {
    id: string;     // Client-generated unique ID
    source: string; // ID of source component
    target: string; // ID of target component
  }
  
  /**
   * Interface for component type visual information
   * Used to define display properties for component types
   */
  export interface ComponentTypeInfo {
    type: ComponentType; // Type of component
    label: string;       // Human-readable label
    color: string;       // Color code for display
    icon: string;        // Icon or emoji for display
  }