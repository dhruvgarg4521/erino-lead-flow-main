import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadFilters, LeadPagination } from '@/types/lead';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<LeadPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLeads = async (filters: LeadFilters = {}, page = 1, limit = 20) => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }
      if (filters.company) {
        query = query.ilike('company', `%${filters.company}%`);
      }
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      if (filters.source && filters.source.length > 0) {
        query = query.in('source', filters.source);
      }
      if (filters.score) {
        if (filters.score.min !== undefined) {
          query = query.gte('score', filters.score.min);
        }
        if (filters.score.max !== undefined) {
          query = query.lte('score', filters.score.max);
        }
      }
      if (filters.lead_value) {
        if (filters.lead_value.min !== undefined) {
          query = query.gte('lead_value', filters.lead_value.min);
        }
        if (filters.lead_value.max !== undefined) {
          query = query.lte('lead_value', filters.lead_value.max);
        }
      }
      if (filters.is_qualified !== undefined) {
        query = query.eq('is_qualified', filters.is_qualified);
      }
      if (filters.created_at) {
        if (filters.created_at.start) {
          query = query.gte('created_at', filters.created_at.start);
        }
        if (filters.created_at.end) {
          query = query.lte('created_at', filters.created_at.end);
        }
      }
      if (filters.last_activity_at) {
        if (filters.last_activity_at.start) {
          query = query.gte('last_activity_at', filters.last_activity_at.start);
        }
        if (filters.last_activity_at.end) {
          query = query.lte('last_activity_at', filters.last_activity_at.end);
        }
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      setLeads(data || []);
      setPagination({
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching leads",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...leadData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Lead created",
        description: "Lead has been successfully created.",
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating lead",
        description: error.message,
      });
      return { data: null, error };
    }
  };

  const updateLead = async (id: string, leadData: Partial<Lead>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('leads')
        .update(leadData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Lead updated",
        description: "Lead has been successfully updated.",
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating lead",
        description: error.message,
      });
      return { data: null, error };
    }
  };

  const deleteLead = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Lead deleted",
        description: "Lead has been successfully deleted.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting lead",
        description: error.message,
      });
      return { error };
    }
  };

  return {
    leads,
    loading,
    pagination,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
  };
};