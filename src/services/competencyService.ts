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
    return response.data;
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

  // ==================== COMPETENCY OPERATIONS ====================

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
