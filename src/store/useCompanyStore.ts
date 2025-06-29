import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { Company } from '@/lib/supabase';
import { toast } from 'sonner';

interface CompanyState {
  companies: Company[];
  loading: boolean;
  currentPage: number;
  totalCount: number;
  searchTerm: string;
  selectedCompany: Company | null;
  isAddOpen: boolean;
  isEditOpen: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  lastFetch: number | null;
  newCompany: {
    name: string;
    website_url: string;
    description: string;
  };
  editedCompany: {
    name: string;
    website_url: string;
    description: string;
  };
  // Actions
  setCompanies: (companies: Company[]) => void;
  setLoading: (loading: boolean) => void;
  setCurrentPage: (page: number) => void;
  setTotalCount: (count: number) => void;
  setSearchTerm: (term: string) => void;
  setSelectedCompany: (company: Company | null) => void;
  setIsAddOpen: (isOpen: boolean) => void;
  setIsEditOpen: (isOpen: boolean) => void;
  setError: (error: string | null) => void;
  setNewCompany: (company: { name: string; website_url: string; description: string }) => void;
  setEditedCompany: (company: { name: string; website_url: string; description: string }) => void;
  // Async actions
  loadCompanies: () => Promise<void>;
  addCompany: () => Promise<void>;
  updateCompany: (companyId: string) => Promise<void>;
  deleteCompany: (companyId: string) => Promise<void>;
  resetNewCompany: () => void;
  resetEditedCompany: () => void;
}

const ITEMS_PER_PAGE = 10;
// const CACHE_DURATION = 5 * 60 * 1000; 

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      companies: [],
      loading: false,
      currentPage: 1,
      totalCount: 0,
      searchTerm: '',
      selectedCompany: null,
      isAddOpen: false,
      isEditOpen: false,
      isCreating: false,
      isUpdating: false,
      error: null,
      lastFetch: null,
      newCompany: {
        name: '',
        website_url: '',
        description: '',
      },
      editedCompany: {
        name: '',
        website_url: '',
        description: '',
      },

      // Actions
      setCompanies: (companies: Company[]) => set({ companies }),
      setLoading: (loading: boolean) => set({ loading }),
      setCurrentPage: (currentPage: number) => set({ currentPage }),
      setTotalCount: (totalCount: number) => set({ totalCount }),
      setSearchTerm: (searchTerm: string) => set({ searchTerm }),
      setSelectedCompany: (selectedCompany: Company | null) => set({ selectedCompany }),
      setIsAddOpen: (isAddOpen: boolean) => set({ isAddOpen }),
      setIsEditOpen: (isEditOpen: boolean) => set({ isEditOpen }),
      setError: (error: string | null) => set({ error }),
      setNewCompany: (newCompany: { name: string; website_url: string; description: string }) => set({ newCompany }),
      setEditedCompany: (editedCompany: { name: string; website_url: string; description: string }) => set({ editedCompany }),

      // Async actions
      loadCompanies: async () => {
        const { currentPage, searchTerm } = get();
        
        set({ loading: true });
        try {
          let query = supabase
            .from('companies')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

          if (searchTerm) {
            query = query.ilike('name', `%${searchTerm}%`);
          }

          const { data, error, count } = await query
            .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

          if (error) {
            console.error('Error loading companies:', error);
            toast.error('Failed to load companies');
            return;
          }

          set({ 
            companies: data || [], 
            totalCount: count || 0,
            lastFetch: Date.now() 
          });
        } catch (error) {
          console.error('Error loading companies:', error);
          toast.error('Failed to load companies');
        } finally {
          set({ loading: false });
        }
      },

      addCompany: async () => {
        const { newCompany } = get();
        if (!newCompany.name || !newCompany.description) {
          toast.error('Company name and description are required');
          return;
        }

        set({ isCreating: true });
        try {
          const { error } = await supabase
            .from('companies')
            .insert([{
              name: newCompany.name,
              website_url: newCompany.website_url,
              description: newCompany.description
            }]);

          if (error) {
            console.error('Error creating company:', error);
            toast.error('Failed to create company');
            return;
          }

          toast.success('Company created successfully');
          set({ isAddOpen: false });
          get().resetNewCompany();
          get().loadCompanies();
        } catch (error) {
          console.error('Error creating company:', error);
          toast.error('Failed to create company');
        } finally {
          set({ isCreating: false });
        }
      },

      updateCompany: async (companyId: string) => {
        const { editedCompany } = get();
        if (!editedCompany.name || !editedCompany.description) {
          toast.error('Company name and description are required');
          return;
        }

        set({ isUpdating: true });
        try {
          const { error } = await supabase
            .from('companies')
            .update({
              name: editedCompany.name,
              website_url: editedCompany.website_url,
              description: editedCompany.description
            })
            .eq('company_id', companyId);

          if (error) {
            console.error('Error updating company:', error);
            toast.error('Failed to update company');
            return;
          }

          toast.success('Company updated successfully');
          set({ isEditOpen: false });
          get().loadCompanies();
        } catch (error) {
          console.error('Error updating company:', error);
          toast.error('Failed to update company');
        } finally {
          set({ isUpdating: false });
        }
      },

      deleteCompany: async (companyId: string) => {
        try {
          const { error } = await supabase
            .from('companies')
            .delete()
            .eq('company_id', companyId);

          if (error) {
            console.error('Error deleting company:', error);
            toast.error('Failed to delete company');
            return;
          }

          toast.success('Company deleted successfully');
          get().loadCompanies();
        } catch (error) {
          console.error('Error deleting company:', error);
          toast.error('Failed to delete company');
        }
      },

      resetNewCompany: () => set({
        newCompany: {
          name: '',
          website_url: '',
          description: '',
        }
      }),

      resetEditedCompany: () => set({
        editedCompany: {
          name: '',
          website_url: '',
          description: '',
        }
      }),
    }),
    {
      name: 'company-store',
      partialize: (state) => ({
        companies: state.companies,
        currentPage: state.currentPage,
        totalCount: state.totalCount,
        searchTerm: state.searchTerm,
        lastFetch: state.lastFetch,
      }),
    }
  )
); 