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
  }
};

export default vehicleController;