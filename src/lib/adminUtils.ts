import { supabase } from '@/integrations/supabase/client';

/**
 * Check if a user has admin privileges
 * @param userId - The user ID to check
 * @returns Promise<boolean> - True if user is admin, false otherwise
 */
export const checkAdminRole = async (userId: string): Promise<boolean> => {
  try {
    console.log('checkAdminRole called with userId:', userId);
    
    // Try to check is_admin column first
    const { data, error } = await supabase
      .from('doctor_profiles')
      .select('is_admin, email')
      .eq('user_id', userId)
      .single();

    console.log('Admin role query result:', { data, error });

    if (error) {
      console.error('Error checking admin role:', error);
      
      // If column doesn't exist (PGRST116), fallback to email check
      if (error.code === 'PGRST116') {
        console.log('is_admin column not found, falling back to email check');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('doctor_profiles')
          .select('email')
          .eq('user_id', userId)
          .single();
        
        if (fallbackError) {
          console.error('Error in fallback query:', fallbackError);
          return false;
        }
        
        // Fallback: allow access for patientpathway@admin.com
        const isDefaultAdmin = fallbackData?.email === 'patientpathway@admin.com';
        console.log('Fallback result - is default admin:', isDefaultAdmin);
        return isDefaultAdmin;
      }
      
      return false;
    }

    // If is_admin column exists and has a value, use it
    if (data?.is_admin !== undefined) {
      console.log('Using is_admin column result:', data.is_admin);
      return data.is_admin === true;
    }

    // If is_admin is null/undefined, fallback to email check
    const isDefaultAdmin = data?.email === 'patientpathway@admin.com';
    console.log('is_admin is null, using email fallback:', isDefaultAdmin);
    return isDefaultAdmin;
  } catch (error) {
    console.error('Unexpected error in checkAdminRole:', error);
    return false;
  }
};

/**
 * Get admin status for the current authenticated user
 * @returns Promise<boolean> - True if current user is admin, false otherwise
 */
export const getCurrentUserAdminStatus = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return false;
    }
    
    return await checkAdminRole(user.id);
  } catch (error) {
    console.error('Error getting current user admin status:', error);
    return false;
  }
};
