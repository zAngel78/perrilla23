import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * JSON Database Helper
 * Maneja lectura y escritura de archivos JSON como base de datos
 */
class JsonDB {
  constructor(dbPath = '../database') {
    this.dbPath = path.join(__dirname, dbPath);
  }

  /**
   * Lee un archivo JSON
   * @param {string} filename - Nombre del archivo (ej: 'products.json')
   * @returns {Promise<Object>} Contenido del archivo
   */
  async read(filename) {
    try {
      const filePath = path.join(this.dbPath, filename);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`⚠️ File ${filename} not found, creating empty structure`);
        // Crear estructura vacía basada en el nombre del archivo
        const key = filename.replace('.json', '');
        const emptyData = { [key]: [] };
        await this.write(filename, emptyData);
        return emptyData;
      }
      throw new Error(`Error reading ${filename}: ${error.message}`);
    }
  }

  /**
   * Escribe datos en un archivo JSON
   * @param {string} filename - Nombre del archivo
   * @param {Object} data - Datos a escribir
   */
  async write(filename, data) {
    try {
      const filePath = path.join(this.dbPath, filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(`Error writing ${filename}: ${error.message}`);
    }
  }

  /**
   * Obtiene todos los elementos de una colección
   * @param {string} collection - Nombre de la colección (ej: 'products')
   * @returns {Promise<Array>} Array de elementos
   */
  async getAll(collection) {
    const data = await this.read(`${collection}.json`);
    return data[collection] || [];
  }

  /**
   * Obtiene un elemento por ID
   * @param {string} collection - Nombre de la colección
   * @param {string} id - ID del elemento
   * @returns {Promise<Object|null>} Elemento encontrado o null
   */
  async getById(collection, id) {
    const items = await this.getAll(collection);
    return items.find(item => item.id === id) || null;
  }

  /**
   * Crea un nuevo elemento
   * @param {string} collection - Nombre de la colección
   * @param {Object} newItem - Datos del nuevo elemento (sin ID)
   * @returns {Promise<Object>} Elemento creado con ID
   */
  async create(collection, newItem) {
    const data = await this.read(`${collection}.json`);
    const items = data[collection] || [];
    
    // Generar ID único
    const id = this.generateId(collection);
    
    const itemWithId = {
      id,
      ...newItem,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    items.push(itemWithId);
    data[collection] = items;
    
    await this.write(`${collection}.json`, data);
    return itemWithId;
  }

  /**
   * Actualiza un elemento existente
   * @param {string} collection - Nombre de la colección
   * @param {string} id - ID del elemento a actualizar
   * @param {Object} updates - Datos a actualizar
   * @returns {Promise<Object|null>} Elemento actualizado o null si no existe
   */
  async update(collection, id, updates) {
    const data = await this.read(`${collection}.json`);
    const items = data[collection] || [];
    
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    items[index] = {
      ...items[index],
      ...updates,
      id, // Asegurar que el ID no cambie
      updatedAt: new Date().toISOString()
    };
    
    data[collection] = items;
    await this.write(`${collection}.json`, data);
    
    return items[index];
  }

  /**
   * Elimina un elemento
   * @param {string} collection - Nombre de la colección
   * @param {string} id - ID del elemento a eliminar
   * @returns {Promise<boolean>} true si se eliminó, false si no existía
   */
  async delete(collection, id) {
    const data = await this.read(`${collection}.json`);
    const items = data[collection] || [];
    
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      return false;
    }
    
    items.splice(index, 1);
    data[collection] = items;
    
    await this.write(`${collection}.json`, data);
    return true;
  }

  /**
   * Busca elementos que cumplan una condición
   * @param {string} collection - Nombre de la colección
   * @param {Function} predicate - Función de búsqueda
   * @returns {Promise<Array>} Elementos que cumplen la condición
   */
  async find(collection, predicate) {
    const items = await this.getAll(collection);
    return items.filter(predicate);
  }

  /**
   * Busca un elemento que cumpla una condición
   * @param {string} collection - Nombre de la colección
   * @param {Function} predicate - Función de búsqueda
   * @returns {Promise<Object|null>} Primer elemento que cumple la condición
   */
  async findOne(collection, predicate) {
    const items = await this.getAll(collection);
    return items.find(predicate) || null;
  }

  /**
   * Genera un ID único para una colección
   * @param {string} collection - Nombre de la colección
   * @returns {string} ID único
   */
  generateId(collection) {
    const prefix = collection.slice(0, 4);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Verifica si existe un elemento con un ID
   * @param {string} collection - Nombre de la colección
   * @param {string} id - ID a verificar
   * @returns {Promise<boolean>} true si existe
   */
  async exists(collection, id) {
    const item = await this.getById(collection, id);
    return item !== null;
  }

  /**
   * Cuenta elementos en una colección
   * @param {string} collection - Nombre de la colección
   * @returns {Promise<number>} Cantidad de elementos
   */
  async count(collection) {
    const items = await this.getAll(collection);
    return items.length;
  }

  /**
   * Limpia una colección (elimina todos los elementos)
   * @param {string} collection - Nombre de la colección
   */
  async clear(collection) {
    const data = { [collection]: [] };
    await this.write(`${collection}.json`, data);
  }
}

// Exportar instancia singleton
export const db = new JsonDB();

// Exportar clase para testing o múltiples instancias
export default JsonDB;
