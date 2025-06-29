"use client";

import { useEffect } from 'react';
import { useCompanyStore } from '@/store/useCompanyStore';
import { DashboardHeader } from "@/module/admin/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/module/admin/components/dashboard/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Building2, Globe, Calendar, Plus, Eye } from "lucide-react";
import Link from "next/link";
import { CompaniesTableSkeleton } from "@/components/skeletons/admin/companies-table-skeleton";
import { DataTable, DataColumn, formatDate } from "@/components/data-table";
import Image from 'next/image';

interface Company {
  id: string;
  company_id: string;
  name: string;
  description: string;
  website_url: string;
  created_at: string;
  logo_url?: string;
}

const ITEMS_PER_PAGE = 10;

export default function CompaniesPage() {
  const {
    companies,
    loading,
    currentPage,
    totalCount,
    searchTerm,
    isAddOpen,
    isCreating,
    newCompany,
    setCurrentPage,
    setIsAddOpen,
    setNewCompany,
    loadCompanies,
    addCompany,
  } = useCompanyStore();

  useEffect(() => {
    loadCompanies();
  }, [currentPage, searchTerm, loadCompanies]);

  const handleAddCompany = async () => {
    await addCompany();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    loadCompanies();
  };

  // Transform companies data to include id for DataTable
  const transformedCompanies: Company[] = companies.map(company => ({
    id: company.company_id,
    ...company,
    description: company.description ?? "",
    website_url: company.website_url ?? "",
  }));

  // Function to get a random demo logo
  const getDemoLogo = (companyId: string) => {
    const demoLogos = [
      "https://ui-avatars.com/api/?name=Company&background=3b82f6&color=fff&size=40&rounded=true&bold=true&format=png",
      "https://ui-avatars.com/api/?name=Corp&background=10b981&color=fff&size=40&rounded=true&bold=true&format=png",
      "https://ui-avatars.com/api/?name=Inc&background=f59e0b&color=fff&size=40&rounded=true&bold=true&format=png",
      "https://ui-avatars.com/api/?name=Ltd&background=ef4444&color=fff&size=40&rounded=true&bold=true&format=png",
      "https://ui-avatars.com/api/?name=LLC&background=8b5cf6&color=fff&size=40&rounded=true&bold=true&format=png",
      "https://ui-avatars.com/api/?name=Group&background=06b6d4&color=fff&size=40&rounded=true&bold=true&format=png",
      "https://ui-avatars.com/api/?name=Tech&background=ec4899&color=fff&size=40&rounded=true&bold=true&format=png",
      "https://ui-avatars.com/api/?name=Co&background=84cc16&color=fff&size=40&rounded=true&bold=true&format=png",
    ];
    
    // Use company ID to consistently get the same logo for the same company
    const index = companyId.charCodeAt(0) % demoLogos.length;
    return demoLogos[index];
  };

  const columns: DataColumn<Company>[] = [
    {
      key: "name",
      header: "Company",
      render: (company) => (
        <Link 
          href={`/admin/dashboard/companies/${company.company_id}`}
          className="flex items-center gap-3 hover:text-blue-600 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
            <Image
              src={company.logo_url || getDemoLogo(company.company_id)}
              alt={`${company.name} logo`}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to demo logo if image fails to load
                (e.target as HTMLImageElement).src = getDemoLogo(company.company_id);
              }}
            />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{company.name}</div>
          </div>
        </Link>
      ),
      sortable: true,
    },
    {
      key: "description",
      header: "Description",
      render: (company) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 truncate">
            {company.description || "No description available"}
          </p>
        </div>
      ),
      sortable: true,
    },
    {
      key: "website_url",
      header: "Website",
      render: (company) => (
        company.website_url ? (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-400" />
            <a
              href={company.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              Visit Website
            </a>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">No website</span>
        )
      ),
      sortable: false,
    },
    {
      key: "created_at",
      header: "Created",
      render: (company) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {formatDate(company.created_at)}
          </span>
        </div>
      ),
      sortable: true,
    },
  ];

  const actions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (company: Company) => 
        window.location.href = `/admin/dashboard/companies/${company.company_id}`,
      variant: "ghost" as const,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader headerTitle="Companies" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {loading ? <CompaniesTableSkeleton /> : (
              <>
                <DataTable
                  data={transformedCompanies}
                  columns={columns}
                  title={`All Companies (${totalCount})`}
                  titleIcon={Building2}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search companies..."
                  searchKeys={["name", "description"] as (keyof Company)[]}
                  sortable={true}
                  pagination={{
                    enabled: true,
                    pageSize: ITEMS_PER_PAGE,
                    currentPage: currentPage,
                    totalCount: totalCount,
                    onPageChange: handlePageChange,
                  }}
                  emptyMessage="No companies found"
                  emptyIcon={Building2}
                  emptyAction={{
                    label: "Add Company",
                    onClick: () => setIsAddOpen(true),
                    icon: Plus,
                  }}
                  addAction={{
                    label: "Add Company",
                    onClick: () => setIsAddOpen(true),
                    icon: Plus,
                    show: true,
                  }}
                  loading={loading}
                  onRefresh={handleRefresh}
                  striped={true}
                  hoverable={true}
                  bordered={true}
                  theme="primary"
                  cardProps={{
                    showCard: true,
                    className: "shadow-sm",
                  }}
                />

                {/* Add Company Dialog */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Company</DialogTitle>
                      <DialogDescription>
                        Create a new company. Fill in all the required information below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="mb-2 block">Company Name *</Label>
                        <Input
                          id="name"
                          value={newCompany.name}
                          onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                          placeholder="Enter company name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="website" className="mb-2 block">Company Website</Label>
                        <Input
                          id="website"
                          value={newCompany.website_url}
                          onChange={(e) => setNewCompany({ ...newCompany, website_url: e.target.value })}
                          placeholder="https://company.com"
                        />
                      </div>
                      <div> 
                        <Label htmlFor="description" className="mb-2 block">Company Description *</Label>
                        <Textarea
                          id="description"
                          value={newCompany.description}
                          onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                          placeholder="Describe the company..."
                          rows={4}
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          className="cursor-pointer"
                          variant="outline"
                          onClick={() => setIsAddOpen(false)}
                          disabled={isCreating}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="cursor-pointer"
                          onClick={handleAddCompany}
                          disabled={isCreating}
                        >
                          {isCreating ? "Creating..." : "Create Company"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 