
const { createClient } = require('@supabase/supabase-js');

class OrganizationController {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async getAllOrganizations(req, res) {
    try {
      const { data: organizations, error } = await this.supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        data: organizations || []
      });
    } catch (error) {
      console.error('Get organizations error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch organizations'
      });
    }
  }

  async getOrganizationById(req, res) {
    try {
      const { id } = req.params;
      
      const { data: organization, error } = await this.supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!organization) {
        return res.status(404).json({
          success: false,
          error: 'Organization not found'
        });
      }

      res.json({
        success: true,
        data: organization
      });
    } catch (error) {
      console.error('Get organization error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch organization'
      });
    }
  }

  async getOrganizationBySlug(req, res) {
    try {
      const { slug } = req.params;
      
      const { data: organization, error } = await this.supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      if (!organization) {
        return res.status(404).json({
          success: false,
          error: 'Organization not found'
        });
      }

      res.json({
        success: true,
        data: organization
      });
    } catch (error) {
      console.error('Get organization by slug error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch organization'
      });
    }
  }

  async createOrganization(req, res) {
    try {
      const {
        name,
        slug,
        domain,
        logo_url,
        primary_color,
        secondary_color,
        plan_type,
        created_by_user_id,
        settings,
        features_config
      } = req.body;

      // Validate required fields
      if (!name || !slug) {
        return res.status(400).json({
          success: false,
          error: 'Name and slug are required'
        });
      }

      // Check if slug already exists
      const { data: existingOrg } = await this.supabase
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existingOrg) {
        return res.status(400).json({
          success: false,
          error: 'Organization slug already exists'
        });
      }

      const organizationData = {
        name,
        slug,
        domain,
        logo_url,
        primary_color: primary_color || '#007ACE',
        secondary_color: secondary_color || '#073763',
        plan_type: plan_type || 'starter',
        created_by_user_id,
        is_active: true,
        max_responses: 100,
        settings: settings || {},
        features_config: features_config || null
      };

      const { data: organization, error } = await this.supabase
        .from('organizations')
        .insert(organizationData)
        .select()
        .single();

      if (error) throw error;

      // Log creation in audit log
      if (organization?.id && created_by_user_id) {
        await this.supabase
          .from('organization_audit_log')
          .insert({
            organization_id: organization.id,
            action: "create_organization",
            performed_by: created_by_user_id,
            new_value: organization,
          });
      }

      res.status(201).json({
        success: true,
        data: organization,
        message: 'Organization created successfully'
      });
    } catch (error) {
      console.error('Create organization error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create organization'
      });
    }
  }

  async updateOrganization(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove id from updates if present
      delete updates.id;

      const { data: organization, error } = await this.supabase
        .from('organizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!organization) {
        return res.status(404).json({
          success: false,
          error: 'Organization not found'
        });
      }

      res.json({
        success: true,
        data: organization,
        message: 'Organization updated successfully'
      });
    } catch (error) {
      console.error('Update organization error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update organization'
      });
    }
  }

  async getOrganizationStats(req, res) {
    try {
      const { id } = req.params;

      const { data: stats, error } = await this.supabase
        .rpc('get_organization_stats_enhanced', {
          org_id: id
        });

      if (error) throw error;

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get organization stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch organization statistics'
      });
    }
  }

  async getOrganizationMembers(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, search, role_filter } = req.query;
      const offset = (page - 1) * limit;

      const { data: result, error } = await this.supabase
        .rpc('get_paginated_organization_users', {
          org_id: id,
          page_size: parseInt(limit),
          page_offset: offset,
          search_term: search || null,
          role_filter: role_filter || null
        });

      if (error) throw error;

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get organization members error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch organization members'
      });
    }
  }

  async getOrganizationConfig(req, res) {
    try {
      const { slug } = req.params;

      const { data: config, error } = await this.supabase
        .rpc('get_organization_config', {
          org_slug: slug
        });

      if (error) throw error;

      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'Organization configuration not found'
        });
      }

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Get organization config error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch organization configuration'
      });
    }
  }
}

module.exports = { OrganizationController };
