// backend/data/json/jsonDataService.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, 'data.json');

export const jsonDataService = {
  async getAll() {
    const content = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(content);
  },

  async getById(id) {
    const data = await this.getAll();
    return data.find((item) => item.id === id);
  },

  async create(newItem) {
    const data = await this.getAll();
    const newId = data.length ? Math.max(...data.map((i) => i.id)) + 1 : 1;
    const item = { id: newId, ...newItem };
    data.push(item);
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    return item;
  },

  async update(id, updatedFields) {
    const data = await this.getAll();
    const index = data.findIndex((i) => i.id === id);
    if (index === -1) return null;
    data[index] = { ...data[index], ...updatedFields };
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    return data[index];
  },

  async remove(id) {
    const data = await this.getAll();
    const filtered = data.filter((i) => i.id !== id);
    if (filtered.length === data.length) return null;
    await fs.writeFile(DATA_FILE, JSON.stringify(filtered, null, 2));
    return { msg: 'Item deleted', id };
  },
};
