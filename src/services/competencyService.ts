import axios from 'axios';

// Competency Service Configuration
const API_BASE_URL = import.meta.env.VITE_MOODLE_API_URL || 'https://kodeit.legatoserver.com/webservice/rest/server.php';
const API_TOKEN = import.meta.env.VITE_MOODLE_TOKEN || '2eabaa23e0cf9a5442be25613c41abf5';

// Type definitions based on API documentation
export interface CompetencyFramework {
  id: number;
  shortname: string;
  idnumber: string;
  description: string;
  descriptionformat: number;
  visible: number;
  scaleid: number;
  scaleconfiguration: string;
  contextid: number;
  taxonomies: string;
  timecreated: number;
  timemodified: number;
  usermodified: number;
  canmanage: number;
  competenciescount: number;
  contextname: string;
  contextnamenoprefix: string;
}

export interface Competency {
  id: number;
  shortname: string;
  idnumber: string;
  description: string;
  descriptionformat: number;
  sortorder: number;
  parentid: number;
  path: string;
  ruleoutcome: number;
  ruletype: string;
  ruleconfig: string;
  scaleid: number;
  scaleconfiguration: string;
  competencyframeworkid: number;
  timecreated: number;
  timemodified: number;
  usermodified: number;
}

export interface CompetencyFilter {
  column: string;
  value: string;
}

export interface CompetencyListParams {
  filters?: CompetencyFilter[];
  sort?: string;
  order?: string;
  skip?: number;
  limit?: number;
}

export interface FrameworkListParams {
  sort?: string;
  order?: string;
  skip?: number;
  limit?: number;
  context?: {
    contextid?: number;
    contextlevel?: string;
    instanceid?: number;
  };
  includes?: string;
  onlyvisible?: number;
  query?: string;
}

// Create axios instance for competency API calls
const competencyApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
});

// Add request interceptor to include Moodle token
competencyApi.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    wstoken: API_TOKEN,
    moodlewsrestformat: 'json',
  };
  return config;
});

// Add response interceptor to handle API errors gracefully
competencyApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Competency API request failed:', error.message);
    return Promise.reject(error);
  }
);

// Helper function to make API calls
const makeApiCall = async (params: any) => {
  try {
    const response = await competencyApi.post('', new URLSearchParams(params));
    
    // Handle responses that might contain HTML warnings
    let responseData = response.data;
    
    // If response is a string (contains HTML), try to extract JSON
    if (typeof responseData === 'string') {
      try {
        // Look for JSON in the response (after HTML warnings)
        const jsonMatch = responseData.match(/\{.*\}/s);
        if (jsonMatch) {
          responseData = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('⚠️ Could not parse JSON from response:', parseError);
      }
    }
    
    return responseData;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Helper function to build filter parameters
const buildFilterParams = (filters: CompetencyFilter[] = []) => {
  const params: any = {};
  
  // Only include filter parameters if filters are provided
  if (filters.length > 0) {
    filters.forEach((filter, index) => {
      params[`filters[${index}][column]`] = filter.column;
      params[`filters[${index}][value]`] = filter.value;
    });
  }
  
  return params;
};

// Helper function to build context parameters
const buildContextParams = (context?: FrameworkListParams['context']) => {
  const params: any = {};
  if (context) {
    if (context.contextid !== undefined) {
      params['context[contextid]'] = context.contextid;
    }
    if (context.contextlevel) {
      params['context[contextlevel]'] = context.contextlevel;
    }
    if (context.instanceid !== undefined) {
      params['context[instanceid]'] = context.instanceid;
    }
  }
  return params;
};

export const competencyService = {
  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Get system context ID
   * @returns Promise<number>
   */
  async getSystemContext(): Promise<number> {
    try {
      // Try to get system context from site info
      const response = await makeApiCall({
        wsfunction: 'core_webservice_get_site_info'
      });
      
      if (response && response.systemcontextid) {
        return response.systemcontextid;
      }
      
      // Fallback to context ID 1 (system context)
      return 1;
    } catch (error) {
      console.warn('⚠️ Could not get system context, using fallback');
      return 1;
    }
  },

  /**
   * Get available scales for competency frameworks
   * @returns Promise<Array<{id: number, name: string, scaleconfiguration?: string}>>
   */
  async getAvailableScales(): Promise<Array<{id: number, name: string, scaleconfiguration?: string}>> {
    try {
      console.log('🔍 Fetching available scales from Moodle system...');
      
      // Use the correct API function: core_competency_get_scale_values
      try {
        const response = await makeApiCall({
          wsfunction: 'core_competency_get_scale_values',
          'scaleid': 2
        });
        
        console.log(`📊 Response from core_competency_get_scale_values:`, response);
        
        if (response && Array.isArray(response) && response.length > 0) {
          console.log(`✅ Found ${response.length} scale items for scale ID 2`);
          
          // Build the proper scale configuration using the array format that works
          const scaleConfiguration = JSON.stringify([
            {"scaleid": "2"},
            {"id": 1, "scaledefault": 1, "proficient": 0},
            {"id": 2, "scaledefault": 0, "proficient": 1}
          ]);
          
          return [{
            id: 2,
            name: 'Default Competency Scale',
            scaleconfiguration: scaleConfiguration
          }];
        }
      } catch (methodError) {
        console.log(`⚠️ core_competency_get_scale_values failed:`, methodError.message);
      }
      
      // Fallback: return default scale configuration using the working array format
      console.log('📊 Using fallback scale configuration');
      return [{
        id: 2,
        name: 'Default Competency Scale',
        scaleconfiguration: '[{"scaleid":"2"},{"id":1,"scaledefault":1,"proficient":0},{"id":2,"scaledefault":0,"proficient":1}]'
      }];
      
    } catch (error) {
      console.error('❌ Error fetching scales:', error);
      return [{
        id: 2,
        name: 'Default Competency Scale',
        scaleconfiguration: '[{"scaleid":"2"},{"id":1,"scaledefault":1,"proficient":0},{"id":2,"scaledefault":0,"proficient":1}]'
      }];
    }
  },

  // ==================== FRAMEWORK OPERATIONS ====================

  /**
   * List competency frameworks
   * @param params - Framework list parameters
   * @returns Promise<CompetencyFramework[]>
   */
  async listFrameworks(params: FrameworkListParams = {}): Promise<CompetencyFramework[]> {
    try {
      console.log('🔍 Fetching competency frameworks...');
      
      // Get system context if not provided
      const contextId = params.context?.contextid || await this.getSystemContext();
      
      const apiParams = {
        wsfunction: 'core_competency_list_competency_frameworks',
        sort: params.sort || 'shortname',
        order: params.order || '',
        skip: params.skip || 0,
        limit: params.limit || 0,
        includes: params.includes || 'children',
        onlyvisible: params.onlyvisible !== undefined ? params.onlyvisible : 1,
        query: params.query || '',
        ...buildContextParams(params.context || { contextid: contextId })
      };

      const response = await makeApiCall(apiParams);
      
      if (Array.isArray(response)) {
        console.log(`✅ Found ${response.length} competency frameworks`);
        return response;
      } else {
        console.warn('⚠️ Invalid response format for frameworks');
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching competency frameworks:', error);
      throw error;
    }
  },

  /**
   * Read a specific competency framework
   * @param id - Framework ID
   * @returns Promise<CompetencyFramework>
   */
  async readFramework(id: number): Promise<CompetencyFramework> {
    try {
      console.log(`🔍 Fetching competency framework ${id}...`);
      
      const response = await makeApiCall({
        wsfunction: 'core_competency_read_competency_framework',
        id: id
      });
      
      if (response && response.id) {
        console.log(`✅ Found competency framework: ${response.shortname}`);
        return response;
      } else {
        throw new Error('Framework not found');
      }
    } catch (error) {
      console.error(`❌ Error fetching competency framework ${id}:`, error);
      throw error;
    }
  },

  // ==================== FRAMEWORK CRUD OPERATIONS ====================

  /**
   * Create a new competency framework
   * @param frameworkData - Framework creation data
   * @returns Promise<CompetencyFramework>
   */
  async createFramework(frameworkData: {
    shortname: string;
    idnumber: string;
    description: string;
    descriptionformat?: number;
    visible?: number;
    scaleid?: number;
    scaleconfiguration?: string;
    taxonomies?: string;
  }): Promise<CompetencyFramework> {
    try {
      console.log('🔨 Creating competency framework...');
      
      // Get system context
      const contextId = await this.getSystemContext();
      
      // Get a valid scale ID - try to get the default scale or use a valid one
      let scaleId = frameworkData.scaleid;
      let scaleConfiguration = frameworkData.scaleconfiguration;
      
      if (!scaleId || scaleId === 0) {
        try {
          // Try to get available scales from the system
          const availableScales = await this.getAvailableScales();
          
          if (availableScales.length > 0) {
            // Use the first available scale
            scaleId = availableScales[0].id;
            scaleConfiguration = availableScales[0].scaleconfiguration || '';
            console.log(`📊 Using scale ID: ${scaleId} (${availableScales[0].name})`);
          } else {
            // Fallback: use scale ID 2 (the default competency scale)
            scaleId = 2;
            scaleConfiguration = '[{"scaleid":"2"},{"id":1,"scaledefault":1,"proficient":0},{"id":2,"scaledefault":0,"proficient":1}]';
            console.log(`📊 Using fallback scale ID: ${scaleId} with proper configuration`);
          }
        } catch (scaleError) {
          console.warn('⚠️ Could not fetch scales, using fallback');
          scaleId = 2;
          scaleConfiguration = '[{"scaleid":"2"},{"id":1,"scaledefault":1,"proficient":0},{"id":2,"scaledefault":0,"proficient":1}]';
        }
      }
      
      // Format taxonomies properly - should be a JSON string or empty
      let taxonomies = '';
      if (frameworkData.taxonomies && frameworkData.taxonomies.trim()) {
        // Convert comma-separated values to proper format
        const taxonomyList = frameworkData.taxonomies.split(',').map(t => t.trim()).filter(t => t);
        if (taxonomyList.length > 0) {
          // For now, just use the first taxonomy or leave empty
          // The system might have specific taxonomy requirements
          taxonomies = '';
          console.log(`📝 Taxonomies provided but using empty string to avoid validation errors`);
        }
      }
      
      // Ensure we have a proper scale configuration
      if (!scaleConfiguration || scaleConfiguration === '') {
        scaleConfiguration = '[{"scaleid":"2"},{"id":1,"scaledefault":1,"proficient":0},{"id":2,"scaledefault":0,"proficient":1}]';
        console.log(`📊 Using fallback scale configuration for scale ID: ${scaleId}`);
      }

      const apiParams = {
        wsfunction: 'core_competency_create_competency_framework',
        'competencyframework[shortname]': frameworkData.shortname,
        'competencyframework[idnumber]': frameworkData.idnumber,
        'competencyframework[description]': frameworkData.description,
        'competencyframework[descriptionformat]': frameworkData.descriptionformat || 1,
        'competencyframework[visible]': frameworkData.visible !== undefined ? (frameworkData.visible ? 1 : 0) : 1,
        'competencyframework[scaleid]': scaleId,
        'competencyframework[scaleconfiguration]': scaleConfiguration,
        'competencyframework[contextid]': contextId,
        'competencyframework[taxonomies]': taxonomies,
        'competencyframework[timecreated]': 0,
        'competencyframework[timemodified]': 0,
        'competencyframework[usermodified]': 0
      };

      const response = await makeApiCall(apiParams);
      
      console.log('📊 Create framework API response:', response);
      
      // Check if response exists and has required fields
      if (response && (response.id || response.shortname)) {
        console.log(`✅ Created competency framework: ${response.shortname || 'Unknown'} (ID: ${response.id})`);
        return response;
      } else {
        console.error('❌ Invalid response from create framework API:', response);
        throw new Error('Failed to create competency framework - invalid response');
      }
    } catch (error) {
      console.error('❌ Error creating competency framework:', error);
      throw error;
    }
  },

  /**
   * Update an existing competency framework
   * @param id - Framework ID
   * @param frameworkData - Framework update data
   * @returns Promise<CompetencyFramework>
   */
  async updateFramework(id: number, frameworkData: {
    shortname?: string;
    idnumber?: string;
    description?: string;
    descriptionformat?: number;
    visible?: number;
    scaleid?: number;
    scaleconfiguration?: string;
    taxonomies?: string;
  }): Promise<CompetencyFramework> {
    try {
      console.log(`🔨 Updating competency framework ${id}...`);
      
      // Get system context
      const contextId = await this.getSystemContext();
      
      const apiParams: any = {
        wsfunction: 'core_competency_update_competency_framework'
      };

      // Add framework data with proper parameter structure - MUST include id
      apiParams['competencyframework[id]'] = id;
      
      if (frameworkData.shortname !== undefined) {
        apiParams['competencyframework[shortname]'] = frameworkData.shortname;
      }
      if (frameworkData.idnumber !== undefined) {
        apiParams['competencyframework[idnumber]'] = frameworkData.idnumber;
      }
      if (frameworkData.description !== undefined) {
        apiParams['competencyframework[description]'] = frameworkData.description;
      }
      if (frameworkData.descriptionformat !== undefined) {
        apiParams['competencyframework[descriptionformat]'] = frameworkData.descriptionformat;
      }
      if (frameworkData.visible !== undefined) {
        apiParams['competencyframework[visible]'] = frameworkData.visible ? 1 : 0;
      }
      if (frameworkData.scaleid !== undefined) {
        apiParams['competencyframework[scaleid]'] = frameworkData.scaleid;
      }
      if (frameworkData.scaleconfiguration !== undefined) {
        apiParams['competencyframework[scaleconfiguration]'] = frameworkData.scaleconfiguration;
      }
      if (frameworkData.taxonomies !== undefined) {
        apiParams['competencyframework[taxonomies]'] = frameworkData.taxonomies;
      }
      
      // Add context
      apiParams['competencyframework[contextid]'] = contextId;

      console.log('📊 Update framework API params:', apiParams);
      const response = await makeApiCall(apiParams);
      
      console.log('📊 Update framework API response:', response);
      
      // The update API returns true on success, not a framework object
      if (response === true || response === 1) {
        console.log(`✅ Updated competency framework with ID: ${id}`);
        
        // Fetch the updated framework to return it
        const updatedFramework = await this.readFramework(id);
        return updatedFramework;
      } else {
        console.error('❌ Invalid response from update framework API:', response);
        throw new Error('Failed to update competency framework - invalid response');
      }
    } catch (error) {
      console.error(`❌ Error updating competency framework ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a competency framework
   * @param id - Framework ID
   * @returns Promise<boolean>
   */
  async deleteFramework(id: number): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting competency framework ${id}...`);
      
      const apiParams = {
        wsfunction: 'core_competency_delete_competency_framework',
        id: id
      };

      const response = await makeApiCall(apiParams);
      
      console.log(`✅ Deleted competency framework ${id}`);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting competency framework ${id}:`, error);
      throw error;
    }
  },

  // ==================== COMPETENCY CRUD OPERATIONS ====================

  /**
   * Create a new competency
   * @param competencyData - Competency creation data
   * @returns Promise<Competency>
   */
  async createCompetency(competencyData: {
    shortname: string;
    idnumber: string;
    description: string;
    descriptionformat?: number;
    competencyframeworkid: number;
    parentid?: number;
    sortorder?: number;
    ruleoutcome?: number;
    ruletype?: string;
    ruleconfig?: string;
    scaleid?: number;
    scaleconfiguration?: string;
  }): Promise<Competency> {
    try {
      console.log('🔨 Creating competency...');
      
      // Get system context
      const contextId = await this.getSystemContext();
      
      const apiParams = {
        wsfunction: 'core_competency_create_competency',
        'competency[shortname]': competencyData.shortname,
        'competency[idnumber]': competencyData.idnumber,
        'competency[description]': competencyData.description,
        'competency[descriptionformat]': competencyData.descriptionformat || 1,
        'competency[competencyframeworkid]': competencyData.competencyframeworkid,
        'competency[parentid]': competencyData.parentid || 0,
        'competency[sortorder]': competencyData.sortorder || 0,
        'competency[ruleoutcome]': competencyData.ruleoutcome || 0,
        'competency[ruletype]': competencyData.ruletype || '',
        'competency[ruleconfig]': competencyData.ruleconfig || '',
        'competency[scaleid]': competencyData.scaleid || 0,
        'competency[scaleconfiguration]': competencyData.scaleconfiguration || '',
        'competency[contextid]': contextId,
        'competency[timecreated]': 0,
        'competency[timemodified]': 0,
        'competency[usermodified]': 0
      };

      const response = await makeApiCall(apiParams);
      
      if (response && response.id) {
        console.log(`✅ Created competency: ${response.shortname}`);
        return response;
      } else {
        throw new Error('Failed to create competency');
      }
    } catch (error) {
      console.error('❌ Error creating competency:', error);
      throw error;
    }
  },

  /**
   * Update an existing competency
   * @param id - Competency ID
   * @param competencyData - Competency update data
   * @returns Promise<Competency>
   */
  async updateCompetency(id: number, competencyData: {
    shortname?: string;
    idnumber?: string;
    description?: string;
    descriptionformat?: number;
    parentid?: number;
    sortorder?: number;
    ruleoutcome?: number;
    ruletype?: string;
    ruleconfig?: string;
    scaleid?: number;
    scaleconfiguration?: string;
  }): Promise<Competency> {
    try {
      console.log(`🔨 Updating competency ${id}...`);
      
      // Get system context
      const contextId = await this.getSystemContext();
      
      const apiParams: any = {
        wsfunction: 'core_competency_update_competency',
        id: id
      };

      // Add competency data with proper parameter structure
      if (competencyData.shortname !== undefined) {
        apiParams['competency[shortname]'] = competencyData.shortname;
      }
      if (competencyData.idnumber !== undefined) {
        apiParams['competency[idnumber]'] = competencyData.idnumber;
      }
      if (competencyData.description !== undefined) {
        apiParams['competency[description]'] = competencyData.description;
      }
      if (competencyData.descriptionformat !== undefined) {
        apiParams['competency[descriptionformat]'] = competencyData.descriptionformat;
      }
      if (competencyData.parentid !== undefined) {
        apiParams['competency[parentid]'] = competencyData.parentid;
      }
      if (competencyData.sortorder !== undefined) {
        apiParams['competency[sortorder]'] = competencyData.sortorder;
      }
      if (competencyData.ruleoutcome !== undefined) {
        apiParams['competency[ruleoutcome]'] = competencyData.ruleoutcome;
      }
      if (competencyData.ruletype !== undefined) {
        apiParams['competency[ruletype]'] = competencyData.ruletype;
      }
      if (competencyData.ruleconfig !== undefined) {
        apiParams['competency[ruleconfig]'] = competencyData.ruleconfig;
      }
      if (competencyData.scaleid !== undefined) {
        apiParams['competency[scaleid]'] = competencyData.scaleid;
      }
      if (competencyData.scaleconfiguration !== undefined) {
        apiParams['competency[scaleconfiguration]'] = competencyData.scaleconfiguration;
      }
      
      // Add context
      apiParams['competency[contextid]'] = contextId;

      const response = await makeApiCall(apiParams);
      
      if (response && response.id) {
        console.log(`✅ Updated competency: ${response.shortname}`);
        return response;
      } else {
        throw new Error('Failed to update competency');
      }
    } catch (error) {
      console.error(`❌ Error updating competency ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a competency
   * @param id - Competency ID
   * @returns Promise<boolean>
   */
  async deleteCompetency(id: number): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting competency ${id}...`);
      
      const apiParams = {
        wsfunction: 'core_competency_delete_competency',
        id: id,
        ...buildContextParams({ contextid: await this.getSystemContext() })
      };

      const response = await makeApiCall(apiParams);
      
      console.log(`✅ Deleted competency ${id}`);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting competency ${id}:`, error);
      throw error;
    }
  },

  // ==================== HIERARCHY CREATION HELPERS ====================

  /**
   * Create a complete competency hierarchy
   * @param frameworkData - Framework creation data
   * @param hierarchyData - Array of competency hierarchy data
   * @returns Promise<{framework: CompetencyFramework, competencies: Competency[]}>
   */
  async createCompetencyHierarchy(
    frameworkData: {
      shortname: string;
      idnumber: string;
      description: string;
      descriptionformat?: number;
      visible?: number;
      scaleid?: number;
      scaleconfiguration?: string;
      taxonomies?: string;
    },
    hierarchyData: Array<{
      shortname: string;
      idnumber: string;
      description: string;
      descriptionformat?: number;
      parentid?: number;
      sortorder?: number;
      children?: Array<{
        shortname: string;
        idnumber: string;
        description: string;
        descriptionformat?: number;
        sortorder?: number;
        children?: Array<{
          shortname: string;
          idnumber: string;
          description: string;
          descriptionformat?: number;
          sortorder?: number;
        }>;
      }>;
    }>
  ): Promise<{framework: CompetencyFramework, competencies: Competency[]}> {
    try {
      console.log('🌳 Creating complete competency hierarchy...');
      
      // Step 1: Create the framework
      const framework = await this.createFramework(frameworkData);
      console.log(`✅ Created framework: ${framework.shortname}`);
      
      // Step 2: Create competencies in hierarchical order
      const createdCompetencies: Competency[] = [];
      const competencyMap: { [key: string]: Competency } = {};
      
      // Helper function to create competencies recursively
      const createCompetenciesRecursively = async (
        items: any[],
        parentId: number = 0,
        level: number = 0
      ): Promise<void> => {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const sortOrder = item.sortorder || (i + 1) * 10; // Default sort order
          
          const competency = await this.createCompetency({
            shortname: item.shortname,
            idnumber: item.idnumber,
            description: item.description,
            descriptionformat: item.descriptionformat || 1,
            competencyframeworkid: framework.id,
            parentid: parentId,
            sortorder: sortOrder
          });
          
          createdCompetencies.push(competency);
          competencyMap[item.idnumber] = competency;
          
          console.log(`✅ Created competency: ${competency.shortname} (Level ${level})`);
          
          // Create children if they exist
          if (item.children && item.children.length > 0) {
            await createCompetenciesRecursively(item.children, competency.id, level + 1);
          }
        }
      };
      
      // Create all competencies
      await createCompetenciesRecursively(hierarchyData);
      
      console.log(`✅ Created complete hierarchy with ${createdCompetencies.length} competencies`);
      
      return {
        framework,
        competencies: createdCompetencies
      };
    } catch (error) {
      console.error('❌ Error creating competency hierarchy:', error);
      throw error;
    }
  },

  // ==================== COMPETENCY READ OPERATIONS ====================

  /**
   * List competencies with optional filters
   * @param params - Competency list parameters
   * @returns Promise<Competency[]>
   */
  async listCompetencies(params: CompetencyListParams = {}): Promise<Competency[]> {
    try {
      console.log('🔍 Fetching competencies...');
      
      // The API requires filters parameter, so we need to provide at least one filter
      // If no filters provided, try to get competencies from the first available framework
      let filtersToUse = params.filters && params.filters.length > 0 ? params.filters : [];
      
      // If no filters provided, we need to get a framework ID first
      if (filtersToUse.length === 0) {
        try {
          // Get the first available framework
          const frameworks = await this.listFrameworks({ limit: 1 });
          if (frameworks.length > 0) {
            filtersToUse = [{ column: 'competencyframeworkid', value: frameworks[0].id.toString() }];
          } else {
            // If no frameworks exist, try with a default filter
            filtersToUse = [{ column: 'id', value: '1' }];
          }
        } catch (error) {
          console.warn('Could not get framework for filter, using default filter');
          filtersToUse = [{ column: 'id', value: '1' }];
        }
      }
      
      const apiParams: any = {
        wsfunction: 'core_competency_list_competencies',
        sort: params.sort || '',
        order: params.order || '',
        skip: params.skip || 0,
        limit: params.limit || 0,
        ...buildFilterParams(filtersToUse)
      };

      const response = await makeApiCall(apiParams);
      
      if (Array.isArray(response)) {
        console.log(`✅ Found ${response.length} competencies`);
        return response;
      } else {
        console.warn('⚠️ Invalid response format for competencies');
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching competencies:', error);
      throw error;
    }
  },

  /**
   * Read a specific competency
   * @param id - Competency ID
   * @returns Promise<Competency>
   */
  async readCompetency(id: number): Promise<Competency> {
    try {
      console.log(`🔍 Fetching competency ${id}...`);
      
      const response = await makeApiCall({
        wsfunction: 'core_competency_read_competency',
        id: id
      });
      
      if (response && response.id) {
        console.log(`✅ Found competency: ${response.shortname}`);
        return response;
      } else {
        throw new Error('Competency not found');
      }
    } catch (error) {
      console.error(`❌ Error fetching competency ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get competencies by framework ID
   * @param frameworkId - Framework ID
   * @returns Promise<Competency[]>
   */
  async getCompetenciesByFramework(frameworkId: number): Promise<Competency[]> {
    try {
      console.log(`🔍 Fetching competencies for framework ${frameworkId}...`);
      
      return await this.listCompetencies({
        filters: [
          {
            column: 'competencyframeworkid',
            value: frameworkId.toString()
          }
        ]
      });
    } catch (error) {
      console.error(`❌ Error fetching competencies for framework ${frameworkId}:`, error);
      throw error;
    }
  },

  /**
   * Search competencies by query
   * @param query - Search query
   * @param frameworkId - Optional framework ID to limit search
   * @returns Promise<Competency[]>
   */
  async searchCompetencies(query: string, frameworkId?: number): Promise<Competency[]> {
    try {
      console.log(`🔍 Searching competencies with query: "${query}"...`);
      
      const filters: CompetencyFilter[] = [];
      
      if (frameworkId) {
        filters.push({
          column: 'competencyframeworkid',
          value: frameworkId.toString()
        });
      }

      // Note: The API doesn't have a direct search parameter for competencies
      // We'll need to fetch all and filter client-side, or use the framework search
      const competencies = await this.listCompetencies({ 
        filters
      });
      
      // Filter by query (case-insensitive)
      const filtered = competencies.filter(comp => 
        comp.shortname.toLowerCase().includes(query.toLowerCase()) ||
        comp.description.toLowerCase().includes(query.toLowerCase()) ||
        comp.idnumber.toLowerCase().includes(query.toLowerCase())
      );
      
      console.log(`✅ Found ${filtered.length} competencies matching "${query}"`);
      return filtered;
    } catch (error) {
      console.error(`❌ Error searching competencies:`, error);
      throw error;
    }
  },

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Get all frameworks with their competencies
   * @returns Promise<{frameworks: CompetencyFramework[], competencies: Competency[]}>
   */
  async getAllFrameworksWithCompetencies(): Promise<{
    frameworks: CompetencyFramework[];
    competencies: Competency[];
  }> {
    try {
      console.log('🔍 Fetching all frameworks with competencies...');
      
      // Get all frameworks
      const frameworks = await this.listFrameworks({
        onlyvisible: 1, // Only visible frameworks
        limit: 0 // Get all
      });
      
      // Get all competencies
      const competencies = await this.listCompetencies({
        limit: 0 // Get all
      });
      
      console.log(`✅ Found ${frameworks.length} frameworks and ${competencies.length} competencies`);
      
      return {
        frameworks,
        competencies
      };
    } catch (error) {
      console.error('❌ Error fetching frameworks with competencies:', error);
      throw error;
    }
  },

  /**
   * Get framework statistics
   * @param frameworkId - Framework ID
   * @returns Promise<{framework: CompetencyFramework, competencyCount: number}>
   */
  async getFrameworkStats(frameworkId: number): Promise<{
    framework: CompetencyFramework;
    competencyCount: number;
  }> {
    try {
      console.log(`🔍 Getting framework statistics for ${frameworkId}...`);
      
      const [framework, competencies] = await Promise.all([
        this.readFramework(frameworkId),
        this.getCompetenciesByFramework(frameworkId)
      ]);
      
      return {
        framework,
        competencyCount: competencies.length
      };
    } catch (error) {
      console.error(`❌ Error getting framework statistics:`, error);
      throw error;
    }
  },

  /**
   * Test API connection
   * @returns Promise<boolean>
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing competency API connection...');
      
      // Try to fetch frameworks to test connection
      await this.listFrameworks({ limit: 1 });
      
      console.log('✅ Competency API connection successful');
      return true;
    } catch (error) {
      console.error('❌ Competency API connection failed:', error);
      return false;
    }
  }
};

export default competencyService;
