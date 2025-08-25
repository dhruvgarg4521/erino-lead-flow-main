import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, LogOut, Users, TrendingUp, DollarSign, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '@/hooks/useLeads';
import { Lead, LeadFilters as LeadFiltersType } from '@/types/lead';
import LeadTable from './LeadTable';
import LeadForm from './LeadForm';
import LeadFilters from './LeadFilters';
import Pagination from './Pagination';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { leads, loading, pagination, fetchLeads, createLead, updateLead, deleteLead } = useLeads();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState<LeadFiltersType>({});
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Load leads on component mount and when filters change
  useEffect(() => {
    fetchLeads(filters, pagination.page, pagination.limit);
  }, []);

  const handleApplyFilters = () => {
    fetchLeads(filters, 1, pagination.limit);
  };

  const handleClearFilters = () => {
    setFilters({});
    fetchLeads({}, 1, pagination.limit);
  };

  const handlePageChange = (page: number) => {
    fetchLeads(filters, page, pagination.limit);
  };

  const handleLimitChange = (limit: number) => {
    fetchLeads(filters, 1, limit);
  };

  const handleCreateLead = async (leadData: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setIsFormLoading(true);
    const { error } = await createLead(leadData);
    if (!error) {
      setShowCreateForm(false);
      fetchLeads(filters, pagination.page, pagination.limit);
    }
    setIsFormLoading(false);
  };

  const handleEditLead = async (leadData: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!editingLead) return;
    
    setIsFormLoading(true);
    const { error } = await updateLead(editingLead.id, leadData);
    if (!error) {
      setEditingLead(null);
      fetchLeads(filters, pagination.page, pagination.limit);
    }
    setIsFormLoading(false);
  };

  const handleDeleteLead = async (id: string) => {
    const { error } = await deleteLead(id);
    if (!error) {
      fetchLeads(filters, pagination.page, pagination.limit);
    }
  };

  // Calculate stats
  const totalLeads = pagination.total;
  const qualifiedLeads = leads.filter(lead => lead.is_qualified).length;
  const totalValue = leads.reduce((sum, lead) => sum + Number(lead.lead_value), 0);
  const avgScore = leads.length > 0 ? leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Lead Management System
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowCreateForm(true)} className="shadow-elegant">
                <Plus className="h-4 w-4 mr-2" />
                New Lead
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign Out</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to sign out?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={signOut}>Sign Out</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                Active leads in system
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{qualifiedLeads}</div>
              <p className="text-xs text-muted-foreground">
                {totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0}% of total leads
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Combined lead value
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(avgScore)}</div>
              <p className="text-xs text-muted-foreground">
                Out of 100 points
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <LeadFilters
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Leads Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Leads</CardTitle>
            <CardDescription>
              Manage and track your leads with advanced filtering and pagination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LeadTable
              leads={leads}
              loading={loading}
              onEdit={setEditingLead}
              onDelete={handleDeleteLead}
              onView={setViewingLead}
            />
            
            {pagination.total > 0 && (
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create Lead Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Lead</DialogTitle>
          </DialogHeader>
          <LeadForm
            onSubmit={handleCreateLead}
            onCancel={() => setShowCreateForm(false)}
            isLoading={isFormLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          {editingLead && (
            <LeadForm
              lead={editingLead}
              onSubmit={handleEditLead}
              onCancel={() => setEditingLead(null)}
              isLoading={isFormLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Lead Dialog */}
      <Dialog open={!!viewingLead} onOpenChange={() => setViewingLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {viewingLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Name</h3>
                  <p>{viewingLead.first_name} {viewingLead.last_name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p>{viewingLead.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p>{viewingLead.phone || '-'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Company</h3>
                  <p>{viewingLead.company || '-'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Location</h3>
                  <p>{[viewingLead.city, viewingLead.state].filter(Boolean).join(', ') || '-'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Source</h3>
                  <p className="capitalize">{viewingLead.source.replace('_', ' ')}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Status</h3>
                  <p className="capitalize">{viewingLead.status}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Score</h3>
                  <p>{viewingLead.score}/100</p>
                </div>
                <div>
                  <h3 className="font-semibold">Lead Value</h3>
                  <p>${Number(viewingLead.lead_value).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Qualified</h3>
                  <p>{viewingLead.is_qualified ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Created</h3>
                  <p>{new Date(viewingLead.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Last Activity</h3>
                  <p>{viewingLead.last_activity_at ? new Date(viewingLead.last_activity_at).toLocaleDateString() : '-'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;