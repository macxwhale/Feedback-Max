
const { createClient } = require('@supabase/supabase-js');

class AssetController {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async getAssets(req, res) {
    try {
      const { organization_id, asset_type, active_only = true } = req.query;
      const { limit = 50, offset = 0 } = req.query;

      let query = this.supabase
        .from('organization_assets')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (organization_id) {
        query = query.eq('organization_id', organization_id);
      }

      if (asset_type) {
        query = query.eq('asset_type', asset_type);
      }

      if (active_only === 'true') {
        query = query.eq('is_active', true);
      }

      const { data: assets, error } = await query;

      if (error) throw error;

      res.json({
        success: true,
        data: assets || []
      });
    } catch (error) {
      console.error('Get assets error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch assets'
      });
    }
  }

  async createAsset(req, res) {
    try {
      const {
        organization_id,
        asset_type,
        asset_url,
        asset_name,
        display_order,
        mime_type,
        file_size
      } = req.body;

      if (!organization_id || !asset_type || !asset_url) {
        return res.status(400).json({
          success: false,
          error: 'Organization ID, asset type, and asset URL are required'
        });
      }

      const assetData = {
        organization_id,
        asset_type,
        asset_url,
        asset_name,
        display_order: display_order || 0,
        mime_type,
        file_size,
        is_active: true
      };

      const { data: asset, error } = await this.supabase
        .from('organization_assets')
        .insert(assetData)
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        data: asset,
        message: 'Asset created successfully'
      });
    } catch (error) {
      console.error('Create asset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create asset'
      });
    }
  }

  async updateAsset(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove id from updates if present
      delete updates.id;

      const { data: asset, error } = await this.supabase
        .from('organization_assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!asset) {
        return res.status(404).json({
          success: false,
          error: 'Asset not found'
        });
      }

      res.json({
        success: true,
        data: asset,
        message: 'Asset updated successfully'
      });
    } catch (error) {
      console.error('Update asset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update asset'
      });
    }
  }

  async deleteAsset(req, res) {
    try {
      const { id } = req.params;

      // First get the asset to check if it exists and get storage path
      const { data: asset, error: fetchError } = await this.supabase
        .from('organization_assets')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !asset) {
        return res.status(404).json({
          success: false,
          error: 'Asset not found'
        });
      }

      // Delete from storage if storage_path exists
      if (asset.storage_path) {
        const { error: storageError } = await this.supabase.storage
          .from('organization-logos')
          .remove([asset.storage_path]);

        if (storageError) {
          console.warn('Failed to delete from storage:', storageError);
        }
      }

      // Delete from database
      const { error: deleteError } = await this.supabase
        .from('organization_assets')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      res.json({
        success: true,
        message: 'Asset deleted successfully'
      });
    } catch (error) {
      console.error('Delete asset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete asset'
      });
    }
  }

  async uploadAsset(req, res) {
    try {
      const { organization_id, asset_type } = req.body;
      const file = req.file;

      if (!organization_id || !asset_type || !file) {
        return res.status(400).json({
          success: false,
          error: 'Organization ID, asset type, and file are required'
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${organization_id}/${asset_type}/${timestamp}-${file.originalname}`;

      // Upload to Supabase Storage
      const { data: storageData, error: storageError } = await this.supabase.storage
        .from('organization-logos')
        .upload(filename, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (storageError) throw storageError;

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('organization-logos')
        .getPublicUrl(filename);

      // Save asset record
      const assetData = {
        organization_id,
        asset_type,
        asset_url: publicUrl,
        asset_name: file.originalname,
        storage_path: filename,
        mime_type: file.mimetype,
        file_size: file.size,
        is_active: true,
        display_order: 0
      };

      const { data: asset, error: dbError } = await this.supabase
        .from('organization_assets')
        .insert(assetData)
        .select()
        .single();

      if (dbError) throw dbError;

      res.status(201).json({
        success: true,
        data: asset,
        message: 'Asset uploaded successfully'
      });
    } catch (error) {
      console.error('Upload asset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload asset'
      });
    }
  }

  async getThemes(req, res) {
    try {
      const { organization_id, active_only = true } = req.query;

      let query = this.supabase
        .from('organization_themes')
        .select('*')
        .order('created_at', { ascending: false });

      if (organization_id) {
        query = query.eq('organization_id', organization_id);
      }

      if (active_only === 'true') {
        query = query.eq('is_active', true);
      }

      const { data: themes, error } = await query;

      if (error) throw error;

      res.json({
        success: true,
        data: themes || []
      });
    } catch (error) {
      console.error('Get themes error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch themes'
      });
    }
  }

  async createTheme(req, res) {
    try {
      const {
        organization_id,
        theme_name,
        colors,
        typography,
        spacing
      } = req.body;

      if (!organization_id || !theme_name) {
        return res.status(400).json({
          success: false,
          error: 'Organization ID and theme name are required'
        });
      }

      const themeData = {
        organization_id,
        theme_name,
        colors: colors || {
          primary: '#007ACE',
          secondary: '#073763',
          background: '#f8fafc',
          surface: '#ffffff',
          text_primary: '#1f2937',
          text_secondary: '#6b7280',
          accent: '#f97316',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444'
        },
        typography: typography || {
          font_family: 'Inter, sans-serif',
          heading_font_size: '2rem',
          body_font_size: '1rem',
          small_font_size: '0.875rem'
        },
        spacing: spacing || {
          container_padding: '2rem',
          section_gap: '1.5rem',
          element_gap: '1rem'
        },
        is_active: true
      };

      const { data: theme, error } = await this.supabase
        .from('organization_themes')
        .insert(themeData)
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        data: theme,
        message: 'Theme created successfully'
      });
    } catch (error) {
      console.error('Create theme error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create theme'
      });
    }
  }
}

module.exports = { AssetController };
