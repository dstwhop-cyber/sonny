
import { supabase } from './supabaseClient';
import { SavedItem } from '../types';

export const collectionService = {
  saveItem: async (params: {
    userId: string;
    type: string;
    topic: string;
    content: string;
    metadata?: any;
  }) => {
    const { data, error } = await supabase
      .from('saved_creations')
      .insert([
        {
          user_id: params.userId,
          type: params.type,
          topic: params.topic,
          content: params.content,
          metadata: params.metadata || {}
        }
      ]);
    
    if (error) {
      console.error('Error saving item:', error);
      throw error;
    }
    return data;
  },

  getItems: async (userId: string): Promise<SavedItem[]> => {
    const { data, error } = await supabase
      .from('saved_creations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching collection:', error);
      return [];
    }
    return data || [];
  },

  deleteItem: async (itemId: string) => {
    const { error } = await supabase
      .from('saved_creations')
      .delete()
      .eq('id', itemId);
    
    if (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }
};
