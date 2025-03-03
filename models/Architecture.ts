// models/Application.ts

import mongoose, { Schema, model, models } from 'mongoose';
import { ComponentType } from '../types/models';

/**
 * Schema for Component subdocument
 * Defines the structure of architecture components in MongoDB
 */
const ComponentSchema = new Schema({
  id: { 
    type: String, 
    required: true, 
    description: 'Client-generated unique ID for the component'
  },
  type: { 
    type: String, 
    enum: Object.values(ComponentType),
    required: true,
    description: 'Type of the component (WEB_CONTAINER, FUNCTION_CONTAINER, etc.)'
  },
  name: { 
    type: String, 
    required: true,
    description: 'User-defined name for the component'
  },
  x: { 
    type: Number, 
    required: true,
    description: 'X position on canvas'
  },
  y: { 
    type: Number, 
    required: true,
    description: 'Y position on canvas'
  },
  width: { 
    type: Number, 
    required: true, 
    default: 120,
    description: 'Width of component in pixels'
  },
  height: { 
    type: Number, 
    required: true, 
    default: 80,
    description: 'Height of component in pixels'
  },
});

/**
 * Schema for Connection subdocument
 * Defines the structure of connections between components
 */
const ConnectionSchema = new Schema({
  id: { 
    type: String, 
    required: true,
    description: 'Client-generated unique ID for the connection'
  },
  fromComponentId: { 
    type: String, 
    required: true,
    description: 'ID of the source component'
  },
  toComponentId: { 
    type: String, 
    required: true,
    description: 'ID of the target component'
  },
});

/**
 * Main Architecture Schema
 * Defines the structure of application documents in MongoDB
 */
const ArchitectureSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    description: 'Name of the architecture'
  },
  components: [ComponentSchema],
  connections: [ConnectionSchema],
  createdAt: { 
    type: Date, 
    default: Date.now,
    description: 'When the architecture was created'
  },
  updatedAt: { 
    type: Date, 
    default: Date.now,
    description: 'When the architecture was last updated'
  },
});

/**
 * Export the model
 * Uses Mongoose's model function to create the model if it doesn't exist
 */
export default models.Application || model('Application', ArchitectureSchema);