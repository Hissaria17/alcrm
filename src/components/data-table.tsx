"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MoreHorizontal, 
  Search, 
  Trash2, 
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  SortAsc,
} from "lucide-react";
import { colors } from "@/design-system/color";
import { cn } from "@/lib/utils";

// Enhanced Types
export interface DataColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  className?: string;
  align?: "left" | "center" | "right";
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataAction<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (item: T) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  disabled?: (item: T) => boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataColumn<T>[];
  title?: string;
  titleIcon?: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  actions?: DataAction<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  filterable?: boolean;
  filters?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
  sortable?: boolean;
  pagination?: {
    enabled: boolean;
    pageSize?: number;
    currentPage?: number;
    totalCount?: number;
    onPageChange?: (page: number) => void;
  };
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  emptyAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  addAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
    show?: boolean;
  };
  onDelete?: (item: T) => void;
  deleteConfirmation?: {
    title: string;
    description: string;
  };
  onRowClick?: (item: T) => void;
  className?: string;
  cardProps?: {
    showCard?: boolean;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
  };
  tableProps?: {
    className?: string;
    headerClassName?: string;
    bodyClassName?: string;
    rowClassName?: string;
    cellClassName?: string;
  };
  loading?: boolean;
  onRefresh?: () => void;
  showRowNumbers?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  bordered?: boolean;
  theme?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  title,
  titleIcon: TitleIcon,
  subtitle,
  actions = [],
  searchable = false,
  searchPlaceholder = "Search...",
  searchKeys = [],
  filterable = false,
  filters = [],
  sortable = false,
  pagination,
  emptyMessage = "No data found",
  emptyIcon: EmptyIcon,
  emptyAction,
  addAction,
  onDelete,
  deleteConfirmation = {
    title: "Are you absolutely sure?",
    description: "This action cannot be undone.",
  },
  onRowClick,
  className = "",
  cardProps = { showCard: true },
  tableProps = {},
  loading = false,
  onRefresh,
  showRowNumbers = false,
  striped = true,
  hoverable = true,
  compact = false,
  bordered = true,
  theme = "default",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [deleteItem, setDeleteItem] = useState<T | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Theme-based styling
  const getThemeStyles = () => {
    const themes = {
      default: {
        headerBg: "bg-gray-50",
        headerText: "text-gray-900",
        border: "border-gray-200",
        hover: "hover:bg-gray-50",
        primary: colors.primaryBlue,
      },
      primary: {
        headerBg: `bg-[${colors.primaryBlue}]/10`,
        headerText: `text-[${colors.primaryBlue}]`,
        border: `border-[${colors.primaryBlue}]/20`,
        hover: `hover:bg-[${colors.primaryBlue}]/5`,
        primary: colors.primaryBlue,
      },
      secondary: {
        headerBg: `bg-[${colors.gold}]/10`,
        headerText: `text-[${colors.gold}]`,
        border: `border-[${colors.gold}]/20`,
        hover: `hover:bg-[${colors.gold}]/5`,
        primary: colors.gold,
      },
      success: {
        headerBg: `bg-[${colors.accentGreen}]/10`,
        headerText: `text-[${colors.accentGreen}]`,
        border: `border-[${colors.accentGreen}]/20`,
        hover: `hover:bg-[${colors.accentGreen}]/5`,
        primary: colors.accentGreen,
      },
      warning: {
        headerBg: `bg-[${colors.gold}]/10`,
        headerText: `text-[${colors.gold}]`,
        border: `border-[${colors.gold}]/20`,
        hover: `hover:bg-[${colors.gold}]/5`,
        primary: colors.gold,
      },
      danger: {
        headerBg: `bg-[${colors.accentRed}]/10`,
        headerText: `text-[${colors.accentRed}]`,
        border: `border-[${colors.accentRed}]/20`,
        hover: `hover:bg-[${colors.accentRed}]/5`,
        primary: colors.accentRed,
      },
    };
    return themes[theme];
  };

  const themeStyles = getThemeStyles();

  // Sorting function
  const handleSort = (key: string) => {
    if (!sortable) return;
    
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' as const }
          : null;
      }
      return { key, direction: 'asc' as const };
    });
  };

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchable && searchTerm && searchKeys.length > 0) {
      filtered = filtered.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key];
          return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    if (filterable && Object.keys(activeFilters).length > 0) {
      filtered = filtered.filter((item) =>
        Object.entries(activeFilters).every(([key, value]) => {
          if (value === "all") return true;
          return item[key as keyof T] === value;
        })
      );
    }

    // Apply sorting
    if (sortable && sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, activeFilters, sortConfig, searchable, searchKeys, filterable, sortable]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination?.enabled || !pagination.pageSize) return processedData;
    
    const startIndex = ((pagination.currentPage || 1) - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, pagination]);

  const handleDelete = (item: T) => {
    if (onDelete) {
      onDelete(item);
      setDeleteItem(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilters({});
    setSortConfig(null);
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortable) return null;
    
    if (sortConfig?.key === columnKey) {
      return sortConfig.direction === 'asc' ? (
        <ChevronUp className="h-4 w-4 ml-1" />
      ) : (
        <ChevronDown className="h-4 w-4 ml-1" />
      );
    }
    return <SortAsc className="h-4 w-4 ml-1 opacity-30" />;
  };

  const tableContent = (
    <div className={cn(
      "rounded-lg overflow-hidden",
      bordered && themeStyles.border,
      bordered && "border",
      className
    )}>
      <Table className={cn(tableProps.className)}>
        <TableHeader className={cn(
          themeStyles.headerBg,
          tableProps.headerClassName
        )}>
          <TableRow className="border-0">
            {showRowNumbers && (
              <TableHead className={cn(
                "font-semibold text-sm",
                themeStyles.headerText,
                compact ? "px-3 py-2" : "px-4 py-3"
              )}>
                #
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "font-semibold text-sm",
                  themeStyles.headerText,
                  compact ? "px-3 py-2" : "px-4 py-3",
                  column.headerClassName,
                  sortable && column.sortable !== false && "cursor-pointer select-none",
                  "transition-colors duration-200"
                )}
                style={{ width: column.width }}
                onClick={() => column.sortable !== false && handleSort(column.key)}
              >
                <div className={cn(
                  "flex items-center",
                  column.align === "center" && "justify-center",
                  column.align === "right" && "justify-end"
                )}>
                  {column.header}
                  {getSortIcon(column.key)}
                </div>
              </TableHead>
            ))}
            {actions.length > 0 && (
              <TableHead className={cn(
                "font-semibold text-sm text-right",
                themeStyles.headerText,
                compact ? "px-3 py-2" : "px-4 py-3"
              )}>
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody className={cn(tableProps.bodyClassName)}>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions.length > 0 ? 1 : 0) + (showRowNumbers ? 1 : 0)}
                className="text-center py-12"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeStyles.primary }}></div>
                  <p className="text-gray-500">Loading...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : paginatedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions.length > 0 ? 1 : 0) + (showRowNumbers ? 1 : 0)}
                className="text-center py-12"
              >
                <div className="flex flex-col items-center gap-4">
                  {EmptyIcon && (
                    <div style={{ color: themeStyles.primary }}>
                      <EmptyIcon className="h-12 w-12 opacity-50" />
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</p>
                    {emptyAction && (
                      <Button
                        onClick={emptyAction.onClick}
                        className="mt-2"
                        style={{ backgroundColor: themeStyles.primary }}
                      >
                        {emptyAction.icon && <emptyAction.icon className="h-4 w-4 mr-2" />}
                        {emptyAction.label}
                      </Button>
                    )}
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((item, index) => (
              <TableRow 
                key={item.id || index} 
                className={cn(
                  tableProps.rowClassName,
                  hoverable && themeStyles.hover,
                  striped && index % 2 === 1 && "bg-gray-50/50",
                  compact ? "py-1" : "py-2",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {showRowNumbers && (
                  <TableCell className={cn(
                    "text-sm text-gray-500 font-medium",
                    compact ? "px-3 py-2" : "px-4 py-3",
                    tableProps.cellClassName
                  )}>
                    {(pagination?.currentPage || 1) * (pagination?.pageSize || 10) - (pagination?.pageSize || 10) + index + 1}
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell 
                    key={column.key} 
                    className={cn(
                      compact ? "px-3 py-2" : "px-4 py-3",
                      column.cellClassName,
                      tableProps.cellClassName,
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right"
                    )}
                  >
                    {column.render ? column.render(item) : String(item[column.key as keyof T] || "")}
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell className={cn(
                    "text-right",
                    compact ? "px-3 py-2" : "px-4 py-3",
                    tableProps.cellClassName
                  )}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {actions.map((action, actionIndex) => {
                          const isDisabled = action.disabled ? action.disabled(item) : false;
                          return (
                            <DropdownMenuItem
                              key={actionIndex}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isDisabled) {
                                  action.onClick(item);
                                }
                              }}
                              className={cn(
                                action.className,
                                isDisabled && "opacity-50 cursor-not-allowed"
                              )}
                              disabled={isDisabled}
                            >
                              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                              {action.label}
                            </DropdownMenuItem>
                          );
                        })}
                        {onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteItem(item);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const searchAndFilterSection = (searchable || filterable) && (
    <Card className="mb-6 border-0 shadow-sm">
      <CardHeader className={cn("pb-4", cardProps.headerClassName)}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" style={{ color: themeStyles.primary }} />
          Search & Filter
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("pt-0", cardProps.contentClassName)}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={activeFilters[filter.key] || "all"}
              onValueChange={(value) =>
                setActiveFilters((prev) => ({ ...prev, [filter.key]: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter.label}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          
          {(searchTerm || Object.values(activeFilters).some((v) => v !== "all") || sortConfig) && (
            <Button onClick={clearFilters} variant="outline">
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const paginationSection =
    pagination?.enabled &&
    pagination.totalCount &&
    pagination.totalCount > (pagination.pageSize || 10) &&
    !loading &&
    paginatedData.length > 0 ? (
      <div className="mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  pagination.onPageChange?.(
                    Math.max(1, (pagination.currentPage || 1) - 1)
                  )
                }
                className={
                  (pagination.currentPage || 1) === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from(
              {
                length: Math.ceil(
                  pagination.totalCount / (pagination.pageSize || 10)
                ),
              },
              (_, i) => i + 1
            ).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => pagination.onPageChange?.(page)}
                  isActive={(pagination.currentPage || 1) === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => {
                  const totalPages = Math.ceil(
                    (pagination.totalCount || 0) / (pagination.pageSize || 10)
                  );
                  pagination.onPageChange?.(
                    Math.min(totalPages, (pagination.currentPage || 1) + 1)
                  );
                }}
                className={
                  (pagination.currentPage || 1) ===
                  Math.ceil(
                    (pagination.totalCount || 0) / (pagination.pageSize || 10)
                  )
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
  ) : null;

  const content = (
    <>
      {searchAndFilterSection}
      {cardProps?.showCard ? (
        <Card className={cn("border-0 shadow-sm", cardProps.className)}>
          {title && (
            <CardHeader className={cn("pb-4", cardProps.headerClassName)}>
                              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    {TitleIcon && (
                      <div style={{ color: themeStyles.primary }}>
                        <TitleIcon className="h-6 w-6" />
                      </div>
                    )}
                    {title}
                  </CardTitle>
                  {subtitle && (
                    <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {addAction?.show !== false && addAction && (
                    <Button
                      onClick={addAction.onClick}
                      size="sm"
                      className="flex items-center gap-2"
                      style={{ backgroundColor: themeStyles.primary }}
                    >
                      {addAction.icon && <addAction.icon className="h-4 w-4" />}
                      {addAction.label}
                    </Button>
                  )}
                  {onRefresh && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRefresh}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          )}
          <CardContent className={cn(title ? "" : "p-0", cardProps.contentClassName)}>
            {tableContent}
          </CardContent>
        </Card>
      ) : (
        tableContent
      )}
      {paginationSection}
    </>
  );

  return (
    <>
      {content}
      
      {/* Delete Confirmation Dialog */}
      {onDelete && (
        <AlertDialog open={deleteItem !== null} onOpenChange={() => setDeleteItem(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{deleteConfirmation.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteConfirmation.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteItem && handleDelete(deleteItem)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

// Enhanced utility functions
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getStatusBadge = (status: string, variant: "default" | "secondary" = "default") => {
  const statusConfig = {
    OPEN: { label: "Open", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    CLOSED: { label: "Closed", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
    ARCHIVED: { label: "Archived", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
    PENDING: { label: "Pending", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
    APPROVED: { label: "Approved", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    REJECTED: { label: "Rejected", className: "bg-red-100 text-red-800 hover:bg-red-100" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: "" };
  
  return (
    <Badge className={config.className || ""} variant={variant}>
      {config.label}
    </Badge>
  );
};

export const getTypeBadge = (type: string) => {
  const typeConfig = {
    "FULL-TIME": { label: "Full-Time", className: "bg-blue-100 text-blue-800" },
    "PART-TIME": { label: "Part-Time", className: "bg-purple-100 text-purple-800" },
    "CONTRACT": { label: "Contract", className: "bg-orange-100 text-orange-800" },
    "INTERNSHIP": { label: "Internship", className: "bg-green-100 text-green-800" },
  };

  const config = typeConfig[type as keyof typeof typeConfig] || { label: type, className: "" };
  
  return (
    <Badge className={`${config.className} hover:${config.className}`}>
      {config.label}
    </Badge>
  );
};

// Theme-based badge component
export const getThemeBadge = (text: string, theme: "default" | "primary" | "secondary" | "success" | "warning" | "danger" = "default") => {
  const themeConfig = {
    default: "bg-gray-100 text-gray-800",
    primary: `bg-[${colors.primaryBlue}]/10 text-[${colors.primaryBlue}]`,
    secondary: `bg-[${colors.gold}]/10 text-[${colors.gold}]`,
    success: `bg-[${colors.accentGreen}]/10 text-[${colors.accentGreen}]`,
    warning: `bg-[${colors.gold}]/10 text-[${colors.gold}]`,
    danger: `bg-[${colors.accentRed}]/10 text-[${colors.accentRed}]`,
  };

  return (
    <Badge className={themeConfig[theme]}>
      {text}
    </Badge>
  );
};