
import { supabase } from '@/integrations/supabase/client';

export interface LogoUploadResult {
  success: boolean;
  logoUrl?: string;
  storagePath?: string;
  error?: string;
}

export const uploadOrganizationLogo = async (
  organizationId: string,
  file: File
): Promise<LogoUploadResult> => {
  try {
    // Create file path: organization-id/logo.extension
    const fileExt = file.name.split('.').pop();
    const fileName = `${organizationId}/logo.${fileExt}`;
    
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('organization-logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // Replace existing logo
      });

    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('organization-logos')
      .getPublicUrl(fileName);

    // Update organization record
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        logo_url: publicUrl,
        logo_storage_path: fileName
      })
      .eq('id', organizationId);

    if (updateError) {
      console.error('Error updating organization logo:', updateError);
      return { success: false, error: updateError.message };
    }

    // Create/update organization asset record
    const { error: assetError } = await supabase
      .from('organization_assets')
      .upsert({
        organization_id: organizationId,
        asset_type: 'logo',
        asset_url: publicUrl,
        storage_path: fileName,
        asset_name: `${organizationId}-logo`,
        file_size: file.size,
        mime_type: file.type,
        is_active: true,
        display_order: 0
      }, {
        onConflict: 'organization_id,asset_type'
      });

    if (assetError) {
      console.error('Error creating asset record:', assetError);
    }

    return {
      success: true,
      logoUrl: publicUrl,
      storagePath: fileName
    };
  } catch (error) {
    console.error('Unexpected error uploading logo:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

export const deleteOrganizationLogo = async (organizationId: string): Promise<boolean> => {
  try {
    // Get current logo path
    const { data: org } = await supabase
      .from('organizations')
      .select('logo_storage_path')
      .eq('id', organizationId)
      .single();

    if (org?.logo_storage_path) {
      // Delete from storage
      await supabase.storage
        .from('organization-logos')
        .remove([org.logo_storage_path]);
    }

    // Update organization record
    await supabase
      .from('organizations')
      .update({
        logo_url: null,
        logo_storage_path: null
      })
      .eq('id', organizationId);

    // Deactivate asset record
    await supabase
      .from('organization_assets')
      .update({ is_active: false })
      .eq('organization_id', organizationId)
      .eq('asset_type', 'logo');

    return true;
  } catch (error) {
    console.error('Error deleting organization logo:', error);
    return false;
  }
};
