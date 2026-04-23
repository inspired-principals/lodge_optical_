import { ChevronDown, ChevronRight, FileCode2, FolderTree } from "lucide-react";
import { useState } from "react";

export type WorkspaceFileNode = {
  id: string;
  name: string;
  type: "folder" | "file";
  path?: string;
  children?: WorkspaceFileNode[];
};

type TreeNodeProps = {
  key?: string;
  node: WorkspaceFileNode;
  depth: number;
  activePath: string;
  openFolders: Record<string, boolean>;
  onToggleFolder: (id: string) => void;
  onOpenFile: (path: string) => void;
};

export default function FileTreePanel({
  tree,
  activePath,
  onOpenFile,
}: {
  tree: WorkspaceFileNode[];
  activePath: string;
  onOpenFile: (path: string) => void;
}) {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    workspace: true,
    engine: true,
    modules: true,
  });

  const toggleFolder = (id: string) => {
    setOpenFolders((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Explorer</p>
        <h2 className="mt-2 text-sm font-semibold text-white">Lodge Optical Workspace</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {tree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            activePath={activePath}
            openFolders={openFolders}
            onToggleFolder={toggleFolder}
            onOpenFile={onOpenFile}
          />
        ))}
      </div>
    </div>
  );
}

function TreeNode({
  node,
  depth,
  activePath,
  openFolders,
  onToggleFolder,
  onOpenFile,
}: TreeNodeProps) {
  const isFolder = node.type === "folder";
  const isOpen = openFolders[node.id] ?? false;
  const isActive = node.path === activePath;

  return (
    <div>
      <button
        onClick={() => {
          if (isFolder) {
            onToggleFolder(node.id);
          } else if (node.path) {
            onOpenFile(node.path);
          }
        }}
        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition ${
          isActive ? "bg-cyan-500/15 text-cyan-100" : "text-slate-300 hover:bg-white/5"
        }`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        {isFolder ? (
          <>
            {isOpen ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
            <FolderTree className="h-4 w-4 text-slate-400" />
          </>
        ) : (
          <>
            <span className="w-4" />
            <FileCode2 className="h-4 w-4 text-slate-500" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {isFolder && isOpen && node.children?.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          activePath={activePath}
          openFolders={openFolders}
          onToggleFolder={onToggleFolder}
          onOpenFile={onOpenFile}
        />
      ))}
    </div>
  );
}
