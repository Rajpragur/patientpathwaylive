import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { quizzes } from '@/data/quizzes';

interface QuizLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  quiz_type: string;
  quiz_name?: string;
  score: number;
  lead_status: string;
  submitted_at: string;
}

interface QuizLeadsTableProps {
  leads: QuizLead[];
  onStatusChange: (id: string, status: string) => void;
}

type SortField = 'name' | 'email' | 'submitted_at' | 'score';
type SortDirection = 'asc' | 'desc';

const getQuizName = (quizType: string, customName?: string) => {
  if (!quizType) return 'Unknown Quiz';
  
  if (quizType.startsWith('custom_')) {
    return customName || 'Custom Quiz';
  }
  
  const standardQuiz = quizzes[quizType.toUpperCase()];
  return standardQuiz?.title || quizType.toUpperCase();
};

export function QuizLeadsTable({ leads, onStatusChange }: QuizLeadsTableProps) {
  const [sortField, setSortField] = useState<SortField>('submitted_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [quizTypeFilter, setQuizTypeFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = searchQuery === '' || 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || lead.lead_status === statusFilter;
    const matchesQuizType = quizTypeFilter === 'ALL' || lead.quiz_type === quizTypeFilter;

    return matchesSearch && matchesStatus && matchesQuizType;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortField === 'submitted_at') {
      const aDate = new Date(aValue as string).getTime();
      const bDate = new Date(bValue as string).getTime();
      return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    }

    if (sortField === 'score') {
      const aScore = aValue as number;
      const bScore = bValue as number;
      return sortDirection === 'asc' ? aScore - bScore : bScore - aScore;
    }

    const aStr = aValue as string;
    const bStr = bValue as string;
    return sortDirection === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const uniqueQuizTypes = Array.from(new Set(leads.map(lead => lead.quiz_type)))
    .sort((a, b) => {
      // Put custom quizzes at the end of the list
      const aIsCustom = a.startsWith('custom_');
      const bIsCustom = b.startsWith('custom_');
      if (aIsCustom && !bIsCustom) return 1;
      if (!aIsCustom && bIsCustom) return -1;
      // Sort by display name
      const aName = getQuizName(a);
      const bName = getQuizName(b);
      return aName.localeCompare(bName);
    });

  const totalPages = Math.ceil(filteredLeads.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLeads = sortedLeads.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="CONTACTED">Contacted</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={quizTypeFilter} onValueChange={setQuizTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by quiz type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Quiz Types</SelectItem>
            {uniqueQuizTypes.map((type) => {
              const isCustom = type.startsWith('custom_');
              const lead = leads.find(l => l.quiz_type === type);
              const displayName = isCustom 
                ? `${lead?.quiz_name || 'Custom Quiz'}`
                : quizzes[type]?.title || type;
              
              return (
                <SelectItem key={type} value={type} className="flex flex-col items-start gap-0.5">
                  <div>{displayName}</div>
                  <div className="text-xs text-gray-500">Type: {type}</div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1"
                >
                  Name {getSortIcon('name')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('email')}
                  className="flex items-center gap-1"
                >
                  Email {getSortIcon('email')}
                </Button>
              </TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Quiz Type</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('score')}
                  className="flex items-center gap-1"
                >
                  Score {getSortIcon('score')}
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('submitted_at')}
                  className="flex items-center gap-1"
                >
                  Submitted {getSortIcon('submitted_at')}
                </Button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.phone || '-'}</TableCell>                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <Badge variant="outline">
                      {lead.quiz_type.startsWith('custom_')
                        ? (lead.quiz_name || 'Custom Quiz')
                        : (quizzes[lead.quiz_type]?.title || lead.quiz_type)}
                    </Badge>
                    <div className="text-xs text-gray-500 italic">
                      Type: {lead.quiz_type}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{lead.score}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      lead.lead_status === 'NEW'
                        ? 'default'
                        : lead.lead_status === 'CONTACTED'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {lead.lead_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(lead.submitted_at), 'MMM d, yyyy h:mm a')}
                </TableCell>
                <TableCell>
                  <select
                    value={lead.lead_status}
                    onChange={(e) => onStatusChange(lead.id, e.target.value)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-sm"
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length} results
          </p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="px-2">...</span>
                <Button
                  variant={currentPage === totalPages ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}