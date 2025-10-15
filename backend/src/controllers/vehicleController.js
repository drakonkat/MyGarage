import { URLSearchParams } from 'url';

// Assicurati che node-fetch sia una dipendenza se usi Node < 18

// Cache in-memoria semplice per ridurre le chiamate API
const cache = new Map();
const CACHE_DURATION = 3600 * 1000; // 1 ora

const vehicleController = {
  async fetchFromExternal(url) {
    if (cache.has(url)) {
      const cached = cache.get(url);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    }

    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`External API request failed: ${response.statusText}`);
    }
    const data = await response.json();

    cache.set(url, { timestamp: Date.now(), data });
    return data;
  },

  getMakes: async (req, res) => {
    try {
      const targetUrl = 'https://www.auto-doc.it/ajax/selector/vehicle';
      const data = await vehicleController.fetchFromExternal(targetUrl);
      
      const allMakes = data.makers.flatMap(group => group.options);
      const uniqueMakesMap = new Map();
      allMakes.forEach(make => {
        if (!uniqueMakesMap.has(make.name)) {
          uniqueMakesMap.set(make.name, make);
        }
      });
      const sortedMakes = [...uniqueMakesMap.values()].sort((a, b) => a.name.localeCompare(b.name));
      
      res.status(200).json(sortedMakes);
    } catch (error) {
      console.error('Error fetching makes:', error);
      res.status(500).json({ message: 'Failed to fetch vehicle makes.' });
    }
  },

  getModels: async (req, res) => {
    const { makeId } = req.params;
    try {
      const targetUrl = `https://www.auto-doc.it/ajax/selector/vehicle?maker=${makeId}&action=models`;
      const data = await vehicleController.fetchFromExternal(targetUrl);

      const allModels = data.models.flatMap(group => group.options);
      const sortedModels = allModels.sort((a, b) => a.name.localeCompare(b.name));
      
      res.status(200).json(sortedModels);
    } catch (error) {
      console.error(`Error fetching models for make ${makeId}:`, error);
      res.status(500).json({ message: 'Failed to fetch vehicle models.' });
    }
  },

  getVehicles: async (req, res) => {
    const { modelId } = req.params;
    try {
      const targetUrl = `https://www.auto-doc.it/ajax/selector/vehicle?model=${modelId}&action=vehicles`;
      const data = await vehicleController.fetchFromExternal(targetUrl);

      const allVehicles = data.vehicles.flatMap(group => group.options);
      const sortedVehicles = allVehicles.sort((a, b) => a.name.localeCompare(b.name));
      
      res.status(200).json(sortedVehicles);
    } catch (error) {
      console.error(`Error fetching vehicles for model ${modelId}:`, error);
      res.status(500).json({ message: 'Failed to fetch vehicle types.' });
    }
  },
  
  searchByPlate: async (req, res) => {
    const { licensePlate } = req.body;
    if (!licensePlate) {
      return res.status(400).json({ message: 'La targa è obbligatoria.' });
    }

    const cacheKey = `plate-${licensePlate}`;
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return res.status(200).json(cached.data);
      }
    }

    try {
      const targetUrl = 'https://www.auto-doc.it/ajax/selector/vehicle/search-number';
      
      const body = new URLSearchParams();
      body.append('kba[]', licensePlate);
      body.append('route', 'main');
      body.append('eventObject', 'block');

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        body: body.toString()
      });

      if (!response.ok) {
        throw new Error(`La richiesta all'API esterna è fallita con stato ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
          return res.status(404).json({ message: 'Veicolo non trovato per la targa fornita.' });
      }

      cache.set(cacheKey, { timestamp: Date.now(), data });
      
      res.status(200).json(data);
    } catch (error) {
      console.error(`Errore nella ricerca per targa ${licensePlate}:`, error);
      res.status(500).json({ message: 'Impossibile completare la ricerca per targa.' });
    }
  }
};

export default vehicleController;