import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { Job, JobType } from '@/lib/supabase';
import { toast } from 'sonner';

interface JobState {
  jobs: Job[];
  loading: boolean;
  currentPage: number;
  totalCount: number;
  searchTerm: string;
  selectedJob: Job | null;
  isAddOpen: boolean;
  isEditOpen: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  newJob: {
    title: string;
    description: string;
    location: string;
    company_id: string;
    job_type: JobType;
  };
  editedJob: {
    title: string;
    description: string;
    location: string;
    company_id: string;
    job_type: JobType;
  };
  // Actions
  setJobs: (jobs: Job[]) => void;
  setLoading: (loading: boolean) => void;
  setCurrentPage: (page: number) => void;
  setTotalCount: (count: number) => void;
  setSearchTerm: (term: string) => void;
  setSelectedJob: (job: Job | null) => void;
  setIsAddOpen: (isOpen: boolean) => void;
  setIsEditOpen: (isOpen: boolean) => void;
  setNewJob: (job: { title: string; description: string; location: string; company_id: string; job_type: JobType }) => void;
  setEditedJob: (job: { title: string; description: string; location: string; company_id: string; job_type: JobType }) => void;
  // Async actions
  loadJobs: (companyId?: string) => Promise<void>;
  addJob: (companyId?: string) => Promise<void>;
  updateJob: (jobId: string) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  resetNewJob: () => void;
  resetEditedJob: () => void;
}

const ITEMS_PER_PAGE = 10;

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      jobs: [],
      loading: false,
      currentPage: 1,
      totalCount: 0,
      searchTerm: '',
      selectedJob: null,
      isAddOpen: false,
      isEditOpen: false,
      isCreating: false,
      isUpdating: false,
      newJob: {
        title: '',
        description: '',
        location: '',
        company_id: '',
        job_type: 'FULL-TIME',
      },
      editedJob: {
        title: '',
        description: '',
        location: '',
        company_id: '',
        job_type: 'FULL-TIME',
      },

      // Actions
      setJobs: (jobs: Job[]) => set({ jobs }),
      setLoading: (loading: boolean) => set({ loading }),
      setCurrentPage: (currentPage: number) => set({ currentPage }),
      setTotalCount: (totalCount: number) => set({ totalCount }),
      setSearchTerm: (searchTerm: string) => set({ searchTerm }),
      setSelectedJob: (selectedJob: Job | null) => set({ selectedJob }),
      setIsAddOpen: (isAddOpen: boolean) => set({ isAddOpen }),
      setIsEditOpen: (isEditOpen: boolean) => set({ isEditOpen }),
      setNewJob: (newJob: { title: string; description: string; location: string; company_id: string; job_type: JobType }) => set({ newJob }),
      setEditedJob: (editedJob: { title: string; description: string; location: string; company_id: string; job_type: JobType }) => set({ editedJob }),

      // Async actions
      loadJobs: async (companyId?: string) => {
        const { currentPage, searchTerm } = get();
        set({ loading: true });
        try {
          let query = supabase
            .from('jobs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

          if (companyId) {
            query = query.eq('company_id', companyId);
          }

          if (searchTerm) {
            query = query.ilike('title', `%${searchTerm}%`);
          }

          const { data, error, count } = await query
            .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

          if (error) {
            console.error('Error loading jobs:', error);
            toast.error('Failed to load jobs');
            return;
          }

          set({ jobs: data || [], totalCount: count || 0 });
        } catch (error) {
          console.error('Error loading jobs:', error);
          toast.error('Failed to load jobs');
        } finally {
          set({ loading: false });
        }
      },

      addJob: async (companyId?: string) => {
        const { newJob } = get();
        if (!newJob.title || !newJob.description) {
          toast.error('Job title and description are required');
          return;
        }

        set({ isCreating: true });
        try {
          const { error } = await supabase
            .from('jobs')
            .insert([{
              title: newJob.title,
              description: newJob.description,
              location: newJob.location,
              company_id: newJob.company_id,
              job_type: newJob.job_type,
              status: 'OPEN'
            }]);

          if (error) {
            console.error('Error creating job:', error);
            toast.error('Failed to create job');
            return;
          }

          toast.success('Job created successfully');
          set({ isAddOpen: false });
          get().resetNewJob();
          get().loadJobs(companyId);
        } catch (error) {
          console.error('Error creating job:', error);
          toast.error('Failed to create job');
        } finally {
          set({ isCreating: false });
        }
      },

      updateJob: async (jobId: string) => {
        const { editedJob } = get();
        if (!editedJob.title || !editedJob.description) {
          toast.error('Job title and description are required');
          return;
        }

        set({ isUpdating: true });
        try {
          const { error } = await supabase
            .from('jobs')
            .update({
              title: editedJob.title,
              description: editedJob.description,
              location: editedJob.location,
              company_id: editedJob.company_id,
              job_type: editedJob.job_type
            })
            .eq('job_id', jobId);

          if (error) {
            console.error('Error updating job:', error);
            toast.error('Failed to update job');
            return;
          }

          toast.success('Job updated successfully');
          set({ isEditOpen: false });
          get().loadJobs();
        } catch (error) {
          console.error('Error updating job:', error);
          toast.error('Failed to update job');
        } finally {
          set({ isUpdating: false });
        }
      },

      deleteJob: async (jobId: string) => {
        try {
          const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('job_id', jobId);

          if (error) {
            console.error('Error deleting job:', error);
            toast.error('Failed to delete job');
            return;
          }

          toast.success('Job deleted successfully');
          get().loadJobs();
        } catch (error) {
          console.error('Error deleting job:', error);
          toast.error('Failed to delete job');
        }
      },

      resetNewJob: () => set({
        newJob: {
          title: '',
          description: '',
          location: '',
          company_id: '',
          job_type: 'FULL-TIME',
        }
      }),

      resetEditedJob: () => set({
        editedJob: {
          title: '',
          description: '',
          location: '',
          company_id: '',
          job_type: 'FULL-TIME',
        }
      }),
    }),
    {
      name: 'job-store', 
      partialize: (state) => ({
        currentPage: state.currentPage,
        searchTerm: state.searchTerm,
        selectedJob: state.selectedJob,
        isAddOpen: state.isAddOpen,
        isEditOpen: state.isEditOpen,
        newJob: state.newJob,
        editedJob: state.editedJob,
      }),
    }
  )
); 