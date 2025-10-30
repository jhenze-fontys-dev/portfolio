// backend/data/dataServiceFactory.js
import dotenv from 'dotenv';
dotenv.config({ path: '../.env', quiet: true });

let dataServiceModule;
let dataService;

// Select data source dynamically based on .env
if (process.env.DATA_SOURCE === 'sqlite') {
  console.log('Using SQLite database');
  dataServiceModule = await import('./sql/services/index.service.js');
  dataService = dataServiceModule.sqlDataService;
} else {
  console.log('Using JSON data source');
  dataServiceModule = await import('./json/jsonDataService.js');
  dataService = dataServiceModule.jsonDataService;
}

export { dataService };
