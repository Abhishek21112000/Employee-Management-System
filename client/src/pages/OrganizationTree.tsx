import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import type { Employee } from '../types';

interface TreeNode extends Employee {
  children?: TreeNode[];
}

const fetchOrgTree = async (): Promise<TreeNode[]> => {
  const { data } = await api.get('/organization/tree');
  return data;
};

const OrgNode: React.FC<{ node: TreeNode; level?: number }> = ({ node, level = 0 }) => {
  return (
    <div className={`flex flex-col ${level > 0 ? 'ml-8 border-l border-border pl-4' : ''}`}>
      <div className="flex items-center gap-3 py-3 relative">
        {level > 0 && (
          <div className="absolute left-[-17px] top-1/2 w-4 border-t border-border" />
        )}
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shadow-sm border border-border">
          {node.profileImage ? (
            <img src={`http://localhost:5000${node.profileImage}`} alt={node.firstName} className="h-full w-full object-cover" />
          ) : (
            node.firstName[0]
          )}
        </div>
        <div>
          <div className="font-medium text-foreground">{node.firstName} {node.lastName}</div>
          <div className="text-muted-foreground text-xs">{node.designation || 'No Designation'}</div>
        </div>
      </div>
      
      {node.children && node.children.length > 0 && (
        <div className="flex flex-col ml-4">
          {node.children.map(child => (
            <OrgNode key={child._id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const OrganizationTree: React.FC = () => {
  const { data: treeData, isLoading, error } = useQuery({
    queryKey: ['orgTree'],
    queryFn: fetchOrgTree,
  });

  if (isLoading) return <div>Loading organization tree...</div>;
  if (error) return <div className="text-destructive">Failed to load organization tree.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organization Tree</h1>
        <p className="text-muted-foreground text-sm mt-1">Hierarchical view of the company structure.</p>
      </div>

      <div className="bg-card border border-border p-6 rounded-xl shadow-sm overflow-x-auto">
        <div className="min-w-max">
          {treeData && treeData.length > 0 ? (
            treeData.map(node => (
              <OrgNode key={node._id} node={node} />
            ))
          ) : (
            <p className="text-muted-foreground">No employees found in the hierarchy.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationTree;
